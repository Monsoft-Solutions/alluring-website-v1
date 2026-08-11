/**
 * Auto Inline Image Generation API
 *
 * Fully automated AI-powered inline image generation:
 * 1. Analyzes blog content to identify optimal image locations
 * 2. Generates tailored prompts for each location
 * 3. Creates images via FAL.ai (parallel with batching)
 * 4. Uploads to Vercel Blob and returns for insertion
 *
 * Supports SSE streaming for real-time progress updates.
 *
 * @route POST /api/blog/generate-inline-images
 */
import type { NextRequest } from 'next/server'
import { after, NextResponse } from 'next/server'
import { z } from 'zod'
import {
    runAutoInlineImagePipeline,
    type AutoInlineImagePipelineStep,
    type AutoInlineImageProgressData,
} from '@workspace/ai/pipelines'
import {
    getInlineImageTypeById,
    type GeneratedInlineImage,
    type InlineImageAnalysis,
    type PipelineMetrics,
} from '@workspace/ai'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { generateImageWithFal } from '@/lib/services/fal-image-generation.service'
import { langfuseSpanProcessor } from '@/instrumentation'
import { createSseStreamSender } from '@/lib/utils/sse-stream.util'

export const runtime = 'nodejs'
export const maxDuration = 300 // Allow up to 5 minutes for full pipeline

/**
 * Request body schema
 */
const requestSchema = z.object({
    content: z.string().min(100, 'Content must be at least 100 characters'),
    title: z.string().min(1, 'Title is required'),
    blogPostId: z.string().uuid('Invalid blog post ID'),
    maxImages: z.number().int().min(1).max(7).optional().default(5),
    imageModel: z
        .enum(['gpt-image-2', 'gpt-image-1.5', 'nano-banana-pro'])
        .optional()
        .default('gpt-image-2'),
})

type ValidatedRequest = z.infer<typeof requestSchema>

/**
 * SSE event types and payloads
 */
type ProgressEventData = {
    step: AutoInlineImagePipelineStep
    progress: number
    message: string
    data?: AutoInlineImageProgressData
}

type AnalysisEventData = {
    analysis: InlineImageAnalysis
    opportunityCount: number
}

type ImageEventData = {
    opportunityId: string
    opportunityIndex: number
    totalOpportunities: number
    status: 'generating' | 'success' | 'error'
    imageUrl?: string
    altText?: string
    error?: string
}

type CompleteEventData = {
    success: true
    analysis: InlineImageAnalysis
    generatedImages: GeneratedInlineImage[]
    metrics: PipelineMetrics
}

type ErrorEventData = {
    success: false
    error: string
}

type SseEventPayloadMap = {
    progress: ProgressEventData
    analysis: AnalysisEventData
    image: ImageEventData
    complete: CompleteEventData
    error: ErrorEventData
}

type SseEventType = keyof SseEventPayloadMap

/**
 * Determine the appropriate image model based on image type
 * - Infographic and Illustration: nano-banana-pro (better for diagrams/graphics)
 * - Marketing and Photo: gpt-image-2 (better for realistic/lifestyle images)
 */
function getModelForImageType(
    imageType: string
): 'gpt-image-2' | 'gpt-image-1.5' | 'nano-banana-pro' {
    if (imageType === 'infographic' || imageType === 'illustration') {
        return 'nano-banana-pro'
    }
    return 'gpt-image-2'
}

/**
 * Generate images for all opportunities using FAL.ai (parallel execution)
 */
async function generateImagesForOpportunities(
    images: GeneratedInlineImage[],
    blogPostId: string,
    _defaultModel: 'gpt-image-2' | 'gpt-image-1.5' | 'nano-banana-pro', // Kept for API compatibility, but model is now determined per image type
    send: <E extends SseEventType>(
        event: E,
        data: SseEventPayloadMap[E]
    ) => void,
    abortSignal?: AbortSignal
): Promise<GeneratedInlineImage[]> {
    const pendingImages = images.filter((img) => img.status === 'pending')
    const totalCount = pendingImages.length

    // Check for early abort
    if (abortSignal?.aborted) {
        return pendingImages.map((image) => ({
            opportunityId: image.opportunityId,
            imageType: image.imageType,
            insertAfterText: image.insertAfterText,
            altText: image.altText,
            prompt: image.prompt,
            status: 'error' as const,
            error: 'Generation cancelled',
        }))
    }

    // Send initial "generating" status for all images
    pendingImages.forEach((image, index) => {
        send('image', {
            opportunityId: image.opportunityId,
            opportunityIndex: index,
            totalOpportunities: totalCount,
            status: 'generating',
        })
    })

    // Generate all images in parallel
    const results = await Promise.allSettled(
        pendingImages.map(async (image, index) => {
            // Check abort before starting
            if (abortSignal?.aborted) {
                throw new Error('Generation cancelled')
            }

            if (!image.prompt) {
                throw new Error('No prompt available')
            }

            // Select model based on image type
            const modelForImage = getModelForImageType(image.imageType)
            console.log(
                `[API] Generating image ${index + 1}/${totalCount} (${image.imageType}) using ${modelForImage}`
            )

            const generatedImages = await generateImageWithFal({
                prompt: image.prompt,
                blogPostId,
                model: modelForImage,
                numImages: 1,
                aspectRatio: getInlineImageTypeById(image.imageType)
                    .aspectRatio,
            })

            if (!generatedImages.length || !generatedImages[0]) {
                throw new Error('No image returned from FAL.ai')
            }

            return { image, generatedImage: generatedImages[0], index }
        })
    )

    // Process results and send SSE updates
    return results.map((result, index) => {
        const image = pendingImages[index]!

        if (result.status === 'fulfilled') {
            send('image', {
                opportunityId: image.opportunityId,
                opportunityIndex: index,
                totalOpportunities: totalCount,
                status: 'success',
                imageUrl: result.value.generatedImage.blobUrl,
                altText: image.altText,
            })

            return {
                opportunityId: image.opportunityId,
                imageType: image.imageType,
                insertAfterText: image.insertAfterText,
                altText: image.altText,
                prompt: image.prompt,
                status: 'success' as const,
                imageUrl: result.value.generatedImage.blobUrl,
            }
        } else {
            const errorMessage =
                result.reason instanceof Error
                    ? result.reason.message
                    : 'Unknown error'

            send('image', {
                opportunityId: image.opportunityId,
                opportunityIndex: index,
                totalOpportunities: totalCount,
                status: 'error',
                error: errorMessage,
            })

            return {
                opportunityId: image.opportunityId,
                imageType: image.imageType,
                insertAfterText: image.insertAfterText,
                altText: image.altText,
                prompt: image.prompt,
                status: 'error' as const,
                error: errorMessage,
            }
        }
    })
}

