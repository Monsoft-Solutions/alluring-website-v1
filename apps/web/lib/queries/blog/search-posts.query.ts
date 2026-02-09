import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import { blogPost, images } from '@workspace/db/schema/blog'
import { and, desc, eq, isNotNull, or, ilike } from 'drizzle-orm'

/**
 * Search result item for blog posts
 */
export type SearchResultPost = {
    slug: string
    title: string
    excerpt: string | null
    featuredImage: {
        url: string
        alt: string
        blurDataUrl?: string | null
    } | null
}

/**
 * Minimal post data for search index (pre-loaded on blog pages)
 */
export type SearchIndexPost = {
    slug: string
    title: string
    excerpt: string | null
    publishedAt: string | null
}

/**
 * Internal function to search blog posts in database
 * Searches in title and excerpt fields
 */
async function fetchSearchResults(
    query: string,
    limit: number
): Promise<SearchResultPost[]> {
    const searchPattern = `%${query}%`

    const rows = await db
        .select({
            slug: blogPost.slug,
            title: blogPost.title,
            excerpt: blogPost.excerpt,
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
                isNotNull(blogPost.slug),
                or(
                    ilike(blogPost.title, searchPattern),
                    ilike(blogPost.excerpt, searchPattern)
                )
            )
        )
        .orderBy(desc(blogPost.publishedAt))
        .limit(limit)

    return rows
        .filter((r) => r.slug !== null)
        .map((r) => ({
            slug: r.slug!,
            title: r.title,
            excerpt: r.excerpt,
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
 * Search blog posts by query
 *
 * Uses Next.js unstable_cache for cross-request caching.
 * Searches in title and excerpt fields.
 *
 * @param query - The search query string
 * @param limit - Maximum number of results (default: 10)
 * @returns Array of matching posts
 */
export const searchPosts = (
    query: string,
    limit = 10
): Promise<SearchResultPost[]> => {
    // Normalize query for caching
    const normalizedQuery = query.toLowerCase().trim()

    if (normalizedQuery.length < 2) {
        return Promise.resolve([])
    }

    return unstable_cache(
        () => fetchSearchResults(normalizedQuery, limit),
        [`blog-search-${normalizedQuery}-${limit}`],
        {
            tags: ['blog-posts', 'blog-search'],
            revalidate: 60,
        }
    )()
}

/**
 * Internal function to fetch search index for client-side search
 */
async function fetchSearchIndex(): Promise<SearchIndexPost[]> {
    const rows = await db
        .select({
            slug: blogPost.slug,
            title: blogPost.title,
            excerpt: blogPost.excerpt,
            publishedAt: blogPost.publishedAt,
        })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.publishedAt),
                isNotNull(blogPost.slug)
            )
        )
        .orderBy(desc(blogPost.publishedAt))

    return rows
        .filter((r) => r.slug !== null)
        .map((r) => ({
            slug: r.slug!,
            title: r.title,
            excerpt: r.excerpt,
            publishedAt: r.publishedAt?.toISOString() ?? null,
        }))
}

/**
 * Get all published posts for client-side search index
 *
 * Used to pre-load post data for fast client-side fuzzy search.
 *
 * @returns Array of posts with title, slug, and excerpt
 */
export const getSearchIndex = (): Promise<SearchIndexPost[]> => {
    return unstable_cache(() => fetchSearchIndex(), ['blog-search-index'], {
        tags: ['blog-posts', 'blog-search-index'],
        revalidate: 300, // Cache for 5 minutes
    })()
}
