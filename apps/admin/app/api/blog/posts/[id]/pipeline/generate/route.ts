/**
 * Pipeline Generation Stage API
 *
 * Triggers the content generation phase for a blog post.
 * Updates the post with generated content and advances to the next stage.
 *
 * @route POST /api/blog/posts/[id]/pipeline/generate
 */
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import type { PipelineState } from '@workspace/db/types'
import { runGenerationPhase } from '@workspace/ai/pipelines'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { langfuseSpanProcessor } from '@/instrumentation'
import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import { runReviewPhaseForPost } from '@/lib/services/pipeline-phase.service'

export const runtime = 'nodejs'
export const maxDuration = 180 // 3 minutes for generation

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    try {
        await requireAuth()

        // Fetch the blog post
        const [post] = await db
            .select()
            .from(blogPost)
            .where(eq(blogPost.id, id))
            .limit(1)

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Blog post not found' },
                { status: 404 }
            )
        }

        // Validate post is in correct stage
        if (post.status !== 'generate') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Post must be in "generate" status to run generation. Current: ${post.status}`,
                },
                { status: 400 }
            )
        }

        // Check if already processing
        if (post.pipelineProcessingStatus === 'processing') {
            return NextResponse.json(
                { success: false, error: 'Generation already in progress' },
                { status: 409 }
            )
        }

        // Validate planning data exists
        const planningData = post.planningData
        if (!planningData) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Planning data with outline is required for generation',
                },
                { status: 400 }
            )
        }

        // Set processing status
        await db
            .update(blogPost)
            .set({
                pipelineProcessingStatus: 'processing',
                processingStartedAt: new Date(),
                processingError: null,
            })
            .where(eq(blogPost.id, id))

        // Admin-configured model wins; the runner keeps its own default when
        // no configuration row exists yet.
        const aiConfig = await getBlogAiConfig()

        // Run generation phase
        const result = await runGenerationPhase({
            contentModelId: aiConfig.contentModelId,
            input: {
                title: post.title,
                topic: planningData.topic,
                primaryKeyword: post.primaryKeyword || undefined,
                secondaryKeywords: post.secondaryKeywords || undefined,
                targetAudience: planningData.targetAudience,
                uniqueAngle: planningData.uniqueAngle,
                contentType: planningData.contentType,
                estimatedWordCount: planningData.estimatedWordCount,
            },
        })

        if (!result.success) {
            // Update with error
            await db
                .update(blogPost)
                .set({
                    pipelineProcessingStatus: 'error',
                    processingError: result.error,
                })
                .where(eq(blogPost.id, id))

            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            )
        }

        // Build pipeline state update
        const existingPipelineState: PipelineState = post.pipelineState ?? {}
        const updatedPipelineState: PipelineState = {
            ...existingPipelineState,
            generationPhase: {
                startedAt:
                    post.processingStartedAt?.toISOString() ||
                    new Date().toISOString(),
                completedAt: new Date().toISOString(),
                sources: result.sources,
                initialContent: result.content,
                initialWordCount: result.wordCount,
                toolCallCount: result.toolCallCount,
                stepCount: result.stepCount,
            },
        }

        // Update post with generated content and advance to next stage
        await db
            .update(blogPost)
            .set({
                content: result.content,
                pipelineProcessingStatus: 'idle',
                processingError: null,
                processingStartedAt: null,
                pipelineState: updatedPipelineState,
                status: 'ai_review', // Auto-advance to next stage
            })
            .where(eq(blogPost.id, id))

        // Chain to review phase after response is sent (non-blocking)
        after(async () => {
            await langfuseSpanProcessor.forceFlush()
            // Run review phase directly (no HTTP, no auth needed)
            await runReviewPhaseForPost(id)
        })

        return NextResponse.json({
            success: true,
            wordCount: result.wordCount,
            sourcesCount: result.sources.length,
            toolCallCount: result.toolCallCount,
            timeMs: result.timeMs,
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
