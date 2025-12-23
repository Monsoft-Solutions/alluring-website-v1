/**
 * Generate Content Brief Function
 *
 * AI-powered content brief generation for high-opportunity search queries.
 * Creates comprehensive outlines to guide content creation.
 *
 * @module @workspace/ai/functions/generate-content-brief
 */
import {
    contentBriefSchema,
    type ContentBrief,
    type GenerateContentBriefInput,
} from '@workspace/shared/schemas/seo'

import {
    CONTENT_BRIEF_SYSTEM_PROMPT,
    getContentBriefPrompt,
} from '../prompts/seo/content-brief.prompt'
import { coreGenerateObject } from '../core'

/**
 * Default model for content brief generation
 * Uses GPT-4 for comprehensive, high-quality briefs
 */
const DEFAULT_MODEL_ID = 'gpt-4.1'

/**
 * Options for content brief generation
 */
export type GenerateContentBriefOptions = GenerateContentBriefInput & {
    /** Model ID to use (defaults to gpt-4o) */
    modelId?: string
    /** Temperature for generation (defaults to 0.5 for balanced creativity) */
    temperature?: number
}

/**
 * Generate a comprehensive content brief for a search query
 *
 * Creates an actionable content brief including:
 * - SEO-optimized title suggestion
 * - Target and secondary keywords
 * - Recommended word count
 * - Complete content outline with H2/H3 headings
 * - Key points for each section
 * - Introduction and conclusion approach
 * - Call-to-action recommendation
 * - Meta description suggestion
 *
 * @param options - Generation options including the query to target
 * @returns Comprehensive content brief
 *
 * @example
 * ```typescript
 * const brief = await generateContentBrief({
 *   query: 'bbl recovery week by week',
 *   currentPosition: 8.5,
 *   impressions: 1500,
 * })
 *
 * console.log(brief.suggestedTitle)
 * // 'BBL Recovery Week by Week: Complete Timeline & Tips'
 *
 * console.log(brief.outline)
 * // [{ heading: 'Week 1: Immediate Recovery', level: 'h2', keyPoints: [...] }, ...]
 * ```
 */
export async function generateContentBrief(
    options: GenerateContentBriefOptions
): Promise<ContentBrief & { modelId: string }> {
    const {
        query,
        currentPosition,
        impressions,
        modelId = DEFAULT_MODEL_ID,
        temperature = 0.5,
    } = options

    const result = await coreGenerateObject({
        modelId,
        schema: contentBriefSchema,
        system: CONTENT_BRIEF_SYSTEM_PROMPT,
        prompt: getContentBriefPrompt({
            query,
            currentPosition,
            impressions,
        }),
        temperature,
    })

    return {
        ...result.object,
        modelId,
    }
}
