/**
 * Image Generation Phase Runner
 *
 * Standalone runner for the featured image generation phase.
 * Orchestrates: AI option selection -> prompt generation -> returns prompt and options.
 *
 * Note: This runner handles the AI operations only. The actual image generation
 * via fal.ai and database operations are handled by the API endpoint/service
 * since they require environment-specific dependencies.
 *
 * @module @workspace/ai/pipelines/image-generation-phase
 */
import { summarizeBlogPost } from '../functions/summarize-blog-post.function'
import {
    selectImageOptions,
    type SelectedImageOptions,
} from '../functions/select-image-options.function'
import { generateFeaturedImagePrompt } from '../functions/generate-featured-image-prompt.function'
import type { AgenticPipelineProgressCallback } from '../types/pipeline/agentic-pipeline-progress-callback.type'

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
    /** Progress callback */
    onProgress?: AgenticPipelineProgressCallback
}

/**
 * Result from the image generation phase (AI operations only)
 */
export type ImageGenerationPhaseResult = {
    /** Whether the AI operations succeeded */
    success: boolean
    /** Error message if failed */
    error?: string
    /** AI-selected image options */
    selectedOptions?: SelectedImageOptions
    /** Generated image prompt */
    prompt?: string
    /** AI summary (generated or passed through) */
    summary?: string
    /** Processing time in ms */
    timeMs: number
}

/**
 * Build option objects from selected option IDs
 * Maps the AI-selected option IDs to the format expected by generateFeaturedImagePrompt
 */
function buildOptionConfig(optionId: string, promptGuidelines: string) {
    return { id: optionId, promptGuidelines }
}

/**
 * Get prompt guidelines for each option ID
 * These match the guidelines from featured-image-options.constant.ts
 */
const OPTION_GUIDELINES: Record<string, Record<string, string>> = {
    scene: {
        'luxury-clinic':
            'Luxurious private clinic interior, marble floors, designer furniture, floor-to-ceiling windows, premium medical spa aesthetic, clean modern architecture',
        'miami-lifestyle':
            'Sunny Miami backdrop, palm trees, ocean views, art deco architecture, tropical paradise setting, South Beach vibes, luxury lifestyle environment',
        'abstract-wellness':
            'Abstract wellness concept, flowing organic shapes, soft gradients, ethereal atmosphere, beauty and self-care symbolism, minimalist modern design',
        'spa-retreat':
            'Tranquil spa setting, natural elements, bamboo and stone accents, calming water features, zen atmosphere, peaceful retreat ambiance',
        'modern-minimalist':
            'Ultra-modern minimalist interior, clean lines, white walls, sculptural furniture, gallery-like space, contemporary luxury, uncluttered elegance',
    },
    subject: {
        'patient-model': 'Patient-like model with customizable appearance',
        'luxury-space':
            'Focus on luxurious interior design, architectural details, premium materials, design-forward space, sophisticated environment without people',
        'wellness-concept':
            'Symbolic wellness imagery, self-care concept, beauty and health representation, abstract visualization of confidence and transformation',
        'lifestyle-scene':
            'Aspirational lifestyle moment, relaxed luxury living, everyday elegance, premium quality of life, sophisticated casual scene',
        'beauty-details':
            'Macro beauty details, flawless skin texture, luxury skincare elements, premium cosmetic aesthetic, detailed product-like quality',
    },
    style: {
        'editorial-photo':
            'High-end editorial photography, magazine quality, Vogue-style aesthetic, professional fashion shoot, polished and refined',
        'luxury-lifestyle':
            'Luxury lifestyle photography, aspirational imagery, premium brand aesthetic, sophisticated elegance, exclusive feel',
        'clinical-clean':
            'Clean clinical aesthetic, professional medical imagery, pristine environment, trustworthy and credible, healthcare quality',
        'warm-aspirational':
            'Warm inviting photography, emotionally resonant, approachable elegance, comfortable luxury, welcoming atmosphere',
        'artistic-conceptual':
            'Artistic conceptual photography, creative composition, fine art influence, unique perspective, gallery-worthy aesthetic',
    },
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
            'Rule of thirds composition, off-center subject placement, dynamic balance, professional photography framing, visual flow',
        'close-up-detail':
            'Close-up composition, intimate framing, detailed focus, shallow depth of field, macro-style attention to detail',
        'wide-environmental':
            'Wide environmental shot, context-rich framing, establishing scene, spacious composition, panoramic feel',
        'negative-space':
            'Negative space composition, minimalist framing, breathing room around subject, clean and uncluttered, modern design aesthetic',
    },
}

