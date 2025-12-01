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

export async function getPublishedPostBySlug(
    slug: string
): Promise<BlogPostDetail | null> {
    const base = await db
        .select({
            id: blogPost.id,
            slug: blogPost.slug,
            title: blogPost.title,
            excerpt: blogPost.excerpt,
            content: blogPost.content,
            publishedAt: blogPost.publishedAt,
            updatedAt: blogPost.updatedAt,
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
                eq(blogPost.slug, slug),
                eq(blogPost.status, 'published'),
                isNotNull(blogPost.publishedAt)
            )
        )
        .limit(1)

    const row = base[0]
    if (!row) return null

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
        content: row.content,
        publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
        updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
        readingTime: row.readingTime,
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
