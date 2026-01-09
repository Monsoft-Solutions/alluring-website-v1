/**
 * Select Featured Image Options Function
 *
 * AI-powered selection of featured image options based on blog post content.
 * Analyzes the post and returns the optimal combination of scene, subject,
 * style, lighting, color palette, and composition.
 *
 * @module @workspace/ai/functions/select-image-options
 */
import {
    selectedImageOptionsSchema,
    type SelectedImageOptions,
    type ModelProfile,
} from '@workspace/shared/schemas/blog'

import {
    SELECT_IMAGE_OPTIONS_SYSTEM,
    getSelectImageOptionsPrompt,
} from '../prompts/blog/select-image-options.prompt'
import { coreGenerateObject } from '../core'

/**
 * Default model for option selection (fast and accurate)
 */
const DEFAULT_MODEL_ID = 'gpt-4.1-mini'

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
 * Selected image options result
 */
export type { SelectedImageOptions, ModelProfile }

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

    const result = (await coreGenerateObject({
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
    })) as { object: SelectedImageOptions }

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
