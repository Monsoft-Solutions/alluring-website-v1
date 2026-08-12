/**
 * Pipeline Review Stage API
 *
 * Triggers the review and orchestration phase for a blog post.
 * Runs 5 review agents and revises content based on feedback.
 *
 * The phase logic lives in pipeline-phase.service.ts (shared with the
 * autopilot workflow and the retry route); this route adds cookie auth,
 * HTTP status mapping, and the after() chain into the extraction phase.
 *
 * @route POST /api/blog/posts/[id]/pipeline/review
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
    runReviewPhaseForPost,
    runExtractPhaseForPost,
} from '@/lib/services/pipeline-phase.service'

export const runtime = 'nodejs'
export const maxDuration = 180 // 3 minutes for review + orchestration

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
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
                content: blogPost.content,
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

        if (post.status !== 'ai_review') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Post must be in "ai_review" status to run review. Current: ${post.status}`,
                },
                { status: 400 }
            )
        }

        if (post.pipelineProcessingStatus === 'processing') {
            return NextResponse.json(
                { success: false, error: 'Review already in progress' },
                { status: 409 }
            )
        }

        if (!post.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Content is required for review phase',
                },
                { status: 400 }
            )
        }

        // Run review inline; the extraction phase chains after the response
        // is sent so the client isn't held for the full pipeline.
        const result = await runReviewPhaseForPost(id, { chain: false })

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error ?? 'Review failed' },
                { status: result.skipped ? 409 : 500 }
            )
        }

        // Chain to extraction phase after response is sent (non-blocking)
        after(async () => {
            await langfuseSpanProcessor.forceFlush()
            await runExtractPhaseForPost(id)
        })

        return NextResponse.json({
            success: true,
            nextStatus: 'generate_metadata',
        })
    } catch (error) {
        return handleApiError(error, 'Failed to run review phase')
    }
}
