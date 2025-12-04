'use server'

import { db } from '@workspace/db/client'
import { blogTag } from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type TagFormData = {
    name: string
    slug: string
    description?: string | null
    color?: string | null
    isActive: boolean
}

type ActionResult = {
    success: boolean
    error?: string
    id?: string
}

export async function createTag(data: TagFormData): Promise<ActionResult> {
    try {
        if (!data.name?.trim()) {
            return { success: false, error: 'Name is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }

        const existingTag = await db
            .select({ id: blogTag.id })
            .from(blogTag)
            .where(eq(blogTag.slug, data.slug))
            .limit(1)

        if (existingTag.length > 0) {
            return {
                success: false,
                error: 'A tag with this slug already exists',
            }
        }

        const [newTag] = await db
            .insert(blogTag)
            .values({
                name: data.name,
                slug: data.slug,
                description: data.description ?? null,
                color: data.color ?? null,
                isActive: data.isActive,
            })
            .returning({ id: blogTag.id })

        revalidatePath('/blog/tags')

        return { success: true, id: newTag?.id }
    } catch (error) {
        console.error('Error creating tag:', error)
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Failed to create tag',
        }
    }
}

export async function updateTag(
    id: string,
    data: TagFormData
): Promise<ActionResult> {
    try {
        if (!data.name?.trim()) {
            return { success: false, error: 'Name is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }

        const existingTag = await db
            .select({ id: blogTag.id })
            .from(blogTag)
            .where(eq(blogTag.slug, data.slug))
            .limit(1)

        if (existingTag.length > 0 && existingTag[0]?.id !== id) {
            return {
                success: false,
                error: 'A tag with this slug already exists',
            }
        }

        await db
            .update(blogTag)
            .set({
                name: data.name,
                slug: data.slug,
                description: data.description ?? null,
                color: data.color ?? null,
                isActive: data.isActive,
            })
            .where(eq(blogTag.id, id))

        revalidatePath('/blog/tags')

        return { success: true, id }
    } catch (error) {
        console.error('Error updating tag:', error)
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Failed to update tag',
        }
    }
}

export async function deleteTag(id: string): Promise<ActionResult> {
    try {
        await db.delete(blogTag).where(eq(blogTag.id, id))

        revalidatePath('/blog/tags')

        return { success: true }
    } catch (error) {
        console.error('Error deleting tag:', error)
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Failed to delete tag',
        }
    }
}
