/**
 * Pipeline Review Stage API
 *
 * Triggers the review and orchestration phase for a blog post.
 * Runs 5 review agents and revises content based on feedback.
 *
 * @route POST /api/blog/posts/[id]/pipeline/review
 */
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import type { PipelineState } from '@workspace/db/types'
import { runReviewPhase } from '@workspace/ai/pipelines'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { langfuseSpanProcessor } from '@/instrumentation'
import { runExtractPhaseForPost } from '@/lib/services/pipeline-phase.service'

export const runtime = 'nodejs'
export const maxDuration = 180 // 3 minutes for review + orchestration

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
        if (post.status !== 'ai_review') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Post must be in "ai_review" status to run review. Current: ${post.status}`,
                },
                { status: 400 }
            )
        }

        // Check if already processing
        if (post.pipelineProcessingStatus === 'processing') {
            return NextResponse.json(
                { success: false, error: 'Review already in progress' },
                { status: 409 }
            )
        }

        // Validate content exists
        if (!post.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Content is required for review phase',
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

        // Run review phase
        const planningData = post.planningData
        const result = await runReviewPhase({
            content: post.content,
            title: post.title,
            primaryKeyword: post.primaryKeyword || undefined,
            secondaryKeywords: post.secondaryKeywords || undefined,
            targetAudience: planningData?.targetAudience,
            contentType: planningData?.contentType,
            estimatedWordCount: planningData?.estimatedWordCount,
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
            reviewPhase: {
                startedAt:
                    post.processingStartedAt?.toISOString() ||
                    new Date().toISOString(),
                completedAt: new Date().toISOString(),
                reviews: result.reviews,
            },
            orchestrationPhase: result.orchestratorResult
                ? {
                      startedAt:
                          post.processingStartedAt?.toISOString() ||
                          new Date().toISOString(),
                      completedAt: new Date().toISOString(),
                      result: result.orchestratorResult,
                  }
                : undefined,
        }

        // Update post with revised content and advance to next stage
        const finalContent = result.revisedContent || post.content
        await db
            .update(blogPost)
            .set({
                content: finalContent,
                pipelineProcessingStatus: 'idle',
                processingError: null,
                processingStartedAt: null,
                pipelineState: updatedPipelineState,
                status: 'generate_metadata', // Auto-advance to next stage
            })
            .where(eq(blogPost.id, id))

        // Calculate average review score
        const avgScore =
            result.reviews.length > 0
                ? Math.round(
                      result.reviews.reduce((sum, r) => sum + r.score, 0) /
                          result.reviews.length
                  )
                : 0

        // Chain to extraction phase after response is sent (non-blocking)
        after(async () => {
            await langfuseSpanProcessor.forceFlush()
            // Run extraction phase directly (no HTTP, no auth needed)
            await runExtractPhaseForPost(id)
        })

        return NextResponse.json({
            success: true,
            reviewCount: result.reviews.length,
            averageScore: avgScore,
            reviewTimeMs: result.reviewTimeMs,
            orchestrationTimeMs: result.orchestrationTimeMs,
            totalTimeMs: result.totalTimeMs,
            nextStatus: 'generate_metadata',
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

        return handleApiError(error, 'Failed to run review phase')
    }
}
