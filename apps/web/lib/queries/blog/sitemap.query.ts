/**
 * Blog Sitemap Query
 *
 * Fetches data needed for sitemap generation:
 * - All published blog post slugs
 * - All active category slugs
 * - All active tag slugs
 */
import { db } from '@workspace/db/client'
import { blogCategory, blogPost, blogTag } from '@workspace/db/schema/blog'
import { and, eq, isNotNull } from 'drizzle-orm'
import { cache } from 'react'

/**
 * Get all published blog post slugs with their last modified dates
 */
export const getPublishedPostSlugs = cache(
    async (): Promise<
        Array<{ slug: string; updatedAt: Date; publishedAt: Date }>
    > => {
        const rows = await db
            .select({
                slug: blogPost.slug,
                updatedAt: blogPost.updatedAt,
                publishedAt: blogPost.publishedAt,
            })
            .from(blogPost)
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
