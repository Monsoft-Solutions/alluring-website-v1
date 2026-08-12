/**
 * Blog Topic Generation — wire schema and response salvage
 *
 * Pure zod module (no provider/model imports) so the salvage path is unit
 * testable without AI SDK setup. The wire schema stays strict — it is what
 * the model sees — while `salvageTopicsResponse` recovers individually
 * valid topics from a payload that failed whole-response validation.
 *
 * @module @workspace/ai/functions/generate-blog-topics.schema
 */
import { z } from 'zod'

/**
 * Enum that tolerates stray markup or whitespace the model occasionally
 * appends to values (e.g. "how_to</br>"). The wire schema sent to the model
 * stays a plain enum; only runtime validation applies the cleanup.
 */
const cleanedEnum = <T extends [string, ...string[]]>(values: T) =>
    z.preprocess(
        (value) =>
            typeof value === 'string'
                ? value.replace(/<[^>]*>/g, '').trim()
                : value,
        z.enum(values)
    )

/**
 * Schema for a single topic suggestion
 */
export const topicSuggestionSchema = z.object({
    title: z
        .string()
        .describe('SEO-friendly blog post title (50-60 characters ideal)'),
    primaryKeyword: z.string().describe('Main keyword to target for SEO'),
    searchIntent: cleanedEnum([
        'informational',
        'commercial',
        'transactional',
    ]).describe('The search intent this topic addresses'),
    description: z
        .string()
        .describe('Brief 1-2 sentence description of what the post will cover'),
    uniqueAngle: z
        .string()
        .describe(
            'What makes this perspective different from existing content'
        ),
    targetAudience: z
        .string()
        .describe(
            'Specific target audience for this topic (e.g., "Women 30-45 considering BBL surgery in Miami")'
        ),
    painPoints: z
        .array(z.string())
        .describe(
            'Key pain points, concerns, or questions this topic addresses. ALWAYS include at least 2-4 pain points.'
        ),
    estimatedWordCount: z
        .number()
        .describe(
            'Suggested word count for the post. ALWAYS include a word count.'
        ),
    suggestedContentType: cleanedEnum([
        'tutorial',
        'guide',
        'how_to',
        'case_study',
        'comparison',
        'faq',
        'listicle',
        'announcement',
        'thought_leadership',
    ]).describe('Recommended content type for this topic'),
    sourceQuery: z
        .string()
        .nullable()
        .optional()
        .describe(
            'When this topic was derived from one of the provided Search Console seed queries, the EXACT seed query string; otherwise null'
        ),
})

/**
 * Schema for the full topics response
 */
export const generateTopicsResponseSchema = z.object({
    topics: z
        .array(topicSuggestionSchema)
        .min(3)
        .max(10)
        .describe('Array of topic suggestions'),
    reasoning: z
        .string()
        .describe('Brief explanation of why these topics were selected'),
})

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

/** Word counts occasionally come back as prose ("1,500–2,000 words");
 * take the first number instead of dropping the topic. */
const coerceWordCount = (value: unknown): unknown => {
    if (typeof value !== 'string') return value
    const match = value.replace(/,/g, '').match(/\d+/)
    return match ? Number(match[0]) : value
}

const salvageTopicSchema = topicSuggestionSchema.extend({
    estimatedWordCount: z.preprocess(coerceWordCount, z.number()),
})

/**
 * Recover valid topics from a raw model response that failed whole-payload
 * validation — e.g. fewer topics than the schema minimum, or one topic
 * with a malformed field poisoning an otherwise good batch. Topics are
 * validated individually; invalid ones are dropped.
 *
 * @param text - The raw model output (NoObjectGeneratedError.text)
 * @returns The salvaged response, or null when nothing usable was found
 */
export function salvageTopicsResponse(
    text: string | undefined
): GenerateBlogTopicsResult | null {
    if (!text) return null

    const cleaned = text
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')

    let parsed: unknown
    try {
        parsed = JSON.parse(cleaned)
    } catch {
        return null
    }
    if (typeof parsed !== 'object' || parsed === null) return null

    const { topics, reasoning } = parsed as {
        topics?: unknown
        reasoning?: unknown
    }
    if (!Array.isArray(topics)) return null

    const valid: TopicSuggestion[] = []
    for (const candidate of topics) {
        const result = salvageTopicSchema.safeParse(candidate)
        if (result.success) valid.push(result.data)
    }
    if (valid.length === 0) return null

    return {
        topics: valid,
        reasoning:
            typeof reasoning === 'string' && reasoning.trim().length > 0
                ? reasoning
                : 'Recovered valid topics from a partially invalid model response.',
    }
}
