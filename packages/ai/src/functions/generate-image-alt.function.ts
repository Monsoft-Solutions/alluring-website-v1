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
    /**
     * Short description of what the image actually depicts.
     *
     * Prefer this over the raw prompt: generation prompts are long
     * art-direction briefs full of camera and exclusion language that has no
     * place in alt text. When supplied it becomes the primary source.
     */
    concept?: string
    /** Primary SEO keyword to weave in naturally, when it fits */
    primaryKeyword?: string
    /** Model ID to use (defaults to gpt-4.1-mini) */
    modelId?: string
}

/**
 * Result of image alt text generation
 */
export type ImageAltResult = {
    /** The generated alt text (max 125 chars) */
    alt: string
}

/**
 * Generate concise alt text describing an image
 *
 * Describes what the image DEPICTS, never the brief that produced it. Pass
 * `concept` (and ideally `primaryKeyword`) whenever the caller knows what the
 * image is of — the raw generation prompt is a noisy fallback because it is
 * full of camera specs, palette notes and exclusion lists.
 *
 * @param options - Generation options including the image prompt and concept
 * @returns The generated alt text
 *
 * @example
 * ```typescript
 * const result = await generateImageAlt({
 *   prompt: featuredImageBrief,
 *   concept: 'Macro study of folded cream silk catching raking light',
 *   primaryKeyword: 'bbl recovery',
 * })
 *
 * console.log(result.alt)
 * // "Folded cream silk in raking light, evoking calm BBL recovery"
 * ```
 */
export async function generateImageAlt(
    options: GenerateImageAltOptions
): Promise<ImageAltResult> {
    const {
        prompt,
        concept,
        primaryKeyword,
        modelId = MODEL_FOR_IMAGE_ALT_TEXT_GENERATION,
    } = options

    const sourceSection = concept
        ? `The image depicts:\n"${concept}"\n\nFull art-direction brief for reference only (do NOT describe the brief itself, its camera notes or its exclusion list):\n"${prompt}"`
        : `The image was created with this prompt:\n"${prompt}"`

    const keywordLine = primaryKeyword
        ? `\n- Work the phrase "${primaryKeyword}" in naturally ONLY if it genuinely describes the image; never force it`
        : ''

    const userPrompt = `Generate concise, accessible alt text (max 125 characters) for an image.

${sourceSection}

Requirements:
- Maximum 125 characters
- Describe what a sighted reader would SEE, not the prompt or the brief
- Be specific and concrete about subject, material and light
- No quotation marks or prefix
- Never mention "image of", "photo of", "AI", "prompt" or "render"
- Professional tone${keywordLine}

Generate the alt text now:`

    const result = await coreGenerateText({
        modelId,
        system: ALT_TEXT_SYSTEM_PROMPT,
        prompt: userPrompt,
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
