/**
 * Select Featured Image Options Function
 *
 * AI-powered selection of featured image options based on blog post content.
 * Analyzes the post and returns the optimal combination of scene, subject,
 * style, lighting, color palette, and composition.
 *
 * @module @workspace/ai/functions/select-image-options
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'
import {
    SELECT_IMAGE_OPTIONS_SYSTEM,
    getSelectImageOptionsPrompt,
} from '../prompts/blog/select-image-options.prompt'

/**
 * Default model for option selection (fast and accurate)
 */
const DEFAULT_MODEL_ID = 'gpt-4.1-mini'

/**
 * Zod schema for model profile (when subject is patient-model)
 */
const modelProfileSchema = z.object({
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
const selectedImageOptionsSchema = z.object({
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
    modelProfile: modelProfileSchema.describe(
        'Model profile details (required when subject is patient-model)'
    ),
    reasoning: z
        .string()
        .describe('Brief explanation for why these options were selected'),
})

/**
 * Options for selecting image options
 */
export type SelectImageOptionsOptions = {
    /** Blog post title */
    title: string
    /** Blog post content (markdown) */
    content: string
    /** Primary keyword for SEO context */
    primaryKeyword?: string
    /** AI-generated summary (if available) */
    summary?: string
    /** Model ID to use (defaults to gpt-4.1-mini) */
    modelId?: string
    /** Temperature for generation (defaults to 0.5 for balanced creativity) */
    temperature?: number
}

/**
 * Model profile type
 */
export type ModelProfile = z.infer<typeof modelProfileSchema>

/**
 * Selected image options result
 */
export type SelectedImageOptions = z.infer<typeof selectedImageOptionsSchema>

/**
 * Select optimal featured image options based on blog post content
 *
 * Analyzes the blog post and returns the best combination of scene, subject,
 * style, lighting, color palette, and composition for generating the featured image.
 * If 'patient-model' is selected as subject, includes a complete model profile.
 *
 * @param options - Selection options including blog post content
 * @returns Selected image options with reasoning
 *
 * @example
 * ```typescript
 * const options = await selectImageOptions({
 *   title: 'Brazilian Butt Lift Recovery Guide',
 *   content: 'A comprehensive guide to BBL recovery...',
 *   primaryKeyword: 'bbl recovery',
 * })
 *
 * console.log(options.scene)      // 'spa-retreat'
 * console.log(options.subject)    // 'patient-model'
 * console.log(options.modelProfile) // { age: 'mid-adult', ... }
 * ```
 */
export async function selectImageOptions(
    options: SelectImageOptionsOptions
): Promise<SelectedImageOptions> {
    const {
        title,
        content,
        primaryKeyword,
        summary,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.5,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: selectedImageOptionsSchema,
        system: SELECT_IMAGE_OPTIONS_SYSTEM,
        prompt: getSelectImageOptionsPrompt({
            title,
            content,
            primaryKeyword,
            summary,
        }),
        temperature,
    })

    // If patient-model was selected but no model profile, add defaults
    if (
        result.object.subject === 'patient-model' &&
        !result.object.modelProfile
    ) {
        result.object.modelProfile = {
            age: 'mid-adult',
            ethnicity: 'latina-hispanic',
            bodyType: 'athletic',
            hairColor: 'brunette',
            hairLength: 'medium',
            hairStyle: 'wavy',
            skinTone: 'olive',
            expression: 'confident-smile',
            pose: 'three-quarter',
            attire: 'casual-elegant',
        }
    }

    return result.object
}
