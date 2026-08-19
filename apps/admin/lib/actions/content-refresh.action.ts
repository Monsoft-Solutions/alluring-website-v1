/**
 * Content Refresh Actions
 *
 * Server actions for the refresh queue page (epic #144, #147): dismissing
 * candidates, queueing a post manually, and running decay detection on
 * demand. Queue semantics live in content-refresh.service.
 *
 * @module lib/actions/content-refresh
 */
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import {
    dismissRefreshCandidate,
    queueManualRefresh,
    type EnqueueOutcome,
} from '@/lib/services/content-refresh.service'
import {
    runDecayDetectionJob,
    type DecayDetectionResult,
} from '@/lib/services/decay-detection.service'
import {
    applyRefresh,
    rollbackRevision,
} from '@/lib/services/refresh-execution.service'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

const REFRESH_QUEUE_PATH = '/blog/refresh'

const idSchema = z.string().uuid('Invalid id')

type ActionResult = { success: boolean; error?: string }

/** Close a candidate without refreshing (starts the cooldown). */
export async function dismissRefreshCandidateAction(
    id: string
): Promise<ActionResult> {
    try {
        await requireAuth()
        const result = await dismissRefreshCandidate(idSchema.parse(id))
        if (result.success) revalidatePath(REFRESH_QUEUE_PATH)
        return result
    } catch (error) {
        return toActionError(error, 'Failed to dismiss candidate')
    }
}

/** Queue a post for refresh because the admin asked. */
export async function queuePostForRefreshAction(
    blogPostId: string
): Promise<ActionResult & { outcome?: EnqueueOutcome }> {
    try {
        await requireAuth()
        const result = await queueManualRefresh(idSchema.parse(blogPostId))
        revalidatePath(REFRESH_QUEUE_PATH)
        return { success: true, outcome: result.outcome }
    } catch (error) {
        return toActionError(error, 'Failed to queue the post')
    }
}

/** Run decay detection now, bypassing the weekly due-check. */
export async function runDecayDetectionNowAction(): Promise<
    ActionResult & { result?: DecayDetectionResult }
> {
    try {
        await requireAuth()
        const result = await runDecayDetectionJob('manual')
        revalidatePath(REFRESH_QUEUE_PATH)
        return { success: true, result }
    } catch (error) {
        return toActionError(error, 'Failed to run detection')
    }
}

/**
 * Merge an approved refresh onto the live post (epic #144, #148). The
 * service snapshots the original first and never touches slug, publishedAt,
 * status, or the featured image.
 */
export async function applyRefreshAction(id: string): Promise<ActionResult> {
    try {
        await requireAuth()
        const result = await applyRefresh(idSchema.parse(id))
        if (result.success) {
            revalidatePath(REFRESH_QUEUE_PATH)
            revalidatePath('/blog/posts')
            revalidatePath('/blog/pipeline')
        }
        return result
    } catch (error) {
        return toActionError(error, 'Failed to apply the refresh')
    }
}

/** Restore a pre-refresh revision onto its post (undo an applied refresh). */
export async function rollbackRevisionAction(
    revisionId: string
): Promise<ActionResult> {
    try {
        await requireAuth()
        const result = await rollbackRevision(idSchema.parse(revisionId))
        if (result.success) {
            revalidatePath('/blog/posts')
        }
        return result
    } catch (error) {
        return toActionError(error, 'Failed to roll back')
    }
}

function toActionError(error: unknown, fallback: string): ActionResult {
    console.error(fallback, error)
    if (error instanceof UnauthorizedError) {
        return { success: false, error: 'Unauthorized' }
    }
    if (error instanceof z.ZodError) {
        return { success: false, error: error.issues[0]?.message ?? fallback }
    }
    return {
        success: false,
        error: error instanceof Error ? error.message : fallback,
    }
}
