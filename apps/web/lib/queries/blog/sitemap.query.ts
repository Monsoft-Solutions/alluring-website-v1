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
    blogPostCategory,
    blogTag,
    images,
} from '@workspace/db/schema/blog'
import { and, desc, eq, isNotNull } from 'drizzle-orm'
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
    featuredImageAlt: string | null
}

/**
 * Blog category sitemap entry with timestamps
 */
export type BlogCategorySitemapEntry = {
    slug: string
    updatedAt: Date | null
    createdAt: Date | null
}

/**
 * Blog tag sitemap entry with timestamp
 */
export type BlogTagSitemapEntry = {
    slug: string
    createdAt: Date
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
                featuredImageAlt: images.alt,
            })
            .from(blogPost)
            .leftJoin(images, eq(images.id, blogPost.featuredImageId))
            .where(
                and(
                    eq(blogPost.status, 'published'),
                    isNotNull(blogPost.publishedAt),
                    isNotNull(blogPost.slug)
                )
            )

        return rows
            .filter((r) => r.slug !== null)
            .map((r) => ({
                slug: r.slug!,
                // Use updatedAt if available, otherwise fallback to publishedAt
                updatedAt: r.updatedAt ?? r.publishedAt!,
                publishedAt: r.publishedAt!,
                featuredImageUrl: r.featuredImageUrl,
                featuredImageTitle: r.featuredImageTitle,
                featuredImageAlt: r.featuredImageAlt,
            }))
    }
)

/**
 * Get all active category slugs with timestamps
 */
export const getActiveCategorySlugs = cache(
    async (): Promise<BlogCategorySitemapEntry[]> => {
        const rows = await db
            .select({
                slug: blogCategory.slug,
                updatedAt: blogCategory.updatedAt,
                createdAt: blogCategory.createdAt,
            })
            .from(blogCategory)
            .where(eq(blogCategory.isActive, true))

        return rows.map((r) => ({
            slug: r.slug,
            updatedAt: r.updatedAt,
            createdAt: r.createdAt,
        }))
    }
)

/**
 * Get all active tag slugs with timestamp
 */
export const getActiveTagSlugs = cache(
    async (): Promise<BlogTagSitemapEntry[]> => {
        const rows = await db
            .select({
                slug: blogTag.slug,
                createdAt: blogTag.createdAt,
            })
            .from(blogTag)
            .where(eq(blogTag.isActive, true))

        return rows.map((r) => ({
            slug: r.slug,
            createdAt: r.createdAt,
        }))
    }
)

/**
 * Get the most recent blog post date (for blog listing page lastmod)
 * Returns the publishedAt date of the most recently published post
 */
export const getMostRecentPostDate = cache(async (): Promise<Date | null> => {
    const result = await db
        .select({ publishedAt: blogPost.publishedAt })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.publishedAt)
            )
        )
        .orderBy(desc(blogPost.publishedAt))
        .limit(1)

    return result[0]?.publishedAt ?? null
})

/**
 * Get most recent post date for a specific category
 * Returns the publishedAt date of the most recent post in the category
 */
export const getMostRecentPostDateForCategory = cache(
    async (categorySlug: string): Promise<Date | null> => {
        const result = await db
            .select({ publishedAt: blogPost.publishedAt })
            .from(blogPost)
            .innerJoin(
                blogPostCategory,
                eq(blogPostCategory.blogPostId, blogPost.id)
            )
            .innerJoin(
                blogCategory,
                eq(blogCategory.id, blogPostCategory.categoryId)
            )
            .where(
                and(
                    eq(blogPost.status, 'published'),
                    isNotNull(blogPost.publishedAt),
                    eq(blogCategory.slug, categorySlug),
                    eq(blogCategory.isActive, true)
                )
            )
            .orderBy(desc(blogPost.publishedAt))
            .limit(1)

        return result[0]?.publishedAt ?? null
    }
)
