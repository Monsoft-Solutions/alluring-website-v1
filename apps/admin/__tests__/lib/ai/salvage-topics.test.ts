/**
 * Regression tests for the topic-response salvage path.
 *
 * On 2026-08-12 a production ideation run failed with "No object generated:
 * response did not match schema." twice in a row — the whole run died even
 * though the payload likely carried usable topics. Salvage validates topics
 * individually so a partially invalid payload yields a partial batch
 * instead of a failed run.
 */
import { describe, expect, it } from 'vitest'

import { salvageTopicsResponse } from '@workspace/ai/functions/generate-blog-topics.schema'

const validTopic = (overrides: Record<string, unknown> = {}) => ({
    title: 'BBL Recovery Week One: What Miami Patients Should Expect',
    primaryKeyword: 'bbl recovery week one',
    searchIntent: 'informational',
    description: 'What the first week after a BBL actually looks like.',
    uniqueAngle: 'Hour-by-hour timeline for the first 48 hours.',
    targetAudience: 'Women 25-45 planning BBL surgery in Miami',
    painPoints: ['pain management', 'sitting restrictions'],
    estimatedWordCount: 1800,
    suggestedContentType: 'guide',
    sourceQuery: null,
    ...overrides,
})

const asPayload = (topics: unknown[], reasoning = 'Demand-led picks.') =>
    JSON.stringify({ topics, reasoning })

describe('salvageTopicsResponse', () => {
    it('recovers a batch below the schema minimum (2 topics vs min 3)', () => {
        const result = salvageTopicsResponse(
            asPayload([
                validTopic(),
                validTopic({ title: 'Tummy Tuck Drains: Care Guide' }),
            ])
        )
        expect(result).not.toBeNull()
        expect(result?.topics).toHaveLength(2)
        expect(result?.reasoning).toBe('Demand-led picks.')
    })

    it('coerces a prose word count instead of dropping the topic', () => {
        const result = salvageTopicsResponse(
            asPayload([validTopic({ estimatedWordCount: '1,500-2,000 words' })])
        )
        expect(result?.topics[0]?.estimatedWordCount).toBe(1500)
    })

    it('drops only the invalid topic from a mixed batch', () => {
        const result = salvageTopicsResponse(
            asPayload([
                validTopic(),
                validTopic({
                    title: 'Broken Topic',
                    searchIntent: 'navigational',
                }),
                validTopic({ title: 'Lipo 360 Compression Garment Guide' }),
            ])
        )
        expect(result?.topics.map((topic) => topic.title)).toEqual([
            validTopic().title,
            'Lipo 360 Compression Garment Guide',
        ])
    })

    it('strips markdown fences before parsing', () => {
        const result = salvageTopicsResponse(
            '```json\n' + asPayload([validTopic()]) + '\n```'
        )
        expect(result?.topics).toHaveLength(1)
    })

    it('cleans stray markup from enum values (existing cleanedEnum behavior)', () => {
        const result = salvageTopicsResponse(
            asPayload([validTopic({ suggestedContentType: 'how_to</br>' })])
        )
        expect(result?.topics[0]?.suggestedContentType).toBe('how_to')
    })

    it('falls back to a stock reasoning when the field is missing', () => {
        const result = salvageTopicsResponse(
            JSON.stringify({ topics: [validTopic()] })
        )
        expect(result?.reasoning).toMatch(/Recovered valid topics/)
    })

    it('returns null for unparseable text', () => {
        expect(salvageTopicsResponse('the model rambled instead')).toBeNull()
    })

    it('returns null when no topic survives validation', () => {
        expect(
            salvageTopicsResponse(
                asPayload([{ title: 'only a title, nothing else' }])
            )
        ).toBeNull()
    })

    it('returns null for missing input', () => {
        expect(salvageTopicsResponse(undefined)).toBeNull()
    })
})
