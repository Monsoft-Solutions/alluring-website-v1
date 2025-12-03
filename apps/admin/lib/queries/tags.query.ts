import { db } from '@workspace/db/client'
import { blogTag, blogPostTag } from '@workspace/db/schema/blog'
import { desc, eq, sql, asc } from 'drizzle-orm'

export type TagListItem = {
    id: string
    name: string
    slug: string
    description: string | null
    color: string | null
    usageCount: number
    isActive: boolean
    createdAt: Date
}

export async function getTags(): Promise<TagListItem[]> {
    return db
        .select({
            id: blogTag.id,
            name: blogTag.name,
            slug: blogTag.slug,
            description: blogTag.description,
            color: blogTag.color,
            usageCount: blogTag.usageCount,
            isActive: blogTag.isActive,
            createdAt: blogTag.createdAt,
        })
        .from(blogTag)
        .orderBy(desc(blogTag.usageCount), asc(blogTag.name))
}

export async function getTagById(id: string): Promise<TagListItem | null> {
    const result = await db
        .select({
            id: blogTag.id,
            name: blogTag.name,
            slug: blogTag.slug,
            description: blogTag.description,
            color: blogTag.color,
            usageCount: blogTag.usageCount,
            isActive: blogTag.isActive,
            createdAt: blogTag.createdAt,
        })
        .from(blogTag)
        .where(eq(blogTag.id, id))
        .limit(1)

    return result[0] ?? null
}
