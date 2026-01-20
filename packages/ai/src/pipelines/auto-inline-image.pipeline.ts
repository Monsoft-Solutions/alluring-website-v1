/**
 * Auto Inline Image Pipeline
 *
 * Fully automated AI-powered pipeline that:
 * 1. Analyzes blog content to identify optimal image locations
 * 2. Generates tailored prompts for each location
 * 3. Creates images via FAL.ai (parallel with batching)
 * 4. Returns structured results for insertion
 *
 * @module @workspace/ai/pipelines/auto-inline-image
 */
import {
    runInlineImageAnalyzer,
    type InlineImageAnalyzerResult,
} from '../agents/inline-image-analyzer.agent'
import { getPhotoGuidelinesWithDiversity } from '../constants/photo-diversity.constant'
import { getPhotoStyleById } from '../constants/photo-style.constant'
import { generateInlineImagePrompt } from '../functions/generate-inline-image-prompt.function'
import type {
    InlineImageAnalysis,
    GeneratedInlineImage,
    PipelineMetrics,
    AutoInlineImagePipelineResult,
    ImageOpportunity,
    InlineImageTypeValue,
} from '../schemas/inline-image-analysis.schema'

/**
 * Image type guidelines mapping
 */
const IMAGE_TYPE_GUIDELINES: Record<InlineImageTypeValue, string> = {
    infographic:
        'Clean infographic design, minimal text, clear visual hierarchy, professional data visualization, modern flat design, easy to read, well-organized information',
    marketing:
        'Aspirational lifestyle photography, emotional appeal, brand-aligned luxury aesthetic, high-end professional photography, warm and inviting atmosphere, premium feel',
    illustration:
        'Detailed professional medical illustration, clean educational diagram, anatomical accuracy, clear labeling areas, professional medical textbook style, precise and informative',
    photo: 'High-quality professional photography, natural lighting, photorealistic, sharp focus, professional clinic environment, medical grade quality, clean and modern',
}

/**
 * Progress callback for auto inline image pipeline
 */
export type AutoInlineImageProgressCallback = (
    step: AutoInlineImagePipelineStep,
    progress: number,
    message: string,
    data?: AutoInlineImageProgressData
) => void

/**
 * Pipeline steps for progress tracking
 */
export type AutoInlineImagePipelineStep =
    | 'analyzing'
    | 'generating-prompts'
    | 'generating-images'
    | 'uploading'
    | 'complete'
    | 'error'

/**
 * Progress data for detailed updates
 */
export type AutoInlineImageProgressData = {
    type: 'analysis' | 'prompt' | 'image' | 'complete' | 'error'
    opportunityId?: string
    opportunityIndex?: number
    totalOpportunities?: number
    imageUrl?: string
    error?: string
}

/**
 * Options for the auto inline image pipeline
 */
export type AutoInlineImagePipelineOptions = {
    /** Blog post content (markdown) */
    content: string
    /** Blog post title */
    title: string
    /** Blog post ID (for blob storage path) */
    blogPostId: string
    /** Maximum number of images to generate (default: 5) */
    maxImages?: number
    /** Image model to use (default: 'gpt-image-1.5') */
    imageModel?: 'gpt-image-1.5' | 'nano-banana-pro'
    /** Progress callback for streaming updates */
    onProgress?: AutoInlineImageProgressCallback
    /** Abort signal for cancellation */
    abortSignal?: AbortSignal
}

/**
 * Get the appropriate guidelines for an opportunity
 * Uses photo style guidelines (with diversity) for photo types with a style,
 * otherwise falls back to standard image type guidelines
 */
function getGuidelinesForOpportunity(opportunity: ImageOpportunity): string {
    // If it's a photo type with a recommended style, use photo style guidelines
    if (
        opportunity.recommendedImageType === 'photo' &&
        opportunity.recommendedPhotoStyle
    ) {
        const baseGuidelines = getPhotoStyleById(
            opportunity.recommendedPhotoStyle
        ).promptGuidelines

        return getPhotoGuidelinesWithDiversity(baseGuidelines)
    }

    // Otherwise use standard image type guidelines
    return IMAGE_TYPE_GUIDELINES[opportunity.recommendedImageType]
}

/**
 * Generate an image prompt for an opportunity
 */
