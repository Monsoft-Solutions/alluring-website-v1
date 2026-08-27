/**
 * Image Generation Phase Runner
 *
 * Standalone runner for the featured image generation phase.
 * Orchestrates: AI option selection -> artistic preset resolution -> prompt
 * generation -> (optionally) image rendering and the no-people QA gate.
 *
 * Rendering is injected. The runner never talks to fal.ai or Vercel Blob
 * directly — the caller passes an {@link ImageGenerationAdapter} so this
 * package stays free of environment-specific dependencies and of any import
 * from `apps/admin`. Omit the adapter and the runner behaves as before,
 * returning the prompt for the caller to render itself.
 *
 * @module @workspace/ai/pipelines/image-generation-phase
 */
import { summarizeBlogPost } from '../functions/summarize-blog-post.function'
import {
    selectImageOptions,
    type SelectedImageOptions,
} from '../functions/select-image-options.function'
import { generateFeaturedImagePrompt } from '../functions/generate-featured-image-prompt.function'
import {
    resolveArtisticStyle,
    type ArtisticImageAspectRatio,
    type ArtisticImagePreferredModel,
    type ArtisticImageStyleId,
} from '../constants/image-style.constant'
import { runNoPeopleQaGate, type QaGateImage } from './no-people-image-qa.gate'
import type { AgenticPipelineProgressCallback } from '../types/pipeline/agentic-pipeline-progress-callback.type'
import type { ReasoningEffort } from '../models/reasoning-effort.constant'
import { sumCosts } from '../models/openrouter-usage.util'

/**
 * Prompt guidelines for the art-direction modifiers the artistic path still
 * honours (lighting, palette, composition).
 *
 * CANONICAL SOURCE: `apps/admin/lib/constants/featured-image-options.constant.ts`.
 * They are duplicated here because `packages/ai` must not import from
 * `apps/admin`. Keep the two in sync when editing either.
 *
 * The scene/subject/style guideline maps that used to live here were deleted:
 * the artistic path derives all three from the style preset registry instead.
 */
const MODIFIER_GUIDELINES: Record<string, Record<string, string>> = {
    lighting: {
        'golden-hour':
            'Golden hour lighting, warm sunset tones, soft diffused sunlight, romantic atmosphere, flattering warm glow',
        'studio-soft':
            'Professional studio lighting, soft diffused light, beauty lighting setup, flattering shadows, controlled illumination',
        'natural-bright':
            'Bright natural daylight, clean illumination, airy atmosphere, window light, fresh and energetic mood',
        'dramatic-moody':
            'Dramatic lighting, bold shadows, high contrast, moody atmosphere, cinematic quality, striking visual impact',
        'soft-ethereal':
            'Soft ethereal lighting, dreamy glow, gentle luminosity, heavenly atmosphere, delicate and refined',
    },
    colorPalette: {
        'stone-gold':
            'Stone and gold color palette, warm beige tones, cream and champagne accents, subtle gold highlights, elegant neutral base',
        'ocean-blues':
            'Ocean blue palette, turquoise and teal accents, Miami coastal colors, aquamarine tones, refreshing water inspiration',
        'warm-neutrals':
            'Warm neutral palette, soft browns and tans, creamy whites, subtle rose undertones, cozy sophisticated colors',
        'blush-rose':
            'Blush and rose palette, soft pink tones, dusty rose accents, feminine elegance, romantic color scheme',
        'monochrome-elegant':
            'Monochrome palette, elegant black and white, grayscale sophistication, timeless contrast, classic refined aesthetic',
    },
    composition: {
        'centered-focus':
            'Centered composition, subject as focal point, symmetrical balance, direct visual impact, hero image framing',
        'rule-of-thirds':
            'Rule of thirds composition, off-center subject placement, dynamic balance, professional framing, visual flow',
        'close-up-detail':
            'Close-up composition, intimate framing, detailed focus, shallow depth of field, macro-style attention to detail',
        'wide-environmental':
            'Wide environmental shot, context-rich framing, establishing scene, spacious composition, panoramic feel',
        'negative-space':
            'Negative space composition, minimalist framing, breathing room around the subject, clean and uncluttered, modern design aesthetic',
    },
}

