/**
 * Finalize Refresh Step
 *
 * Durable workflow step that closes a refresh run on every path. Success:
 * park the working copy in Draft, write the change summary (best effort),
 * flip the candidate to ready_for_review, email the reviewer, complete the
 * run row. Failure: candidate → failed (working copy kept for inspection),
 * run row → failed, failure email — which engages the same acknowledgment
 * rail as the other autopilot kinds.
 *
 * Idempotent by design: the candidate transition is a conditional update,
 * so a retried step that finds the work already done skips the side
 * effects (no second summary call, no duplicate email); the run-row update
 * is a plain overwrite and safe to repeat.
 *
 * @module @admin/app/workflows/refresh/finalize-refresh.step
 */
import { and, eq } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import {
    autopilotRun,
    blogPost,
    contentRefresh,
} from '@workspace/db/schema/blog'
import type { AutopilotPhaseOutcome } from '@workspace/db/types'
import { summarizeRefreshChanges } from '@workspace/ai/functions'

import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import { notifyRefreshReadyForReview } from '@/lib/services/seo-digest-notification.service'
import { notifyAutopilotFailure } from '@/lib/services/autopilot-notification.service'

export type FinalizeRefreshStepInput = {
    runId: string
    candidateId: string
    status: 'completed' | 'failed'
    originalPostId?: string
    postTitle?: string
    workingPostId?: string
    phaseOutcomes?: AutopilotPhaseOutcome[]
    error?: string
}

/**
 * Average review score from the working copy's stored pipeline state
 * (0–100), or null when the review phase left no scores. Same read as the
 * autopilot content run's (private in finalize-run.step).
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

/**
 * Best-effort AI bullet summary of what changed — the diff screen works
 * without it.
 */
async function buildChangeSummary(
    originalPostId: string,
    workingPostId: string,
    title: string
): Promise<string | null> {
    try {
        const [original] = await db
            .select({ content: blogPost.content })
            .from(blogPost)
            .where(eq(blogPost.id, originalPostId))
            .limit(1)
        const [refreshed] = await db
            .select({ content: blogPost.content })
            .from(blogPost)
            .where(eq(blogPost.id, workingPostId))
            .limit(1)
        if (!original?.content || !refreshed?.content) return null

        const aiConfig = await getBlogAiConfig()
        const summary = await summarizeRefreshChanges({
            title,
            oldContent: original.content,
            newContent: refreshed.content,
            modelId: aiConfig.extractionModelId,
            reasoningEffort: aiConfig.extractionEffort,
        })
        return summary.changes.map((change) => `- ${change}`).join('\n')
    } catch (error) {
        console.warn('[Refresh Step] Change summary failed:', error)
        return null
    }
}

export async function finalizeRefreshStep(
    input: FinalizeRefreshStepInput
): Promise<{ finalized: boolean }> {
    'use step'

    if (
        input.status === 'completed' &&
        input.workingPostId &&
        input.originalPostId &&
        input.postTitle
    ) {
        // Park the working copy in Draft for the Kanban (image phase is
        // skipped on purpose — the clone keeps the original's image).
        await db
            .update(blogPost)
            .set({ status: 'draft' })
            .where(eq(blogPost.id, input.workingPostId))

        const changeSummary = await buildChangeSummary(
            input.originalPostId,
            input.workingPostId,
            input.postTitle
        )

        // Only the invocation that flips the row sends the email.
        const [transitioned] = await db
            .update(contentRefresh)
            .set({ status: 'ready_for_review', changeSummary })
            .where(
                and(
                    eq(contentRefresh.id, input.candidateId),
                    eq(contentRefresh.status, 'in_progress')
                )
            )
            .returning({ id: contentRefresh.id })

        if (transitioned) {
            try {
                await notifyRefreshReadyForReview({
                    candidateId: input.candidateId,
                    postTitle: input.postTitle,
                    changeSummary,
                })
            } catch (error) {
                console.warn('[Refresh Step] Notification failed:', error)
            }
        }
    } else if (input.status === 'failed') {
        const [transitioned] = await db
            .update(contentRefresh)
            .set({
                status: 'failed',
                error: input.error ?? 'Refresh run failed',
            })
            .where(
                and(
                    eq(contentRefresh.id, input.candidateId),
                    eq(contentRefresh.status, 'in_progress')
                )
            )
            .returning({ id: contentRefresh.id })

        if (transitioned) {
            await notifyAutopilotFailure({
                runId: input.runId,
                kind: 'refresh',
                topicTitle: input.postTitle,
                error: input.error ?? 'Refresh run failed',
            })
        }
    }

    const qualityScore =
        input.status === 'completed' && input.workingPostId
            ? await readQualityScore(input.workingPostId)
            : null

    await db
        .update(autopilotRun)
        .set({
            status: input.status,
            postId: input.originalPostId ?? null,
            topicTitle: input.postTitle ?? null,
            phaseOutcomes: input.phaseOutcomes ?? null,
            qualityScore,
            error: input.error ?? null,
            finishedAt: new Date(),
        })
        .where(eq(autopilotRun.id, input.runId))

    console.log(
        `[Refresh Step] Run ${input.runId} finalized: ${input.status}${
            qualityScore !== null ? ` score=${qualityScore}` : ''
        }`
    )

    return { finalized: true }
}
