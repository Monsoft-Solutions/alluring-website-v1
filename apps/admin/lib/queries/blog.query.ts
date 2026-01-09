import { db } from '@workspace/db/client'
import type { FaqItem } from '@workspace/shared/schemas/blog'
import { author, blogPost, images } from '@workspace/db/schema/blog'
import { count, desc, eq, sql, asc } from 'drizzle-orm'

import type { PipelineStatus } from '@/lib/types/blog/blog-action.type'

export type { PipelineStatus }

export type BlogPostListItem = {
    id: string
    slug: string | null
    title: string
    status: PipelineStatus | null
    publishedAt: Date | null
    views: number
    authorName: string | null
    featuredImageUrl: string | null
    createdAt: Date | null
}

export type BlogPostSortBy = 'createdAt' | 'views' | 'publishedAt'

export type BlogPostSortOrder = 'asc' | 'desc'

export type GetBlogPostsOptions = {
    page?: number
    pageSize?: number
    sortBy?: BlogPostSortBy
    sortOrder?: BlogPostSortOrder
}

export async function getBlogPosts(
    options: GetBlogPostsOptions = {}
): Promise<{ posts: BlogPostListItem[]; total: number }> {
    const {
        page = 1,
        pageSize = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = options
    const offset = (page - 1) * pageSize

    // Determine sort column and direction
    const sortColumn =
        sortBy === 'views'
            ? blogPost.views
            : sortBy === 'publishedAt'
              ? blogPost.publishedAt
              : blogPost.createdAt

    const orderDirection = sortOrder === 'asc' ? asc : desc

    const [posts, totalResult] = await Promise.all([
        db
            .select({
                id: blogPost.id,
                slug: blogPost.slug,
                title: blogPost.title,
                status: blogPost.status,
                publishedAt: blogPost.publishedAt,
                views: blogPost.views,
                authorName: author.name,
                featuredImageUrl: images.url,
                createdAt: blogPost.createdAt,
            })
            .from(blogPost)
            .leftJoin(author, eq(blogPost.authorId, author.id))
            .leftJoin(images, eq(blogPost.featuredImageId, images.id))
            .orderBy(orderDirection(sortColumn))
            .limit(pageSize)
            .offset(offset),
        db.select({ count: count() }).from(blogPost),
    ])

    return {
        posts,
        total: totalResult[0]?.count ?? 0,
    }
}

export type AuthorWithPostCount = {
    id: string
    name: string
    email: string
    avatarUrl: string | null
    isActive: boolean
    postCount: number
    createdAt: Date
}

export async function getAuthors(): Promise<AuthorWithPostCount[]> {
    const authors = await db
        .select({
            id: author.id,
            name: author.name,
            email: author.email,
            avatarUrl: author.avatarUrl,
            isActive: author.isActive,
            createdAt: author.createdAt,
            postCount: sql<number>`count(${blogPost.id})::int`,
        })
        .from(author)
        .leftJoin(blogPost, eq(author.id, blogPost.authorId))
        .groupBy(author.id)
        .orderBy(desc(author.createdAt))

    return authors
}

export async function updateBlogPostStatus(
    postId: string,
    status: 'draft' | 'ready_to_publish' | 'published'
): Promise<void> {
    const updateData: { status: typeof status; publishedAt?: Date } = { status }

    if (status === 'published') {
        updateData.publishedAt = new Date()
    }

    await db.update(blogPost).set(updateData).where(eq(blogPost.id, postId))
}

export type BlogPostDetail = {
    id: string
    slug: string | null
    title: string
    content: string | null
    metaDescription: string | null
    metaTitle: string | null
    metaKeywords: string | null
    primaryKeyword: string | null
    secondaryKeywords: string[] | null
    excerpt: string | null
    status: PipelineStatus | null
    publishedAt: Date | null
    readingTime: number | null
    authorId: string | null
    aiSummary: string | null
    featuredImageUrl: string | null
    featuredImageId: string | null
    faqs: FaqItem[] | null
}

export async function getBlogPostById(
    id: string
): Promise<BlogPostDetail | null> {
    const result = await db
        .select({
            id: blogPost.id,
            slug: blogPost.slug,
            title: blogPost.title,
            content: blogPost.content,
            metaDescription: blogPost.metaDescription,
            metaTitle: blogPost.metaTitle,
            metaKeywords: blogPost.metaKeywords,
            primaryKeyword: blogPost.primaryKeyword,
            secondaryKeywords: blogPost.secondaryKeywords,
            excerpt: blogPost.excerpt,
            status: blogPost.status,
            publishedAt: blogPost.publishedAt,
            readingTime: blogPost.readingTime,
            authorId: blogPost.authorId,
            aiSummary: blogPost.aiSummary,
            featuredImageUrl: images.url,
            featuredImageId: blogPost.featuredImageId,
            faqs: blogPost.faqs,
        })
        .from(blogPost)
        .leftJoin(images, eq(blogPost.featuredImageId, images.id))
        .where(eq(blogPost.id, id))
        .limit(1)

    const post = result[0]
    if (!post) return null

    return {
        ...post,
        secondaryKeywords: post.secondaryKeywords,
        faqs: post.faqs,
    }
}

export type AuthorOption = {
    id: string
    name: string
}

export async function getAuthorsForSelect(): Promise<AuthorOption[]> {
    return db
        .select({
            id: author.id,
            name: author.name,
        })
        .from(author)
        .where(eq(author.isActive, true))
        .orderBy(asc(author.name))
}

export type AuthorDetail = {
    id: string
    name: string
    email: string
    bio: string | null
    avatarUrl: string | null
    website: string | null
    socialLinks: {
        twitter?: string
        linkedin?: string
        github?: string
        instagram?: string
    } | null
    isActive: boolean
    createdAt: Date
}

export async function getAuthorById(id: string): Promise<AuthorDetail | null> {
    const result = await db
        .select({
            id: author.id,
            name: author.name,
            email: author.email,
            bio: author.bio,
            avatarUrl: author.avatarUrl,
            website: author.website,
            socialLinks: author.socialLinks,
            isActive: author.isActive,
            createdAt: author.createdAt,
        })
        .from(author)
        .where(eq(author.id, id))
        .limit(1)

    return result[0] ?? null
}
