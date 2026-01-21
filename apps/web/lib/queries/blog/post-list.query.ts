import { unstable_cache } from 'next/cache'

import { db } from '@workspace/db/client'
import {
    author,
    blogCategory,
    blogPost,
    blogPostCategory,
    blogPostTag,
    blogTag,
    images,
} from '@workspace/db/schema/blog'
import { and, desc, eq, isNotNull, lt, ne, or } from 'drizzle-orm'
import { CACHE_TAGS } from '@workspace/shared/cache'

import type { BlogPostCard } from '@/types/blog/post-card.type'

const PAGE_SIZE_DEFAULT = 12

/**
 * Internal function to fetch blog post cards from database
 * This is wrapped by getPublishedPostCardsPage for caching
 */
async function fetchPublishedPostCardsPage(options?: {
    limit?: number
    cursor?: { publishedAt: Date; id: string } | null
    categorySlug?: string | null
    tagSlug?: string | null
    excludeSlug?: string | null
}): Promise<{
    items: BlogPostCard[]
    nextCursor?: { publishedAt: Date; id: string }
}> {
    const limit = Math.min(
        Math.max(options?.limit ?? PAGE_SIZE_DEFAULT, 1),
        100
    )

    const cursor = options?.cursor
    const categorySlug = options?.categorySlug ?? null
    const tagSlug = options?.tagSlug ?? null
    const excludeSlug = options?.excludeSlug ?? null
    const whereExpr = cursor
        ? and(
              eq(blogPost.status, 'published'),
              isNotNull(blogPost.publishedAt),
              or(
                  lt(blogPost.publishedAt, cursor.publishedAt),
                  and(
                      eq(blogPost.publishedAt, cursor.publishedAt),
                      lt(blogPost.id, cursor.id)
                  )
              )
          )
        : and(
              eq(blogPost.status, 'published'),
              isNotNull(blogPost.publishedAt),
              isNotNull(blogPost.slug)
          )

    // Build base query with optional taxonomy filters
    let query = db
        .select({
            id: blogPost.id,
            slug: blogPost.slug,
            title: blogPost.title,
            excerpt: blogPost.excerpt,
            publishedAt: blogPost.publishedAt,
            readingTime: blogPost.readingTime,
            authorName: author.name,
            imageUrl: images.url,
            imageAlt: images.alt,
            imageBlur: images.blurDataUrl,
        })
        .from(blogPost)
        .leftJoin(author, eq(author.id, blogPost.authorId))
        .leftJoin(images, eq(images.id, blogPost.featuredImageId))

    if (categorySlug) {
        query = query
            .innerJoin(
                blogPostCategory,
                eq(blogPostCategory.blogPostId, blogPost.id)
            )
            .innerJoin(
                blogCategory,
                eq(blogCategory.id, blogPostCategory.categoryId)
            )
    }

    if (tagSlug) {
        query = query
            .innerJoin(blogPostTag, eq(blogPostTag.blogPostId, blogPost.id))
            .innerJoin(blogTag, eq(blogTag.id, blogPostTag.tagId))
    }

    const rows = await query
        .where(
            and(
                whereExpr,
                categorySlug ? eq(blogCategory.slug, categorySlug) : undefined,
                tagSlug ? eq(blogTag.slug, tagSlug) : undefined,
                excludeSlug ? ne(blogPost.slug, excludeSlug) : undefined
            )
        )
        .orderBy(desc(blogPost.publishedAt), desc(blogPost.id))
        .limit(limit + 1)

    const items: BlogPostCard[] = rows
        .slice(0, limit)
        .filter((r) => r.slug !== null)
        .map((r) => ({
            id: r.id,
            slug: r.slug!,
            title: r.title,
            excerpt: r.excerpt,
            publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
            readingTime: r.readingTime,
            featuredImage: r.imageUrl
                ? {
                      url: r.imageUrl,
                      alt: r.imageAlt ?? '',
                      blurDataUrl: r.imageBlur,
                  }
                : null,
            author: r.authorName ? { name: r.authorName } : null,
        }))

    let nextCursor: { publishedAt: Date; id: string } | undefined
    if (rows.length > limit) {
        const last = rows[limit - 1]!
        nextCursor = {
            publishedAt: last.publishedAt!,
            id: last.id,
        }
    }

    return { items, nextCursor }
}

/**
 * Get a page of published blog posts with caching
 *
 * Uses Next.js unstable_cache for cross-request caching.
 * Cache is tagged with 'blog-posts' for on-demand invalidation.
 *
 * Note: Cursor-based pagination results are cached per cursor value.
 * This means the first page is cached, but subsequent pages with cursors
 * are also cached independently.
 *
 * @param options - Query options including limit, cursor, and taxonomy filters
 * @returns Paginated blog post cards with next cursor
 */
export async function getPublishedPostCardsPage(options?: {
    limit?: number
    cursor?: { publishedAt: Date; id: string } | null
    categorySlug?: string | null
    tagSlug?: string | null
    excludeSlug?: string | null
}): Promise<{
    items: BlogPostCard[]
    nextCursor?: { publishedAt: Date; id: string }
}> {
    // Generate cache key based on options
    const limit = options?.limit ?? PAGE_SIZE_DEFAULT
    const categorySlug = options?.categorySlug ?? 'all'
    const tagSlug = options?.tagSlug ?? 'all'
    const excludeSlug = options?.excludeSlug ?? 'none'
    const cursorKey = options?.cursor
        ? `${options.cursor.publishedAt.toISOString()}-${options.cursor.id}`
        : 'initial'

    const result = await unstable_cache(
        () => fetchPublishedPostCardsPage(options),
        [
            'blog-posts-list',
            String(limit),
            categorySlug,
            tagSlug,
            excludeSlug,
            cursorKey,
        ],
        {
            tags: [CACHE_TAGS.BLOG_POSTS],
            revalidate: 60, // Cache for 60 seconds
        }
    )()

    // Transform nextCursor.publishedAt from string to Date if needed (after cache deserialization)
    // unstable_cache serializes Dates to strings, so we need to convert them back
    // Create a new result object to avoid mutating the cached value
    return {
        ...result,
        nextCursor:
            result.nextCursor &&
            typeof result.nextCursor.publishedAt === 'string'
                ? {
                      ...result.nextCursor,
                      publishedAt: new Date(result.nextCursor.publishedAt),
                  }
                : result.nextCursor,
    }
}
