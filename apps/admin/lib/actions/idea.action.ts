'use server'

import { db } from '@workspace/db/client'
import {
    blogIdea,
    type BlogIdeaOutlineSection,
} from '@workspace/db/schema/blog'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

/**
 * Blog Idea form data structure
 */
export type BlogIdeaFormData = {
    title: string
    topic?: string | null
    uniqueAngle?: string | null
    primaryKeyword?: string | null
    secondaryKeywords?: string[] | null
    targetAudience?: string | null
    painPoints?: string[] | null
    contentType?:
        | 'tutorial'
        | 'guide'
        | 'how_to'
        | 'case_study'
        | 'comparison'
        | 'faq'
        | 'listicle'
        | 'announcement'
        | 'thought_leadership'
        | null
    estimatedWordCount?: number | null
    outline?: BlogIdeaOutlineSection[] | null
    researchNotes?: string | null
    competitorUrls?: string[] | null
    stage?: 'backlog' | 'researching' | 'approved' | 'in_progress' | 'published'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    aiGeneratedScore?: number | null
    aiSuggestions?: string | null
    assignedAuthorId?: string | null
}

type ActionResult = {
    success: boolean
    error?: string
    id?: string
}

/**
 * Create a new blog idea
 */
export async function createBlogIdea(
    data: BlogIdeaFormData
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Validate required fields
        if (!data.title?.trim()) {
            return { success: false, error: 'Title is required' }
        }

        // Create the blog idea
        const [newIdea] = await db
            .insert(blogIdea)
            .values({
                title: data.title.trim(),
                topic: data.topic?.trim() ?? null,
                uniqueAngle: data.uniqueAngle?.trim() ?? null,
                primaryKeyword: data.primaryKeyword?.trim() ?? null,
                secondaryKeywords: data.secondaryKeywords ?? null,
                targetAudience: data.targetAudience?.trim() ?? null,
                painPoints: data.painPoints ?? null,
                contentType: data.contentType ?? null,
                estimatedWordCount: data.estimatedWordCount ?? null,
                outline: data.outline ?? null,
                researchNotes: data.researchNotes?.trim() ?? null,
                competitorUrls: data.competitorUrls ?? null,
                stage: data.stage ?? 'backlog',
                priority: data.priority ?? 'medium',
                aiGeneratedScore: data.aiGeneratedScore ?? null,
                aiSuggestions: data.aiSuggestions?.trim() ?? null,
                assignedAuthorId: data.assignedAuthorId ?? null,
            })
            .returning({ id: blogIdea.id })

        revalidatePath('/blog/ideas')

        return { success: true, id: newIdea?.id }
    } catch (error) {
        console.error('Error creating blog idea:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create idea',
        }
    }
}

/**
 * Update an existing blog idea
 */
export async function updateBlogIdea(
    id: string,
    data: Partial<BlogIdeaFormData>
): Promise<ActionResult> {
    try {
        await requireAuth()

        // Check if idea exists
        const [existingIdea] = await db
            .select({ id: blogIdea.id })
            .from(blogIdea)
            .where(eq(blogIdea.id, id))
            .limit(1)

        if (!existingIdea) {
            return { success: false, error: 'Idea not found' }
        }

        // Build update object
        const updateData: Record<string, unknown> = {}

        if (data.title !== undefined) {
            updateData.title = data.title.trim()
        }
        if (data.topic !== undefined) {
            updateData.topic = data.topic?.trim() ?? null
        }
        if (data.uniqueAngle !== undefined) {
            updateData.uniqueAngle = data.uniqueAngle?.trim() ?? null
        }
        if (data.primaryKeyword !== undefined) {
            updateData.primaryKeyword = data.primaryKeyword?.trim() ?? null
        }
        if (data.secondaryKeywords !== undefined) {
            updateData.secondaryKeywords = data.secondaryKeywords ?? null
        }
        if (data.targetAudience !== undefined) {
            updateData.targetAudience = data.targetAudience?.trim() ?? null
        }
        if (data.painPoints !== undefined) {
            updateData.painPoints = data.painPoints ?? null
        }
        if (data.contentType !== undefined) {
            updateData.contentType = data.contentType ?? null
        }
        if (data.estimatedWordCount !== undefined) {
            updateData.estimatedWordCount = data.estimatedWordCount ?? null
        }
        if (data.outline !== undefined) {
            updateData.outline = data.outline ?? null
        }
        if (data.researchNotes !== undefined) {
            updateData.researchNotes = data.researchNotes?.trim() ?? null
        }
        if (data.competitorUrls !== undefined) {
            updateData.competitorUrls = data.competitorUrls ?? null
        }
        if (data.stage !== undefined) {
            updateData.stage = data.stage
        }
        if (data.priority !== undefined) {
            updateData.priority = data.priority
        }
        if (data.aiGeneratedScore !== undefined) {
            updateData.aiGeneratedScore = data.aiGeneratedScore ?? null
        }
        if (data.aiSuggestions !== undefined) {
            updateData.aiSuggestions = data.aiSuggestions?.trim() ?? null
        }
        if (data.assignedAuthorId !== undefined) {
            updateData.assignedAuthorId = data.assignedAuthorId ?? null
        }

        // Update the idea
        await db.update(blogIdea).set(updateData).where(eq(blogIdea.id, id))

        revalidatePath('/blog/ideas')
        revalidatePath(`/blog/ideas/${id}`)

        return { success: true, id }
    } catch (error) {
        console.error('Error updating blog idea:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update idea',
        }
    }
}

/**
 * Update an idea's stage (for Kanban drag-and-drop)
 */
export async function updateBlogIdeaStage(
    id: string,
    stage: 'backlog' | 'researching' | 'approved' | 'in_progress' | 'published'
): Promise<ActionResult> {
    try {
        await requireAuth()

        const [existingIdea] = await db
            .select({ id: blogIdea.id })
            .from(blogIdea)
            .where(eq(blogIdea.id, id))
            .limit(1)

        if (!existingIdea) {
            return { success: false, error: 'Idea not found' }
        }

        await db.update(blogIdea).set({ stage }).where(eq(blogIdea.id, id))

        revalidatePath('/blog/ideas')

        return { success: true }
    } catch (error) {
        console.error('Error updating idea stage:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update stage',
        }
    }
}

/**
 * Delete a blog idea
 */
export async function deleteBlogIdea(id: string): Promise<ActionResult> {
    try {
        await requireAuth()

        const [existingIdea] = await db
            .select({ id: blogIdea.id })
            .from(blogIdea)
            .where(eq(blogIdea.id, id))
            .limit(1)

        if (!existingIdea) {
            return { success: false, error: 'Idea not found' }
        }

        await db.delete(blogIdea).where(eq(blogIdea.id, id))

        revalidatePath('/blog/ideas')

        return { success: true }
    } catch (error) {
        console.error('Error deleting blog idea:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete idea',
        }
    }
}

/**
 * Link a blog idea to a created blog post
 */
export async function linkIdeaToBlogPost(
    ideaId: string,
    blogPostId: string
): Promise<ActionResult> {
    try {
        await requireAuth()

        await db
            .update(blogIdea)
            .set({
                blogPostId,
                stage: 'in_progress',
            })
            .where(eq(blogIdea.id, ideaId))

        revalidatePath('/blog/ideas')
        revalidatePath(`/blog/ideas/${ideaId}`)

        return { success: true }
    } catch (error) {
        console.error('Error linking idea to blog post:', error)

        if (error instanceof UnauthorizedError) {
            return { success: false, error: 'Unauthorized' }
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to link idea to blog post',
        }
    }
}
