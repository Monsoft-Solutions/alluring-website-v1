/**
 * Autopilot Content Workflow
 *
 * Durable Vercel Workflow driving one autopilot content run: select the
 * next topic, then generate → review → extract → images, landing the post
 * in Draft for human review. Each phase is its own durable step with its
 * own execution budget — this is what lets a multi-minute pipeline survive
 * serverless limits, restarts, and step retries.
 *
 * The run row (autopilot_run) was created by the cron pre-flight, which
 * also holds the per-kind run lock. This workflow finalizes that row on
 * every path — completed, skipped, or failed.
 *
 * @module @admin/app/workflows/autopilot/autopilot-content
 */
import type { AutopilotPhaseOutcome } from '@workspace/db/types'

import { selectTopicStep } from './select-topic.step'
import { runPhaseStep, type AutopilotPhase } from './run-phase.step'
import { finalizeRunStep } from './finalize-run.step'
import { checkDraftCapStep } from './check-draft-cap.step'

export type AutopilotContentWorkflowInput = {
    /** The autopilot_run row created (and locked) by the cron pre-flight */
    runId: string
    /** Posts to write this run (1–3) */
    postsPerRun: number
}

export type AutopilotContentWorkflowResult = {
    written: Array<{ postId: string; title: string }>
    outcome: 'completed' | 'skipped' | 'failed'
}

const PHASES: AutopilotPhase[] = ['generate', 'review', 'extract', 'images']

export async function autopilotContentWorkflow(
    input: AutopilotContentWorkflowInput
): Promise<AutopilotContentWorkflowResult> {
    'use workflow'

    const { runId, postsPerRun } = input
    const written: Array<{ postId: string; title: string }> = []
    const phaseOutcomes: AutopilotPhaseOutcome[] = []

    console.log(
        `[Autopilot Workflow] Starting content run ${runId} (${postsPerRun} post(s))`
    )

    for (let postIndex = 0; postIndex < postsPerRun; postIndex++) {
        // Re-check the draft cap between posts — the first post of this very
        // run may have filled the review queue.
        if (postIndex > 0) {
            const cap = await checkDraftCapStep({})
            if (!cap.ok) {
                console.log(
                    `[Autopilot Workflow] Draft cap reached mid-run (${cap.draftCount}); stopping at ${written.length} post(s)`
                )
                break
            }
        }

        const selection = await selectTopicStep({ runId })

        if (!selection.selected) {
            if (written.length === 0) {
                await finalizeRunStep({
                    runId,
                    status: 'skipped',
                    skipReason: selection.reason,
                    refreshCandidates: selection.refreshCandidates,
                })
                return { written, outcome: 'skipped' }
            }
            break
        }

        const { postId, title } = selection
        phaseOutcomes.push({ phase: 'select-topic', status: 'completed' })

        for (const phase of PHASES) {
            const result = await runPhaseStep({ postId, phase })
            phaseOutcomes.push({
                phase,
                status: result.success ? 'completed' : 'failed',
                durationMs: result.durationMs,
                error: result.error,
            })

            if (!result.success) {
                await finalizeRunStep({
                    runId,
                    status: 'failed',
                    postId,
                    topicTitle: title,
                    phaseOutcomes,
                    error: `${phase} phase failed: ${result.error ?? 'unknown error'}`,
                })
                return { written, outcome: 'failed' }
            }
        }

        written.push({ postId, title })
        console.log(
            `[Autopilot Workflow] Post "${title}" reached Draft (${written.length}/${postsPerRun})`
        )
    }

    const first = written[0]
    await finalizeRunStep({
        runId,
        status: 'completed',
        postId: first?.postId,
        topicTitle:
            written.length > 1
                ? written.map((w) => w.title).join(' · ')
                : first?.title,
        phaseOutcomes,
    })

    return { written, outcome: 'completed' }
}
