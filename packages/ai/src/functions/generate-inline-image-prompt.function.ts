/**
 * Generate Inline Image Prompt Function
 *
 * AI-powered prompt generation for inline blog post images based on selected text.
 * Creates type-specific prompts (infographic, marketing, illustration, photorealistic)
 * optimized for fal.ai image generation models.
 *
 * @module @workspace/ai/functions/generate-inline-image-prompt
 */
import {
    INLINE_IMAGE_PROMPT_SYSTEM,
    getInlineImagePrompt,
} from '../prompts/blog/inline-image-prompt.prompt'
import { coreGenerateText } from '../core'

/**
 * Default model for text generation
 */
const DEFAULT_MODEL_ID = 'gpt-5.2'

/**
 * Supported inline image types
 */
export type InlineImageType =
    | 'infographic'
    | 'marketing'
    | 'illustration'
    | 'photo'

/**
 * Options for inline image prompt generation
 */
export type GenerateInlineImagePromptOptions = {
    /** The text selected in the editor */
    selectedText: string
    /** The type of image to generate */
    imageType: InlineImageType
    /** Type-specific prompting guidelines */
    imageTypeGuidelines: string
    /** Optional blog post title for context */
    blogPostTitle?: string
    /** Optional blog post topic/category */
    blogPostTopic?: string
    /** Model ID to use (defaults to gpt-5.2) */
    modelId?: string
    /** Temperature for generation (defaults to 0.8) */
    temperature?: number
}

/**
 * Result of inline image prompt generation
 */
export type InlineImagePromptResult = {
    /** The generated image prompt optimized for the selected image type */
    prompt: string
}

/**
 * Generate an optimized image prompt for inline blog post images
 *
 * Takes selected text from a blog post editor and generates a detailed,
 * type-specific prompt optimized for AI image generation.
 *
 * @param options - Generation options including selected text and image type
 * @returns The generated image prompt
 *
 * @example
 * ```typescript
 * const result = await generateInlineImagePrompt({
 *   selectedText: "Botox injections reduce wrinkles by relaxing facial muscles...",
 *   imageType: "illustration",
 *   imageTypeGuidelines: "Professional medical illustration, anatomical accuracy...",
 *   blogPostTitle: "Understanding Botox: A Complete Guide"
 * })
 *
 * console.log(result.prompt)
 * // "Professional medical illustration showing facial muscle anatomy and Botox injection sites..."
 * ```
 */
export async function generateInlineImagePrompt(
    options: GenerateInlineImagePromptOptions
): Promise<InlineImagePromptResult> {
    const {
        selectedText,
        imageType,
        imageTypeGuidelines,
        blogPostTitle,
        blogPostTopic,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.8,
    } = options

    const result = await coreGenerateText({
        modelId,
        system: INLINE_IMAGE_PROMPT_SYSTEM,
        prompt: getInlineImagePrompt({
            selectedText,
            imageType,
            imageTypeGuidelines,
            blogPostTitle,
            blogPostTopic,
        }),
        temperature,
    })

    return {
        prompt: result.text,
    }
}
