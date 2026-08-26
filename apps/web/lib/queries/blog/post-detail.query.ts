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
import { and, eq, isNotNull } from 'drizzle-orm'

import type { BlogPostDetail } from '@/types/blog/post-detail.type'

/**
 * Internal function to fetch blog post by slug from database
 * This is wrapped by getPublishedPostBySlug for caching
 */
async function fetchPublishedPostBySlug(
    slug: string
): Promise<BlogPostDetail | null> {
    const base = await db
        .select({
            id: blogPost.id,
            slug: blogPost.slug,
            title: blogPost.title,
            excerpt: blogPost.excerpt,
            metaDescription: blogPost.metaDescription,
            content: blogPost.content,
            publishedAt: blogPost.publishedAt,
            updatedAt: blogPost.updatedAt,
            readingTime: blogPost.readingTime,
            faqs: blogPost.faqs,
            quickAnswer: blogPost.quickAnswer,
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
                eq(blogPost.slug, slug),
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.publishedAt)
            )
        )
        .limit(1)

    const row = base[0]
    if (!row) return null

    // Published posts must have slug and content (enforced by status transition)
    if (!row.slug || !row.content) return null

    const categoriesRows = await db
        .select({
            id: blogCategory.id,
            name: blogCategory.name,
            slug: blogCategory.slug,
        })
        .from(blogPostCategory)
        .innerJoin(
            blogCategory,
            eq(blogCategory.id, blogPostCategory.categoryId)
        )
        .where(eq(blogPostCategory.blogPostId, row.id))

    const tagsRows = await db
        .select({ id: blogTag.id, name: blogTag.name, slug: blogTag.slug })
        .from(blogPostTag)
        .innerJoin(blogTag, eq(blogTag.id, blogPostTag.tagId))
        .where(eq(blogPostTag.blogPostId, row.id))

    const detail: BlogPostDetail = {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        metaDescription: row.metaDescription,
        content: row.content,
        publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
        updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
        readingTime: row.readingTime,
        faqs: row.faqs,
        quickAnswer: row.quickAnswer,
        featuredImage: row.imageUrl
            ? {
                  url: row.imageUrl,
                  alt: row.imageAlt ?? '',
                  blurDataUrl: row.imageBlur,
              }
            : null,
        author: row.authorName ? { name: row.authorName } : null,
        categories: categoriesRows,
        tags: tagsRows,
    }

    return detail
}

/**
 * Get a published blog post by slug with persistent caching
 *
 * Uses Next.js unstable_cache for cross-request caching.
 * Cache is tagged with 'blog-posts' and specific post slug for targeted invalidation.
 *
 * @param slug - The blog post slug
 * @returns The blog post detail or null if not found
 */
export const getPublishedPostBySlug = (
    slug: string
): Promise<BlogPostDetail | null> => {
    return unstable_cache(
        () => fetchPublishedPostBySlug(slug),
        [`blog-post-${slug}`],
        {
            tags: ['blog-posts', `blog-post-${slug}`],
            revalidate: 60, // Cache for 60 seconds
        }
    )()
}
