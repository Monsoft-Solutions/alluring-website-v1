'use server'

import { db } from '@workspace/db/client'
import { blogPost, images } from '@workspace/db/schema/blog'
import type { PlanningData } from '@workspace/db/types'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@workspace/shared/cache'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import { validateBlogPostData } from '@/lib/utils/blog-validation.util'
import { revalidateWebAppCache } from '@/lib/utils/revalidate-web.util'

/**
 * All possible pipeline status values
 */
export type PipelineStatus =
    | 'ideation'
    | 'generate'
    | 'ai_review'
    | 'generate_metadata'
    | 'draft'
    | 'ready_to_publish'
    | 'scheduled'
    | 'published'

/**
 * Processing status for pipeline operations
 */
export type ProcessingStatus = 'idle' | 'processing' | 'error'

/**
 * Priority levels for Kanban ordering
 */
export type BlogPostPriority = 'low' | 'medium' | 'high' | 'urgent'

export type BlogPostFormData = {
    title: string
    slug: string
    content: string
    metaDescription: string
    metaTitle?: string | null
    metaKeywords?: string | null
    primaryKeyword?: string | null
    secondaryKeywords?: string[] | null
    excerpt?: string | null
    authorId?: string | null
    status: 'draft' | 'ready_to_publish' | 'published'
    aiSummary?: string | null
    featuredImageUrl?: string | null
    featuredImageId?: string | null
    readingTime?: number | null
    faqs?: Array<{ question: string; answer: string }> | null
}

/**
 * Form data for creating a new blog post in the pipeline
 */
export type CreatePipelinePostData = {
    title: string
    primaryKeyword?: string | null
    secondaryKeywords?: string[] | null
    authorId?: string | null
    priority?: BlogPostPriority
    planningData?: PlanningData | null
}

type ActionResult = {
    success: boolean
    error?: string
    id?: string
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
                .insert(images)
                .values({
                    url: data.featuredImageUrl,
                    alt: data.title,
                    title: data.title,
                })
                .returning({ id: images.id })

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
                    .update(images)
                    .set({ url: data.featuredImageUrl, alt: data.title })
                    .where(eq(images.id, featuredImageId))
            } else {
                // Create new image record
                const [imageRecord] = await db
                    .insert(images)
                    .values({
                        url: data.featuredImageUrl,
                        alt: data.title,
                        title: data.title,
                    })
                    .returning({ id: images.id })

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
                .delete(images)
                .where(eq(images.id, existingPost.featuredImageId))
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
 */
export async function createPipelinePost(
    data: CreatePipelinePostData
): Promise<ActionResult> {
    try {
        await requireAuth()

        if (!data.title?.trim()) {
            return { success: false, error: 'Title is required' }
        }

        const [newPost] = await db
            .insert(blogPost)
            .values({
                title: data.title.trim(),
                primaryKeyword: data.primaryKeyword ?? null,
                secondaryKeywords: data.secondaryKeywords ?? null,
                authorId: data.authorId ?? null,
                priority: data.priority ?? 'medium',
                planningData: data.planningData ?? null,
                status: 'ideation',
                pipelineProcessingStatus: 'idle',
            })
            .returning({ id: blogPost.id })

        revalidatePath('/blog/pipeline')
        revalidatePath('/blog/posts')

        return { success: true, id: newPost?.id }
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
 * Form data for updating a pipeline post from the edit dialog
 */
export type UpdatePipelinePostData = {
    title: string
    slug?: string | null
    status: PipelineStatus
    priority: BlogPostPriority
    // Keywords
    primaryKeyword?: string | null
    secondaryKeywords?: string[] | null
    // Content
    content?: string | null
    // SEO
    metaTitle?: string | null
    metaDescription?: string | null
    metaKeywords?: string | null
    excerpt?: string | null
    // Author
    authorId?: string | null
    // Media
    featuredImageId?: string | null
    aiSummary?: string | null
    // Planning & FAQs
    planningData?: PlanningData | null
    faqs?: Array<{ question: string; answer: string }> | null
    // Reading time
    readingTime?: number | null
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
