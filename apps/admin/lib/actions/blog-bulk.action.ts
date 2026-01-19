'use server'

/**
 * Blog Bulk Actions
 *
 * Server actions for bulk operations on blog posts:
 * - Bulk status update (draft, ready_to_publish, published)
 * - Bulk FAQ generation using AI
 *
 * @module @admin/lib/actions/blog-bulk
 */

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import { CACHE_TAGS } from '@workspace/shared/cache'
import { eq, inArray } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'

import { extractFaqs } from '@workspace/ai/functions'

import type {
    PipelineStatus,
    ActionResult,
} from '@/lib/types/blog/blog-action.type'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import { revalidateWebAppCache } from '@/lib/utils/revalidate-web.util'

// ============================================================================
// Types
// ============================================================================

type BulkFaqResult = {
    success: boolean
    error?: string
    processedCount?: number
    failedCount?: number
    results?: Array<{
        postId: string
        success: boolean
        error?: string
        faqCount?: number
    }>
}

// ============================================================================
// Constants
// ============================================================================

const MAX_BULK_STATUS_UPDATE = 100
const MAX_BULK_FAQ_GENERATION = 20
const FAQ_GENERATION_BATCH_SIZE = 5

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate post IDs array
 */
function validatePostIds(
    postIds: string[] | undefined,
    maxCount: number
): ActionResult | null {
    if (!postIds || postIds.length === 0) {
        return { success: false, error: 'No post IDs provided' }
    }

    if (postIds.length > maxCount) {
        return {
            success: false,
            error: `Maximum ${maxCount} posts can be processed at once`,
        }
    }

    return null
}

/**
 * Handle action errors with consistent formatting
 */
function handleActionError<T extends ActionResult>(
    error: unknown,
    fallbackMessage: string,
    logPrefix?: string
): T {
    if (error instanceof UnauthorizedError) {
        return { success: false, error: 'Unauthorized' } as T
    }

    const errorMessage = logPrefix || fallbackMessage
    console.error(errorMessage, error)

    return {
        success: false,
        error: error instanceof Error ? error.message : fallbackMessage,
    } as T
}

// ============================================================================
// Revalidation Helpers
// ============================================================================

/**
 * Revalidate blog-related paths
 */
function revalidateBlogPaths(): void {
    revalidatePath('/blog/posts')
    revalidatePath('/blog/pipeline')
    revalidatePath('/')
}

/**
 * Revalidate web app cache with post slugs
 */
async function revalidateBlogCacheWithSlugs(
    slugs: (string | null | undefined)[]
): Promise<void> {
    const cacheTags: string[] = [CACHE_TAGS.BLOG_POSTS]
    slugs.forEach((slug) => {
        if (slug) {
            cacheTags.push(CACHE_TAGS.blogPostBySlug(slug))
        }
    })
    await revalidateWebAppCache(cacheTags)
}

// ============================================================================
// Bulk Status Update Action
// ============================================================================

/**
 * Statuses that can be set via bulk action
 */
type BulkStatusOption = 'draft' | 'ready_to_publish' | 'published'

/**
 * Update status for multiple blog posts at once
 *
 * @param postIds - Array of blog post IDs to update
 * @param status - New status to apply (draft, ready_to_publish, or published)
 * @returns ActionResult
 */
