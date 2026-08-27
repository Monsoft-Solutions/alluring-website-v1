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
    ARTISTIC_IMAGE_STYLE_IDS,
    aiSelectedImageOptionsSchema,
    type SelectedImageOptions,
    type ModelProfile,
} from '@workspace/shared/schemas/blog'

import {
    SELECT_IMAGE_OPTIONS_SYSTEM,
    getSelectImageOptionsPrompt,
} from '../prompts/blog/select-image-options.prompt'
import {
    DEFAULT_ARTISTIC_STYLE_ID,
    isArtisticImageStyleId,
    type ArtisticImageStyleId,
} from '../constants/image-style.constant'
import { coreGenerateObject } from '../core'
import type { ReasoningEffort } from '../models/reasoning-effort.constant'
import {
    readOpenRouterCost,
    type WithCallCost,
} from '../models/openrouter-usage.util'

/**
 * Default model for option selection (fast and accurate)
 */
const DEFAULT_MODEL_ID = 'gpt-4.1-mini'

/**
 * The artistic preset IDs the schema accepts, typed against the registry.
 *
 * These IDs are declared twice: richly in `constants/image-style.constant.ts`
 * and as a bare tuple in `@workspace/shared` (which cannot depend on this
 * package, since the dependency runs the other way). Sourcing the list from
 * shared while typing it as the registry union fails the build the moment
 * shared gains an ID the registry does not define. The reverse direction is
 * covered by assigning {@link DEFAULT_ARTISTIC_STYLE_ID} into a
 * `SelectedImageOptions['style']` field below.
 */
const VALID_ARTISTIC_STYLE_IDS: readonly ArtisticImageStyleId[] =
    ARTISTIC_IMAGE_STYLE_IDS

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
    /** How hard the model should think (default: none) */
    reasoningEffort?: ReasoningEffort
}

/**
 * Selected image options result
 */
export type { SelectedImageOptions, ModelProfile }

/**
 * Select optimal featured image options based on blog post content
 *
 * Analyzes the blog post and returns an artistic (people-free) configuration:
 * one artistic style preset plus lighting, colour palette and composition
 * leanings.
 *
 * The result is normalised onto the artistic path. The schema still accepts the
 * legacy photographic values so previously stored pipeline state keeps parsing,
 * but anything the model returns from that legacy vocabulary is coerced here —
 * the automated pipeline never produces imagery with a person in it.
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
 * console.log(options.style)   // 'botanical-still-life'
 * console.log(options.subject) // 'artistic-composition'
 * ```
 */
export async function selectImageOptions(
    options: SelectImageOptionsOptions
): Promise<WithCallCost<SelectedImageOptions>> {
    const {
        title,
        content,
        primaryKeyword,
        summary,
        modelId = DEFAULT_MODEL_ID,
        reasoningEffort,
    } = options

    const result = (await coreGenerateObject({
        modelId,
        reasoningEffort,
        schema: aiSelectedImageOptionsSchema,
        system: SELECT_IMAGE_OPTIONS_SYSTEM,
        prompt: getSelectImageOptionsPrompt({
            title,
            content,
            primaryKeyword,
            summary,
        }),
    })) as {
        object: SelectedImageOptions
        providerMetadata?: unknown
    }

    return {
        ...normalizeToArtisticPath(result.object),
        ...readOpenRouterCost(result.providerMetadata),
    }
}

/**
 * Force a selection onto the people-free artistic path.
 *
 * Guards against the model reaching for the legacy photographic vocabulary that
 * the schema still permits for backward compatibility.
 */
function normalizeToArtisticPath(
    selected: SelectedImageOptions
): SelectedImageOptions {
    const normalized: SelectedImageOptions = { ...selected }

    if (!isArtisticImageStyleId(normalized.style)) {
        console.warn(
            `[Select Image Options] Legacy style "${normalized.style}" selected; falling back to "${DEFAULT_ARTISTIC_STYLE_ID}" (valid presets: ${VALID_ARTISTIC_STYLE_IDS.join(', ')})`
        )
        normalized.style = DEFAULT_ARTISTIC_STYLE_ID
    }

    if (normalized.subject !== 'artistic-composition') {
        console.warn(
            `[Select Image Options] Legacy subject "${normalized.subject}" selected; forcing "artistic-composition"`
        )
        normalized.subject = 'artistic-composition'
    }

    if (normalized.scene !== 'material-study') {
        normalized.scene = 'material-study'
    }

    // The artistic path never renders a person, so a model profile is noise.
    delete normalized.modelProfile

    return normalized
}