/**
 * A rendered image returned by the injected adapter
 */
export type ImageGenerationPhaseImage = QaGateImage

/**
 * Renders a prompt into an image.
 *
 * Injected by the caller (the admin app wraps its fal.ai service). Return
 * `null` when nothing could be produced — the runner treats that as a soft
 * failure rather than throwing.
 */
export type ImageGenerationAdapter = (input: {
    /** Prompt to render */
    prompt: string
    /** Aspect ratio the preset wants for a featured image */
    aspectRatio: ArtisticImageAspectRatio
    /** Model the preset renders best on */
    model: ArtisticImagePreferredModel
    /** Kebab-case descriptor for SEO-friendly storage paths */
    descriptor: string
    /** 1 for the first render, 2 for the QA retry */
    attempt: number
}) => Promise<ImageGenerationPhaseImage | null>

/**
 * Options for running the image generation phase
 */
export type ImageGenerationPhaseOptions = {
    /** Blog post title */
    title: string
    /** Blog post content (markdown) */
    content: string
    /** Primary SEO keyword */
    primaryKeyword?: string
    /** Pre-existing AI summary (if available) */
    aiSummary?: string
    /**
     * Optional renderer. When provided the runner also generates the image and
     * runs the no-people QA gate; when omitted it returns the prompt only.
     */
    imageAdapter?: ImageGenerationAdapter
    /**
     * Override the render model.
     *
     * By default each artistic preset renders on its own `preferredModel`.
     * Supply this to pin every render to one model (admin Blog AI Settings).
     */
    imageModel?: ArtisticImagePreferredModel
    /**
     * Model that writes the featured-image concept and picks the style
     * options. Omit to use each function's own code default.
     */
    promptModelId?: string
    /** How hard the image-prompt model should think (default: none) */
    promptEffort?: ReasoningEffort
    /**
     * Pin the artistic preset instead of letting the AI pick one per topic.
     *
     * The AI still selects the lighting / palette / composition modifiers, so
     * art direction stays topic-aware while the visual register is fixed.
     * Unknown ids fall back to the default preset.
     */
    forcedArtisticStyleId?: ArtisticImageStyleId
    /** Progress callback */
    onProgress?: AgenticPipelineProgressCallback
}

/**
 * Result from the image generation phase
 */
export type ImageGenerationPhaseResult = {
    /** Whether the AI operations succeeded */
    success: boolean
    /** Error message if failed */
    error?: string
    /** AI-selected image options */
    selectedOptions?: SelectedImageOptions
    /** Generated image prompt (reinforced version when the QA gate retried) */
    prompt?: string
    /** AI summary (generated or passed through) */
    summary?: string
    /** Artistic preset the image was generated from */
    artisticStyleId?: ArtisticImageStyleId
    /** Aspect ratio requested for the render */
    aspectRatio?: ArtisticImageAspectRatio
    /** Model the preset was rendered on */
    imageModel?: ArtisticImagePreferredModel
    /** Kebab-case descriptor for SEO-friendly storage paths */
    descriptor?: string
    /** The rendered image, when an adapter was supplied */
    image?: ImageGenerationPhaseImage
    /**
     * True when the kept image still appears to contain a person.
     * Advisory only — the phase still succeeds so the admin UI can flag it.
     */
    peopleDetected?: boolean
    /** True when the QA gate regenerated the image */
    qaRegenerated?: boolean
    /**
     * What OpenRouter billed for this phase's *language* model calls, in USD —
     * the option selection plus the art-direction brief. Does not include the
     * fal.ai render, which bills separately and is not an OpenRouter call.
     */
    costUsd?: number
    /** Processing time in ms */
    timeMs: number
}

/**
 * Build the option object shape `generateFeaturedImagePrompt` expects.
 *
 * Returns `undefined` for unknown IDs so the modifier is simply omitted rather
 * than injected as an empty string.
 */
