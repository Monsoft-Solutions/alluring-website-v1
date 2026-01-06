/**
 * Analysis Result Schemas
 *
 * Zod schemas and types for AI analysis results.
 * Used across packages for type safety and validation.
 *
 * @module @workspace/shared/schemas/analysis
 */
import { z } from 'zod'

/**
 * AI-suggested group for media assignment
 */
export const aiSuggestedGroupSchema = z.object({
    groupId: z.string().uuid(),
    slug: z.string(),
    name: z.string(),
    confidence: z.number().describe('Confidence from 0.0 to 1.0'),
    reason: z.string(),
})

/**
 * Detected B&A pair from analysis
 */
export const detectedPairSchema = z.object({
    id: z.string(),
    type: z.enum(['side_by_side', 'paired']),
    beforeMediaId: z.string().uuid(),
    beforeMediaUrl: z.string().url(),
    afterMediaId: z.string().uuid(),
    afterMediaUrl: z.string().url(),
    procedureSlug: z.string().nullable(),
    bodyArea: z.string(),
    confidence: z.number().describe('Confidence from 0.0 to 1.0'),
    aiSuggestedGroups: z.array(aiSuggestedGroupSchema),
    aiPrimaryGroup: z.string().nullable(),
})

/**
 * Media item awaiting manual pairing
 */
export const unpairedMediaSchema = z.object({
    mediaId: z.string().uuid(),
    mediaUrl: z.string().url(),
    beforeAfterType: z.enum(['before', 'after']),
    procedureSlug: z.string().nullable(),
    bodyArea: z.string(),
    postId: z.string().uuid(),
    postCode: z.string(),
    aiSuggestedGroups: z.array(aiSuggestedGroupSchema),
    aiAnalysis: z.unknown().nullable(),
})

/**
 * Non-B&A media item
 */
export const nonBAMediaSchema = z.object({
    mediaId: z.string().uuid(),
    mediaUrl: z.string().url(),
    contentType: z.string(),
    procedureSlug: z.string().nullable(),
    postId: z.string().uuid(),
    isSideBySide: z.boolean().optional(),
    aiSuggestedGroups: z.array(aiSuggestedGroupSchema),
    aiAnalysis: z.unknown().nullable(),
})

/**
 * Analysis statistics
 */
export const analysisStatsSchema = z.object({
    totalPosts: z.number().int().describe('Total posts (non-negative integer)'),
    totalMedia: z.number().int().describe('Total media (non-negative integer)'),
    analyzedMedia: z
        .number()
        .int()
        .describe('Analyzed media (non-negative integer)'),
    failedMedia: z
        .number()
        .int()
        .describe('Failed media (non-negative integer)'),
    sideBySideCount: z
        .number()
        .int()
        .describe('Side by side count (non-negative integer)'),
    pairedCount: z
        .number()
        .int()
        .describe('Paired count (non-negative integer)'),
    unpairedCount: z
        .number()
        .int()
        .describe('Unpaired count (non-negative integer)'),
})

/**
 * Result of bulk analysis
 */
export const bulkAnalysisResultSchema = z.object({
    success: z.boolean(),
    error: z.string().optional(),
    analyzedPosts: z.array(z.unknown()),
    detectedPairs: z.array(detectedPairSchema),
    unpairedMedia: z.array(unpairedMediaSchema),
    nonBAMedia: z.array(nonBAMediaSchema),
    stats: analysisStatsSchema,
})

// Type exports
export type AISuggestedGroup = z.infer<typeof aiSuggestedGroupSchema>
export type DetectedPair = z.infer<typeof detectedPairSchema>
export type UnpairedMedia = z.infer<typeof unpairedMediaSchema>
export type NonBAMedia = z.infer<typeof nonBAMediaSchema>
export type AnalysisStats = z.infer<typeof analysisStatsSchema>
export type BulkAnalysisResult = z.infer<typeof bulkAnalysisResultSchema>
