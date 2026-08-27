/**
 * Suggest Groups Function
 *
 * AI-powered gallery group suggestion for media assignment.
 * Matches image analysis to available gallery groups.
 *
 * @module @workspace/ai/functions/suggest-groups
 */
import {
    type GalleryMediaAIAnalysis,
    groupSuggestionSchema,
    type GroupSuggestion,
    type AvailableGroup,
} from '@workspace/shared/schemas/gallery'
import {
    GROUP_SUGGESTION_SYSTEM_PROMPT,
    getGroupSuggestionPrompt,
} from '../prompts/gallery/group-suggestion.prompt'
import { coreGenerateObject } from '../core'

/**
 * Default model for group suggestion
 * Uses a cost-effective model since this is text-only
 */
const DEFAULT_SUGGESTION_MODEL_ID = 'gpt-4.1-mini'

/**
 * Options for group suggestion
 */
export type SuggestGroupsOptions = {
    /** The AI analysis of the image */
    aiAnalysis: GalleryMediaAIAnalysis
    /** Available groups to choose from */
    availableGroups: AvailableGroup[]
    /** Model ID to use (defaults to gpt-4.1) */
    modelId?: string
}

/**
 * Suggest gallery groups for a media item
 *
 * Uses the AI analysis to suggest appropriate gallery groups
 * based on detected procedure, body area, and other metadata.
 *
 * @param options - Suggestion options including AI analysis and available groups
 * @returns Suggested groups with confidence scores and reasoning
 *
 * @example
 * ```typescript
 * const suggestion = await suggestGalleryGroups({
 *   aiAnalysis: imageAnalysis,
 *   availableGroups: [
 *     { id: '1', name: 'Brazilian Butt Lift', slug: 'brazilian-butt-lift', description: 'BBL results' },
 *     { id: '2', name: 'Liposuction', slug: 'liposuction', description: 'Lipo results' },
 *   ],
 * })
 * console.log(suggestion.suggestedGroups) // [{ slug: 'brazilian-butt-lift', confidence: 0.95, reason: '...' }]
 * ```
 */
export async function suggestGalleryGroups(
    options: SuggestGroupsOptions
): Promise<GroupSuggestion> {
    const {
        aiAnalysis,
        availableGroups,
        modelId = DEFAULT_SUGGESTION_MODEL_ID,
    } = options

    // If no groups available, return empty suggestion
    if (availableGroups.length === 0) {
        return {
            suggestedGroups: [],
            primaryGroup: undefined,
        }
    }

    const result = await coreGenerateObject({
        modelId,
        schema: groupSuggestionSchema,
        system: GROUP_SUGGESTION_SYSTEM_PROMPT,
        prompt: getGroupSuggestionPrompt(aiAnalysis, availableGroups),
    })

    return result.object
}
