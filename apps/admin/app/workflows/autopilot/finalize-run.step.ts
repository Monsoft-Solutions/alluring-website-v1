/**
 * Finalize Run Step
 *
 * Durable workflow step that closes an autopilot content run: records the
 * outcome (completed / skipped / failed) with phase outcomes and the quality
 * score, and sends the corresponding notification email.
 *
 * @module @admin/app/workflows/autopilot/finalize-run.step
 */
import { eq } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { autopilotRun, blogPost } from '@workspace/db/schema/blog'
import type {
    AutopilotPhaseOutcome,
    AutopilotSkipReason,
    RefreshCandidate,
} from '@workspace/db/types'

import {
    notifyAutopilotDraftReady,
    notifyAutopilotFailure,
} from '@/lib/services/autopilot-notification.service'

export type FinalizeRunStepInput = {
    runId: string
    status: 'completed' | 'skipped' | 'failed'
    postId?: string
    topicTitle?: string
    skipReason?: AutopilotSkipReason
    phaseOutcomes?: AutopilotPhaseOutcome[]
    refreshCandidates?: RefreshCandidate[]
    error?: string
}

/**
 * Average review score from the post's stored pipeline state (0–100), or
 * null when the review phase left no scores.
 */
async function readQualityScore(postId: string): Promise<number | null> {
    const [post] = await db
        .select({ pipelineState: blogPost.pipelineState })
        .from(blogPost)
        .where(eq(blogPost.id, postId))
        .limit(1)

    const reviews = post?.pipelineState?.reviewPhase?.reviews
    if (!reviews || reviews.length === 0) return null

    return Math.round(
        reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length
    )
}

export async function finalizeRunStep(
    input: FinalizeRunStepInput
): Promise<{ qualityScore: number | null }> {
    'use step'

    const qualityScore =
        input.status === 'completed' && input.postId
            ? await readQualityScore(input.postId)
            : null

    await db
        .update(autopilotRun)
        .set({
            status: input.status,
            skipReason: input.skipReason ?? null,
            postId: input.postId ?? null,
            topicTitle: input.topicTitle ?? null,
            phaseOutcomes: input.phaseOutcomes ?? null,
            refreshCandidates: input.refreshCandidates ?? null,
            qualityScore,
            error: input.error ?? null,
            finishedAt: new Date(),
        })
        .where(eq(autopilotRun.id, input.runId))

    console.log(
        `[Autopilot Step] Run ${input.runId} finalized: ${input.status}${
            input.skipReason ? ` (${input.skipReason})` : ''
        }${qualityScore !== null ? ` score=${qualityScore}` : ''}`
    )

    if (input.status === 'completed' && input.postId && input.topicTitle) {
        await notifyAutopilotDraftReady({
            postId: input.postId,
            title: input.topicTitle,
            qualityScore,
        })
    } else if (input.status === 'failed') {
        await notifyAutopilotFailure({
            runId: input.runId,
            kind: 'content',
            topicTitle: input.topicTitle,
            error: input.error ?? 'Unknown error',
        })
    }

    return { qualityScore }
}
