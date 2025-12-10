/**
 * Generate SEO Content Function
 *
 * AI-powered SEO content generation for gallery media.
 * Creates search-optimized titles, descriptions, and slugs.
 *
 * @module @workspace/ai/functions/generate-seo-content
 */
import {
    seoContentSchema,
    type SEOContent,
    type GalleryMediaAIAnalysis,
} from '../schemas/image-analysis.schema'
import {
    SEO_CONTENT_SYSTEM_PROMPT,
    getSEOContentPrompt,
} from '../prompts/gallery/seo-content.prompt'
import { coreGenerateObject } from '../core'

/**
 * Default model for content generation
 * Uses a cost-effective model since this is text-only
 */
const DEFAULT_CONTENT_MODEL_ID = 'gpt-4.1'

/**
 * Options for SEO content generation
 */
export type GenerateSEOContentOptions = {
    /** The AI analysis of the image */
    aiAnalysis: GalleryMediaAIAnalysis
    /** Optional current title for context */
    currentTitle?: string
    /** Model ID to use (defaults to gpt-4.1-mini) */
    modelId?: string
    /** Temperature for generation (defaults to 0.7 for creativity) */
    temperature?: number
}

/**
 * Generate SEO-optimized content for a gallery image
 *
 * Uses the AI analysis to generate search-engine-optimized
 * content including title, description, and URL slug.
 *
 * @param options - Generation options including AI analysis
 * @returns SEO-optimized content
 *
 * @example
 * ```typescript
 * const seoContent = await generateGallerySEOContent({
 *   aiAnalysis: imageAnalysis,
 *   currentTitle: 'Patient Gallery Image',
 * })
 * console.log(seoContent.seoTitle) // 'BBL Results Before After | Miami Plastic Surgery'
 * ```
 */
export async function generateGallerySEOContent(
    options: GenerateSEOContentOptions
): Promise<SEOContent> {
    const {
        aiAnalysis,
        currentTitle,
        modelId = DEFAULT_CONTENT_MODEL_ID,
        temperature = 0.7,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: seoContentSchema,
        system: SEO_CONTENT_SYSTEM_PROMPT,
        prompt: getSEOContentPrompt(aiAnalysis, currentTitle),
        temperature,
    })

    return result.object
}
