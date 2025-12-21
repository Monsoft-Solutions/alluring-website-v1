/**
 * Generate Image Prompt Function
 *
 * AI-powered image prompt generation for gpt-image-1.
 * Creates optimized prompts based on blog post summaries.
 *
 * @module @workspace/ai/functions/generate-image-prompt
 */
import { z } from 'zod'

import {
    IMAGE_PROMPT_SYSTEM_PROMPT,
    getImagePromptPrompt,
} from '../prompts/blog/image-prompt.prompt'
import { coreGenerateObject } from '../core'

/**
 * Schema for image prompt output
 */
const imagePromptSchema = z.object({
    prompt: z
        .string()
        .min(40)
        .max(1000)
        .describe(
            'A detailed image generation prompt optimized for gpt-image-1, incorporating brand guidelines and technical specifications'
        ),
})

/**
 * Default model for text generation
 * Uses a cost-effective model since this is text-only
 */
const DEFAULT_MODEL_ID = 'gpt-4o-mini'

/**
 * Options for image prompt generation
 */
export type GenerateImagePromptOptions = {
    /** Visual summary of the blog post */
    summary: string
    /** Blog post title */
    title: string
    /** Optional keywords for additional context */
    keywords?: string
    /** Model ID to use (defaults to gpt-4o-mini) */
    modelId?: string
    /** Temperature for generation (defaults to 0.7 for creativity) */
    temperature?: number
}

/**
 * Result of image prompt generation
 */
export type ImagePromptResult = z.infer<typeof imagePromptSchema>

/**
 * Generate an optimized image prompt for gpt-image-1
 *
 * Creates a detailed prompt based on blog post summary that incorporates
 * brand guidelines and technical specifications for optimal image generation.
 *
 * @param options - Generation options including summary and title
 * @returns Optimized image generation prompt
 *
 * @example
 * ```typescript
 * const promptResult = await generateImagePrompt({
 *   summary: 'A comprehensive guide to BBL recovery...',
 *   title: 'Brazilian Butt Lift Recovery Tips',
 *   keywords: 'plastic surgery, recovery, Miami',
 * })
 * console.log(promptResult.prompt)
 * // 'Luxury medical consultation room in Miami, modern clean aesthetic...'
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
        temperature = 0.7,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: imagePromptSchema,
        system: IMAGE_PROMPT_SYSTEM_PROMPT,
        prompt: getImagePromptPrompt(summary, title, keywords),
        temperature,
    })

    return result.object
}
