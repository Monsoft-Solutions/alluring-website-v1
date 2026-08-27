/**
 * Unified Blog Content Generation API
 *
 * Single endpoint for all blog content generation using the unified
 * agentic content pipeline with 4 phases:
 * 1. Agentic Generation (with on-demand research)
 * 2. Review (parallel - 4 agents)
 * 3. Orchestration (revise based on reviews)
 * 4. Extraction (FAQ + Metadata)
 *
 * Supports SSE streaming for real-time progress updates.
 *
 * @route POST /api/blog/generate-content
 */
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { z } from 'zod'
import {
    runAgenticContentPipeline,
    type AgenticContentPipelineResult,
    type AgenticPipelineStep,
    type AgenticProgressData,
} from '@workspace/ai/pipelines'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { langfuseSpanProcessor } from '@/instrumentation'
import { createSseStreamSender } from '@/lib/utils/sse-stream.util'

export const runtime = 'nodejs'
export const maxDuration = 300 // Allow up to 5 minutes for full pipeline

/**
 * Request body schema with full validation
 */
const requestSchema = z.object({
    idea: z.object({
        title: z.string().min(1, 'Title is required'),
        topic: z.string().optional(),
        primaryKeyword: z.string().optional(),
        secondaryKeywords: z.array(z.string()).optional(),
        targetAudience: z.string().optional(),
        uniqueAngle: z.string().optional(),
        estimatedWordCount: z.number().int().min(300).max(10000).optional(),
    }),
    outline: z.string().optional(),
    options: z
        .object({
            /** Enable SSE streaming for progress updates */
            stream: z.boolean().optional().default(true),
            /** Skip review phase (faster, lower quality) */
            skipReview: z.boolean().optional().default(false),
            /** Skip orchestration/revision phase */
            skipOrchestration: z.boolean().optional().default(false),
            /** Model ID for content generation */
            contentModelId: z.string().optional(),
            /** Model ID for review agents */
            reviewModelId: z.string().optional(),
            /** Temperature for content generation (0.0-1.0) */
            /** Maximum tool call steps */
            maxSteps: z.number().int().min(5).max(50).optional(),
        })
        .optional(),
})

type ValidatedRequest = z.infer<typeof requestSchema>

/**
 * SSE event types and payloads
 */
type ProgressEventData = {
    step: AgenticPipelineStep
    progress: number
    message: string
    data?: AgenticProgressData
}

type CompleteEventData = {
    success: true
    content: string
    wordCount: number
    metaDescription: string
    excerpt: string
    suggestedTags: string[]
    readingTimeMinutes: number
    suggestedCategory: string
    faqs: AgenticContentPipelineResult['faqs']
    faqSchema: object | null
    sources: AgenticContentPipelineResult['sources']
    reviews: AgenticContentPipelineResult['reviews']
    orchestratorResult: AgenticContentPipelineResult['orchestratorResult']
    initialContent: string
    initialWordCount: number
    metrics: AgenticContentPipelineResult['metrics']
}

type ErrorEventData = {
    success: false
    error: string
}

type SseEventPayloadMap = {
    progress: ProgressEventData
    complete: CompleteEventData
    error: ErrorEventData
}

type SseEventType = keyof SseEventPayloadMap

/**
 * Run the pipeline with streaming progress
 */
async function runPipelineWithStreaming(
    validatedData: ValidatedRequest,
    send: <E extends SseEventType>(
        event: E,
        data: SseEventPayloadMap[E]
    ) => void,
    close: () => void
): Promise<void> {
    const { idea, outline, options } = validatedData

    try {
        const result = await runAgenticContentPipeline({
            idea: {
                title: idea.title,
                topic: idea.topic,
                primaryKeyword: idea.primaryKeyword,
                secondaryKeywords: idea.secondaryKeywords,
                targetAudience: idea.targetAudience,
                uniqueAngle: idea.uniqueAngle,
                estimatedWordCount: idea.estimatedWordCount,
            },
            outline: outline,
            skipReview: options?.skipReview ?? false,
            skipOrchestration: options?.skipOrchestration ?? false,
            contentModelId: options?.contentModelId,
            reviewModelId: options?.reviewModelId,
            maxSteps: options?.maxSteps,
            onProgress: (step, progress, message, data) => {
                send('progress', { step, progress, message, data })
            },
        })

        if (result.success) {
            send('complete', {
                success: true,
                content: result.content,
                wordCount: result.wordCount,
                metaDescription: result.metaDescription,
                excerpt: result.excerpt,
                suggestedTags: result.suggestedTags,
                readingTimeMinutes: result.readingTimeMinutes,
                suggestedCategory: result.suggestedCategory,
                faqs: result.faqs,
                faqSchema: result.faqSchema,
                sources: result.sources,
                reviews: result.reviews,
                orchestratorResult: result.orchestratorResult,
                initialContent: result.initialContent,
                initialWordCount: result.initialWordCount,
                metrics: result.metrics,
            })
        } else {
            send('error', {
                success: false,
                error: result.error || 'Pipeline failed',
            })
        }
    } catch (error) {
        send('error', {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred',
        })
    } finally {
        close()
        void langfuseSpanProcessor.forceFlush()
    }
}