/**
 * Build model description from profile for prompt generation
 */
function buildModelDescription(
    profile: NonNullable<SelectedImageOptions['modelProfile']>
): string {
    const AGE_MAP: Record<string, string> = {
        'young-adult':
            'woman in her late 20s to early 30s, youthful appearance',
        'mid-adult': 'woman in her late 30s to early 40s, confident and poised',
        'mature-adult':
            'woman in her late 40s to mid 50s, elegant and sophisticated',
    }

    const ETHNICITY_MAP: Record<string, string> = {
        'latina-hispanic': 'Latina woman, Latin American heritage',
        caribbean: 'Caribbean woman, island heritage',
        'african-american': 'African American woman',
        caucasian: 'Caucasian woman, European heritage',
        asian: 'Asian woman',
        'middle-eastern': 'Middle Eastern woman',
        'mixed-heritage': 'mixed heritage woman, diverse ethnic background',
    }

    const BODY_TYPE_MAP: Record<string, string> = {
        slim: 'slim body type, slender figure',
        athletic: 'athletic body type, toned and fit physique',
        average: 'average body type, natural balanced figure',
        curvy: 'curvy body type, full feminine curves',
        'plus-size': 'plus size body type, beautiful fuller figure',
    }

    const HAIR_COLOR_MAP: Record<string, string> = {
        blonde: 'blonde hair',
        brunette: 'brunette hair, rich brown tones',
        black: 'jet black hair',
        auburn: 'auburn hair, warm reddish-brown tones',
        'gray-silver': 'elegant gray or silver hair',
        highlighted: 'hair with professional highlights',
    }

    const HAIR_LENGTH_MAP: Record<string, string> = {
        short: 'short hair',
        medium: 'medium-length hair',
        long: 'long flowing hair',
    }

    const HAIR_STYLE_MAP: Record<string, string> = {
        straight: 'straight sleek hair',
        wavy: 'soft wavy hair',
        curly: 'natural curly hair',
        braided: 'elegantly braided hair',
        updo: 'sophisticated updo hairstyle',
    }

    const SKIN_TONE_MAP: Record<string, string> = {
        fair: 'fair skin tone',
        light: 'light skin tone',
        medium: 'medium skin tone',
        olive: 'warm olive skin tone',
        tan: 'sun-kissed tan skin tone',
        deep: 'deep skin tone',
        rich: 'rich dark skin tone',
    }

    const EXPRESSION_MAP: Record<string, string> = {
        'confident-smile': 'confident genuine smile, warm expression',
        'serene-peaceful': 'serene and peaceful expression, calm demeanor',
        contemplative: 'thoughtful contemplative expression',
        joyful: 'joyful radiant expression, genuine happiness',
        'natural-relaxed': 'natural relaxed expression, at ease',
    }

    const POSE_MAP: Record<string, string> = {
        'front-facing':
            'front-facing portrait pose, direct eye contact with camera',
        'three-quarter': 'three-quarter angle pose, slight turn to the side',
        profile: 'elegant profile pose, side view',
        'full-body': 'full body pose, head to toe visible',
        'upper-body': 'upper body portrait, waist up',
    }

    const ATTIRE_MAP: Record<string, string> = {
        clinical: 'wearing elegant white spa robe or patient gown',
        'casual-elegant':
            'wearing sophisticated casual elegant attire, tasteful fashion',
        athleisure: 'wearing premium athleisure wear, sporty yet elegant',
        professional:
            'wearing professional business attire, polished and refined',
        'spa-wellness':
            'wearing spa or wellness attire, relaxed and comfortable',
    }

    const parts = [
        AGE_MAP[profile.age],
        ETHNICITY_MAP[profile.ethnicity],
        BODY_TYPE_MAP[profile.bodyType],
        `${HAIR_LENGTH_MAP[profile.hairLength]} ${HAIR_STYLE_MAP[profile.hairStyle]} ${HAIR_COLOR_MAP[profile.hairColor]}`,
        SKIN_TONE_MAP[profile.skinTone],
        'with healthy radiant glow',
        EXPRESSION_MAP[profile.expression],
        POSE_MAP[profile.pose],
        ATTIRE_MAP[profile.attire],
    ].filter(Boolean)

    return parts.join(', ')
}

