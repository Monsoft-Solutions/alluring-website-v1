import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { blogPost, images } from '@workspace/db/schema/blog'
import { and, desc, eq, gt, isNotNull, lt, asc, ne, or } from 'drizzle-orm'

/**
 * Minimal post data for prev/next navigation
 */
export type AdjacentPost = {
    slug: string
    title: string
    publishedAt: string | null
    featuredImage: {
        url: string
        alt: string
        blurDataUrl?: string | null
    } | null
}

/**
 * Adjacent posts (previous and next) for navigation
 */
export type AdjacentPosts = {
    previousPost: AdjacentPost | null
    nextPost: AdjacentPost | null
}

/**
 * Internal function to fetch adjacent posts from database
 *
 * Uses date comparison with explicit ID exclusion to handle edge cases
 * where posts might have the same publishedAt timestamp.
 */
async function fetchAdjacentPosts(
    postId: string,
    publishedAt: Date
): Promise<AdjacentPosts> {
    // Get previous post (older, published before current or same time but different post)
    // Uses <= with explicit ID exclusion for posts with same timestamp
    const previousRows = await db
        .select({
            slug: blogPost.slug,
            title: blogPost.title,
            publishedAt: blogPost.publishedAt,
            imageUrl: images.url,
            imageAlt: images.alt,
            imageBlur: images.blurDataUrl,
        })
        .from(blogPost)
        .leftJoin(images, eq(images.id, blogPost.featuredImageId))
        .where(
            and(
                ne(blogPost.id, postId), // Explicitly exclude current post
                or(
                    lt(blogPost.publishedAt, publishedAt),
                    // Handle same-timestamp posts by using ID comparison
                    and(
                        eq(blogPost.publishedAt, publishedAt),
                        lt(blogPost.id, postId)
                    )
                ),
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.publishedAt),
                isNotNull(blogPost.slug)
            )
        )
        .orderBy(desc(blogPost.publishedAt), desc(blogPost.id))
        .limit(1)

    // Get next post (newer, published after current or same time but different post)
    const nextRows = await db
        .select({
            slug: blogPost.slug,
            title: blogPost.title,
            publishedAt: blogPost.publishedAt,
            imageUrl: images.url,
            imageAlt: images.alt,
            imageBlur: images.blurDataUrl,
        })
        .from(blogPost)
        .leftJoin(images, eq(images.id, blogPost.featuredImageId))
        .where(
            and(
                ne(blogPost.id, postId), // Explicitly exclude current post
                or(
                    gt(blogPost.publishedAt, publishedAt),
                    // Handle same-timestamp posts by using ID comparison
                    and(
                        eq(blogPost.publishedAt, publishedAt),
                        gt(blogPost.id, postId)
                    )
                ),
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.publishedAt),
                isNotNull(blogPost.slug)
            )
        )
        .orderBy(asc(blogPost.publishedAt), asc(blogPost.id))
        .limit(1)

    const previousRow = previousRows[0]
    const nextRow = nextRows[0]

    return {
        previousPost:
            previousRow && previousRow.slug
                ? {
                      slug: previousRow.slug,
                      title: previousRow.title,
                      publishedAt:
                          previousRow.publishedAt?.toISOString() ?? null,
                      featuredImage: previousRow.imageUrl
                          ? {
                                url: previousRow.imageUrl,
                                alt: previousRow.imageAlt ?? '',
                                blurDataUrl: previousRow.imageBlur,
                            }
                          : null,
                  }
                : null,
        nextPost:
            nextRow && nextRow.slug
                ? {
                      slug: nextRow.slug,
                      title: nextRow.title,
                      publishedAt: nextRow.publishedAt?.toISOString() ?? null,
                      featuredImage: nextRow.imageUrl
                          ? {
                                url: nextRow.imageUrl,
                                alt: nextRow.imageAlt ?? '',
                                blurDataUrl: nextRow.imageBlur,
                            }
                          : null,
                  }
                : null,
    }
}

/**
 * Get adjacent posts (previous and next) for navigation
 *
 * Uses Next.js unstable_cache for cross-request caching.
 * Posts are ordered by publishedAt date.
 *
 * @param postId - The current post ID
 * @param publishedAt - The published date of the current post (ISO string)
 * @returns Previous and next posts for navigation
 */
export const getAdjacentPosts = (
    postId: string,
    publishedAt: string
): Promise<AdjacentPosts> => {
    const date = new Date(publishedAt)

    return unstable_cache(
        () => fetchAdjacentPosts(postId, date),
        [`blog-adjacent-posts-${postId}`],
        {
            tags: ['blog-posts', `blog-adjacent-${postId}`],
            revalidate: 60,
        }
    )()
}
