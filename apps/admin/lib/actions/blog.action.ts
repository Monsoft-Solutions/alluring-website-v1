'use server'

import { db } from '@workspace/db/client'
import { blogPost, images } from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'
import { validateBlogPostData } from '@/lib/utils/blog-validation.util'
import {
    revalidateWebAppCache,
    CACHE_TAGS,
} from '@/lib/utils/revalidate-web.util'

export type BlogPostFormData = {
    title: string
    slug: string
    content: string
    metaDescription: string
    metaTitle?: string | null
    metaKeywords?: string | null
    excerpt?: string | null
    authorId?: string | null
    status: 'draft' | 'readyToPublish' | 'published'
    aiSummary?: string | null
    featuredImageUrl?: string | null
    readingTime?: number | null
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
                excerpt: data.excerpt ?? null,
                authorId: data.authorId || null,
                status: data.status,
                aiSummary: data.aiSummary ?? null,
                featuredImageId,
                readingTime: data.readingTime ?? null,
                publishedAt: data.status === 'published' ? new Date() : null,
            })
            .returning({ id: blogPost.id })

        revalidatePath('/blog/posts')
        revalidatePath('/')

        // Revalidate web app cache
        await revalidateWebAppCache([CACHE_TAGS.BLOG_POSTS])

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
        if (data.featuredImageUrl) {
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
                excerpt: data.excerpt ?? null,
                authorId: data.authorId || null,
                status: data.status,
                aiSummary: data.aiSummary ?? null,
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
        await revalidateWebAppCache([
            CACHE_TAGS.BLOG_POSTS,
            CACHE_TAGS.blogPostBySlug(existingPost.slug),
        ])

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
    status: 'draft' | 'readyToPublish' | 'published'
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
        await revalidateWebAppCache([
            CACHE_TAGS.BLOG_POSTS,
            CACHE_TAGS.blogPostBySlug(currentPost[0]!.slug),
        ])

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
