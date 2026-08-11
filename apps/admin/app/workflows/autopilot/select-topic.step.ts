/**
 * Select Topic Step
 *
 * Durable workflow step that picks the next topic for an autopilot content
 * run and promotes it to `generate` status.
 *
 * Selection order:
 * 1. The approved-ideas queue (priority, then FIFO) — every mode.
 * 2. In `full` mode, the best pending (unapproved) idea.
 * 3. In `full` mode, inline ideation when the board has nothing usable.
 *
 * Every topic is re-gated at selection time: the ownership registry may
 * have gained an owner since the idea was approved. Ideas that fail the
 * re-gate are marked rejected (with the gate reason) so they never retry.
 *
 * @module @admin/app/workflows/autopilot/select-topic.step
 */
import { and, desc, eq } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import type { PlanningData, RefreshCandidate } from '@workspace/db/types'

import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import { evaluateSingleTopic } from '@/lib/services/ideation-gate.service'
import {
    getApprovedIdeaQueue,
    sourceGatedTopicCandidates,
    topicToPlanningData,
} from '@/lib/services/autopilot.service'
import { createPipelinePostInternal } from '@/lib/services/pipeline-post.service'

export type SelectTopicStepResult =
    | { selected: true; postId: string; title: string }
    | {
          selected: false
          reason: 'queue-empty' | 'gate-rejected-all'
          refreshCandidates?: RefreshCandidate[]
      }

/** Mark an idea rejected because the write-time re-gate refused it. */
async function rejectIdeaFromGate(
    ideaId: string,
    planningData: PlanningData | null,
    reason: string
): Promise<void> {
    await db
        .update(blogPost)
        .set({
            ideaApproval: 'rejected',
            planningData: {
                ...(planningData ?? {}),
                ideaRejection: {
                    reason: `Rejected at write time by the ownership gate: ${reason}`,
                    rejectedAt: new Date().toISOString(),
                    rejectedBy: 'autopilot',
                },
            },
        })
        .where(eq(blogPost.id, ideaId))
}

/** Promote an ideation card into the generate stage. */
async function promoteIdea(ideaId: string): Promise<void> {
    await db
        .update(blogPost)
        .set({
            status: 'generate',
            ideaApproval: 'approved',
            pipelineProcessingStatus: 'idle',
            processingError: null,
        })
        .where(eq(blogPost.id, ideaId))
}

export async function selectTopicStep(input: {
    runId: string
}): Promise<SelectTopicStepResult> {
    'use step'

    console.log(`[Autopilot Step] Selecting topic for run ${input.runId}`)
    const config = await getBlogAiConfig()

    // 1. Approved queue, re-gated at write time
    const queue = await getApprovedIdeaQueue()
    for (const idea of queue) {
        const gate = await evaluateSingleTopic({
            title: idea.title,
            primaryKeyword: idea.primaryKeyword,
            secondaryKeywords: idea.secondaryKeywords,
        })
        if (gate.verdict === 'new') {
            await promoteIdea(idea.id)
            console.log(
                `[Autopilot Step] Selected approved idea "${idea.title}"`
            )
            return { selected: true, postId: idea.id, title: idea.title }
        }

        const [current] = await db
            .select({ planningData: blogPost.planningData })
            .from(blogPost)
            .where(eq(blogPost.id, idea.id))
            .limit(1)
        await rejectIdeaFromGate(
            idea.id,
            current?.planningData ?? null,
            gate.reason
        )
        console.warn(
            `[Autopilot Step] Approved idea "${idea.title}" no longer passes the gate (${gate.verdict}): ${gate.reason}`
        )
    }

    if (config.autopilotMode !== 'full') {
        return { selected: false, reason: 'queue-empty' }
    }

    // 2. Full mode: best pending idea
    const pending = await db
        .select({
            id: blogPost.id,
            title: blogPost.title,
            primaryKeyword: blogPost.primaryKeyword,
            secondaryKeywords: blogPost.secondaryKeywords,
            planningData: blogPost.planningData,
        })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'ideation'),
                eq(blogPost.ideaApproval, 'pending')
            )
        )
        .orderBy(desc(blogPost.priority), blogPost.createdAt)

    for (const idea of pending) {
        const gate = await evaluateSingleTopic({
            title: idea.title,
            primaryKeyword: idea.primaryKeyword,
            secondaryKeywords: idea.secondaryKeywords,
        })
        if (gate.verdict === 'new') {
            await promoteIdea(idea.id)
            console.log(
                `[Autopilot Step] Selected pending idea "${idea.title}" (full mode)`
            )
            return { selected: true, postId: idea.id, title: idea.title }
        }
        await rejectIdeaFromGate(idea.id, idea.planningData, gate.reason)
    }

    // 3. Full mode: inline ideation
    console.log('[Autopilot Step] Queue exhausted — ideating inline')
    const candidates = await sourceGatedTopicCandidates(config)
    for (const topic of candidates.fresh) {
        const created = await createPipelinePostInternal({
            title: topic.title,
            primaryKeyword: topic.primaryKeyword ?? null,
            priority: 'medium',
            planningData: topicToPlanningData(topic),
            ideaApproval: 'approved',
        })
        if (created.success) {
            await promoteIdea(created.id)
            console.log(
                `[Autopilot Step] Created and selected "${topic.title}" (inline ideation)`
            )
            return { selected: true, postId: created.id, title: topic.title }
        }
    }

    return {
        selected: false,
        reason: candidates.allRejected ? 'gate-rejected-all' : 'queue-empty',
        refreshCandidates: candidates.refreshCandidates,
    }
}
