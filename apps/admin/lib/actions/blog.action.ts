'use server'

import { db } from '@workspace/db/client'
import {
    blogPost,
    blogPostImages,
    images as imagesTable,
} from '@workspace/db/schema/blog'
import type { PlanningData } from '@workspace/db/types'
import { eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@workspace/shared/cache'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import { validateBlogPostData } from '@/lib/utils/blog-validation.util'
import { revalidateWebAppCache } from '@/lib/utils/revalidate-web.util'
import { createPipelinePostInternal } from '@/lib/services/pipeline-post.service'
import type {
    PipelineStatus,
    ProcessingStatus,
    BlogPostPriority,
    ActionResult,
    CreatePipelinePostData,
    UpdatePipelinePostData,
} from '@/lib/types/blog/blog-action.type'
import type { BlogPostFormData } from '@/lib/types/blog/blog-post-form.type'

// Re-export types for consumers
export type {
    PipelineStatus,
    ProcessingStatus,
    BlogPostPriority,
    ActionResult,
    CreatePipelinePostData,
    UpdatePipelinePostData,
    BlogPostFormData,
}

export async function createBlogPost(
    data: BlogPostFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate required fields
        if (!data.title?.trim()) {
            return { success: false, error: 'Title is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }
        if (!data.content?.trim()) {
            return { success: false, error: 'Content is required' }
        }
        if (!data.metaDescription?.trim()) {
            return { success: false, error: 'Meta description is required' }
        }

        // Check if slug already exists
        const existingPost = await db
            .select({ id: blogPost.id })
            .from(blogPost)
            .where(eq(blogPost.slug, data.slug))
            .limit(1)

        if (existingPost.length > 0) {
            return {
                success: false,
                error: 'A post with this slug already exists',
            }
        }

        // Handle featured image if URL provided
        let featuredImageId: string | null = null
        if (data.featuredImageUrl) {
            const [imageRecord] = await db
                .insert(imagesTable)
                .values({
                    url: data.featuredImageUrl,
                    alt: data.title,
                    title: data.title,
                })
                .returning({ id: imagesTable.id })

            featuredImageId = imageRecord?.id ?? null
        }

        // Create the blog post
        const [newPost] = await db
            .insert(blogPost)
            .values({
                title: data.title,
                slug: data.slug,
                content: data.content,
                metaDescription: data.metaDescription,
                metaTitle: data.metaTitle ?? null,
                metaKeywords: data.metaKeywords ?? null,
                primaryKeyword: data.primaryKeyword ?? null,
                secondaryKeywords: data.secondaryKeywords ?? null,
                excerpt: data.excerpt ?? null,
                authorId: data.authorId || null,
                status: data.status,
                aiSummary: data.aiSummary ?? null,
                faqs: data.faqs ?? null,
                featuredImageId,
                readingTime: data.readingTime ?? null,
                publishedAt: data.status === 'published' ? new Date() : null,
            })
            .returning({ id: blogPost.id })

        revalidatePath('/blog/posts')
        revalidatePath('/')

        // Revalidate web app cache
        await revalidateWebAppCache([CACHE_TAGS.BLOG_POSTS])

        // Invalidate URL registry cache when a post is published
        // This ensures page classification stays accurate
        if (data.status === 'published') {
            revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })
        }

        return { success: true, id: newPost?.id }
    } catch (error) {
        console.error('Error creating blog post:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create post',
        }
    }
}

