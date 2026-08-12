/**
 * Pipeline Retry API
 *
 * Recovers an errored or stuck post in one server-side call: frees the
 * processing flag and re-runs the pipeline phase the post is currently
 * sitting in, then chains the remaining phases after the response is sent
 * (same shape as the per-phase routes).
 *
 * Replaces the old client-orchestrated two-step (reset action + re-POST of
 * the phase endpoint), which left the post idle-but-unprocessed when the
 * browser closed between the two calls.
 *
 * @route POST /api/blog/posts/[id]/pipeline/retry
 */
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { and, eq, isNull, lt, ne, or } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { langfuseSpanProcessor } from '@/instrumentation'
import { stuckCutoff } from '@/lib/utils/stuck-post.util'
import {
    runGenerationPhaseForPost,
    runReviewPhaseForPost,
    runExtractPhaseForPost,
    runImageGenerationPhaseForPost,
    type PhaseRunResult,
} from '@/lib/services/pipeline-phase.service'

export const runtime = 'nodejs'
// As long as the longest phase (generation/review both budget 180s).
export const maxDuration = 180

type RouteParams = {
    params: Promise<{ id: string }>
}

/** The phase to re-run and what to chain afterwards, keyed by post status. */
const RETRY_PLAN: Record<
    string,
    {
        run: (postId: string) => Promise<PhaseRunResult>
        chainAfter?: (postId: string) => Promise<PhaseRunResult>
        nextStatus: string
    }
> = {
    generate: {
        run: (postId) => runGenerationPhaseForPost(postId, { chain: false }),
        chainAfter: (postId) => runReviewPhaseForPost(postId),
        nextStatus: 'ai_review',
    },
    ai_review: {
        run: (postId) => runReviewPhaseForPost(postId, { chain: false }),
        chainAfter: (postId) => runExtractPhaseForPost(postId),
        nextStatus: 'generate_metadata',
    },
    generate_metadata: {
        run: (postId) => runExtractPhaseForPost(postId, { chain: false }),
        chainAfter: (postId) => runImageGenerationPhaseForPost(postId),
        nextStatus: 'generate_image',
    },
    generate_image: {
        run: (postId) => runImageGenerationPhaseForPost(postId),
        nextStatus: 'draft',
    },
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    try {
        await requireAuth()

        const [post] = await db
            .select({
                id: blogPost.id,
                status: blogPost.status,
                pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
                processingStartedAt: blogPost.processingStartedAt,
            })
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Blog post not found' },
                { status: 404 }
            )
        }

        // Claim the post: free the processing flag unless a live phase holds
        // it. Stuck rows (dead invocation the reaper hasn't passed yet) are
        // claimable — their "processing" started before the stuck cutoff or
        // never recorded a start at all. The conditional UPDATE makes two
        // concurrent retries resolve to one winner.
        const claimed = await db
            .update(blogPost)
            .set({
                pipelineProcessingStatus: 'idle',
                processingError: null,
                processingStartedAt: null,
            })
            .where(
                and(
                    eq(blogPost.id, id),
                    or(
                        // NULL <> 'processing' is falsy in SQL; legacy rows
                        // with no processing status are claimable too.
                        ne(blogPost.pipelineProcessingStatus, 'processing'),
                        isNull(blogPost.pipelineProcessingStatus),
                        lt(
                            blogPost.processingStartedAt,
                            stuckCutoff(new Date())
                        ),
                        isNull(blogPost.processingStartedAt)
                    )
                )
            )
            .returning({ id: blogPost.id })

        if (claimed.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'A phase is still running for this post',
                },
                { status: 409 }
            )
        }

        const plan = RETRY_PLAN[post.status ?? '']

        // Posts outside the auto-processing stages have no phase to re-run;
        // the claim above already cleared the error flag.
        if (!plan) {
            return NextResponse.json({
                success: true,
                action: 'reset-only',
                status: post.status,
            })
        }

        const result = await plan.run(id)

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error ?? 'Retry failed' },
                { status: result.skipped ? 409 : 500 }
            )
        }

        // Chain the remaining phases after the response is sent, matching
        // the per-phase routes.
        after(async () => {
            await langfuseSpanProcessor.forceFlush()
            if (plan.chainAfter) await plan.chainAfter(id)
        })

        return NextResponse.json({
            success: true,
            action: 'retried',
            nextStatus: plan.nextStatus,
        })
    } catch (error) {
        return handleApiError(error, 'Failed to retry pipeline phase')
    }
}