/**
 * Run the full pipeline with streaming
 */
async function runPipelineWithStreaming(
    validatedData: ValidatedRequest,
    send: <E extends SseEventType>(
        event: E,
        data: SseEventPayloadMap[E]
    ) => void,
    close: () => void,
    abortSignal?: AbortSignal
): Promise<void> {
    const { content, title, blogPostId, maxImages, imageModel } = validatedData
    const startTime = Date.now()

    try {
        // Phase 1: Run analysis and prompt generation pipeline
        const pipelineResult = await runAutoInlineImagePipeline({
            content,
            title,
            blogPostId,
            maxImages,
            imageModel,
            onProgress: (step, progress, message, data) => {
                send('progress', { step, progress, message, data })
            },
            abortSignal,
        })

        if (!pipelineResult.success || !pipelineResult.analysis) {
            send('error', {
                success: false,
                error:
                    pipelineResult.error || 'Pipeline failed during analysis',
            })
            return
        }

        // Send analysis results
        send('analysis', {
            analysis: pipelineResult.analysis,
            opportunityCount: pipelineResult.analysis.opportunities.length,
        })

        // If no opportunities, complete early
        if (pipelineResult.analysis.opportunities.length === 0) {
            send('complete', {
                success: true,
                analysis: pipelineResult.analysis,
                generatedImages: [],
                metrics: {
                    ...pipelineResult.metrics,
                    totalTimeMs: Date.now() - startTime,
                },
            })
            return
        }

        // Phase 2: Generate images using FAL.ai
        send('progress', {
            step: 'generating-images',
            progress: 35,
            message: `Generating ${pipelineResult.generatedImages.length} images...`,
        })

        const imageStartTime = Date.now()
        const generatedImages = await generateImagesForOpportunities(
            pipelineResult.generatedImages,
            blogPostId,
            imageModel,
            send,
            abortSignal
        )

        // Calculate final metrics
        const successCount = generatedImages.filter(
            (img) => img.status === 'success'
        ).length
        const failureCount = generatedImages.filter(
            (img) => img.status === 'error'
        ).length

        const finalMetrics: PipelineMetrics = {
            ...pipelineResult.metrics,
            imageGenerationTimeMs: Date.now() - imageStartTime,
            totalTimeMs: Date.now() - startTime,
            imagesGenerated: successCount,
            imagesFailed: failureCount,
        }

        // Send complete event
        send('complete', {
            success: true,
            analysis: pipelineResult.analysis,
            generatedImages,
            metrics: finalMetrics,
        })
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
 * POST /api/blog/generate-inline-images
 *
 * Automatically generate inline images for a blog post.
 *
 * Features:
 * - AI-powered content analysis to identify optimal image locations
 * - Type-specific prompt generation (infographic, marketing, illustration, photo)
 * - Parallel image generation via FAL.ai
 * - Automatic upload to Vercel Blob
 * - Real-time SSE streaming for progress updates
 *
 * @example Request body
 * ```json
 * {
 *   "content": "# BBL Recovery Guide\n\nA Brazilian Butt Lift...",
 *   "title": "BBL Recovery Guide: Week by Week",
 *   "blogPostId": "abc-123-456",
 *   "maxImages": 5,
 *   "imageModel": "gpt-image-2"
 * }
 * ```
 */
export async function POST(request: NextRequest) {
    try {
        await requireAuth()

        console.log('[API] POST /api/blog/generate-inline-images')

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

        console.log(
            `[API] Auto generating inline images for: "${validatedData.title}"`
        )
        console.log(`[API] Blog Post ID: ${validatedData.blogPostId}`)
        console.log(`[API] Max images: ${validatedData.maxImages}`)
        console.log(`[API] Image model: ${validatedData.imageModel}`)

        // Create abort controller for request cancellation
        const abortController = new AbortController()

        // Listen for request abort (client disconnect)
        request.signal.addEventListener('abort', () => {
            console.log('[API] Request aborted by client')
            abortController.abort()
        })

        // SSE streaming response
        const { stream, send, close } = createSseStreamSender<
            SseEventType,
            SseEventPayloadMap
        >()

        // Send initial progress
        send('progress', {
            step: 'analyzing',
            progress: 0,
            message: 'Starting auto inline image generation...',
        })

        // Run pipeline in background (non-blocking)
        void runPipelineWithStreaming(
            validatedData,
            send,
            close,
            abortController.signal
        )

        // Flush telemetry after response
        after(async () => await langfuseSpanProcessor.forceFlush())

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to generate inline images',
            'Error in auto inline image generation:'
        )
    }
}
