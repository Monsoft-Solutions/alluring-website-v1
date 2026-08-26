/**
 * Refresh Content Workflow
 *
 * Durable Vercel Workflow driving one in-place refresh run (epic #144
 * Phase 5): prepare the claimed candidate (brief + shadow working copy),
 * then generate → review → extract on the copy, landing it in Draft with
 * the candidate `ready_for_review`. The image phase is skipped on purpose
 * — the clone keeps the original's featured image and the merge never
 * touches images.
 *
 * The run row (autopilot_run, kind='refresh') and the candidate claim
 * (pending → in_progress) were created by the cron/route pre-flight
 * (`startRefreshRunJob`), which also holds the per-kind run lock. This
 * workflow finalizes both on every path — completed or failed.
 *
 * @module @admin/app/workflows/refresh/refresh-content
 */
import type { AutopilotPhaseOutcome } from '@workspace/db/types'

import { runPhaseStep, type AutopilotPhase } from '../autopilot/run-phase.step'
import { prepareRefreshStep } from './prepare-refresh.step'
import { finalizeRefreshStep } from './finalize-refresh.step'

export type RefreshContentWorkflowInput = {
    /** The autopilot_run row (kind='refresh') created by the pre-flight */
    runId: string
    /** The content_refresh row, already claimed pending → in_progress */
    candidateId: string
}

export type RefreshContentWorkflowResult = {
    outcome: 'completed' | 'failed'
    workingPostId?: string
}

/** Refresh runs the pipeline without the image phase. */
const PHASES: AutopilotPhase[] = ['generate', 'review', 'extract']

export async function refreshContentWorkflow(
    input: RefreshContentWorkflowInput
): Promise<RefreshContentWorkflowResult> {
    'use workflow'

    const { runId, candidateId } = input
    const phaseOutcomes: AutopilotPhaseOutcome[] = []

    console.log(
        `[Refresh Workflow] Starting run ${runId} (candidate ${candidateId})`
    )

    const prep = await prepareRefreshStep({ candidateId })
    if (!prep.ok) {
        phaseOutcomes.push({
            phase: 'create-post',
            status: 'failed',
            error: prep.error,
        })
        await finalizeRefreshStep({
            runId,
            candidateId,
            status: 'failed',
            phaseOutcomes,
            error: prep.error,
        })
        return { outcome: 'failed' }
    }
    phaseOutcomes.push({ phase: 'create-post', status: 'completed' })

    for (const phase of PHASES) {
        const result = await runPhaseStep({
            postId: prep.workingPostId,
            phase,
        })
        phaseOutcomes.push({
            phase,
            status: result.success ? 'completed' : 'failed',
            durationMs: result.durationMs,
            error: result.error,
        })

        if (!result.success) {
            await finalizeRefreshStep({
                runId,
                candidateId,
                status: 'failed',
                originalPostId: prep.originalPostId,
                postTitle: prep.postTitle,
                workingPostId: prep.workingPostId,
                phaseOutcomes,
                error: `${phase} phase failed: ${result.error ?? 'unknown error'}`,
            })
            return { outcome: 'failed' }
        }
    }

    await finalizeRefreshStep({
        runId,
        candidateId,
        status: 'completed',
        originalPostId: prep.originalPostId,
        postTitle: prep.postTitle,
        workingPostId: prep.workingPostId,
        phaseOutcomes,
    })

    console.log(
        `[Refresh Workflow] "${prep.postTitle}" refreshed — ready for review`
    )
    return { outcome: 'completed', workingPostId: prep.workingPostId }
}