export async function updateBlogPost(
    id: string,
    data: BlogPostFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate required fields
        const validationResult = validateBlogPostData(data)
        if (!validationResult.isValid) {
            return { success: false, error: validationResult.error }
        }

        // Check if slug already exists for another post
        const existingPost = await db
            .select({ id: blogPost.id })
            .from(blogPost)
            .where(eq(blogPost.slug, data.slug))
            .limit(1)

        if (existingPost.length > 0 && existingPost[0]?.id !== id) {
            return {
                success: false,
                error: 'A post with this slug already exists',
            }
        }

        // Get current post to check status change
        const currentPost = await db
            .select({
                status: blogPost.status,
                featuredImageId: blogPost.featuredImageId,
            })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!currentPost.length) {
            return { success: false, error: 'Post not found' }
        }

        // Handle featured image
        let featuredImageId = currentPost[0]?.featuredImageId ?? null

        if (data.featuredImageId) {
            // Use existing image record (preserves AI-generated alt text)
            featuredImageId = data.featuredImageId
        } else if (data.featuredImageUrl) {
            // Fallback: create/update record for URL-only input
            // Check if we need to create a new image record
            if (featuredImageId) {
                // Update existing image
                await db
                    .update(imagesTable)
                    .set({ url: data.featuredImageUrl, alt: data.title })
                    .where(eq(imagesTable.id, featuredImageId))
            } else {
                // Create new image record
                const [imageRecord] = await db
                    .insert(imagesTable)
                    .values({
                        url: data.featuredImageUrl,
                        alt: data.title,
                        title: data.title,
                    })
                    .returning({ id: imagesTable.id })

                featuredImageId = imageRecord?.id ?? null
            }
        } else if (featuredImageId) {
            // Clear the image association if URL was removed
            featuredImageId = null
        }

        // Determine if we need to update publishedAt
        const wasPublished = currentPost[0]?.status === 'published'
        const isNowPublished = data.status === 'published'
        const publishedAt =
            !wasPublished && isNowPublished ? new Date() : undefined

        // Update the blog post
        await db
            .update(blogPost)
            .set({
                title: data.title,
                slug: data.slug,
                content: data.content,
                metaDescription: data.metaDescription,
                metaTitle: data.metaTitle ?? null,
                metaKeywords: data.metaKeywords ?? null,
                primaryKeyword: data.primaryKeyword ?? null,
                secondaryKeywords: data.secondaryKeywords ?? null,
                excerpt: data.excerpt ?? null,
                authorId: data.authorId || null,
                status: data.status,
                aiSummary: data.aiSummary ?? null,
                faqs: data.faqs ?? null,
                featuredImageId,
                readingTime: data.readingTime ?? null,
                ...(publishedAt ? { publishedAt } : {}),
            })
            .where(eq(blogPost.id, id))

        revalidatePath('/blog/posts')
        revalidatePath(`/blog/posts/${id}/edit`)
        revalidatePath('/')

        // Revalidate web app cache
        await revalidateWebAppCache([
            CACHE_TAGS.BLOG_POSTS,
            CACHE_TAGS.blogPostBySlug(data.slug),
        ])

        // Invalidate URL registry cache when publish status changes
        // This ensures page classification stays accurate
        if (wasPublished !== isNowPublished) {
            revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })
        }

        return { success: true, id }
    } catch (error) {
        console.error('Error updating blog post:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update post',
        }
    }
}

export async function deleteBlogPost(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        // Fetch the post to get featuredImageId and slug before deletion
        const [existingPost] = await db
            .select({
                featuredImageId: blogPost.featuredImageId,
                slug: blogPost.slug,
            })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!existingPost) {
            return { success: false, error: 'Post not found' }
        }

        // Delete the blog post first
        await db.delete(blogPost).where(eq(blogPost.id, id))

        // Clean up orphaned featured image if it exists
        if (existingPost.featuredImageId) {
            await db
                .delete(imagesTable)
                .where(eq(imagesTable.id, existingPost.featuredImageId))
        }

        revalidatePath('/blog/posts')
        revalidatePath('/')

        // Revalidate web app cache
        const cacheTags: string[] = [CACHE_TAGS.BLOG_POSTS]
        if (existingPost.slug) {
            cacheTags.push(CACHE_TAGS.blogPostBySlug(existingPost.slug))
        }
        await revalidateWebAppCache(cacheTags)

        // Invalidate URL registry cache when a post is deleted
        // This ensures page classification stays accurate
        revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })

        return { success: true }
    } catch (error) {
        console.error('Error deleting blog post:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete post',
        }
    }
}

export async function updateBlogPostStatus(
    id: string,
    status: 'draft' | 'ready_to_publish' | 'published'
): Promise<ActionResult> {
    try {
        await requireAuth()

        const currentPost = await db
            .select({ status: blogPost.status, slug: blogPost.slug })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!currentPost.length) {
            return { success: false, error: 'Post not found' }
        }

        const wasAlreadyPublished = currentPost[0]?.status === 'published'
        const isNowPublished = status === 'published'
        const publishedAt =
            !wasAlreadyPublished && isNowPublished ? new Date() : undefined

        await db
            .update(blogPost)
            .set({
                status,
                ...(publishedAt ? { publishedAt } : {}),
            })
            .where(eq(blogPost.id, id))

        revalidatePath('/blog/posts')
        revalidatePath('/')

        // Revalidate web app cache
        const cacheTags: string[] = [CACHE_TAGS.BLOG_POSTS]
        if (currentPost[0]?.slug) {
            cacheTags.push(CACHE_TAGS.blogPostBySlug(currentPost[0].slug))
        }
        await revalidateWebAppCache(cacheTags)

        // Invalidate URL registry cache when publish status changes
        // This ensures page classification stays accurate
        if (wasAlreadyPublished !== isNowPublished) {
            revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating post status:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update status',
        }
    }
}

