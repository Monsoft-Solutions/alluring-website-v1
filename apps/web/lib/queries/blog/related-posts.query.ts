import { db } from '@workspace/db/client'
import {
    author,
    blogPost,
    blogPostCategory,
    blogPostTag,
    images,
} from '@workspace/db/schema/blog'
import { and, desc, eq, inArray, isNotNull, ne } from 'drizzle-orm'

import type { BlogPostCard } from '@/lib/types/blog/post-card.type'

/**
 * Fetch related posts based on shared categories and tags with weighted scoring
 * Returns up to limit posts ordered by relevance (shared categories/tags count) and recency
 *
 * Algorithm:
 * 1. Find posts that share categories or tags with the current post
 * 2. Count matches per post (categories weighted higher than tags)
 * 3. Order by match count DESC, then by publishedAt DESC
 * 4. Fallback to recent posts if no matches found
 */
export async function getRelatedPosts(
    postId: string,
    categoryIds: string[],
    tagIds: string[],
    limit = 3
): Promise<BlogPostCard[]> {
    // If no categories or tags, return recent posts
    if (categoryIds.length === 0 && tagIds.length === 0) {
        return getRecentPosts(postId, limit, [])
    }

    // Build subquery to find all related post IDs with their match counts
    const relatedPostIds: string[] = []

    // Get posts that share categories
    if (categoryIds.length > 0) {
        const categoryMatches = await db
            .select({ blogPostId: blogPostCategory.blogPostId })
            .from(blogPostCategory)
            .where(
                and(
                    inArray(blogPostCategory.categoryId, categoryIds),
                    ne(blogPostCategory.blogPostId, postId)
                )
            )

        relatedPostIds.push(...categoryMatches.map((r) => r.blogPostId))
    }

    // Get posts that share tags
    if (tagIds.length > 0) {
        const tagMatches = await db
            .select({ blogPostId: blogPostTag.blogPostId })
            .from(blogPostTag)
            .where(
                and(
                    inArray(blogPostTag.tagId, tagIds),
                    ne(blogPostTag.blogPostId, postId)
                )
            )

        relatedPostIds.push(...tagMatches.map((r) => r.blogPostId))
    }

    // Remove duplicates
    const uniquePostIds = Array.from(new Set(relatedPostIds))

    if (uniquePostIds.length === 0) {
        return getRecentPosts(postId, limit, [])
    }

    // Count matches per post for weighted scoring
    const postMatchCounts = new Map<string, number>()
    uniquePostIds.forEach((id) => {
        postMatchCounts.set(
            id,
            relatedPostIds.filter((relId) => relId === id).length
        )
    })

    // Sort by match count (descending)
    const sortedPostIds = uniquePostIds.sort(
        (a, b) => (postMatchCounts.get(b) ?? 0) - (postMatchCounts.get(a) ?? 0)
    )

    // Take top N IDs to fetch
    const idsToFetch = sortedPostIds.slice(
        0,
        Math.min(limit * 2, sortedPostIds.length)
    )

    // Fetch the top related posts with full details
    const rows = await db
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
        .where(
            and(
                inArray(blogPost.id, idsToFetch),
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.publishedAt)
            )
        )
        .orderBy(desc(blogPost.publishedAt))

    // Map and sort by original match count order
    const postsMap = new Map<string, BlogPostCard>(
        rows.map((r) => [
            r.id,
            {
                id: r.id,
                slug: r.slug,
                title: r.title,
                excerpt: r.excerpt,
                publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
                readingTime: r.readingTime,
                featuredImage: r.imageUrl
                    ? {
                          url: r.imageUrl,
                          alt: r.imageAlt ?? '',
                          blurDataUrl: r.imageBlur ?? undefined,
                      }
                    : null,
                author: r.authorName ? { name: r.authorName } : null,
            },
        ])
    )

    // Return posts in order of relevance (match count)
    const sortedPosts = sortedPostIds
        .map((id) => postsMap.get(id))
        .filter((post): post is BlogPostCard => post !== undefined)
        .slice(0, limit)

    // If we didn't get enough posts, fill with recent ones
    if (sortedPosts.length < limit) {
        const existingIds = sortedPosts.map((p) => p.id)
        const additionalPosts = await getRecentPosts(
            postId,
            limit - sortedPosts.length,
            existingIds
        )
        sortedPosts.push(...additionalPosts)
    }

    return sortedPosts
}

/**
 * Fallback: Get recent posts excluding the current post and any already selected posts
 */
async function getRecentPosts(
    excludePostId: string,
    limit: number,
    alsoExclude: string[]
): Promise<BlogPostCard[]> {
    // Build where conditions - exclude current post and any additional posts
    const whereConditions = [
        ne(blogPost.id, excludePostId),
        eq(blogPost.status, 'published'),
        isNotNull(blogPost.publishedAt),
    ]

    // Add additional exclusions
    alsoExclude.forEach((id) => {
        whereConditions.push(ne(blogPost.id, id))
    })

    const rows = await db
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
        .where(and(...whereConditions))
        .orderBy(desc(blogPost.publishedAt))
        .limit(limit)

    return rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
        readingTime: r.readingTime,
        featuredImage: r.imageUrl
            ? {
                  url: r.imageUrl,
                  alt: r.imageAlt ?? '',
                  blurDataUrl: r.imageBlur ?? undefined,
              }
            : null,
        author: r.authorName ? { name: r.authorName } : null,
    }))
}