export async function bulkUpdateBlogPostStatus(
    postIds: string[],
    status: BulkStatusOption
): Promise<ActionResult> {
    try {
        await requireAuth()

        const validation = validatePostIds(postIds, MAX_BULK_STATUS_UPDATE)
        if (validation) return validation

        // Get current status of all posts for publishedAt logic and slug for cache
        const currentPosts = await db
            .select({
                id: blogPost.id,
                status: blogPost.status,
                slug: blogPost.slug,
            })
            .from(blogPost)
            .where(inArray(blogPost.id, postIds))

        if (currentPosts.length === 0) {
            return { success: false, error: 'No posts found' }
        }

        // Determine which posts need publishedAt updated
        const now = new Date()
        await db.transaction(async (tx) => {
            for (const post of currentPosts) {
                const wasPublished = post.status === 'published'
                const isNowPublished = status === 'published'

                await tx
                    .update(blogPost)
                    .set({
                        status,
                        ...(!wasPublished && isNowPublished
                            ? { publishedAt: now }
                            : {}),
                    })
                    .where(eq(blogPost.id, post.id))
            }
        })

        revalidateBlogPaths()
        await revalidateBlogCacheWithSlugs(currentPosts.map((p) => p.slug))

        // Invalidate sitemap cache if publishing status changed
        const hasPublishStatusChange = currentPosts.some((post) => {
            const wasPublished = post.status === 'published'
            const isNowPublished = status === 'published'
            return wasPublished !== isNowPublished
        })

        if (hasPublishStatusChange) {
            revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })
        }

        return { success: true }
    } catch (error) {
        return handleActionError(
            error,
            'Failed to update status',
            'Error updating blog post status:'
        )
    }
}

// ============================================================================
// Bulk FAQ Generation Action
// ============================================================================

/**
 * Generate FAQs for multiple blog posts using AI
 *
 * Processes posts in batches to avoid overwhelming the AI API.
 * Only processes posts that have content.
 *
 * @param postIds - Array of blog post IDs to generate FAQs for
 * @returns BulkFaqResult with per-item results
 */
export async function bulkGenerateFaqs(
    postIds: string[]
): Promise<BulkFaqResult> {
    try {
        await requireAuth()

        const validation = validatePostIds(postIds, MAX_BULK_FAQ_GENERATION)
        if (validation) return validation as BulkFaqResult

        // Get posts with content
        const posts = await db
            .select({
                id: blogPost.id,
                title: blogPost.title,
                content: blogPost.content,
                primaryKeyword: blogPost.primaryKeyword,
                slug: blogPost.slug,
            })
            .from(blogPost)
            .where(inArray(blogPost.id, postIds))

        if (posts.length === 0) {
            return { success: false, error: 'No posts found' }
        }

        // Filter posts with content
        const postsWithContent = posts.filter((p) => p.content)

        if (postsWithContent.length === 0) {
            return {
                success: false,
                error: 'No posts with content found. Content is required for FAQ generation.',
            }
        }

        const results: BulkFaqResult['results'] = []
        let processedCount = 0
        let failedCount = 0

        // Process in batches
        for (
            let i = 0;
            i < postsWithContent.length;
            i += FAQ_GENERATION_BATCH_SIZE
        ) {
            const batch = postsWithContent.slice(
                i,
                i + FAQ_GENERATION_BATCH_SIZE
            )

            const batchResults = await Promise.all(
                batch.map(async (post) => {
                    try {
                        const faqResult = await extractFaqs({
                            content: post.content!,
                            primaryKeyword: post.primaryKeyword || undefined,
                            maxFaqs: 8,
                            generateIfMissing: true,
                        })

                        if (faqResult.faqs.length > 0) {
                            // Update post with generated FAQs
                            await db
                                .update(blogPost)
                                .set({
                                    faqs: faqResult.faqs,
                                })
                                .where(eq(blogPost.id, post.id))

                            processedCount++
                            return {
                                postId: post.id,
                                success: true,
                                faqCount: faqResult.faqs.length,
                            }
                        } else {
                            failedCount++
                            return {
                                postId: post.id,
                                success: false,
                                error: 'No FAQs generated',
                            }
                        }
                    } catch (error) {
                        failedCount++
                        return {
                            postId: post.id,
                            success: false,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : 'FAQ generation failed',
                        }
                    }
                })
            )

            results.push(...batchResults)
        }

        revalidateBlogPaths()
        await revalidateBlogCacheWithSlugs(posts.map((p) => p.slug))

        return {
            success: true,
            results,
            processedCount,
            failedCount,
        }
    } catch (error) {
        return handleActionError<BulkFaqResult>(
            error,
            'Failed to generate FAQs',
            'Error generating FAQs:'
        )
    }
}
