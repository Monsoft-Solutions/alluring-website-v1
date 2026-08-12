/**
 * Pipeline Post Service
 *
 * Headless creation of pipeline posts — no cookie auth, no cache
 * revalidation. The createPipelinePost server action wraps this for the
 * admin UI; the autopilot jobs call it directly.
 *
 * The keyword-ownership gate is enforced here so every entry path into the
 * pipeline (human or autopilot) is cannibalization-safe by construction.
 *
 * @module @/lib/services/pipeline-post
 */
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import type { PlanningData } from '@workspace/db/types'
import type { TopicVerdict } from '@workspace/shared/seo'

import { evaluateSingleTopic } from '@/lib/services/ideation-gate.service'
import { enqueueIdeationGateSignal } from '@/lib/services/content-refresh.service'
import type { CreatePipelinePostData } from '@/lib/types/blog/blog-action.type'

export type CreatePipelinePostInternalData = CreatePipelinePostData & {
    /**
     * Approval state stamped on the ideation card. Manual admin creates are
     * implicitly approved (the admin chose the topic); autopilot-generated
     * ideas start pending and wait in the approval queue.
     */
    ideaApproval?: 'pending' | 'approved'
}

export type CreatePipelinePostInternalResult =
    | { success: true; id: string; gate: TopicVerdict }
    | { success: false; error: string; gate?: TopicVerdict }

export async function createPipelinePostInternal(
    data: CreatePipelinePostInternalData
): Promise<CreatePipelinePostInternalResult> {
    if (!data.title?.trim()) {
        return { success: false, error: 'Title is required' }
    }

    // Keyword-ownership gate: a topic whose cluster is owned by a money
    // page or duplicates an existing post cannot enter the pipeline
    const gate = await evaluateSingleTopic({
        title: data.title,
        primaryKeyword: data.primaryKeyword,
        secondaryKeywords: data.secondaryKeywords,
    })
    if (gate.verdict === 'reject') {
        return {
            success: false,
            error: `Topic rejected: ${gate.reason}`,
            gate,
        }
    }
    if (gate.verdict === 'refresh') {
        // The topic's demand belongs to an existing post — route it into
        // the refresh queue (#147) instead of writing a competing article.
        let queued = false
        try {
            const result = await enqueueIdeationGateSignal({
                owningUrl: gate.owningUrl,
                topicTitle: data.title,
                primaryKeyword: data.primaryKeyword,
                reason: gate.reason,
            })
            queued =
                result?.outcome === 'created' || result?.outcome === 'merged'
        } catch (error) {
            console.warn(
                `[Pipeline] Failed to queue refresh for "${data.title}":`,
                error
            )
        }
        return {
            success: false,
            error: queued
                ? `Topic refused: ${gate.reason} — the owning post was queued for a refresh instead`
                : `Topic refused: ${gate.reason}`,
            gate,
        }
    }

    const planningData: PlanningData = {
        ...(data.planningData ?? {}),
        ideationGate: {
            verdict: gate.verdict,
            reason: gate.reason,
            owningUrl: gate.owningUrl,
            claimedQueries: gate.claimedQueries,
            checkedAt: new Date().toISOString(),
        },
    }

    const [newPost] = await db
        .insert(blogPost)
        .values({
            title: data.title.trim(),
            primaryKeyword: data.primaryKeyword ?? null,
            secondaryKeywords: data.secondaryKeywords ?? null,
            authorId: data.authorId ?? null,
            priority: data.priority ?? 'medium',
            planningData,
            status: 'ideation',
            pipelineProcessingStatus: 'idle',
            ideaApproval: data.ideaApproval ?? 'approved',
        })
        .returning({ id: blogPost.id })

    if (!newPost) {
        return { success: false, error: 'Failed to create post', gate }
    }

    return { success: true, id: newPost.id, gate }
}
