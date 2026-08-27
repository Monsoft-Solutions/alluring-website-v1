/**
 * Generate Featured Image Prompt Function
 *
 * AI-powered featured image prompt generation optimized for fal-ai models
 * (gpt-image-2, gpt-image-1.5 and nano-banana-pro).
 *
 * Default path is artistic and people-free, using a 5-section structure:
 * Concept → Composition → Materials & Palette → Light & Mood → Constraints.
 *
 * Supplying `modelDescription` switches to the opt-in human-subject photography
 * brief (Scene → Subject → Details → Technical → Avoid), which only the admin
 * featured-image dialog does.
 *
 * @module @workspace/ai/functions/generate-featured-image-prompt
 */
import {
    FEATURED_IMAGE_PROMPT_SYSTEM,
    getFeaturedImagePrompt,
} from '../prompts/blog/featured-image-prompt.prompt'
import type { ArtisticImageAspectRatio } from '../constants/image-style.constant'
import { coreGenerateText } from '../core'
import type { ReasoningEffort } from '../models/reasoning-effort.constant'
import {
    readOpenRouterCost,
    type WithCallCost,
} from '../models/openrouter-usage.util'

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
    /**
     * Artistic preset ID driving the people-free path. Unknown or missing
     * values resolve to the default preset.
     */
    artisticStyleId?: string
    /** Aspect ratio for the target placement (defaults to 16:9) */
    aspectRatio?: ArtisticImageAspectRatio
    /** Scene/environment option (legacy photographic path) */
    scene?: CustomizationOption
    /** Subject type option (legacy photographic path) */
    subject?: CustomizationOption
    /** Image style option (legacy photographic path) */
    style?: CustomizationOption
    /** Lighting/mood option — applied as a modifier on both paths */
    lighting?: CustomizationOption
    /** Color palette option — applied as a modifier on both paths */
    colorPalette?: CustomizationOption
    /** Composition option — applied as a modifier on both paths */
    composition?: CustomizationOption
    /**
     * Detailed model description for the `patient-model` subject type.
     * Presence of this field opts into the human-subject brief.
     */
    modelDescription?: string
    /** Optional keywords for additional context */
    keywords?: string
    /** Model ID to use (defaults to gpt-5.2) */
    modelId?: string
    /** How hard the model should think (default: none) */
    reasoningEffort?: ReasoningEffort
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
 * Produces a 5-section markdown brief. Without `modelDescription` the brief is
 * artistic and people-free (Concept, Composition, Materials & Palette, Light &
 * Mood, Constraints), driven by the artistic preset registry. With
 * `modelDescription` it falls back to the opt-in human-subject photography
 * brief (Scene, Subject, Details, Technical, Avoid).
 *
 * Optimized for openai/gpt-image-2, fal-ai/gpt-image-1.5 and fal-ai/nano-banana-pro.
 *
 * @param options - Generation options including summary, title, and customizations
 * @returns Structured image generation prompt as raw markdown text
 *
 * @example
 * ```typescript
 * // Artistic path (default)
 * const promptResult = await generateFeaturedImagePrompt({
 *   title: 'Brazilian Butt Lift Recovery Tips',
 *   summary: 'A week-by-week recovery guide for BBL patients...',
 *   artisticStyleId: 'botanical-still-life',
 *   aspectRatio: '16:9',
 *   lighting: { id: 'soft-ethereal', promptGuidelines: 'Soft ethereal lighting...' },
 * })
 * // Returns markdown with: Concept, Composition, Materials & Palette, Light & Mood, Constraints
 * console.log(promptResult.prompt)
 * ```
 */
export async function generateFeaturedImagePrompt(
    options: GenerateFeaturedImagePromptOptions
): Promise<WithCallCost<FeaturedImagePromptResult>> {
    const {
        title,
        summary,
        artisticStyleId,
        aspectRatio,
        scene,
        subject,
        style,
        lighting,
        colorPalette,
        composition,
        modelDescription,
        keywords,
        modelId = DEFAULT_MODEL_ID,
        reasoningEffort,
    } = options

    const result = await coreGenerateText({
        modelId,
        reasoningEffort,
        system: FEATURED_IMAGE_PROMPT_SYSTEM,
        prompt: getFeaturedImagePrompt({
            title,
            summary,
            artisticStyleId,
            aspectRatio,
            sceneGuidelines: scene?.promptGuidelines,
            subjectGuidelines: subject?.promptGuidelines,
            styleGuidelines: style?.promptGuidelines,
            lightingGuidelines: lighting?.promptGuidelines,
            colorGuidelines: colorPalette?.promptGuidelines,
            compositionGuidelines: composition?.promptGuidelines,
            modelDescription,
            keywords,
        }),
    })

    // Keep the structured 5-section markdown format.
    // Only clean up code fences if the LLM wrapped its output in them.
    const cleanedPrompt = result.text
        .trim()
        .replace(/^```markdown\s*\n/, '') // Remove markdown code fence
        .replace(/^```\s*\n/, '') // Remove plain code fence
        .replace(/\n```$/, '') // Remove closing code fence
        .trim()

    return {
        prompt: cleanedPrompt,
        ...readOpenRouterCost(result.providerMetadata),
    }
}
