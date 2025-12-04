import { db } from '@workspace/db/client'
import { blogCategory, blogPostCategory } from '@workspace/db/schema/blog'
import { count, desc, eq, sql, asc } from 'drizzle-orm'

export type CategoryListItem = {
    id: string
    name: string
    slug: string
    description: string | null
    color: string | null
    sortOrder: number | null
    isActive: boolean
    postCount: number
    createdAt: Date | null
}

export async function getCategories(): Promise<CategoryListItem[]> {
    return db
        .select({
            id: blogCategory.id,
            name: blogCategory.name,
            slug: blogCategory.slug,
            description: blogCategory.description,
            color: blogCategory.color,
            sortOrder: blogCategory.sortOrder,
            isActive: blogCategory.isActive,
            createdAt: blogCategory.createdAt,
            postCount: sql<number>`count(${blogPostCategory.blogPostId})::int`,
        })
        .from(blogCategory)
        .leftJoin(
            blogPostCategory,
            eq(blogCategory.id, blogPostCategory.categoryId)
        )
        .groupBy(blogCategory.id)
        .orderBy(asc(blogCategory.sortOrder), asc(blogCategory.name))
}

export async function getCategoryById(
    id: string
): Promise<CategoryListItem | null> {
    const result = await db
        .select({
            id: blogCategory.id,
            name: blogCategory.name,
            slug: blogCategory.slug,
            description: blogCategory.description,
            color: blogCategory.color,
            sortOrder: blogCategory.sortOrder,
            isActive: blogCategory.isActive,
            createdAt: blogCategory.createdAt,
            postCount: sql<number>`count(${blogPostCategory.blogPostId})::int`,
        })
        .from(blogCategory)
        .leftJoin(
            blogPostCategory,
            eq(blogCategory.id, blogPostCategory.categoryId)
        )
        .where(eq(blogCategory.id, id))
        .groupBy(blogCategory.id)
        .limit(1)

    return result[0] ?? null
}
