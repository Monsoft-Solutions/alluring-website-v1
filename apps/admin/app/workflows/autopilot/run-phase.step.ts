/**
 * Run Phase Step
 *
 * Durable workflow step that executes one pipeline phase for a post via the
 * shared pipeline-phase service (`chain: false` — the workflow owns
 * sequencing).
 *
 * Idempotent by design: workflow steps are retried after crashes, so the
 * step first checks where the post actually is. A post already past the
 * phase's expected status means a previous invocation finished the work —
 * report success. A post stuck in `processing` means a previous invocation
 * died mid-phase — reset it and run the phase again.
 *
 * @module @admin/app/workflows/autopilot/run-phase.step
 */
import { eq } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'

import {
    runGenerationPhaseForPost,
    runReviewPhaseForPost,
    runExtractPhaseForPost,
    runImageGenerationPhaseForPost,
} from '@/lib/services/pipeline-phase.service'

export type AutopilotPhase = 'generate' | 'review' | 'extract' | 'images'

export type RunPhaseStepResult = {
    success: boolean
    alreadyDone?: boolean
    error?: string
    durationMs: number
}

/** Post status each phase expects, and the pipeline order for comparisons. */
const PHASE_EXPECTED_STATUS: Record<AutopilotPhase, string> = {
    generate: 'generate',
    review: 'ai_review',
    extract: 'generate_metadata',
    images: 'generate_image',
}

const STATUS_ORDER = [
    'ideation',
    'generate',
    'ai_review',
    'generate_metadata',
    'generate_image',
    'draft',
    'ready_to_publish',
    'scheduled',
    'published',
]

const PHASE_RUNNERS: Record<
    AutopilotPhase,
    (postId: string) => ReturnType<typeof runGenerationPhaseForPost>
> = {
    generate: (postId) => runGenerationPhaseForPost(postId, { chain: false }),
    review: (postId) => runReviewPhaseForPost(postId, { chain: false }),
    extract: (postId) => runExtractPhaseForPost(postId, { chain: false }),
    images: (postId) =>
        runImageGenerationPhaseForPost(postId, { chain: false }),
}

export async function runPhaseStep(input: {
    postId: string
    phase: AutopilotPhase
}): Promise<RunPhaseStepResult> {
    'use step'

    const { postId, phase } = input
    const startedAt = Date.now()
    console.log(`[Autopilot Step] Phase ${phase} for post ${postId}`)

    const [post] = await db
        .select({
            status: blogPost.status,
            pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
        })
        .from(blogPost)
        .where(eq(blogPost.id, postId))
        .limit(1)

    if (!post) {
        return {
            success: false,
            error: 'Post not found',
            durationMs: Date.now() - startedAt,
        }
    }

    const expected = PHASE_EXPECTED_STATUS[phase]
    const currentIndex = STATUS_ORDER.indexOf(post.status ?? '')
    const expectedIndex = STATUS_ORDER.indexOf(expected)

    // Step retry after the phase already completed: the post moved on.
    if (currentIndex > expectedIndex) {
        console.log(
            `[Autopilot Step] Phase ${phase} already done (post is in ${post.status})`
        )
        return {
            success: true,
            alreadyDone: true,
            durationMs: Date.now() - startedAt,
        }
    }

    // Step retry after a mid-phase crash: free the per-post processing flag
    // so the runner's validation lets the phase re-run. The content-run lock
    // guarantees no other autopilot run touches this post concurrently.
    if (
        currentIndex === expectedIndex &&
        post.pipelineProcessingStatus === 'processing'
    ) {
        console.warn(
            `[Autopilot Step] Post ${postId} stuck in processing before ${phase}; resetting for retry`
        )
        await db
            .update(blogPost)
            .set({ pipelineProcessingStatus: 'idle', processingError: null })
            .where(eq(blogPost.id, postId))
    }

    const result = await PHASE_RUNNERS[phase](postId)

    return {
        success: result.success,
        error: result.error,
        durationMs: Date.now() - startedAt,
    }
}