/**
 * Run the image generation phase standalone
 *
 * Orchestrates AI operations for featured image generation:
 * 1. Ensures summary exists (generates if missing)
 * 2. Selects optimal image options using AI
 * 3. Generates structured image prompt
 *
 * Note: Does NOT generate the actual image - that's handled by the API endpoint
 * using the fal.ai service which requires environment-specific configuration.
 *
 * @param options - Generation options including blog post content
 * @returns AI-selected options and generated prompt
 *
 * @example
 * ```typescript
 * const result = await runImageGenerationPhase({
 *   title: 'Brazilian Butt Lift Recovery Guide',
 *   content: '# Recovery Tips\n\nWeek 1: Rest and avoid...',
 *   primaryKeyword: 'bbl recovery',
 * })
 *
 * if (result.success) {
 *   console.log(result.selectedOptions) // AI-selected options
 *   console.log(result.prompt)          // Generated image prompt
 *   // Now use the prompt with fal.ai service in your API endpoint
 * }
 * ```
 */
export async function runImageGenerationPhase(
    options: ImageGenerationPhaseOptions
): Promise<ImageGenerationPhaseResult> {
    const startTime = Date.now()
    const { title, content, primaryKeyword, aiSummary, onProgress } = options

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
        onProgress?.('image-generation', 40, 'AI selecting image options...')

        const selectedOptions = await selectImageOptions({
            title,
            content,
            primaryKeyword,
            summary,
        })

        console.log(
            `[Image Generation Phase] Selected: scene=${selectedOptions.scene}, subject=${selectedOptions.subject}`
        )

        // Step 3: Generate structured prompt
        console.log('[Image Generation Phase] Generating image prompt...')
        onProgress?.('image-generation', 70, 'Generating image prompt...')

        // Build option configs
        const sceneGuidelines =
            OPTION_GUIDELINES.scene?.[selectedOptions.scene] ?? ''
        const subjectGuidelines =
            OPTION_GUIDELINES.subject?.[selectedOptions.subject] ?? ''
        const styleGuidelines =
            OPTION_GUIDELINES.style?.[selectedOptions.style] ?? ''
        const lightingGuidelines =
            OPTION_GUIDELINES.lighting?.[selectedOptions.lighting] ?? ''
        const colorGuidelines =
            OPTION_GUIDELINES.colorPalette?.[selectedOptions.colorPalette] ?? ''
        const compositionGuidelines =
            OPTION_GUIDELINES.composition?.[selectedOptions.composition] ?? ''

        // Build model description if patient-model selected
        let modelDescription: string | undefined
        if (
            selectedOptions.subject === 'patient-model' &&
            selectedOptions.modelProfile
        ) {
            modelDescription = buildModelDescription(
                selectedOptions.modelProfile
            )
        }

        const promptResult = await generateFeaturedImagePrompt({
            title,
            summary,
            scene: buildOptionConfig(selectedOptions.scene, sceneGuidelines),
            subject: buildOptionConfig(
                selectedOptions.subject,
                subjectGuidelines
            ),
            style: buildOptionConfig(selectedOptions.style, styleGuidelines),
            lighting: buildOptionConfig(
                selectedOptions.lighting,
                lightingGuidelines
            ),
            colorPalette: buildOptionConfig(
                selectedOptions.colorPalette,
                colorGuidelines
            ),
            composition: buildOptionConfig(
                selectedOptions.composition,
                compositionGuidelines
            ),
            modelDescription,
            keywords: primaryKeyword,
        })

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
            success: true,
            selectedOptions,
            prompt: promptResult.prompt,
            summary,
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