// ============================================================================
// Pipeline Actions
// ============================================================================

/**
 * Create a new blog post in the ideation stage (pipeline entry point)
 *
 * Delegates to createPipelinePostInternal (shared with autopilot); manual
 * creates are stamped as approved ideas since the admin chose the topic.
 */
export async function createPipelinePost(
    data: CreatePipelinePostData
): Promise<ActionResult> {
    try {
        await requireAuth()

        const result = await createPipelinePostInternal({
            ...data,
            ideaApproval: 'approved',
        })

        if (!result.success) {
            return { success: false, error: result.error }
        }

        revalidatePath('/blog/pipeline')
        revalidatePath('/blog/posts')

        return { success: true, id: result.id }
    } catch (error) {
        console.error('Error creating pipeline post:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create post',
        }
    }
}

/**
 * Approve a pending autopilot idea — it joins the writing queue.
 */
export async function approveIdea(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        const [idea] = await db
            .select({ status: blogPost.status })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!idea) {
            return { success: false, error: 'Idea not found' }
        }
        if (idea.status !== 'ideation') {
            return {
                success: false,
                error: 'Only ideation cards can be approved',
            }
        }

        await db
            .update(blogPost)
            .set({ ideaApproval: 'approved' })
            .where(eq(blogPost.id, id))

        revalidatePath('/blog/pipeline')
        return { success: true, id }
    } catch (error) {
        console.error('Error approving idea:', error)
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to approve idea',
        }
    }
}

/**
 * Reject an idea. The card leaves the board but the row is kept so
 * ideation never re-proposes the topic.
 */
export async function rejectIdea(
    id: string,
    reason?: string
): Promise<ActionResult> {
    try {
        await requireAuth()

        const [idea] = await db
            .select({
                status: blogPost.status,
                planningData: blogPost.planningData,
            })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!idea) {
            return { success: false, error: 'Idea not found' }
        }
        if (idea.status !== 'ideation') {
            return {
                success: false,
                error: 'Only ideation cards can be rejected',
            }
        }

        const planningData: PlanningData = {
            ...(idea.planningData ?? {}),
            ideaRejection: {
                reason: reason?.trim() || undefined,
                rejectedAt: new Date().toISOString(),
                rejectedBy: 'admin',
            },
        }

        await db
            .update(blogPost)
            .set({ ideaApproval: 'rejected', planningData })
            .where(eq(blogPost.id, id))

        revalidatePath('/blog/pipeline')
        return { success: true, id }
    } catch (error) {
        console.error('Error rejecting idea:', error)
        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to reject idea',
        }
    }
}

/**
 * Update a blog post's pipeline status
 * This is used by the Kanban board for drag-and-drop
 */
export async function updatePipelineStatus(
    id: string,
    status: PipelineStatus
): Promise<ActionResult> {
    try {
        await requireAuth()

        const [existingPost] = await db
            .select({
                id: blogPost.id,
                status: blogPost.status,
                slug: blogPost.slug,
                pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
            })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!existingPost) {
            return { success: false, error: 'Post not found' }
        }

        // Don't allow status change while processing
        if (existingPost.pipelineProcessingStatus === 'processing') {
            return {
                success: false,
                error: 'Cannot change status while processing',
            }
        }

        // A post without a slug is unreachable on the site — block go-live
        if (
            (status === 'published' || status === 'scheduled') &&
            !existingPost.slug
        ) {
            return {
                success: false,
                error: 'Cannot publish a post without a slug. Set a slug first.',
            }
        }

        // Determine if this is a publish action
        const wasPublished = existingPost.status === 'published'
        const isNowPublished = status === 'published'
        const publishedAt =
            !wasPublished && isNowPublished ? new Date() : undefined

        await db
            .update(blogPost)
            .set({
                status,
                ...(publishedAt ? { publishedAt } : {}),
            })
            .where(eq(blogPost.id, id))

        revalidatePath('/blog/pipeline')
        revalidatePath('/blog/posts')

        // Revalidate web app cache if publishing
        if (existingPost.slug) {
            await revalidateWebAppCache([
                CACHE_TAGS.BLOG_POSTS,
                CACHE_TAGS.blogPostBySlug(existingPost.slug),
            ])
        }

        // Invalidate URL registry cache when publish status changes
        if (wasPublished !== isNowPublished) {
            revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating pipeline status:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update status',
        }
    }
}

