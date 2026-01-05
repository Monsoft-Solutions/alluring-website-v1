import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { z } from 'zod'
import {
    generateBlogPostContentAgentic,
    type GenerateBlogPostContentAgenticResult,
} from '@workspace/ai/functions'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { langfuseSpanProcessor } from '@/instrumentation'

export const runtime = 'nodejs'
export const maxDuration = 180 // Allow up to 3 minutes for agentic generation

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
 * POST /api/blog/generate-content-agentic
 *
 * Generate blog post content using the agentic approach:
 * - AI writes content while using research tools (Perplexity/Google)
 * - Real-time tool call streaming via SSE
 * - Faster than the full pipeline (no separate review agents)
 *
 * Supports streaming progress updates via SSE when options.stream is true.
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth()

        console.log('Generating agentic content...')

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

            // Track tool calls for the UI
            let toolCallIndex = 0

            // Start agentic generation in background
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const generationPromise: Promise<GenerateBlogPostContentAgenticResult> =
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                generateBlogPostContentAgentic({
                    title: idea.title,
                    topic: idea.topic || idea.title,
                    primaryKeyword: idea.primaryKeyword || '',
                    secondaryKeywords: idea.secondaryKeywords,
                    targetAudience: idea.targetAudience,
                    uniqueAngle: idea.uniqueAngle,
                    estimatedWordCount: idea.estimatedWordCount,
                    outline: {
                        ...outline,
                        sections: outline.sections.map((s) => ({
                            title: s.title,
                            description: s.description,
                            keyPoints: s.keyPoints,
                            subsections: s.subsections,
                        })),
                    },
                    onStepFinish: (step: {
                        stepType: string
                        toolCalls?: unknown[]
                        text?: string
                    }) => {
                        if (step.stepType === 'tool_call' && step.toolCalls) {
                            // Send tool call events
                            // Note: AI SDK v5 uses 'input' property, v4 used 'args'
                            for (const toolCall of step.toolCalls as Array<{
                                toolName: string
                                input?: Record<string, unknown>
                                args?: Record<string, unknown>
                            }>) {
                                toolCallIndex++
                                // Support both AI SDK v5 (input) and fallback to args for compatibility
                                const toolInput =
                                    toolCall.input ?? toolCall.args
                                const queryArg =
                                    typeof toolInput?.query === 'string'
                                        ? toolInput.query
                                        : 'research query'
                                send('progress', {
                                    step: 'agentic-writing',
                                    progress: Math.min(
                                        90,
                                        20 + toolCallIndex * 10
                                    ),
                                    message: `Searching: ${queryArg}`,
                                    data: {
                                        type: 'tool-call',
                                        toolName: toolCall.toolName,
                                        query: queryArg,
                                        toolCallIndex,
                                    },
                                })
                            }
                        } else if (step.text) {
                            // Periodic text update (AI is writing)
                            send('progress', {
                                step: 'agentic-writing',
                                progress: Math.min(90, 20 + toolCallIndex * 10),
                                message: 'AI is writing with research tools...',
                            })
                        }
                    },
                })

            generationPromise
                .then((result: GenerateBlogPostContentAgenticResult) => {
                    send('complete', {
                        success: true,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        content: result.content,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        wordCount: result.wordCount,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        metaDescription: result.metaDescription,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        excerpt: result.excerpt,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        suggestedTags: result.suggestedTags,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        readingTimeMinutes: result.readingTimeMinutes,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        suggestedCategory: result.suggestedCategory,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        faqs: result.faqs,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        faqSchema: result.faqSchema,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        sources: result.sources,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                        pipelineMetadata: result.pipelineMetadata,
                    })
                    close()
                    void langfuseSpanProcessor.forceFlush()
                })
                .catch((error: unknown) => {
                    send('error', {
                        success: false,
                        error:
                            error instanceof Error
                                ? error.message
                                : 'Agentic generation failed',
                    })
                    close()
                    console.error(error)
                    void langfuseSpanProcessor.forceFlush()
                })

            // Send initial progress
            send('progress', {
                step: 'agentic-writing',
                progress: 5,
                message: 'Starting AI writing with research tools...',
            })

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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const result: GenerateBlogPostContentAgenticResult =
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                await generateBlogPostContentAgentic({
                    title: idea.title,
                    topic: idea.topic || idea.title,
                    primaryKeyword: idea.primaryKeyword || '',
                    secondaryKeywords: idea.secondaryKeywords,
                    targetAudience: idea.targetAudience,
                    uniqueAngle: idea.uniqueAngle,
                    estimatedWordCount: idea.estimatedWordCount,
                    outline: {
                        ...outline,
                        sections: outline.sections.map((s) => ({
                            title: s.title,
                            description: s.description,
                            keyPoints: s.keyPoints,
                            subsections: s.subsections,
                        })),
                    },
                })

            return NextResponse.json({
                success: true,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                content: result.content,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                wordCount: result.wordCount,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                metaDescription: result.metaDescription,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                excerpt: result.excerpt,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                suggestedTags: result.suggestedTags,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                readingTimeMinutes: result.readingTimeMinutes,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                suggestedCategory: result.suggestedCategory,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                faqs: result.faqs,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                faqSchema: result.faqSchema,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                sources: result.sources,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                pipelineMetadata: result.pipelineMetadata,
            })
        }
    } catch (error) {
        return handleApiError(
            error,
            'Failed to generate agentic content',
            'Error in agentic content generation:'
        )
    }
}