async function generatePromptForOpportunity(
    opportunity: ImageOpportunity,
    title: string,
    abortSignal?: AbortSignal
): Promise<{ opportunityId: string; prompt: string } | null> {
    // Check if aborted
    if (abortSignal?.aborted) {
        return null
    }

    try {
        const guidelines = getGuidelinesForOpportunity(opportunity)

        const result = await generateInlineImagePrompt({
            selectedText: opportunity.contextText,
            imageType: opportunity.recommendedImageType,
            imageTypeGuidelines: guidelines,
            blogPostTitle: title,
            blogPostTopic: opportunity.suggestedSubject,
            photoStyle: opportunity.recommendedPhotoStyle,
        })

        return {
            opportunityId: opportunity.id,
            prompt: result.prompt,
        }
    } catch (error) {
        console.error(
            `[Auto Inline Image] Failed to generate prompt for ${opportunity.id}:`,
            error
        )
        return null
    }
}

/**
 * Generate an image using the FAL.ai service
 * Note: The actual FAL service is in the admin app, so this pipeline
 * returns prompts and the API route handles actual generation
 */
function createGeneratedImageResult(
    opportunity: ImageOpportunity,
    prompt: string | null,
    status: 'pending' | 'success' | 'error',
    imageUrl?: string,
    error?: string
): GeneratedInlineImage {
    return {
        opportunityId: opportunity.id,
        imageUrl,
        altText: opportunity.suggestedSubject,
        prompt: prompt ?? undefined,
        imageType: opportunity.recommendedImageType,
        photoStyle: opportunity.recommendedPhotoStyle,
        insertAfterText: opportunity.insertAfterText,
        status,
        error,
    }
}

/**
 * Run the auto inline image pipeline
 *
 * This pipeline analyzes content and generates prompts for optimal image locations.
 * The actual image generation is delegated to the API route which has access to
 * the FAL.ai service.
 *
 * @param options - Pipeline options
 * @returns Pipeline result with analysis and generated images
 *
 * @example
 * ```typescript
 * const result = await runAutoInlineImagePipeline({
 *   content: markdownContent,
 *   title: 'BBL Recovery Guide',
 *   blogPostId: 'abc-123',
 *   maxImages: 5,
 *   onProgress: (step, progress, message) => {
 *     console.log(`${step}: ${progress}% - ${message}`)
 *   },
 * })
 *
 * if (result.success) {
 *   console.log(`Generated ${result.generatedImages.length} images`)
 * }
 * ```
 */
