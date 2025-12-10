/**
 * Gallery Group Suggestion Schema
 *
 * Zod schema for validating AI group suggestion responses.
 * Single source of truth used across @workspace/ai and apps.
 *
 * @module @workspace/shared/schemas/gallery/gallery-group-suggestion
 */
import { z } from 'zod'

/**
 * Schema for a single group suggestion
 */
export const groupSuggestionItemSchema = z.object({
    slug: z
        .string()
        .describe(
            'The slug of the suggested group (must match an available group)'
        ),

    confidence: z
        .number()
        .min(0)
        .max(1)
        .describe(
            'Confidence score (0-1) for this group suggestion based on how well the image matches the group'
        ),

    reason: z
        .string()
        .describe(
            'Brief explanation of why this group is a good match for the image'
        ),
})

/**
 * Schema for the complete group suggestion response
 */
export const groupSuggestionSchema = z.object({
    suggestedGroups: z
        .array(groupSuggestionItemSchema)
        .describe(
            'Array of suggested groups to assign the media to, ordered by relevance'
        ),

    primaryGroup: z
        .string()
        .optional()
        .describe(
            'The slug of the most relevant group (the best match). Only set if there is a clear primary match.'
        ),
})

/**
 * TypeScript types inferred from schemas
 */
export type GroupSuggestionItem = z.infer<typeof groupSuggestionItemSchema>
export type GroupSuggestion = z.infer<typeof groupSuggestionSchema>

/**
 * Input type for available groups passed to the AI
 */
export type AvailableGroup = {
    id: string
    name: string
    slug: string
    description: string | null
}
