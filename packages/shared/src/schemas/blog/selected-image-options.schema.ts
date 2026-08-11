import { z } from 'zod'

/**
 * Artistic (people-free) image style preset IDs.
 *
 * Canonical definitions — prompt blocks, negatives, aspect ratios, preferred
 * models — live in `packages/ai/src/constants/image-style.constant.ts`. Only
 * the ID tuple is duplicated here because `@workspace/shared` must not depend
 * on `@workspace/ai` (the dependency runs the other way). A compile-time parity
 * assertion in `packages/ai/src/functions/select-image-options.function.ts`
 * fails the build if the two lists ever drift apart.
 */
export const ARTISTIC_IMAGE_STYLE_IDS = [
    'abstract-material-macro',
    'botanical-still-life',
    'painterly-editorial',
] as const

/**
 * Zod schema for model profile (when subject is patient-model)
 */
export const modelProfileSchema = z.object({
    age: z
        .enum(['young-adult', 'mid-adult', 'mature-adult'])
        .describe('Age range of the model'),
    ethnicity: z
        .enum([
            'latina-hispanic',
            'caribbean',
            'african-american',
            'caucasian',
            'asian',
            'middle-eastern',
            'mixed-heritage',
        ])
        .describe('Ethnicity of the model'),
    bodyType: z
        .enum(['slim', 'athletic', 'average', 'curvy', 'plus-size'])
        .describe('Body type of the model'),
    hairColor: z
        .enum([
            'blonde',
            'brunette',
            'black',
            'auburn',
            'gray-silver',
            'highlighted',
        ])
        .describe('Hair color'),
    hairLength: z.enum(['short', 'medium', 'long']).describe('Hair length'),
    hairStyle: z
        .enum(['straight', 'wavy', 'curly', 'braided', 'updo'])
        .describe('Hair style'),
    skinTone: z
        .enum(['fair', 'light', 'medium', 'olive', 'tan', 'deep', 'rich'])
        .describe('Skin tone'),
    expression: z
        .enum([
            'confident-smile',
            'serene-peaceful',
            'contemplative',
            'joyful',
            'natural-relaxed',
        ])
        .describe('Facial expression'),
    pose: z
        .enum([
            'front-facing',
            'three-quarter',
            'profile',
            'full-body',
            'upper-body',
        ])
        .describe('Pose and framing'),
    attire: z
        .enum([
            'clinical',
            'casual-elegant',
            'athleisure',
            'professional',
            'spa-wellness',
        ])
        .describe('Attire/clothing style'),
})

/**
 * Zod schema for selected image options
 *
 * `style` is the carrier for the artistic preset: when it holds one of
 * {@link ARTISTIC_IMAGE_STYLE_IDS}, the people-free artistic path runs. Legacy
 * photographic style values remain valid so already-stored pipeline state keeps
 * parsing; the AI pipeline resolves any unrecognised value to the default
 * artistic preset rather than reviving the old photographic direction.
 */
const selectedImageOptionsObjectSchema = z.object({
    scene: z
        .enum([
            // Artistic path — the material/abstract field IS the scene
            'material-study',
            // Legacy photographic scenes (kept for stored data + admin opt-in)
            'luxury-clinic',
            'miami-lifestyle',
            'abstract-wellness',
            'spa-retreat',
            'modern-minimalist',
        ])
        .describe('Scene/environment for the image'),
    subject: z
        .enum([
            // Artistic path — the style preset governs the subject matter
            'artistic-composition',
            // Legacy subjects. 'patient-model' is admin opt-in only.
            'patient-model',
            'luxury-space',
            'wellness-concept',
            'lifestyle-scene',
            'beauty-details',
        ])
        .describe('Main subject/focal element'),
    style: z
        .enum([
            // Artistic presets (default path)
            ...ARTISTIC_IMAGE_STYLE_IDS,
            // Legacy photographic styles (kept for stored data + admin opt-in)
            'editorial-photo',
            'luxury-lifestyle',
            'clinical-clean',
            'warm-aspirational',
            'artistic-conceptual',
        ])
        .describe(
            'Visual style. Prefer an artistic preset id; legacy photographic values are retained for backward compatibility.'
        ),
    lighting: z
        .enum([
            'golden-hour',
            'studio-soft',
            'natural-bright',
            'dramatic-moody',
            'soft-ethereal',
        ])
        .describe('Lighting mood'),
    colorPalette: z
        .enum([
            'stone-gold',
            'ocean-blues',
            'warm-neutrals',
            'blush-rose',
            'monochrome-elegant',
        ])
        .describe('Color palette'),
    composition: z
        .enum([
            'centered-focus',
            'rule-of-thirds',
            'close-up-detail',
            'wide-environmental',
            'negative-space',
        ])
        .describe('Composition style'),
    modelProfile: modelProfileSchema
        .optional()
        .describe(
            'Model profile details (required when subject is patient-model)'
        ),
    reasoning: z
        .string()
        .describe('Brief explanation for why these options were selected'),
})

export const selectedImageOptionsSchema =
    selectedImageOptionsObjectSchema.refine(
        (data) => {
            if (data.subject === 'patient-model') {
                return !!data.modelProfile
            }
            return true
        },
        {
            message: 'Model profile is required when subject is patient-model',
            path: ['modelProfile'],
        }
    )

/**
 * AI-facing variant for structured-output model calls.
 *
 * Omits `modelProfile`: OpenAI strict response schemas reject optional
 * properties (every property must be in `required`), and the AI selection
 * path never produces one — `patient-model` is admin opt-in only.
 */
export const aiSelectedImageOptionsSchema =
    selectedImageOptionsObjectSchema.omit({ modelProfile: true })

export type SelectedImageOptions = z.infer<typeof selectedImageOptionsSchema>
export type ModelProfile = z.infer<typeof modelProfileSchema>

/** Union of the artistic preset IDs accepted by {@link selectedImageOptionsSchema} */
export type ArtisticImageStyleIdValue =
    (typeof ARTISTIC_IMAGE_STYLE_IDS)[number]
