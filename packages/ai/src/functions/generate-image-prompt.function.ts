/**
 * Generate Image Prompt Function
 *
 * AI-powered image prompt generation for openai/gpt-image-2, fal-ai/gpt-image-1.5 and fal-ai/nano-banana-pro.
 * Creates structured prompts based on blog post summaries using best practices.
 *
 * @module @workspace/ai/functions/generate-image-prompt
 */
import {
    IMAGE_PROMPT_SYSTEM_PROMPT,
    getImagePromptPrompt,
} from '../prompts/blog/image-prompt.prompt'
import { coreGenerateText } from '../core'

/**
 * Default model for text generation
 */
const DEFAULT_MODEL_ID = 'gpt-5.2'

/**
 * Options for image prompt generation
 */
export type GenerateImagePromptOptions = {
    /** Content summary of the blog post */
    summary: string
    /** Blog post title */
    title: string
    /** Optional keywords for additional context */
    keywords?: string
    /** Model ID to use (defaults to gpt-5.2) */
    modelId?: string
    /** Temperature for generation (defaults to 0.9 for creativity) */
    temperature?: number
}

/**
 * Result of image prompt generation
 */
export type ImagePromptResult = {
    /** The generated image prompt as raw text */
    prompt: string
}

/**
 * Generate an optimized image prompt for fal-ai image models
 *
 * Creates a structured prompt based on blog post summary using best practices
 * for gpt-image-2, gpt-image-1.5 and nano-banana-pro. Follows the format:
 * Scene → Subject → Details → Lighting → Composition → Style → Constraints
 *
 * @param options - Generation options including summary and title
 * @returns Structured image generation prompt as raw text
 *
 * @example
 * ```typescript
 * const promptResult = await generateImagePrompt({
 *   summary: 'A week-by-week recovery guide for BBL patients covering healing milestones...',
 *   title: 'Brazilian Butt Lift Recovery Tips',
 *   keywords: 'plastic surgery, recovery, Miami',
 * })
 * console.log(promptResult.prompt)
 * // 'Elegant private recovery suite in a luxury Miami plastic surgery clinic...'
 * ```
 */
export async function generateImagePrompt(
    options: GenerateImagePromptOptions
): Promise<ImagePromptResult> {
    const {
        summary,
        title,
        keywords,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.9,
    } = options

    const result = await coreGenerateText({
        modelId,
        system: IMAGE_PROMPT_SYSTEM_PROMPT,
        prompt: getImagePromptPrompt(summary, title, keywords),
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
