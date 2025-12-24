import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { runBlogContentPipeline } from '@workspace/ai/pipelines'
import type { PipelineStep } from '@workspace/ai/agents'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'
export const maxDuration = 300 // Allow up to 5 minutes for full pipeline

const outlineSectionSchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string(),
    keyPoints: z.array(z.string()).optional(),
    subsections: z
        .array(
            z.object({
                title: z.string(),
                description: z.string().optional(),
            })
        )
        .optional(),
})

const requestSchema = z.object({
    idea: z.object({
        title: z.string().min(1),
        topic: z.string().optional(),
        primaryKeyword: z.string().optional(),
        secondaryKeywords: z.array(z.string()).optional(),
        targetAudience: z.string().optional(),
        uniqueAngle: z.string().optional(),
        estimatedWordCount: z.number().optional(),
        contentType: z.string().optional(),
    }),
    outline: z.object({
        tldr: z.array(z.string()),
        introduction: z.object({
            hook: z.string(),
            preview: z.string(),
        }),
        sections: z.array(outlineSectionSchema),
        conclusion: z.object({
            summaryPoints: z.array(z.string()),
            nextSteps: z.string(),
        }),
        seoNotes: z
            .object({
                internalLinks: z.array(z.string()).optional(),
                externalSources: z.array(z.string()).optional(),
                imageIdeas: z.array(z.string()).optional(),
            })
            .optional(),
    }),
    options: z
        .object({
            skipResearch: z.boolean().optional(),
            skipReview: z.boolean().optional(),
            stream: z.boolean().optional(),
        })
        .optional(),
})

/**
 * Create a streaming response with Server-Sent Events (SSE)
 */
function createSSEStream() {
    const encoder = new TextEncoder()
    let controller: ReadableStreamDefaultController<Uint8Array> | null = null

    const stream = new ReadableStream<Uint8Array>({
        start(c) {
            controller = c
        },
    })

    const send = (event: string, data: unknown) => {
        if (controller) {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(message))
        }
    }

    const close = () => {
        if (controller) {
            controller.close()
        }
    }

    return { stream, send, close }
}

/**
 * POST /api/blog/generate-content-v2
 *
 * Generate blog post content using the full AI pipeline:
 * 1. Research phase (web search)
 * 2. Content generation with tools
 * 3. Parallel review agents
 * 4. Orchestrator for final revisions
 *
 * Supports streaming progress updates via SSE when options.stream is true.
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth()

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

        const { idea, outline, options } = validationResult.data
        const useStreaming = options?.stream ?? false

        if (useStreaming) {
            // Streaming response with SSE
            const { stream, send, close } = createSSEStream()

            // Start pipeline in background
            runBlogContentPipeline({
                idea: {
                    ...idea,
                    topic: idea.topic || idea.title,
                },
                outline: {
                    ...outline,
                    sections: outline.sections.map((s, i) => ({
                        ...s,
                        id: s.id || `section-${i}`,
                    })),
                },
                skipResearch: options?.skipResearch,
                skipReview: options?.skipReview,
                onProgress: (
                    step: PipelineStep,
                    progress: number,
                    message: string,
                    data?: unknown
                ) => {
                    send('progress', { step, progress, message, data })
                },
            })
                .then((result) => {
                    send('complete', {
                        success: result.success,
                        error: result.error,
                        initialContent: result.initialContent,
                        reviews: result.reviews.map((r) => ({
                            agentName: r.agentName,
                            score: r.score,
                            summary: r.summary,
                            issueCount: r.issues.length,
                        })),
                        finalContent: result.orchestratorResult.revisedContent,
                        changesSummary:
                            result.orchestratorResult.changesSummary,
                        overallScore: result.orchestratorResult.overallScore,
                        totalProcessingTimeMs: result.totalProcessingTimeMs,
                        timeBreakdown: result.timeBreakdown,
                        // Include research summary for final display
                        research: result.research?.map((r) => ({
                            query: r.query,
                            findingsCount: r.findings.length,
                            topSources: r.findings.slice(0, 2).map((f) => ({
                                title: f.title,
                                url: f.url,
                            })),
                        })),
                    })
                    close()
                })
                .catch((error) => {
                    send('error', {
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : 'Pipeline failed',
                    })
                    close()
                })

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                },
            })
        } else {
            // Non-streaming response - wait for full result
            const result = await runBlogContentPipeline({
                idea: {
                    ...idea,
                    topic: idea.topic || idea.title,
                },
                outline: {
                    ...outline,
                    sections: outline.sections.map((s, i) => ({
                        ...s,
                        id: s.id || `section-${i}`,
                    })),
                },
                skipResearch: options?.skipResearch,
                skipReview: options?.skipReview,
            })

            if (!result.success) {
                return NextResponse.json(
                    {
                        success: false,
                        error: result.error,
                    },
                    { status: 500 }
                )
            }

            return NextResponse.json({
                success: true,
                // Initial content (before reviews)
                initialContent: result.initialContent,
                // Review summaries
                reviews: result.reviews.map((r) => ({
                    agentName: r.agentName,
                    score: r.score,
                    summary: r.summary,
                    issues: r.issues,
                    processingTimeMs: r.processingTimeMs,
                })),
                // Final revised content
                finalContent: result.orchestratorResult.revisedContent,
                metaDescription: result.initialContent.metaDescription,
                excerpt: result.initialContent.excerpt,
                // Orchestrator details
                changesSummary: result.orchestratorResult.changesSummary,
                changes: result.orchestratorResult.changes,
                overallScore: result.orchestratorResult.overallScore,
                // Timing
                totalProcessingTimeMs: result.totalProcessingTimeMs,
                timeBreakdown: result.timeBreakdown,
            })
        }
    } catch (error) {
        return handleApiError(
            error,
            'Failed to generate content',
            'Error in content pipeline:'
        )
    }
}
