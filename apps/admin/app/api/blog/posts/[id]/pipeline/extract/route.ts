/**
 * Pipeline Extraction Stage API
 *
 * Triggers the metadata and FAQ extraction phase for a blog post.
 * Extracts SEO metadata and FAQ items from the content.
 *
 * @route POST /api/blog/posts/[id]/pipeline/extract
 */
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import type { PipelineState, PipelineMetrics } from '@workspace/db/types'
import { runExtractionPhase } from '@workspace/ai/pipelines'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { langfuseSpanProcessor } from '@/instrumentation'
import { calculateDuration } from '@/lib/utils/time.util'

export const runtime = 'nodejs'
export const maxDuration = 60 // 1 minute for extraction

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
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
        if (post.status !== 'generate_metadata') {
            return NextResponse.json(
                {
                    success: false,
                    error: `Post must be in "generate_metadata" status to run extraction. Current: ${post.status}`,
                },
                { status: 400 }
            )
        }

        // Check if already processing
        if (post.pipelineProcessingStatus === 'processing') {
            return NextResponse.json(
                { success: false, error: 'Extraction already in progress' },
                { status: 409 }
            )
        }

        // Validate content exists
        if (!post.content) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Content is required for extraction phase',
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

        // Run extraction phase
        const result = await runExtractionPhase({
            content: post.content,
            title: post.title,
            primaryKeyword: post.primaryKeyword || undefined,
        })

        // Flush telemetry
        after(async () => await langfuseSpanProcessor.forceFlush())

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

        // Build pipeline state update with metrics
        const existingPipelineState = post.pipelineState || {}
        const metrics: PipelineMetrics = {
            totalTimeMs:
                (existingPipelineState.generationPhase
                    ? calculateDuration(
                          existingPipelineState.generationPhase.startedAt,
                          existingPipelineState.generationPhase.completedAt
                      )
                    : 0) + result.timeMs,
            generationTimeMs: 0, // Already captured
            reviewTimeMs: 0, // Already captured
            orchestrationTimeMs: 0, // Already captured
            extractionTimeMs: result.timeMs,
            toolCallCount:
                existingPipelineState.generationPhase?.toolCallCount || 0,
            stepCount: existingPipelineState.generationPhase?.stepCount || 0,
        }

        const updatedPipelineState: PipelineState = {
            ...existingPipelineState,
            extractionPhase: {
                startedAt:
                    post.processingStartedAt?.toISOString() ||
                    new Date().toISOString(),
                completedAt: new Date().toISOString(),
            },
            metrics,
        }

        // Generate slug if not set
        const slug =
            post.slug ||
            post.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

        // Update post with extracted metadata and advance to generate_image
        await db
            .update(blogPost)
            .set({
                slug,
                metaDescription: result.metaDescription,
                excerpt: result.excerpt,
                readingTime: result.readingTimeMinutes,
                faqs: result.faqs,
                pipelineProcessingStatus: 'idle',
                processingError: null,
                processingStartedAt: null,
                pipelineState: updatedPipelineState,
                status: 'generate_image', // Auto-advance to image generation
            })
            .where(eq(blogPost.id, id))

        return NextResponse.json({
            success: true,
            metaDescription: result.metaDescription,
            excerpt: result.excerpt,
            faqCount: result.faqs.length,
            readingTimeMinutes: result.readingTimeMinutes,
            suggestedCategory: result.suggestedCategory,
            suggestedTags: result.suggestedTags,
            timeMs: result.timeMs,
            nextStatus: 'generate_image',
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

        return handleApiError(error, 'Failed to run extraction phase')
    }
}
