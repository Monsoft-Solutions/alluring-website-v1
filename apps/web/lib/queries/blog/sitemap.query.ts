/**
 * Blog Sitemap Query
 *
 * Fetches data needed for sitemap generation:
 * - All published blog post slugs with featured images
 * - All active category slugs
 * - All active tag slugs
 */
import { db } from '@workspace/db/client'
import {
    blogCategory,
    blogPost,
    blogTag,
    images,
} from '@workspace/db/schema/blog'
import { and, eq, isNotNull } from 'drizzle-orm'
import { cache } from 'react'

/**
 * Blog post sitemap entry with optional featured image
 */
export type BlogPostSitemapEntry = {
    slug: string
    updatedAt: Date
    publishedAt: Date
    featuredImageUrl: string | null
    featuredImageTitle: string | null
}

/**
 * Get all published blog post slugs with their last modified dates and featured images
 */
export const getPublishedPostSlugs = cache(
    async (): Promise<BlogPostSitemapEntry[]> => {
        const rows = await db
            .select({
                slug: blogPost.slug,
                updatedAt: blogPost.updatedAt,
                publishedAt: blogPost.publishedAt,
                featuredImageUrl: images.url,
                featuredImageTitle: images.title,
            })
            .from(blogPost)
            .leftJoin(images, eq(images.id, blogPost.featuredImageId))
            .where(
                and(
                    eq(blogPost.status, 'published'),
                    isNotNull(blogPost.publishedAt)
                )
            )

        return rows.map((r) => ({
            slug: r.slug,
            // Use updatedAt if available, otherwise fallback to publishedAt
            updatedAt: r.updatedAt ?? r.publishedAt!,
            publishedAt: r.publishedAt!,
            featuredImageUrl: r.featuredImageUrl,
            featuredImageTitle: r.featuredImageTitle,
        }))
    }
)

/**
 * Get all active category slugs
 */
export const getActiveCategorySlugs = cache(async (): Promise<string[]> => {
    const rows = await db
        .select({ slug: blogCategory.slug })
        .from(blogCategory)
        .where(eq(blogCategory.isActive, true))

    return rows.map((r) => r.slug)
})

/**
 * Get all active tag slugs
 */
export const getActiveTagSlugs = cache(async (): Promise<string[]> => {
    const rows = await db
        .select({ slug: blogTag.slug })
        .from(blogTag)
        .where(eq(blogTag.isActive, true))

    return rows.map((r) => r.slug)
})
