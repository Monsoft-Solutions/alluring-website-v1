/**
 * Pipeline Image Generation Stage API
 *
 * Triggers the featured image generation phase for a blog post.
 * AI selects optimal image options, generates prompt, creates image via
 * fal.ai, and links it as the featured image.
 *
 * The phase logic lives in pipeline-phase.service.ts (shared with the
 * autopilot workflow and the retry route); this route adds cookie auth and
 * HTTP status mapping. Terminal phase — nothing chains after it.
 *
 * @route POST /api/blog/posts/[id]/pipeline/generate-image
 */
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { langfuseSpanProcessor } from '@/instrumentation'
import { runImageGenerationPhaseForPost } from '@/lib/services/pipeline-phase.service'

export const runtime = 'nodejs'
export const maxDuration = 120 // 2 minutes for image generation

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

        if (post.status !== 'generate_image') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Post must be in "generate_image" status to generate image. Current: ${post.status}`,
                },
                { status: 400 }
            )
        }

        if (post.pipelineProcessingStatus === 'processing') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Image generation already in progress',
                },
                { status: 409 }
            )
        }

        if (!post.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Content is required for image generation phase',
                },
                { status: 400 }
            )
        }

        const result = await runImageGenerationPhaseForPost(id)

        // Flush telemetry after the response regardless of outcome
        after(async () => {
            await langfuseSpanProcessor.forceFlush()
        })

        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: result.error ?? 'Image generation failed',
                },
                { status: result.skipped ? 409 : 500 }
            )
        }

        return NextResponse.json({
            success: true,
            nextStatus: 'draft',
        })
    } catch (error) {
        return handleApiError(error, 'Failed to run image generation phase')
    }
}
