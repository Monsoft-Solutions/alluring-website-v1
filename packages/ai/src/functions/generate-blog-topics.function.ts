/**
 * Generate Blog Topics Function
 *
 * AI-powered blog topic generation for content ideation.
 * Creates SEO-optimized topic suggestions with keyword targeting.
 *
 * @module @workspace/ai/functions/generate-blog-topics
 */
import {
    GENERATE_TOPICS_SYSTEM_PROMPT,
    getGenerateTopicsPrompt,
} from '../prompts/blog/generate-topics.prompt'
import { generateText, NoObjectGeneratedError, Output } from 'ai'
import { getModel } from '../models'
import {
    generateTopicsResponseSchema,
    salvageTopicsResponse,
} from './generate-blog-topics.schema'
import type {
    GenerateBlogTopicsResult,
    TopicSuggestion,
} from './generate-blog-topics.schema'

export type { GenerateBlogTopicsResult, TopicSuggestion }

/**
 * Default model for topic generation
 */
const DEFAULT_MODEL_ID = 'claude-opus-5'

/**
 * Selected keywords from Google Search Console
 */
export type SelectedKeywords = {
    /** Primary keyword (main target) */
    primary: string | null
    /** Secondary keywords (supporting) */
    secondary: string[]
}

/**
 * Context hints for enhanced topic generation
 */
export type ContextHints = {
    /** Procedure slug for context lookup */
    procedureSlug?: string
    /** Search intent filter (informational, commercial, transactional, mixed) */
    searchIntent?: 'informational' | 'commercial' | 'transactional' | 'mixed'
    /** Target audience description */
    targetAudience?: string
    /** Unique angle or perspective for content */
    uniqueAngle?: string
    /** Preferred content type */
    contentType?: string
}

/**
 * Procedure-specific context for AI enrichment
 */
export type ProcedureContext = {
    /** Display name of the procedure */
    name: string
    /** URL slug */
    slug: string
    /** Related SEO keywords */
    relatedKeywords: string[]
    /** Common patient concerns and pain points */
    commonPainPoints: string[]
    /** Target audience segment hints */
    targetAudienceHints: string[]
}

/**
 * A live Search Console query seeding topic generation
 */
export type GscTopicSeed = {
    /** The search query as typed by users */
    query: string
    impressions: number
    clicks: number
    /** Click-through rate in [0, 1] */
    ctr: number
    /** Average ranking position */
    position: number
    /**
     * Why this query is a candidate:
     * - opportunity: high impressions, low CTR
     * - gap: no dedicated page ranks for it
     * - decay: rankings recently dropped
     */
    source: 'opportunity' | 'gap' | 'decay'
}

/**
 * Options for topic generation
 */
export type GenerateBlogTopicsOptions = {
    /** Procedure to focus on (e.g., 'BBL', 'Mommy Makeover') - legacy field */
    procedureFocus?: string
    /** Preferred content type - legacy field */
    contentType?: string
    /** Target audience description - legacy field */
    targetAudience?: string
    /** Existing topics to avoid duplicating */
    existingTopics?: string[]
    /** Additional context or requirements */
    additionalContext?: string
    /** Selected keywords from Google Search Console */
    selectedKeywords?: SelectedKeywords
    /** Live Search Console demand seeds (headless/autopilot sourcing) */
    gscSeeds?: GscTopicSeed[]
    /** Structured context hints for enhanced generation */
    contextHints?: ContextHints
    /** Procedure-specific context (injected by API route) */
    procedureContext?: ProcedureContext
    /** Model ID to use */
    modelId?: string
}

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
        selectedKeywords,
        gscSeeds,
        contextHints,
        procedureContext,
        modelId = DEFAULT_MODEL_ID,
    } = options

    const prompt = getGenerateTopicsPrompt({
        procedureFocus,
        contentType,
        targetAudience,
        existingTopics,
        additionalContext,
        selectedKeywords,
        gscSeeds,
        contextHints,
        procedureContext,
    })

    // Models occasionally emit payloads that fail whole-response validation
    // (a stray field, a word count as prose, fewer topics than the schema
    // minimum). Retry converts one-off flakes into latency; salvage recovers
    // the individually valid topics when retrying doesn't help — a partial
    // batch beats a failed run, since callers gate and cap topics anyway.
    const MAX_ATTEMPTS = 3
    let lastError: unknown
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const result = await generateText({
                model: getModel(modelId),
                output: Output.object({
                    schema: generateTopicsResponseSchema,
                }),
                instructions: GENERATE_TOPICS_SYSTEM_PROMPT,
                prompt,
                maxOutputTokens: 16000,
            })

            return result.output
        } catch (error) {
            lastError = error
            if (!NoObjectGeneratedError.isInstance(error)) throw error

            console.warn(
                `[generateBlogTopics] Invalid topics payload (attempt ${attempt}/${MAX_ATTEMPTS}): ${error.message}`
            )
            if (error.text) {
                console.warn(
                    `[generateBlogTopics] Raw model output (first 600 chars): ${error.text.slice(0, 600)}`
                )
            }

            // A healthy salvage (full minimum batch) is accepted right away;
            // a thin one only when no retries remain.
            const salvaged = salvageTopicsResponse(error.text)
            if (
                salvaged &&
                (salvaged.topics.length >= 3 || attempt === MAX_ATTEMPTS)
            ) {
                console.warn(
                    `[generateBlogTopics] Salvaged ${salvaged.topics.length} valid topic(s) from the invalid payload`
                )
                return salvaged
            }
        }
    }

    throw new Error(
        `Topic generation produced no valid topics after ${MAX_ATTEMPTS} attempts: ${
            lastError instanceof Error ? lastError.message : 'unknown error'
        }`,
        { cause: lastError }
    )
}