/**
 * Update a blog post's planning data
 */
export async function updatePlanningData(
    id: string,
    planningData: PlanningData
): Promise<ActionResult> {
    try {
        await requireAuth()

        const [existingPost] = await db
            .select({ id: blogPost.id })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!existingPost) {
            return { success: false, error: 'Post not found' }
        }

        await db
            .update(blogPost)
            .set({ planningData })
            .where(eq(blogPost.id, id))

        revalidatePath('/blog/pipeline')
        revalidatePath(`/blog/posts/${id}`)

        return { success: true }
    } catch (error) {
        console.error('Error updating planning data:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update planning data',
        }
    }
}

/**
 * Update a blog post's priority
 */
export async function updatePostPriority(
    id: string,
    priority: BlogPostPriority
): Promise<ActionResult> {
    try {
        await requireAuth()

        const [existingPost] = await db
            .select({ id: blogPost.id })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!existingPost) {
            return { success: false, error: 'Post not found' }
        }

        await db.update(blogPost).set({ priority }).where(eq(blogPost.id, id))

        revalidatePath('/blog/pipeline')

        return { success: true }
    } catch (error) {
        console.error('Error updating post priority:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update priority',
        }
    }
}

/**
 * Duplicate a blog post (creates a copy in ideation stage)
 */
export async function duplicateBlogPost(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        const [existingPost] = await db
            .select({
                title: blogPost.title,
                primaryKeyword: blogPost.primaryKeyword,
                secondaryKeywords: blogPost.secondaryKeywords,
                authorId: blogPost.authorId,
                priority: blogPost.priority,
                planningData: blogPost.planningData,
                content: blogPost.content,
            })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!existingPost) {
            return { success: false, error: 'Post not found' }
        }

        const [newPost] = await db
            .insert(blogPost)
            .values({
                title: `${existingPost.title} (Copy)`,
                primaryKeyword: existingPost.primaryKeyword,
                secondaryKeywords: existingPost.secondaryKeywords,
                authorId: existingPost.authorId,
                priority: existingPost.priority,
                planningData: existingPost.planningData,
                content: existingPost.content,
                status: 'ideation',
                pipelineProcessingStatus: 'idle',
            })
            .returning({ id: blogPost.id })

        revalidatePath('/blog/pipeline')
        revalidatePath('/blog/posts')

        return { success: true, id: newPost?.id }
    } catch (error) {
        console.error('Error duplicating blog post:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to duplicate post',
        }
    }
}

/**
 * Update a blog post from the pipeline edit dialog
 * Handles all fields including title, SEO, media, planning data, and FAQs
 */
