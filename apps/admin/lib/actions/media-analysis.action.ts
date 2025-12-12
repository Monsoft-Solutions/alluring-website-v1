/**
 * Media Analysis Actions
 *
 * Server actions for creating, updating, and managing media analysis sessions.
 *
 * @module lib/actions/media-analysis.action
 */
'use server'

import { db } from '@workspace/db/client'
import {
    mediaAnalysis,
    mediaAnalysisItem,
    type InsertMediaAnalysis,
    type InsertMediaAnalysisItem,
} from '@workspace/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { BulkAnalysisResult } from '@workspace/shared/schemas/analysis'

// ============================================================================
// Types
// ============================================================================

type ActionResult<T = void> = {
    success: boolean
    error?: string
    data?: T
}

/**
 * Input for creating a new analysis session
 */
export type CreateAnalysisInput = {
    name: string
    type: 'bulk' | 'single'
    source: 'instagram' | 'gallery'
    status?: 'pending' | 'analyzing'
}

/**
 * Input for updating analysis with results
 */
export type UpdateAnalysisResultInput = {
    id: string
    status: 'completed' | 'failed'
    resultData?: BulkAnalysisResult
    errorMessage?: string
}

/**
 * Input for applying analysis results
 */
export type ApplyAnalysisInput = {
    analysisId: string
    pairs: Array<{
        beforeMediaId: string
        afterMediaId: string
        procedureSlug: string | null
        isSideBySide: boolean
    }>
    groupAssignments: Array<{
        mediaId: string
        groupId: string
    }>
    postIds: string[]
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Create a new analysis session
 */
export async function createAnalysis(
    input: CreateAnalysisInput
): Promise<ActionResult<{ id: string }>> {
    try {
        const [createdAnalysis] = await db
            .insert(mediaAnalysis)
            .values({
                name: input.name,
                type: input.type,
                source: input.source,
                status: input.status ?? 'pending',
                totalMedia: 0,
                analyzedMedia: 0,
                detectedPairs: 0,
                unpairedMedia: 0,
                nonBAMedia: 0,
            })
            .returning({ id: mediaAnalysis.id })

        if (!createdAnalysis) {
            return { success: false, error: 'Failed to create analysis' }
        }

        revalidatePath('/analysis')

        return { success: true, data: { id: createdAnalysis.id } }
    } catch (error) {
        console.error('Error creating analysis:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create analysis',
        }
    }
}

/**
 * Update analysis with results after AI processing
 */
export async function updateAnalysisResult(
    input: UpdateAnalysisResultInput
): Promise<ActionResult> {
    try {
        const updateData: Partial<InsertMediaAnalysis> = {
            status: input.status,
            completedAt: new Date(),
        }

        if (input.status === 'completed' && input.resultData) {
            updateData.resultData = input.resultData
            updateData.totalMedia = input.resultData.stats.totalMedia
            updateData.analyzedMedia = input.resultData.stats.analyzedMedia
            updateData.detectedPairs = input.resultData.detectedPairs.length
            updateData.unpairedMedia = input.resultData.unpairedMedia.length
            updateData.nonBAMedia = input.resultData.nonBAMedia.length
        }

        if (input.status === 'failed' && input.errorMessage) {
            updateData.errorMessage = input.errorMessage
        }

        await db
            .update(mediaAnalysis)
            .set(updateData)
            .where(eq(mediaAnalysis.id, input.id))

        revalidatePath('/analysis')
        revalidatePath(`/analysis/${input.id}`)

        return { success: true }
    } catch (error) {
        console.error('Error updating analysis result:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update analysis',
        }
    }
}

/**
 * Update analysis status
 */
export async function updateAnalysisStatus(
    id: string,
    status: 'pending' | 'analyzing' | 'completed' | 'applied' | 'failed'
): Promise<ActionResult> {
    try {
        await db
            .update(mediaAnalysis)
            .set({
                status,
                ...(status === 'applied' && { appliedAt: new Date() }),
            })
            .where(eq(mediaAnalysis.id, id))

        revalidatePath('/analysis')
        revalidatePath(`/analysis/${id}`)

        return { success: true }
    } catch (error) {
        console.error('Error updating analysis status:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update status',
        }
    }
}

/**
 * Update analysis name
 */
export async function updateAnalysisName(
    id: string,
    name: string
): Promise<ActionResult> {
    try {
        if (!name.trim()) {
            return { success: false, error: 'Name cannot be empty' }
        }

        await db
            .update(mediaAnalysis)
            .set({ name: name.trim() })
            .where(eq(mediaAnalysis.id, id))

        revalidatePath('/analysis')
        revalidatePath(`/analysis/${id}`)

        return { success: true }
    } catch (error) {
        console.error('Error updating analysis name:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update name',
        }
    }
}

/**
 * Create analysis items (junction records)
 */
export async function createAnalysisItems(
    items: InsertMediaAnalysisItem[]
): Promise<ActionResult> {
    try {
        if (items.length === 0) {
            return { success: true }
        }

        await db.insert(mediaAnalysisItem).values(items)

        return { success: true }
    } catch (error) {
        console.error('Error creating analysis items:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to create items',
        }
    }
}

/**
 * Update analysis result data (for editing after initial analysis)
 */
export async function updateAnalysisResultData(
    id: string,
    resultData: BulkAnalysisResult
): Promise<ActionResult> {
    try {
        await db
            .update(mediaAnalysis)
            .set({
                resultData,
                detectedPairs: resultData.detectedPairs.length,
                unpairedMedia: resultData.unpairedMedia.length,
                nonBAMedia: resultData.nonBAMedia.length,
            })
            .where(eq(mediaAnalysis.id, id))

        revalidatePath(`/analysis/${id}`)

        return { success: true }
    } catch (error) {
        console.error('Error updating analysis result data:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to update result data',
        }
    }
}

/**
 * Delete an analysis session
 */
export async function deleteAnalysis(id: string): Promise<ActionResult> {
    try {
        // Delete analysis (cascade will delete items)
        await db.delete(mediaAnalysis).where(eq(mediaAnalysis.id, id))

        revalidatePath('/analysis')

        return { success: true }
    } catch (error) {
        console.error('Error deleting analysis:', error)
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Failed to delete analysis',
        }
    }
}