function buildModifier(
    axis: keyof typeof MODIFIER_GUIDELINES,
    optionId: string
): { id: string; promptGuidelines: string } | undefined {
    const promptGuidelines = MODIFIER_GUIDELINES[axis]?.[optionId]

    return promptGuidelines ? { id: optionId, promptGuidelines } : undefined
}

/**
 * Derive a short kebab-case descriptor for SEO-friendly image filenames.
 *
 * Prefers the primary keyword (which is what the post is trying to rank for)
 * and falls back to the title.
 */
export function buildImageDescriptor(
    primaryKeyword: string | undefined,
    title: string
): string {
    const source = primaryKeyword?.trim() || title

    const descriptor = source
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .split('-')
        .filter(Boolean)
        .slice(0, 6)
        .join('-')

    return descriptor || 'featured-image'
}

/**
 * Run the image generation phase standalone
 *
 * Orchestrates:
 * 1. Ensures a summary exists (generates if missing)
 * 2. Selects the artistic style preset and art-direction modifiers using AI
 * 3. Generates a people-free art-direction brief
 * 4. If an adapter was supplied: renders the image and runs the no-people QA
 *    gate, regenerating once if a person slipped in
 *
 * The people machinery (`patient-model` subject, model profiles, human
 * descriptions) is NOT reachable from here. It is opt-in only, driven by an
 * admin through `/api/blog/generate-featured-image-prompt`.
 *
 * @param options - Generation options including blog post content
 * @returns Selected options, generated prompt, and the image when rendered
 *
 * @example
 * ```typescript
 * const result = await runImageGenerationPhase({
 *   title: 'Brazilian Butt Lift Recovery Guide',
 *   content: '# Recovery Tips\n\nWeek 1: Rest and avoid...',
 *   primaryKeyword: 'bbl recovery',
 *   imageAdapter: async ({ prompt, aspectRatio, model, descriptor }) => {
 *     const [image] = await generateImageWithFal({ prompt, aspectRatio, model, descriptor, ... })
 *     return image ? { url: image.blobUrl, width: image.width, height: image.height } : null
 *   },
 * })
 *
 * if (result.success) {
 *   console.log(result.artisticStyleId) // 'botanical-still-life'
 *   console.log(result.image?.url)
 *   console.log(result.peopleDetected)  // false
 * }
 * ```
 */
