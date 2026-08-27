/**
 * Analyze Image Function
 *
 * AI-powered image analysis for gallery media using GPT-4o vision.
 * Analyzes plastic surgery gallery images and extracts structured metadata.
 *
 * @module @workspace/ai/functions/analyze-image
 */
import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'

import { imageAnalysisSchema } from '../schemas/image-analysis.schema'
import { IMAGE_ANALYSIS_SYSTEM_PROMPT } from '../prompts/gallery/image-analysis.prompt'
import { coreGenerateObject } from '../core'

/**
 * Default model for vision analysis
 * GPT-4o is required for vision capabilities
 */
const DEFAULT_VISION_MODEL_ID = 'gpt-4.1'

/**
 * Options for image analysis
 */
export type AnalyzeImageOptions = {
    /** The URL of the image to analyze */
    imageUrl: string
    /** Model ID to use (defaults to gpt-4.1 for vision) */
    modelId?: string
}

/**
 * Analyze a gallery image using AI vision
 *
 * Uses GPT-4o vision to analyze plastic surgery gallery images
 * and extract structured metadata for content management.
 *
 * @param options - Analysis options including image URL
 * @returns Complete AI analysis with metadata
 *
 * @example
 * ```typescript
 * const analysis = await analyzeGalleryImage({
 *   imageUrl: 'https://example.com/gallery/bbl-result.jpg',
 * })
 * console.log(analysis.detectedProcedure) // 'brazilian-butt-lift-bbl-miami'
 * console.log(analysis.isBeforeAfter) // true
 * ```
 */
export async function analyzeGalleryImage(
    options: AnalyzeImageOptions
): Promise<GalleryMediaAIAnalysis> {
    const { imageUrl, modelId = DEFAULT_VISION_MODEL_ID } = options

    const result = await coreGenerateObject({
        modelId,
        schema: imageAnalysisSchema,
        system: IMAGE_ANALYSIS_SYSTEM_PROMPT,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: 'Analyze this plastic surgery gallery image and extract structured information for our content management system. Provide a comprehensive analysis following the guidelines in your instructions.',
                    },
                    {
                        type: 'image',
                        image: imageUrl,
                    },
                ],
            },
        ],
    })

    // Add metadata to the analysis result
    const analysisWithMetadata: GalleryMediaAIAnalysis = {
        ...result.object,
        analyzedAt: new Date().toISOString(),
        modelId,
    }

    return analysisWithMetadata
}
