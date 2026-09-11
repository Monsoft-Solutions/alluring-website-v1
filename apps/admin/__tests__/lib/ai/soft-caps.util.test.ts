/**
 * Tests for the generic soft length caps behind coreGenerateObject (#223).
 *
 * After the repair retry misses, every structured call — not only metadata
 * extraction — trims what overshot a cap instead of failing: prose is cut at
 * a sentence or word boundary, lists are sliced, numbers are clamped. These
 * run against the real pipeline schemas, and pin that anything structurally
 * broken still fails.
 */
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { agentReviewSchema } from '@workspace/ai/agents'
import { coerceToSchema } from '@workspace/ai/core'
import {
    contentMetadataSchema,
    quickAnswerSchema,
} from '@workspace/ai/functions'

// The shape grok-4.6 returned on 2026-09-11, excerpt over its 300-char cap
// (the run logged 331; this reconstruction is 335).
const PRODUCTION_ANSWER = {
    metaTitle: 'BBL Smell Explained: Why Do BBL Stink and How to Prevent It',
    metaDescription:
        'BBL Smell Explained: Why Do BBL Stink and How to Prevent It. Discover why odor happens after BBL from drainage and garments and simple ways to prevent it.',
    excerpt:
        'A mild odor after Brazilian butt lift surgery is common in the first week from liposuction drainage, sweat, and moisture trapped under compression garments. This post covers typical BBL smells versus infection warning signs plus practical steps to stay clean and dry. Follow your surgeon’s garment and hygiene rules to support healing.',
    suggestedTags: ['bbl', 'bbl recovery', 'bbl smell', 'compression garments'],
    readingTimeMinutes: 6,
    suggestedCategory: 'recovery',
}

/** Mirrors the (unexported) refresh-change summary schema. */
const refreshChangesSchema = z.object({
    changes: z.array(z.string().min(10).max(300)).min(1).max(10),
})

const asText = (value: unknown) => JSON.stringify(value)

describe('coerceToSchema', () => {
    it('trims the production over-cap excerpt with no caller salvage', () => {
        const originalLength = PRODUCTION_ANSWER.excerpt.length
        expect(originalLength).toBeGreaterThan(300)

        const result = coerceToSchema(
            asText(PRODUCTION_ANSWER),
            contentMetadataSchema
        )

        expect(result).not.toBeNull()
        expect(result!.object.excerpt.length).toBeLessThanOrEqual(300)
        expect(result!.object.excerpt.endsWith('stay clean and dry.')).toBe(
            true
        )
        expect(contentMetadataSchema.safeParse(result!.object).success).toBe(
            true
        )
        expect(result!.object.metaTitle).toBe(PRODUCTION_ANSWER.metaTitle)
        expect(result!.coercions).toEqual([
            `excerpt: ${originalLength}→${result!.object.excerpt.length} chars`,
        ])
    })

    it('trims a review summary and clamps its score', () => {
        const summary = Array.from(
            { length: 12 },
            (_, i) =>
                `Finding ${i + 1} is that the recovery section needs a clearer timeline.`
        ).join(' ')
        expect(summary.length).toBeGreaterThan(500)

        const result = coerceToSchema(
            asText({ score: 104, issues: [], summary }),
            agentReviewSchema
        )

        expect(result!.object.score).toBe(100)
        expect(result!.object.summary.length).toBeLessThanOrEqual(500)
        expect(result!.object.summary.endsWith('timeline.')).toBe(true)
        expect(result!.coercions).toContain('score: 104→100')
    })

    it('trims a quick answer without dropping it under its minimum', () => {
        const answer =
            'Most tummy tuck drains come out within 7 to 14 days, once output drops below about 30 mL a day. '.repeat(
                8
            )
        expect(answer.trim().length).toBeGreaterThan(700)

        const result = coerceToSchema(
            asText({
                question: 'How long do tummy tuck drains stay in?',
                answer,
            }),
            quickAnswerSchema
        )

        expect(result!.object.answer.length).toBeLessThanOrEqual(700)
        expect(result!.object.answer.length).toBeGreaterThanOrEqual(120)
        expect(result!.object.question).toBe(
            'How long do tummy tuck drains stay in?'
        )
    })

    it('slices a list and cuts an over-long item past the slice point', () => {
        const changes = Array.from(
            { length: 12 },
            (_, i) => `Change ${i + 1}: rewrote the intro for clarity.`
        )
        changes[11] = `Change 12: ${'expanded the recovery timeline section. '.repeat(12)}`

        const result = coerceToSchema(asText({ changes }), refreshChangesSchema)

        expect(result!.object.changes).toHaveLength(10)
        expect(refreshChangesSchema.safeParse(result!.object).success).toBe(
            true
        )
    })

    it('unwraps a junk-key wrapper whose payload is also over a cap (#191)', () => {
        const result = coerceToSchema(
            asText({
                config: { score: 104, issues: [], summary: 'Solid draft.' },
            }),
            agentReviewSchema
        )
        expect(result!.object).toEqual({
            score: 100,
            issues: [],
            summary: 'Solid draft.',
        })
    })

    it('parses an answer wrapped in a markdown code fence', () => {
        const result = coerceToSchema(
            '```json\n' +
                asText({ score: 120, issues: [], summary: 'ok' }) +
                '\n```',
            agentReviewSchema
        )
        expect(result!.object.score).toBe(100)
    })

    it('clamps a number below its minimum', () => {
        const result = coerceToSchema(
            asText({ ...PRODUCTION_ANSWER, readingTimeMinutes: 0 }),
            contentMetadataSchema
        )
        expect(result!.object.readingTimeMinutes).toBe(1)
    })

    it('returns a clean answer unchanged with no coercions', () => {
        const clean = { score: 80, issues: [], summary: 'Fine.' }
        const result = coerceToSchema(asText(clean), agentReviewSchema)
        expect(result).toEqual({ object: clean, coercions: [] })
    })

    it.each([
        ['a missing field', { score: 80, issues: [] }],
        ['a wrong type', { score: 'high', issues: [], summary: 'x' }],
        ['a cap overshoot next to a missing field', { score: 104, issues: [] }],
    ])('refuses %s', (_label, value) => {
        expect(coerceToSchema(asText(value), agentReviewSchema)).toBeNull()
    })

    it('refuses a string under its minimum (nothing to trim)', () => {
        expect(
            coerceToSchema(
                asText({ ...PRODUCTION_ANSWER, metaDescription: 'Too short.' }),
                contentMetadataSchema
            )
        ).toBeNull()
    })

    it('refuses an exclusive bound (no single value to clamp to)', () => {
        const schema = z.object({ n: z.number().lt(10) })
        expect(coerceToSchema(asText({ n: 12 }), schema)).toBeNull()
    })

    it.each([
        ['prose', 'The model rambled instead of answering.'],
        ['an empty string', ''],
        ['undefined', undefined],
    ])('returns null for %s', (_label, text) => {
        expect(coerceToSchema(text, agentReviewSchema)).toBeNull()
    })
})
