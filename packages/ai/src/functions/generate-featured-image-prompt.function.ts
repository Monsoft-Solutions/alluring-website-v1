/**
 * Generate Featured Image Prompt Function
 *
 * AI-powered featured image prompt generation with customizable options
 * for scene, subject, style, lighting, colors, and composition.
 *
 * @module @workspace/ai/functions/generate-featured-image-prompt
 */
import {
    FEATURED_IMAGE_PROMPT_SYSTEM,
    getFeaturedImagePrompt,
} from '../prompts/blog/featured-image-prompt.prompt'
import { coreGenerateText } from '../core'

/**
 * Default model for text generation
 */
const DEFAULT_MODEL_ID = 'gpt-5.2'

/**
 * Customization option with guidelines
 */
type CustomizationOption = {
    id: string
    promptGuidelines: string
}

/**
 * Options for featured image prompt generation
 */
export type GenerateFeaturedImagePromptOptions = {
    /** Blog post title */
    title: string
    /** Content summary of the blog post */
    summary: string
    /** Scene/environment option */
    scene: CustomizationOption
    /** Subject type option */
    subject: CustomizationOption
    /** Image style option */
    style: CustomizationOption
    /** Lighting/mood option */
    lighting: CustomizationOption
    /** Color palette option */
    colorPalette: CustomizationOption
    /** Composition option */
    composition: CustomizationOption
    /** Optional keywords for additional context */
    keywords?: string
    /** Model ID to use (defaults to gpt-5.2) */
    modelId?: string
    /** Temperature for generation (defaults to 0.9 for creativity) */
    temperature?: number
}

/**
 * Result of featured image prompt generation
 */
export type FeaturedImagePromptResult = {
    /** The generated image prompt as raw text */
    prompt: string
}

/**
 * Generate an optimized featured image prompt with customization options
 *
 * Creates a structured prompt based on blog post summary and user-selected
 * customization options. Optimized for fal-ai/gpt-image-1.5.
 *
 * @param options - Generation options including summary, title, and customizations
 * @returns Structured image generation prompt as raw text
 *
 * @example
 * ```typescript
 * const promptResult = await generateFeaturedImagePrompt({
 *   title: 'Brazilian Butt Lift Recovery Tips',
 *   summary: 'A week-by-week recovery guide for BBL patients...',
 *   scene: { id: 'luxury-clinic', promptGuidelines: 'Luxurious private clinic...' },
 *   subject: { id: 'elegant-model', promptGuidelines: 'Elegant diverse model...' },
 *   style: { id: 'luxury-lifestyle', promptGuidelines: 'Luxury lifestyle photography...' },
 *   lighting: { id: 'golden-hour', promptGuidelines: 'Golden hour lighting...' },
 *   colorPalette: { id: 'stone-gold', promptGuidelines: 'Stone and gold color...' },
 *   composition: { id: 'centered-focus', promptGuidelines: 'Centered composition...' },
 * })
 * console.log(promptResult.prompt)
 * ```
 */
export async function generateFeaturedImagePrompt(
    options: GenerateFeaturedImagePromptOptions
): Promise<FeaturedImagePromptResult> {
    const {
        title,
        summary,
        scene,
        subject,
        style,
        lighting,
        colorPalette,
        composition,
        keywords,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.9,
    } = options

    const result = await coreGenerateText({
        modelId,
        system: FEATURED_IMAGE_PROMPT_SYSTEM,
        prompt: getFeaturedImagePrompt({
            title,
            summary,
            sceneGuidelines: scene.promptGuidelines,
            subjectGuidelines: subject.promptGuidelines,
            styleGuidelines: style.promptGuidelines,
            lightingGuidelines: lighting.promptGuidelines,
            colorGuidelines: colorPalette.promptGuidelines,
            compositionGuidelines: composition.promptGuidelines,
            keywords,
        }),
        temperature,
    })

    // Clean up the response - remove any markdown formatting if present
    const cleanedPrompt = result.text
        .trim()
        .replace(/^```[\s\S]*?\n/, '') // Remove opening code fence
        .replace(/\n```$/, '') // Remove closing code fence
        .trim()

    return { prompt: cleanedPrompt }
}