export async function runImageGenerationPhase(
    options: ImageGenerationPhaseOptions
): Promise<ImageGenerationPhaseResult> {
    const startTime = Date.now()
    const {
        title,
        content,
        primaryKeyword,
        aiSummary,
        imageAdapter,
        imageModel,
        promptModelId,
        promptEffort,
        forcedArtisticStyleId,
        onProgress,
    } = options

    try {
        console.log('[Image Generation Phase] Starting')
        onProgress?.('image-generation', 10, 'Preparing image generation...')

        // Step 1: Ensure summary exists
        let summary = aiSummary
        if (!summary) {
            console.log('[Image Generation Phase] Generating summary...')
            onProgress?.(
                'image-generation',
                20,
                'Generating content summary...'
            )

            const summaryResult = await summarizeBlogPost({
                title,
                content,
            })
            summary = summaryResult.summary
        }

        // Step 2: Select image options using AI
        console.log('[Image Generation Phase] Selecting image options...')
        onProgress?.('image-generation', 30, 'AI selecting image style...')

        const selectedOptions = await selectImageOptions({
            title,
            content,
            primaryKeyword,
            summary,
            ...(promptModelId ? { modelId: promptModelId } : {}),
            reasoningEffort: promptEffort,
        })

        // A pinned preset wins over the AI selection. The selection is already
        // normalised onto the artistic path; resolving here keeps us safe
        // against unexpected values from either source.
        const style = resolveArtisticStyle(
            forcedArtisticStyleId ?? selectedOptions.style
        )
        const aspectRatio = style.aspectRatios.featured
        const descriptor = buildImageDescriptor(primaryKeyword, title)

        // Configured model wins over the preset's preferred model.
        const renderModel = imageModel ?? style.preferredModel

        console.log(
            `[Image Generation Phase] Style: ${style.id}${forcedArtisticStyleId ? ' (pinned)' : ''}, model=${renderModel}, lighting=${selectedOptions.lighting}, composition=${selectedOptions.composition}`
        )

        // Step 3: Generate the art-direction brief
        console.log('[Image Generation Phase] Generating image prompt...')
        onProgress?.('image-generation', 50, 'Writing art-direction brief...')

        const promptResult = await generateFeaturedImagePrompt({
            title,
            summary,
            artisticStyleId: style.id,
            aspectRatio,
            lighting: buildModifier('lighting', selectedOptions.lighting),
            colorPalette: buildModifier(
                'colorPalette',
                selectedOptions.colorPalette
            ),
            composition: buildModifier(
                'composition',
                selectedOptions.composition
            ),
            keywords: primaryKeyword,
            ...(promptModelId ? { modelId: promptModelId } : {}),
            reasoningEffort: promptEffort,
        })

        const baseResult: ImageGenerationPhaseResult = {
            success: true,
            selectedOptions,
            prompt: promptResult.prompt,
            summary,
            artisticStyleId: style.id,
            aspectRatio,
            imageModel: renderModel,
            descriptor,
            costUsd: sumCosts([selectedOptions.costUsd, promptResult.costUsd]),
            timeMs: 0,
        }

        // Step 4 (optional): render the image and run the no-people QA gate
        if (!imageAdapter) {
            const timeMs = Date.now() - startTime

            onProgress?.(
                'image-generation',
                100,
                'Image generation phase complete',
                {
                    type: 'image-generation-result',
                    selectedOptions,
                }
            )

            console.log(`[Image Generation Phase] Complete: ${timeMs}ms`)

            return { ...baseResult, timeMs }
        }

        console.log('[Image Generation Phase] Rendering image...')
        onProgress?.('image-generation', 70, 'Rendering image...')

        const renderedImage = await imageAdapter({
            prompt: promptResult.prompt,
            aspectRatio,
            model: renderModel,
            descriptor,
            attempt: 1,
        })

        if (!renderedImage) {
            const timeMs = Date.now() - startTime
            const error = 'Image renderer returned no image'

            console.error(`[Image Generation Phase] ERROR: ${error}`)
            onProgress?.('error', 0, `Image generation failed: ${error}`)

            return { ...baseResult, success: false, error, timeMs }
        }

        console.log('[Image Generation Phase] Running no-people QA gate...')
        onProgress?.('image-generation', 85, 'Checking image for people...')

        const qa = await runNoPeopleQaGate({
            image: renderedImage,
            styleId: style.id,
            prompt: promptResult.prompt,
            regenerate: (reinforcedPrompt) =>
                imageAdapter({
                    prompt: reinforcedPrompt,
                    aspectRatio,
                    model: renderModel,
                    descriptor,
                    attempt: 2,
                }),
        })

        if (qa.peopleDetected) {
            console.warn(
                `[Image Generation Phase] WARNING: image still appears to contain a person and needs human review. ${qa.details ?? ''}`
            )
        }

        const timeMs = Date.now() - startTime

        onProgress?.(
            'image-generation',
            100,
            'Image generation phase complete',
            {
                type: 'image-generation-result',
                selectedOptions,
            }
        )

        console.log(`[Image Generation Phase] Complete: ${timeMs}ms`)

        return {
            ...baseResult,
            prompt: qa.prompt,
            image: qa.image,
            peopleDetected: qa.peopleDetected,
            qaRegenerated: qa.regenerated,
            timeMs,
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'
        console.error('[Image Generation Phase] ERROR:', errorMessage)

        onProgress?.('error', 0, `Image generation failed: ${errorMessage}`)

        return {
            success: false,
            error: errorMessage,
            timeMs: Date.now() - startTime,
        }
    }
}