/**
 * POST /api/blog/generate-content
 *
 * Unified blog content generation endpoint.
 *
 * Features:
 * - Agentic generation with on-demand research (Perplexity/Google)
 * - Parallel review by 4 specialized agents
 * - Orchestrated revision based on reviews
 * - FAQ and metadata extraction
 * - Real-time SSE streaming for progress updates
 *
 * @example Request body
 * ```json
 * {
 *   "idea": {
 *     "title": "BBL Recovery Guide: Week by Week",
 *     "topic": "Brazilian Butt Lift Recovery",
 *     "primaryKeyword": "bbl recovery",
 *     "secondaryKeywords": ["bbl recovery timeline", "bbl aftercare"],
 *     "estimatedWordCount": 2000
 *   },
 *   "outline": {
 *     "tldr": ["Recovery takes 6-8 weeks", "Avoid sitting directly for 2 weeks"],
 *     "introduction": { "hook": "...", "preview": "..." },
 *     "sections": [{ "title": "Week 1-2", "description": "...", "keyPoints": [...] }],
 *     "conclusion": { "summaryPoints": [...], "nextSteps": "..." }
 *   },
 *   "options": {
 *     "stream": true,
 *     "skipReview": false,
 *     "skipOrchestration": false
 *   }
 * }
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth()

        console.log('[API] POST /api/blog/generate-content')

        const body: unknown = await request.json()
        const validationResult = requestSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request body',
                    details: validationResult.error.format(),
                },
                { status: 400 }
            )
        }

        const validatedData = validationResult.data
        const useStreaming = validatedData.options?.stream ?? true

        console.log(
            `[API] Generating content for: "${validatedData.idea.title}"`
        )
        console.log(`[API] Streaming: ${useStreaming}`)
        console.log(
            `[API] Skip review: ${validatedData.options?.skipReview ?? false}`
        )
        console.log(
            `[API] Skip orchestration: ${validatedData.options?.skipOrchestration ?? false}`
        )

        if (useStreaming) {
            // SSE streaming response
            const { stream, send, close } = createSseStreamSender<
                SseEventType,
                SseEventPayloadMap
            >()

            // Send initial progress
            send('progress', {
                step: 'generation',
                progress: 0,
                message: 'Initializing content generation pipeline...',
            })

            // Run pipeline in background (non-blocking)
            void runPipelineWithStreaming(validatedData, send, close)

            // Flush telemetry after response
            after(async () => await langfuseSpanProcessor.forceFlush())

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                },
            })
        } else {
            // Non-streaming response - wait for full result
            const result = await runAgenticContentPipeline({
                idea: {
                    title: validatedData.idea.title,
                    topic: validatedData.idea.topic,
                    primaryKeyword: validatedData.idea.primaryKeyword,
                    secondaryKeywords: validatedData.idea.secondaryKeywords,
                    targetAudience: validatedData.idea.targetAudience,
                    uniqueAngle: validatedData.idea.uniqueAngle,
                    estimatedWordCount: validatedData.idea.estimatedWordCount,
                },
                skipReview: validatedData.options?.skipReview ?? false,
                skipOrchestration:
                    validatedData.options?.skipOrchestration ?? false,
                contentModelId: validatedData.options?.contentModelId,
                reviewModelId: validatedData.options?.reviewModelId,
                maxSteps: validatedData.options?.maxSteps,
            })

            // Flush telemetry
            after(async () => await langfuseSpanProcessor.forceFlush())

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    content: result.content,
                    wordCount: result.wordCount,
                    metaDescription: result.metaDescription,
                    excerpt: result.excerpt,
                    suggestedTags: result.suggestedTags,
                    readingTimeMinutes: result.readingTimeMinutes,
                    suggestedCategory: result.suggestedCategory,
                    faqs: result.faqs,
                    faqSchema: result.faqSchema,
                    sources: result.sources,
                    reviews: result.reviews,
                    orchestratorResult: result.orchestratorResult,
                    initialContent: result.initialContent,
                    initialWordCount: result.initialWordCount,
                    metrics: result.metrics,
                })
            } else {
                return NextResponse.json(
                    {
                        success: false,
                        error: result.error || 'Pipeline failed',
                    },
                    { status: 500 }
                )
            }
        }
    } catch (error) {
        return handleApiError(
            error,
            'Failed to generate content',
            'Error in unified content generation:'
        )
    }
}