export async function updatePipelinePost(
    id: string,
    data: UpdatePipelinePostData
): Promise<ActionResult> {
    try {
        await requireAuth()

        if (!data.title?.trim()) {
            return { success: false, error: 'Title is required' }
        }

        const [existingPost] = await db
            .select({
                id: blogPost.id,
                status: blogPost.status,
                slug: blogPost.slug,
                pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
            })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!existingPost) {
            return { success: false, error: 'Post not found' }
        }

        // Don't allow updates while processing
        if (existingPost.pipelineProcessingStatus === 'processing') {
            return {
                success: false,
                error: 'Cannot update while processing',
            }
        }

        // Check for slug uniqueness if changed
        if (data.slug && data.slug !== existingPost.slug) {
            const [existingSlug] = await db
                .select({ id: blogPost.id })
                .from(blogPost)
                .where(eq(blogPost.slug, data.slug))
                .limit(1)

            if (existingSlug && existingSlug.id !== id) {
                return {
                    success: false,
                    error: 'A post with this slug already exists',
                }
            }
        }

        // Determine if this is a publish action
        const wasPublished = existingPost.status === 'published'
        const isNowPublished = data.status === 'published'
        const publishedAt =
            !wasPublished && isNowPublished ? new Date() : undefined

        // Build update object with all provided fields
        const updateData: Record<string, unknown> = {
            title: data.title.trim(),
            status: data.status,
            priority: data.priority,
        }

        // Optional fields - only set if provided (not undefined)
        if (data.slug !== undefined) updateData.slug = data.slug
        if (data.primaryKeyword !== undefined)
            updateData.primaryKeyword = data.primaryKeyword
        if (data.secondaryKeywords !== undefined)
            updateData.secondaryKeywords = data.secondaryKeywords
        if (data.content !== undefined) updateData.content = data.content
        if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle
        if (data.metaDescription !== undefined)
            updateData.metaDescription = data.metaDescription
        if (data.metaKeywords !== undefined)
            updateData.metaKeywords = data.metaKeywords
        if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
        if (data.quickAnswer !== undefined)
            updateData.quickAnswer = data.quickAnswer
        if (data.authorId !== undefined) updateData.authorId = data.authorId
        if (data.featuredImageId !== undefined)
            updateData.featuredImageId = data.featuredImageId
        if (data.aiSummary !== undefined) updateData.aiSummary = data.aiSummary
        if (data.planningData !== undefined)
            updateData.planningData = data.planningData
        if (data.faqs !== undefined) updateData.faqs = data.faqs
        if (data.readingTime !== undefined)
            updateData.readingTime = data.readingTime
        if (publishedAt) updateData.publishedAt = publishedAt

        await db.update(blogPost).set(updateData).where(eq(blogPost.id, id))

        revalidatePath('/blog/pipeline')
        revalidatePath('/blog/posts')
        revalidatePath(`/blog/posts/${id}`)

        // Revalidate web app cache - use new slug if changed, otherwise existing
        const slugToRevalidate = data.slug ?? existingPost.slug
        if (slugToRevalidate) {
            await revalidateWebAppCache([
                CACHE_TAGS.BLOG_POSTS,
                CACHE_TAGS.blogPostBySlug(slugToRevalidate),
            ])
        }

        // Invalidate URL registry cache when publish status changes
        if (wasPublished !== isNowPublished) {
            revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })
        }

        return { success: true }
    } catch (error) {
        console.error('Error updating pipeline post:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update post',
        }
    }
}

// ============================================================================
// Inline Image Tracking
// ============================================================================

export type InlineImageData = {
    imageUrl: string
    altText: string
    prompt?: string
}

/**
 * Track inline images that were generated and inserted into a blog post.
 * Creates image records and links them to the post via the junction table.
 */
export async function trackInlineImages(
    blogPostId: string,
    images: InlineImageData[]
): Promise<ActionResult> {
    try {
        await requireAuth()

        if (!blogPostId) {
            return { success: false, error: 'Blog post ID is required' }
        }

        if (!images.length) {
            return { success: true } // Nothing to track
        }

        // Verify the blog post exists
        const [existingPost] = await db
            .select({ id: blogPost.id })
            .from(blogPost)
            .where(eq(blogPost.id, blogPostId))
            .limit(1)

        if (!existingPost) {
            return { success: false, error: 'Blog post not found' }
        }

        // Track each inline image
        for (const img of images) {
            // Create the image record
            const [imageRecord] = await db
                .insert(imagesTable)
                .values({
                    url: img.imageUrl,
                    alt: img.altText,
                    generatedBy: 'fal-ai',
                    generationPrompt: img.prompt ?? img.altText,
                })
                .onConflictDoUpdate({
                    target: imagesTable.url,
                    set: { updatedAt: new Date() },
                })
                .returning({ id: imagesTable.id })

            // Link to blog post with 'inline' type
            if (imageRecord) {
                await db
                    .insert(blogPostImages)
                    .values({
                        blogPostId,
                        imageId: imageRecord.id,
                        prompt: img.prompt ?? img.altText,
                        imageType: 'inline',
                    })
                    .onConflictDoNothing()
            }
        }

        // Revalidate the blog posts list to update inline image counts
        revalidatePath('/blog/posts')

        return { success: true }
    } catch (error) {
        console.error('Error tracking inline images:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to track inline images',
        }
    }
}
