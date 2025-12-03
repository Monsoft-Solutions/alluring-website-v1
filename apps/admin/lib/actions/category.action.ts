'use server'

import { db } from '@workspace/db/client'
import { blogCategory } from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type CategoryFormData = {
    name: string
    slug: string
    description?: string | null
    color?: string | null
    sortOrder?: number | null
    isActive: boolean
}

type ActionResult = {
    success: boolean
    error?: string
    id?: string
}

export async function createCategory(
    data: CategoryFormData
): Promise<ActionResult> {
    try {
        if (!data.name?.trim()) {
            return { success: false, error: 'Name is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }

        const existingCategory = await db
            .select({ id: blogCategory.id })
            .from(blogCategory)
            .where(eq(blogCategory.slug, data.slug))
            .limit(1)

        if (existingCategory.length > 0) {
            return {
                success: false,
                error: 'A category with this slug already exists',
            }
        }

        const [newCategory] = await db
            .insert(blogCategory)
            .values({
                name: data.name,
                slug: data.slug,
                description: data.description ?? null,
                color: data.color ?? null,
                sortOrder: data.sortOrder ?? 0,
                isActive: data.isActive,
            })
            .returning({ id: blogCategory.id })

        revalidatePath('/blog/categories')

        return { success: true, id: newCategory?.id }
    } catch (error) {
        console.error('Error creating category:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create category',
        }
    }
}

export async function updateCategory(
    id: string,
    data: CategoryFormData
): Promise<ActionResult> {
    try {
        if (!data.name?.trim()) {
            return { success: false, error: 'Name is required' }
        }
        if (!data.slug?.trim()) {
            return { success: false, error: 'Slug is required' }
        }

        const existingCategory = await db
            .select({ id: blogCategory.id })
            .from(blogCategory)
            .where(eq(blogCategory.slug, data.slug))
            .limit(1)

        if (existingCategory.length > 0 && existingCategory[0]?.id !== id) {
            return {
                success: false,
                error: 'A category with this slug already exists',
            }
        }

        await db
            .update(blogCategory)
            .set({
                name: data.name,
                slug: data.slug,
                description: data.description ?? null,
                color: data.color ?? null,
                sortOrder: data.sortOrder ?? 0,
                isActive: data.isActive,
            })
            .where(eq(blogCategory.id, id))

        revalidatePath('/blog/categories')

        return { success: true, id }
    } catch (error) {
        console.error('Error updating category:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update category',
        }
    }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
    try {
        await db.delete(blogCategory).where(eq(blogCategory.id, id))

        revalidatePath('/blog/categories')

        return { success: true }
    } catch (error) {
        console.error('Error deleting category:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete category',
        }
    }
}
