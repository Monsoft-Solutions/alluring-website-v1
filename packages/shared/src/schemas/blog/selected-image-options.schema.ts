import { z } from 'zod'

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
 */
export const selectedImageOptionsSchema = z
    .object({
        scene: z
            .enum([
                'luxury-clinic',
                'miami-lifestyle',
                'abstract-wellness',
                'spa-retreat',
                'modern-minimalist',
            ])
            .describe('Scene/environment for the image'),
        subject: z
            .enum([
                'patient-model',
                'luxury-space',
                'wellness-concept',
                'lifestyle-scene',
                'beauty-details',
            ])
            .describe('Main subject/focal element'),
        style: z
            .enum([
                'editorial-photo',
                'luxury-lifestyle',
                'clinical-clean',
                'warm-aspirational',
                'artistic-conceptual',
            ])
            .describe('Photographic style'),
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
    .refine(
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

export type SelectedImageOptions = z.infer<typeof selectedImageOptionsSchema>
export type ModelProfile = z.infer<typeof modelProfileSchema>