export async function runAutoInlineImagePipeline(
    options: AutoInlineImagePipelineOptions
): Promise<AutoInlineImagePipelineResult> {
    const startTime = Date.now()
    const {
        content,
        title,
        blogPostId,
        maxImages = 5,
        onProgress,
        abortSignal,
    } = options

    // Initialize metrics
    const metrics: PipelineMetrics = {
        totalTimeMs: 0,
        analysisTimeMs: 0,
        promptGenerationTimeMs: 0,
        imageGenerationTimeMs: 0,
        imagesGenerated: 0,
        imagesFailed: 0,
    }

    let analysis: InlineImageAnalysis | undefined
    const generatedImages: GeneratedInlineImage[] = []

    console.log('[Auto Inline Image] ========================================')
    console.log(`[Auto Inline Image] Starting pipeline for: "${title}"`)
    console.log(`[Auto Inline Image] Blog Post ID: ${blogPostId}`)
    console.log(`[Auto Inline Image] Max images: ${maxImages}`)
    console.log('[Auto Inline Image] ========================================')

    try {
        // Check if aborted before starting
        if (abortSignal?.aborted) {
            throw new Error('Pipeline aborted before starting')
        }

        // Phase 1: Analyze content
        onProgress?.(
            'analyzing',
            5,
            'Analyzing content for image opportunities...'
        )
        const analysisStartTime = Date.now()

        let analyzerResult: InlineImageAnalyzerResult
        try {
            analyzerResult = await runInlineImageAnalyzer({
                content,
                title,
                maxImages,
            })
            analysis = analyzerResult.analysis
            metrics.analysisTimeMs = Date.now() - analysisStartTime
        } catch (error) {
            throw new Error(
                `Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            )
        }

        onProgress?.(
            'analyzing',
            15,
            `Found ${analysis.opportunities.length} image opportunities`,
            {
                type: 'analysis',
                totalOpportunities: analysis.opportunities.length,
            }
        )

        console.log(
            `[Auto Inline Image] Analysis complete: ${analysis.opportunities.length} opportunities`
        )

        // If no opportunities, return early
        if (analysis.opportunities.length === 0) {
            metrics.totalTimeMs = Date.now() - startTime
            onProgress?.('complete', 100, 'No image opportunities found', {
                type: 'complete',
            })

            return {
                success: true,
                analysis,
                generatedImages: [],
                metrics,
            }
        }

        // Check if aborted
        if (abortSignal?.aborted) {
            throw new Error('Pipeline aborted after analysis')
        }

        // Phase 2: Generate prompts (parallel)
        onProgress?.('generating-prompts', 20, 'Generating image prompts...')
        const promptStartTime = Date.now()

        const promptPromises = analysis.opportunities.map(
            (opportunity, index) =>
                generatePromptForOpportunity(
                    opportunity,
                    title,
                    abortSignal
                ).then((result) => {
                    if (result) {
                        const progress =
                            20 +
                            Math.round(
                                ((index + 1) / analysis!.opportunities.length) *
                                    10
                            )
                        onProgress?.(
                            'generating-prompts',
                            progress,
                            `Generated prompt ${index + 1}/${analysis!.opportunities.length}`,
                            {
                                type: 'prompt',
                                opportunityId: opportunity.id,
                                opportunityIndex: index,
                                totalOpportunities:
                                    analysis!.opportunities.length,
                            }
                        )
                    }
                    return result
                })
        )

        const promptResults = await Promise.all(promptPromises)
        metrics.promptGenerationTimeMs = Date.now() - promptStartTime

        // Create a map of opportunityId -> prompt
        const promptMap = new Map<string, string>()
        for (const result of promptResults) {
            if (result) {
                promptMap.set(result.opportunityId, result.prompt)
            }
        }

        console.log(
            `[Auto Inline Image] Generated ${promptMap.size}/${analysis.opportunities.length} prompts`
        )

        // Check if aborted
        if (abortSignal?.aborted) {
            throw new Error('Pipeline aborted after prompt generation')
        }

        // Phase 3: Create generated image results
        // Note: The actual image generation will be done by the API route
        // This pipeline returns the prompts and analysis for the API to process
        onProgress?.('generating-images', 30, 'Preparing image generation...')

        for (const opportunity of analysis.opportunities) {
            const prompt = promptMap.get(opportunity.id) ?? null

            if (prompt) {
                // Mark as pending - API route will update status
                const generatedImage = createGeneratedImageResult(
                    opportunity,
                    prompt,
                    'pending'
                )
                generatedImages.push(generatedImage)
                metrics.imagesGenerated++
            } else {
                // Failed to generate prompt
                const generatedImage = createGeneratedImageResult(
                    opportunity,
                    null,
                    'error',
                    undefined,
                    'Failed to generate prompt'
                )
                generatedImages.push(generatedImage)
                metrics.imagesFailed++
            }
        }

        // Complete
        metrics.totalTimeMs = Date.now() - startTime
        onProgress?.(
            'complete',
            100,
            `Pipeline complete: ${metrics.imagesGenerated} images ready`,
            {
                type: 'complete',
            }
        )

        console.log(
            '[Auto Inline Image] ========================================'
        )
        console.log('[Auto Inline Image] Pipeline Complete!')
        console.log(`[Auto Inline Image] Total time: ${metrics.totalTimeMs}ms`)
        console.log(
            `[Auto Inline Image] Images ready: ${metrics.imagesGenerated}`
        )
        console.log(`[Auto Inline Image] Failures: ${metrics.imagesFailed}`)
        console.log(
            '[Auto Inline Image] ========================================'
        )

        return {
            success: true,
            analysis,
            generatedImages,
            metrics,
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('[Auto Inline Image] Pipeline ERROR:', errorMessage)

        metrics.totalTimeMs = Date.now() - startTime
        onProgress?.('error', 0, `Pipeline failed: ${errorMessage}`, {
            type: 'error',
            error: errorMessage,
        })

        return {
            success: false,
            analysis,
            generatedImages,
            metrics,
            error: errorMessage,
        }
    }
}

/**
 * Re-export types for external use
 */
export type {
    InlineImageAnalysis,
    GeneratedInlineImage,
    PipelineMetrics,
    AutoInlineImagePipelineResult,
    ImageOpportunity,
}
