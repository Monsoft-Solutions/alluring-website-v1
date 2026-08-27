/**
 * Generate Visitor Content Function
 *
 * AI-powered visitor-focused content generation for gallery media.
 * Creates engaging titles, descriptions, and accessible alt text.
 *
 * @module @workspace/ai/functions/generate-visitor-content
 */
import {
    type GalleryMediaAIAnalysis,
    visitorContentSchema,
    type VisitorContent,
} from '@workspace/shared/schemas/gallery'
import {
    VISITOR_CONTENT_SYSTEM_PROMPT,
    getVisitorContentPrompt,
} from '../prompts/gallery/visitor-content.prompt'
import { coreGenerateObject } from '../core'

/**
 * Default model for content generation
 * Uses a cost-effective model since this is text-only
 */
const DEFAULT_CONTENT_MODEL_ID = 'gpt-4.1'

/**
 * Options for visitor content generation
 */
export type GenerateVisitorContentOptions = {
    /** The AI analysis of the image */
    aiAnalysis: GalleryMediaAIAnalysis
    /** Optional current title for context */
    currentTitle?: string
    /** Model ID to use (defaults to gpt-4.1-mini) */
    modelId?: string
}

/**
 * Generate visitor-focused content for a gallery image
 *
 * Uses the AI analysis to generate engaging content
 * that resonates with potential patients.
 *
 * @param options - Generation options including AI analysis
 * @returns Visitor-focused content
 *
 * @example
 * ```typescript
 * const visitorContent = await generateGalleryVisitorContent({
 *   aiAnalysis: imageAnalysis,
 * })
 * console.log(visitorContent.title) // 'Stunning BBL Transformation: Natural Curves'
 * ```
 */
export async function generateGalleryVisitorContent(
    options: GenerateVisitorContentOptions
): Promise<VisitorContent> {
    const {
        aiAnalysis,
        currentTitle,
        modelId = DEFAULT_CONTENT_MODEL_ID,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: visitorContentSchema,
        system: VISITOR_CONTENT_SYSTEM_PROMPT,
        prompt: getVisitorContentPrompt(aiAnalysis, currentTitle),
    })

    return result.object
}
