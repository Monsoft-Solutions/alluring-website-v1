import { db } from '@workspace/db/client'
import { author, blogPost, images } from '@workspace/db/schema/blog'
import { count, desc, eq, sql } from 'drizzle-orm'

export type BlogPostListItem = {
    id: string
    slug: string
    title: string
    status: 'draft' | 'readyToPublish' | 'published' | null
    publishedAt: Date | null
    views: number
    authorName: string | null
    featuredImageUrl: string | null
    createdAt: Date | null
}

export async function getBlogPosts(
    page = 1,
    pageSize = 10
): Promise<{ posts: BlogPostListItem[]; total: number }> {
    const offset = (page - 1) * pageSize

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
            .orderBy(desc(blogPost.createdAt))
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
    status: 'draft' | 'readyToPublish' | 'published'
): Promise<void> {
    const updateData: { status: typeof status; publishedAt?: Date } = { status }

    if (status === 'published') {
        updateData.publishedAt = new Date()
    }

    await db.update(blogPost).set(updateData).where(eq(blogPost.id, postId))
}
