/**
 * Pipeline Extraction Stage API
 *
 * Triggers the metadata and FAQ extraction phase for a blog post.
 * Extracts SEO metadata and FAQ items from the content.
 *
 * The phase logic lives in pipeline-phase.service.ts (shared with the
 * autopilot workflow and the retry route); this route adds cookie auth,
 * HTTP status mapping, and the after() chain into the image phase.
 *
 * @route POST /api/blog/posts/[id]/pipeline/extract
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
    runExtractPhaseForPost,
    runImageGenerationPhaseForPost,
} from '@/lib/services/pipeline-phase.service'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute for extraction

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

        if (post.status !== 'generate_metadata') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Post must be in "generate_metadata" status to run extraction. Current: ${post.status}`,
                },
                { status: 400 }
            )
        }

        if (post.pipelineProcessingStatus === 'processing') {
            return NextResponse.json(
                { success: false, error: 'Extraction already in progress' },
                { status: 409 }
            )
        }

        if (!post.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Content is required for extraction phase',
                },
                { status: 400 }
            )
        }

        // Run extraction inline; the image phase chains after the response
        // is sent so the client isn't held for the full pipeline.
        const result = await runExtractPhaseForPost(id, { chain: false })

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error ?? 'Extraction failed' },
                { status: result.skipped ? 409 : 500 }
            )
        }

        // Chain to image generation phase after response is sent (non-blocking)
        after(async () => {
            await langfuseSpanProcessor.forceFlush()
            await runImageGenerationPhaseForPost(id)
        })

        return NextResponse.json({
            success: true,
            nextStatus: 'generate_image',
        })
    } catch (error) {
        return handleApiError(error, 'Failed to run extraction phase')
    }
}
