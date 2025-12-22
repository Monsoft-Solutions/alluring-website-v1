/**
 * Generate Blog Topics Function
 *
 * AI-powered blog topic generation for content ideation.
 * Creates SEO-optimized topic suggestions with keyword targeting.
 *
 * @module @workspace/ai/functions/generate-blog-topics
 */
import { z } from 'zod'

import {
    GENERATE_TOPICS_SYSTEM_PROMPT,
    getGenerateTopicsPrompt,
} from '../prompts/blog/generate-topics.prompt'
import { coreGenerateObject } from '../core'

/**
 * Schema for a single topic suggestion
 */
const topicSuggestionSchema = z.object({
    title: z
        .string()
        .describe('SEO-friendly blog post title (50-60 characters ideal)'),
    primaryKeyword: z.string().describe('Main keyword to target for SEO'),
    searchIntent: z
        .enum(['informational', 'commercial', 'transactional'])
        .describe('The search intent this topic addresses'),
    description: z
        .string()
        .describe('Brief 1-2 sentence description of what the post will cover'),
    uniqueAngle: z
        .string()
        .describe(
            'What makes this perspective different from existing content'
        ),
    estimatedWordCount: z
        .number()
        .optional()
        .describe('Suggested word count for the post'),
    suggestedContentType: z
        .enum([
            'tutorial',
            'guide',
            'how_to',
            'case_study',
            'comparison',
            'faq',
            'listicle',
            'announcement',
            'thought_leadership',
        ])
        .optional()
        .describe('Recommended content type for this topic'),
})

/**
 * Schema for the full topics response
 */
const generateTopicsResponseSchema = z.object({
    topics: z
        .array(topicSuggestionSchema)
        .min(3)
        .max(10)
        .describe('Array of topic suggestions'),
    reasoning: z
        .string()
        .optional()
        .describe('Brief explanation of why these topics were selected'),
})

/**
 * Default model for topic generation
 */
const DEFAULT_MODEL_ID = 'gpt-4.1'

/**
 * Options for topic generation
 */
export type GenerateBlogTopicsOptions = {
    /** Procedure to focus on (e.g., 'BBL', 'Mommy Makeover') */
    procedureFocus?: string
    /** Preferred content type */
    contentType?: string
    /** Target audience description */
    targetAudience?: string
    /** Existing topics to avoid duplicating */
    existingTopics?: string[]
    /** Additional context or requirements */
    additionalContext?: string
    /** Model ID to use */
    modelId?: string
    /** Temperature for creativity (higher = more creative) */
    temperature?: number
}

/**
 * Single topic suggestion type
 */
export type TopicSuggestion = z.infer<typeof topicSuggestionSchema>

/**
 * Full response type
 */
export type GenerateBlogTopicsResult = z.infer<
    typeof generateTopicsResponseSchema
>

/**
 * Generate blog topic suggestions using AI
 *
 * Creates SEO-optimized topic ideas based on procedure focus,
 * content type preferences, and target audience.
 *
 * @param options - Generation options
 * @returns Array of topic suggestions with SEO data
 *
 * @example
 * ```typescript
 * const result = await generateBlogTopics({
 *   procedureFocus: 'BBL',
 *   contentType: 'guide',
 *   existingTopics: ['BBL Recovery Guide'],
 * })
 *
 * console.log(result.topics[0])
 * // {
 * //   title: 'BBL Cost in Miami: Complete 2025 Pricing Guide',
 * //   primaryKeyword: 'bbl cost miami',
 * //   searchIntent: 'commercial',
 * //   description: 'Breakdown of BBL costs in Miami...',
 * //   uniqueAngle: 'Includes financing options and payment plans',
 * // }
 * ```
 */
export async function generateBlogTopics(
    options: GenerateBlogTopicsOptions = {}
): Promise<GenerateBlogTopicsResult> {
    const {
        procedureFocus,
        contentType,
        targetAudience,
        existingTopics,
        additionalContext,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.8, // Higher temperature for creativity
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: generateTopicsResponseSchema,
        system: GENERATE_TOPICS_SYSTEM_PROMPT,
        prompt: getGenerateTopicsPrompt({
            procedureFocus,
            contentType,
            targetAudience,
            existingTopics,
            additionalContext,
        }),
        temperature,
    })

    return result.object
}
