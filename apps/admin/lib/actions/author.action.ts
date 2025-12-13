'use server'

import { db } from '@workspace/db/client'
import { author } from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { requireAuth } from '@/lib/utils/auth.util'

export type AuthorFormData = {
    name: string
    email: string
    bio?: string | null
    avatarUrl?: string | null
    website?: string | null
    socialLinks?: {
        twitter?: string
        linkedin?: string
        github?: string
        instagram?: string
    } | null
    isActive: boolean
}

type ActionResult = {
    success: boolean
    error?: string
    id?: string
}

export async function createAuthor(
    data: AuthorFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate required fields
        if (!data.name?.trim()) {
            return { success: false, error: 'Name is required' }
        }
        if (!data.email?.trim()) {
            return { success: false, error: 'Email is required' }
        }

        // Create the author - rely on database unique constraint for email
        const [newAuthor] = await db
            .insert(author)
            .values({
                name: data.name,
                email: data.email,
                bio: data.bio ?? null,
                avatarUrl: data.avatarUrl ?? null,
                website: data.website ?? null,
                socialLinks: data.socialLinks ?? null,
                isActive: data.isActive,
            })
            .returning({ id: author.id })

        revalidatePath('/blog/authors')

        return { success: true, id: newAuthor?.id }
    } catch (error) {
        console.error('Error creating author:', error)

        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        // Handle PostgreSQL unique constraint violation
        if (
            error instanceof Error &&
            'code' in error &&
            (error as { code: string }).code === '23505'
        ) {
            return {
                success: false,
                error: 'An author with this email already exists',
            }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create author',
        }
    }
}

export async function updateAuthor(
    id: string,
    data: AuthorFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate required fields
        if (!data.name?.trim()) {
            return { success: false, error: 'Name is required' }
        }
        if (!data.email?.trim()) {
            return { success: false, error: 'Email is required' }
        }

        // Check if email already exists for another author
        const existingAuthor = await db
            .select({ id: author.id })
            .from(author)
            .where(eq(author.email, data.email))
            .limit(1)

        if (existingAuthor.length > 0 && existingAuthor[0]?.id !== id) {
            return {
                success: false,
                error: 'An author with this email already exists',
            }
        }

        // Update the author
        await db
            .update(author)
            .set({
                name: data.name,
                email: data.email,
                bio: data.bio ?? null,
                avatarUrl: data.avatarUrl ?? null,
                website: data.website ?? null,
                socialLinks: data.socialLinks ?? null,
                isActive: data.isActive,
            })
            .where(eq(author.id, id))

        revalidatePath('/blog/authors')
        revalidatePath(`/blog/authors/${id}/edit`)

        return { success: true, id }
    } catch (error) {
        console.error('Error updating author:', error)

        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update author',
        }
    }
}

export async function deleteAuthor(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        await db.delete(author).where(eq(author.id, id))

        revalidatePath('/blog/authors')

        return { success: true }
    } catch (error) {
        console.error('Error deleting author:', error)

        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete author',
        }
    }
}

export async function toggleAuthorStatus(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        const currentAuthor = await db
            .select({ isActive: author.isActive })
            .from(author)
            .where(eq(author.id, id))
            .limit(1)

        if (!currentAuthor.length) {
            return { success: false, error: 'Author not found' }
        }

        await db
            .update(author)
            .set({ isActive: !currentAuthor[0]?.isActive })
            .where(eq(author.id, id))

        revalidatePath('/blog/authors')

        return { success: true }
    } catch (error) {
        console.error('Error toggling author status:', error)

        if (error instanceof Error && error.message === 'Unauthorized') {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to toggle status',
        }
    }
}
