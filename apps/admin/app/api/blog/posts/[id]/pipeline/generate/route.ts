/**
 * Pipeline Generation Stage API
 *
 * Triggers the content generation phase for a blog post.
 * Updates the post with generated content and advances to the next stage.
 *
 * The phase logic lives in pipeline-phase.service.ts (shared with the
 * autopilot workflow); this route adds cookie auth, HTTP status mapping,
 * and the after() chain into the review phase.
 *
 * @route POST /api/blog/posts/[id]/pipeline/generate
 */
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { langfuseSpanProcessor } from '@/instrumentation'
import {
    runGenerationPhaseForPost,
    runReviewPhaseForPost,
} from '@/lib/services/pipeline-phase.service'

export const runtime = 'nodejs'
export const maxDuration = 180 // 3 minutes for generation

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    try {
        await requireAuth()

        // Pre-validate here so HTTP callers get precise status codes; the
        // service re-validates before doing any work.
        const [post] = await db
            .select({
                id: blogPost.id,
                status: blogPost.status,
                pipelineProcessingStatus: blogPost.pipelineProcessingStatus,
                planningData: blogPost.planningData,
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

        if (post.status !== 'generate') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Post must be in "generate" status to run generation. Current: ${post.status}`,
                },
                { status: 400 }
            )
        }

        if (post.pipelineProcessingStatus === 'processing') {
            return NextResponse.json(
                { success: false, error: 'Generation already in progress' },
                { status: 409 }
            )
        }

        if (!post.planningData) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Planning data with outline is required for generation',
                },
                { status: 400 }
            )
        }

        // Run generation inline; the review phase chains after the response
        // is sent so the client isn't held for the full pipeline.
        const result = await runGenerationPhaseForPost(id, { chain: false })

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error ?? 'Generation phase failed',
                },
                { status: result.skipped ? 409 : 500 }
            )
        }

        // Chain to review phase after response is sent (non-blocking)
        after(async () => {
            await langfuseSpanProcessor.forceFlush()
            // Run review phase directly (no HTTP, no auth needed)
            await runReviewPhaseForPost(id)
        })

        return NextResponse.json({
            success: true,
            wordCount: result.meta?.wordCount,
            sourcesCount: result.meta?.sourcesCount,
            toolCallCount: result.meta?.toolCallCount,
            timeMs: result.meta?.timeMs,
            nextStatus: 'ai_review',
        })
    } catch (error) {
        // Reset processing status on error
        await db
            .update(blogPost)
            .set({
                pipelineProcessingStatus: 'error',
                processingError:
                    error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(blogPost.id, id))

        return handleApiError(error, 'Failed to run generation phase')
    }
}
