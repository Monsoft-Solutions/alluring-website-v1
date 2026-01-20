import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { blogPost, images } from '@workspace/db/schema/blog'
import { and, desc, eq, isNotNull } from 'drizzle-orm'

/**
 * Popular post data for widget display
 */
export type PopularPost = {
    slug: string
    title: string
    views: number
    featuredImage: {
        url: string
        alt: string
        blurDataUrl?: string | null
    } | null
}

/**
 * Format view count for display (e.g., 12345 -> "12.3K")
 */
export function formatViewCount(views: number): string {
    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
        return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
}

/**
 * Internal function to fetch popular posts from database
 */
async function fetchPopularPosts(limit: number): Promise<PopularPost[]> {
    const rows = await db
        .select({
            slug: blogPost.slug,
            title: blogPost.title,
            views: blogPost.views,
            imageUrl: images.url,
            imageAlt: images.alt,
            imageBlur: images.blurDataUrl,
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
        .orderBy(desc(blogPost.views))
        .limit(limit)

    return rows
        .filter((r) => r.slug !== null)
        .map((r) => ({
            slug: r.slug!,
            title: r.title,
            views: r.views,
            featuredImage: r.imageUrl
                ? {
                      url: r.imageUrl,
                      alt: r.imageAlt ?? '',
                      blurDataUrl: r.imageBlur,
                  }
                : null,
        }))
}

/**
 * Get popular posts ordered by view count
 *
 * Uses Next.js unstable_cache for cross-request caching.
 *
 * @param limit - Maximum number of posts to return (default: 5)
 * @returns Array of popular posts ordered by views
 */
export const getPopularPosts = (limit = 5): Promise<PopularPost[]> => {
    return unstable_cache(
        () => fetchPopularPosts(limit),
        [`blog-popular-posts-${limit}`],
        {
            tags: ['blog-posts', 'blog-popular-posts'],
            revalidate: 300, // Cache for 5 minutes (views update frequently)
        }
    )()
}
