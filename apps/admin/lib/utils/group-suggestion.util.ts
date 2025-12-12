/**
 * Group Suggestion Utilities
 *
 * Functions for converting AI analysis into gallery group suggestions.
 *
 * @module lib/utils/group-suggestion
 */
import type {
    GalleryMediaAIAnalysis,
    AvailableGroup,
} from '@workspace/shared/schemas/gallery'
import { suggestGalleryGroups } from '@workspace/ai'
import type { AISuggestedGroup } from '@/lib/actions/instagram-analysis.action'

/**
 * Convert AI group suggestions to AISuggestedGroup format
 *
 * Takes AI analysis results and available gallery groups, then uses
 * the AI to suggest which groups the media should belong to, with
 * confidence scores and reasoning.
 *
 * @param analysis - AI analysis of the media
 * @param availableGroups - List of available gallery groups
 * @returns Array of suggested groups with confidence scores
 */
export async function convertGroupSuggestions(
    analysis: GalleryMediaAIAnalysis,
    availableGroups: AvailableGroup[]
): Promise<AISuggestedGroup[]> {
    try {
        const suggestion = await suggestGalleryGroups({
            aiAnalysis: analysis,
            availableGroups,
        })

        if (
            !suggestion.suggestedGroups ||
            suggestion.suggestedGroups.length === 0
        ) {
            return []
        }

        // Map slug suggestions to group IDs with full details
        const suggestedGroups: AISuggestedGroup[] = []
        for (const item of suggestion.suggestedGroups) {
            const group = availableGroups.find((g) => g.slug === item.slug)
            if (group) {
                suggestedGroups.push({
                    groupId: group.id,
                    slug: group.slug,
                    name: group.name,
                    confidence: item.confidence,
                    reason: item.reason,
                })
            }
        }

        return suggestedGroups
    } catch (error) {
        console.error('Error getting group suggestions:', error)
        return []
    }
}
