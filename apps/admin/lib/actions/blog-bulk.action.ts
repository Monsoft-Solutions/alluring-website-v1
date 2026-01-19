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
import { runAutoInlineImagePipeline } from '@workspace/ai/pipelines'
import type { GeneratedInlineImage } from '@workspace/ai'

import { generateImageWithFal } from '@/lib/services/fal-image-generation.service'
import { insertInlineImagesIntoMarkdown } from '@/lib/utils/insert-inline-images.util'
import type { ActionResult } from '@/lib/types/blog/blog-action.type'
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

type BulkInlineImageResult = {
    success: boolean
    error?: string
    processedCount?: number
    failedCount?: number
    totalImagesGenerated?: number
    results?: Array<{
        postId: string
        success: boolean
        error?: string
        imagesInserted?: number
    }>
}

// ============================================================================
// Constants
// ============================================================================

const MAX_BULK_STATUS_UPDATE = 100
const MAX_BULK_FAQ_GENERATION = 20
const FAQ_GENERATION_BATCH_SIZE = 5
const MAX_BULK_INLINE_IMAGE_GENERATION = 10
const INLINE_IMAGE_GENERATION_BATCH_SIZE = 2 // Lower due to heavy processing

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

// ============================================================================
// Bulk Inline Image Generation Action
// ============================================================================

/**
 * Get the appropriate FAL model for an image type
 *
 * @param imageType - The type of image being generated
 * @returns The recommended model ID
 */
function getModelForImageType(
    imageType: string
): 'gpt-image-1.5' | 'nano-banana-pro' {
    if (imageType === 'infographic' || imageType === 'illustration') {
        return 'nano-banana-pro'
    }
    return 'gpt-image-1.5'
}

/**
 * Generate inline images for multiple blog posts using AI
 *
 * Fully automatic: analyzes content, generates images, inserts them,
 * and saves to database without user approval.
 *
 * @param postIds - Array of blog post IDs to generate images for
 * @returns BulkInlineImageResult with per-item results
 */
export async function bulkGenerateInlineImages(
    postIds: string[]
): Promise<BulkInlineImageResult> {
    try {
        await requireAuth()

        const validation = validatePostIds(
            postIds,
            MAX_BULK_INLINE_IMAGE_GENERATION
        )
        if (validation) return validation as BulkInlineImageResult

        // Fetch posts with content
        const posts = await db
            .select({
                id: blogPost.id,
                title: blogPost.title,
                content: blogPost.content,
                slug: blogPost.slug,
            })
            .from(blogPost)
            .where(inArray(blogPost.id, postIds))

        if (posts.length === 0) {
            return { success: false, error: 'No posts found' }
        }

        // Filter posts with sufficient content (min 100 chars)
        const postsWithContent = posts.filter(
            (p) => p.content && p.content.length >= 100
        )

        if (postsWithContent.length === 0) {
            return {
                success: false,
                error: 'No posts with sufficient content. Minimum 100 characters required.',
            }
        }

        const results: BulkInlineImageResult['results'] = []
        let processedCount = 0
        let failedCount = 0
        let totalImagesGenerated = 0

        // Process in batches
        for (
            let i = 0;
            i < postsWithContent.length;
            i += INLINE_IMAGE_GENERATION_BATCH_SIZE
        ) {
            const batch = postsWithContent.slice(
                i,
                i + INLINE_IMAGE_GENERATION_BATCH_SIZE
            )

            const batchResults = await Promise.all(
                batch.map(async (post) => {
                    try {
                        console.log(`[Bulk Images] Processing: "${post.title}"`)

                        // Phase 1: Run pipeline (analysis + prompt generation)
                        const pipelineResult = await runAutoInlineImagePipeline(
                            {
                                content: post.content!,
                                title: post.title,
                                blogPostId: post.id,
                                maxImages: 5,
                            }
                        )

                        if (
                            !pipelineResult.success ||
                            !pipelineResult.analysis
                        ) {
                            return {
                                postId: post.id,
                                success: false,
                                error:
                                    pipelineResult.error || 'Analysis failed',
                            }
                        }

                        // Phase 2: Generate images via FAL.ai
                        const pendingImages =
                            pipelineResult.generatedImages.filter(
                                (img) => img.status === 'pending' && img.prompt
                            )

                        if (pendingImages.length === 0) {
                            return {
                                postId: post.id,
                                success: true,
                                imagesInserted: 0,
                            }
                        }

                        // Generate all images in parallel
                        const imageResults = await Promise.allSettled(
                            pendingImages.map(async (img) => {
                                const model = getModelForImageType(
                                    img.imageType
                                )
                                const generated = await generateImageWithFal({
                                    prompt: img.prompt!,
                                    blogPostId: post.id,
                                    model,
                                    numImages: 1,
                                })
                                return {
                                    ...img,
                                    imageUrl: generated[0]?.blobUrl,
                                    status: generated[0]?.blobUrl
                                        ? 'success'
                                        : 'error',
                                } as GeneratedInlineImage
                            })
                        )

                        const generatedImages: GeneratedInlineImage[] =
                            imageResults.map((result, idx) =>
                                result.status === 'fulfilled'
                                    ? result.value
                                    : {
                                          ...pendingImages[idx]!,
                                          status: 'error' as const,
                                          error: 'Generation failed',
                                      }
                            )

                        // Phase 3: Insert images into markdown
                        const successfulImages = generatedImages.filter(
                            (img) => img.status === 'success' && img.imageUrl
                        )

                        if (successfulImages.length === 0) {
                            return {
                                postId: post.id,
                                success: false,
                                error: 'All image generations failed',
                            }
                        }

                        const updatedContent = insertInlineImagesIntoMarkdown(
                            post.content!,
                            successfulImages
                        )

                        // Phase 4: Save to database
                        await db
                            .update(blogPost)
                            .set({ content: updatedContent })
                            .where(eq(blogPost.id, post.id))

                        console.log(
                            `[Bulk Images] Done: "${post.title}" - ${successfulImages.length} images`
                        )
                        totalImagesGenerated += successfulImages.length
                        processedCount++

                        return {
                            postId: post.id,
                            success: true,
                            imagesInserted: successfulImages.length,
                        }
                    } catch (error) {
                        console.error(
                            `[Bulk Images] Error for post ${post.id}:`,
                            error
                        )
                        failedCount++
                        return {
                            postId: post.id,
                            success: false,
                            error:
                                error instanceof Error
                                    ? error.message
                                    : 'Processing failed',
                        }
                    }
                })
            )

            results.push(...batchResults)
        }

        // Revalidate caches
        revalidateBlogPaths()
        await revalidateBlogCacheWithSlugs(posts.map((p) => p.slug))

        return {
            success: true,
            results,
            processedCount,
            failedCount,
            totalImagesGenerated,
        }
    } catch (error) {
        return handleActionError<BulkInlineImageResult>(
            error,
            'Failed to generate inline images',
            'Error generating inline images:'
        )
    }
}
