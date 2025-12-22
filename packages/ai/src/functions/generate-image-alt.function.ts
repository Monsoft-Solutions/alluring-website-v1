/**
 * Generate Image Alt Text Function
 *
 * AI-powered alt text generation for images.
 * Creates concise, descriptive alt text from image prompts following
 * accessibility best practices and SEO guidelines.
 *
 * @module @workspace/ai/functions/generate-image-alt
 */
import { coreGenerateText } from '../core'

/**
 * Model for image alt text generation
 */
const MODEL_FOR_IMAGE_ALT_TEXT_GENERATION = 'gpt-4.1-mini'

/**
 * System prompt for alt text generation
 */
const ALT_TEXT_SYSTEM_PROMPT = `You are an expert in writing accessible, SEO-optimized image alt text.

Your role is to:
1. Generate concise, descriptive alt text for images
2. Follow web accessibility (WCAG) best practices
3. Create SEO-friendly descriptions
4. Keep alt text focused and relevant
5. Avoid redundancy and unnecessary words

Alt Text Best Practices:
- **Length**: Maximum 125 characters (optimal for screen readers)
- **Be Specific**: Describe what's actually in the image
- **Context Matters**: Consider the image's purpose and surrounding content
- **No Redundancy**: Don't start with "Image of" or "Picture of"
- **Active Voice**: Use active, descriptive language
- **Keywords**: Include relevant keywords naturally (if appropriate)
- **Accuracy**: Be precise and truthful about image content

For medical/cosmetic surgery images:
- Be professional and clinical when appropriate
- Use proper medical terminology
- Describe procedures, results, or diagrams accurately
- Maintain dignity and professionalism

Output Requirements:
- Maximum 125 characters
- No quotation marks around the text
- No prefix like "Alt:" or "Description:"
- Just the clean, concise description
- Proper capitalization and grammar`

/**
 * Options for image alt text generation
 */
export type GenerateImageAltOptions = {
    /** The image generation prompt */
    prompt: string
    /** Model ID to use (defaults to gpt-5.2) */
    modelId?: string
    /** Temperature for generation (defaults to 0.3 for consistency) */
    temperature?: number
}

/**
 * Result of image alt text generation
 */
export type ImageAltResult = {
    /** The generated alt text (max 125 chars) */
    alt: string
}

/**
 * Generate concise alt text for an image from its generation prompt
 *
 * Takes a detailed image generation prompt and creates a concise,
 * accessible alt text description following WCAG guidelines.
 *
 * @param options - Generation options including the image prompt
 * @returns The generated alt text
 *
 * @example
 * ```typescript
 * const result = await generateImageAlt({
 *   prompt: "Professional medical illustration showing facial muscle anatomy and Botox injection sites, detailed diagram with clear labels, clinical style, anatomical accuracy"
 * })
 *
 * console.log(result.alt)
 * // "Facial anatomy diagram showing Botox injection sites with muscle detail"
 * ```
 */
export async function generateImageAlt(
    options: GenerateImageAltOptions
): Promise<ImageAltResult> {
    const {
        prompt,
        modelId = MODEL_FOR_IMAGE_ALT_TEXT_GENERATION,
        temperature = 0.3,
    } = options

    const userPrompt = `Generate concise, accessible alt text (max 125 characters) for an image created with this prompt:

"${prompt}"

Requirements:
- Maximum 125 characters
- Describe what's in the image, not the prompt itself
- Be specific and descriptive
- Use proper terminology
- No quotation marks or prefix
- Professional tone for medical content

Generate the alt text now:`

    const result = await coreGenerateText({
        modelId,
        system: ALT_TEXT_SYSTEM_PROMPT,
        prompt: userPrompt,
        temperature,
        maxTokens: 50, // Keep it concise
    })

    // Clean up the result (remove quotes, trim, ensure max length)
    let altText = result.text.trim()

    // Remove surrounding quotes if present
    if (
        (altText.startsWith('"') && altText.endsWith('"')) ||
        (altText.startsWith("'") && altText.endsWith("'"))
    ) {
        altText = altText.slice(1, -1)
    }

    // Ensure max length
    if (altText.length > 125) {
        altText = altText.substring(0, 122) + '...'
    }

    return {
        alt: altText,
    }
}
