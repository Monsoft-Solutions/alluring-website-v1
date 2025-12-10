/**
 * Group Suggestion Prompt
 *
 * Prompt template for AI-powered gallery group suggestion.
 * Matches image analysis to available gallery groups.
 *
 * @module @workspace/ai/prompts/gallery/group-suggestion
 */
import type { GalleryMediaAIAnalysis } from '../../schemas/image-analysis.schema'
import type { AvailableGroup } from '../../schemas/group-suggestion.schema'

/**
 * System prompt for group suggestion
 *
 * Provides instructions for matching gallery images to appropriate groups
 * based on the AI analysis and available group metadata.
 */
export const GROUP_SUGGESTION_SYSTEM_PROMPT = `You are a content organization specialist for Alluring Plastic Surgery, a luxury yet affordable cosmetic surgery clinic in Miami, FL.

Your task is to analyze gallery image metadata and suggest the most appropriate gallery groups to assign the image to.

## MATCHING GUIDELINES

### 1. PROCEDURE MATCHING (Highest Priority)
- Match the detected procedure slug from the image analysis to group slugs
- Look for exact or partial slug matches
- Examples:
  - Image with "brazilian-butt-lift-bbl-miami" → Group with "brazilian-butt-lift" slug
  - Image with "breast-augmentation-miami" → Group with "breast-augmentation" slug
  - Image with "tummy-tuck-miami" → Group with "tummy-tuck" slug

### 2. BODY AREA MATCHING
- Consider the body area when procedure is unclear
- Face procedures: facelift, blepharoplasty, rhinoplasty
- Breast procedures: augmentation, lift, reduction
- Body procedures: liposuction, tummy tuck, BBL, mommy makeover

### 3. GROUP DESCRIPTION ANALYSIS
- Read group descriptions carefully for additional context
- Match image characteristics to group themes
- Consider related or combined procedures

### 4. SUGGESTED TAGS
- Use the image's suggested tags to find additional group matches
- Look for thematic connections

## CONFIDENCE SCORING
- 0.9-1.0: Exact procedure slug match or very clear alignment
- 0.7-0.89: Strong match based on body area and characteristics
- 0.5-0.69: Moderate match, related but not exact
- Below 0.5: Weak match, only suggest if no better options

## IMPORTANT RULES
- Only suggest groups from the provided list
- Return slugs exactly as provided (case-sensitive)
- Order suggestions by relevance (best match first)
- Provide clear reasoning for each suggestion
- Set primaryGroup only when there's a clear best match
- It's okay to suggest multiple groups if the image fits multiple categories
- Don't suggest groups with confidence below 0.5 unless there are no better options`

/**
 * Generate the group suggestion prompt from AI analysis and available groups
 *
 * @param analysis - The AI analysis of the image
 * @param groups - Array of available groups with their metadata
 * @returns The prompt string for group suggestion
 */
export function getGroupSuggestionPrompt(
    analysis: GalleryMediaAIAnalysis,
    groups: AvailableGroup[]
): string {
    const parts = [
        'Suggest appropriate gallery groups for this image based on the analysis:',
        '',
        '## IMAGE ANALYSIS',
        `Description: ${analysis.description}`,
        `Is Before/After: ${analysis.isBeforeAfter}`,
    ]

    if (analysis.beforeAfterType) {
        parts.push(`Before/After Type: ${analysis.beforeAfterType}`)
    }

    if (analysis.detectedProcedure) {
        parts.push(
            `Detected Procedure: ${analysis.detectedProcedure} (confidence: ${analysis.procedureConfidence ?? 'N/A'})`
        )
    }

    if (analysis.bodyArea) {
        parts.push(`Body Area: ${analysis.bodyArea}`)
    }

    if (analysis.suggestedTags?.length) {
        parts.push(`Suggested Tags: ${analysis.suggestedTags.join(', ')}`)
    }

    if (analysis.clinicalDetails) {
        parts.push(`Clinical Details: ${analysis.clinicalDetails}`)
    }

    parts.push('', '## AVAILABLE GROUPS', '')

    for (const group of groups) {
        parts.push(`### ${group.name}`)
        parts.push(`- Slug: ${group.slug}`)
        if (group.description) {
            parts.push(`- Description: ${group.description}`)
        }
        parts.push('')
    }

    parts.push(
        'Based on the image analysis and available groups, suggest which groups this image should be assigned to.',
        'Return the group slugs exactly as shown above.'
    )

    return parts.join('\n')
}
