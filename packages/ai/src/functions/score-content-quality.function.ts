/**
 * Score Content Quality Function
 *
 * Evaluates generated blog content against quality criteria.
 * Returns a quality score and improvement suggestions.
 *
 * @module @workspace/ai/functions/score-content-quality
 */
import { z } from 'zod'

import { coreGenerateObject } from '../core'

/**
 * Quality score dimensions
 */
export const qualityDimensionsSchema = z.object({
    /** How easy the content is to read (1-10) */
    readability: z.number().min(1).max(10).describe('Reading ease score'),
    /** SEO optimization quality (1-10) */
    seoOptimization: z
        .number()
        .min(1)
        .max(10)
        .describe('Keyword usage and SEO structure'),
    /** Factual accuracy and authority (1-10) */
    factualAccuracy: z
        .number()
        .min(1)
        .max(10)
        .describe('Medical accuracy and use of authoritative sources'),
    /** Brand voice alignment (1-10) */
    brandVoice: z
        .number()
        .min(1)
        .max(10)
        .describe('Alignment with brand guidelines'),
    /** Reader engagement potential (1-10) */
    engagement: z
        .number()
        .min(1)
        .max(10)
        .describe('Hook quality and reader engagement'),
    /** Natural, human-like writing (1-10) */
    naturalLanguage: z
        .number()
        .min(1)
        .max(10)
        .describe('How natural and human-like the writing sounds'),
})

/**
 * Quality score response schema
 */
export const qualityScoreSchema = z.object({
    /** Overall quality score (1-10) */
    overall: z
        .number()
        .min(1)
        .max(10)
        .describe('Overall quality score weighted average'),
    /** Individual dimension scores */
    dimensions: qualityDimensionsSchema,
    /** Top 3 improvement suggestions */
    improvements: z
        .array(z.string())
        .max(3)
        .describe('Specific actionable improvements'),
    /** Whether content passes quality threshold */
    passesThreshold: z.boolean().describe('True if overall score >= 7'),
    /** Brief reasoning for the score */
    reasoning: z.string().describe('Brief explanation of the score'),
})

/**
 * Quality score result type
 */
export type QualityScoreResult = z.infer<typeof qualityScoreSchema>

/**
 * Quality dimensions type
 */
export type QualityDimensions = z.infer<typeof qualityDimensionsSchema>

/**
 * Options for content quality scoring
 */
export type ScoreContentQualityOptions = {
    /** Content to evaluate */
    content: string
    /** Primary keyword for SEO evaluation */
    primaryKeyword: string
    /** Target audience for relevance evaluation */
    targetAudience?: string
    /** Minimum threshold score (default: 7) */
    threshold?: number
    /** Model ID to use (default: gpt-4.1-mini for speed) */
    modelId?: string
}

/**
 * System prompt for quality evaluation
 */
const QUALITY_SCORER_SYSTEM_PROMPT = `You are an expert content quality evaluator for a luxury plastic surgery clinic blog.

Evaluate the provided content against these criteria:

**Readability (1-10):**
- Short paragraphs (3-4 sentences max)
- Clear, accessible language
- Good use of headings and bullet points
- Scannable structure

**SEO Optimization (1-10):**
- Primary keyword in first 100 words
- Keyword in at least one H2 heading
- Natural keyword density (not stuffed)
- Semantic variations used

**Factual Accuracy (1-10):**
- Medical information is accurate
- Sources cited where appropriate
- No misleading claims
- Appropriate disclaimers

**Brand Voice (1-10):**
- Clear, direct language (not marketing fluff)
- Confident but not arrogant
- Technical but accessible
- No corporate jargon (leverage, synergy, etc.)

**Engagement (1-10):**
- Strong opening hook
- Clear value proposition
- Compelling structure
- Actionable conclusion

**Natural Language (1-10):**
- Sounds human, not AI-generated
- Varied sentence structure
- Conversational flow
- Personal touches and expertise

Score each dimension, calculate a weighted overall score, and provide specific improvement suggestions.`

/**
 * Score content quality
 *
 * Evaluates blog content against quality criteria and returns
 * a comprehensive score with improvement suggestions.
 *
 * @param options - Scoring options
 * @returns Quality score with dimensions and improvements
 *
 * @example
 * ```typescript
 * const score = await scoreContentQuality({
 *   content: blogPostMarkdown,
 *   primaryKeyword: 'bbl recovery',
 * })
 *
 * if (score.passesThreshold) {
 *   console.log('Content is ready for publishing')
 * } else {
 *   console.log('Improvements needed:', score.improvements)
 * }
 * ```
 */
export async function scoreContentQuality(
    options: ScoreContentQualityOptions
): Promise<QualityScoreResult> {
    const {
        content,
        primaryKeyword,
        targetAudience = 'Women 25-55 considering cosmetic procedures',
        threshold = 7,
        modelId = 'gpt-5.2',
    } = options

    const prompt = `Evaluate the following blog post content:

**Primary Keyword:** ${primaryKeyword}
**Target Audience:** ${targetAudience}

---

${content}

---

Score each dimension from 1-10, calculate the overall score as a weighted average (with natural language and brand voice weighted 1.5x), and provide up to 3 specific improvement suggestions.

Set passesThreshold to true if overall >= ${threshold}.`

    const result = await coreGenerateObject({
        modelId,
        schema: qualityScoreSchema,
        system: QUALITY_SCORER_SYSTEM_PROMPT,
        prompt,
        temperature: 0.3, // Low temperature for consistent scoring
    })

    return result.object
}
