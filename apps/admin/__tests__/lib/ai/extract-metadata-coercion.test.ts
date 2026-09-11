/**
 * Tests for the soft length caps on extracted metadata (issue #223).
 *
 * The production failure: a 331-character excerpt against a 300-character
 * cap ended a twelve-minute refresh run. These pin that the salvage turns
 * that answer into a strict-valid object, and that anything structurally
 * broken still fails.
 */
import { describe, expect, it } from 'vitest'

import {
    coerceContentMetadata,
    contentMetadataSchema,
    createMetadataSalvage,
    METADATA_LIMITS,
    truncateAtWordBoundary,
} from '@workspace/ai/functions'

// The exact shape grok-4.6 returned on 2026-09-11 (excerpt 331 chars).
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

describe('truncateAtWordBoundary', () => {
    it('leaves text inside the cap untouched', () => {
        expect(truncateAtWordBoundary('  short text  ', 20)).toBe('short text')
    })

    it('prefers a sentence end past 60% of the cap', () => {
        const text =
            'First sentence is here. Second sentence follows it. Third one is long.'
        const cut = truncateAtWordBoundary(text, 55)
        expect(cut).toBe('First sentence is here. Second sentence follows it.')
    })

    it('falls back to the last word boundary and drops dangling punctuation', () => {
        const text = 'alpha beta gamma delta, epsilon zeta'
        expect(truncateAtWordBoundary(text, 24)).toBe('alpha beta gamma delta')
    })

    it('hard-cuts when no boundary sits past 60% of the cap', () => {
        expect(truncateAtWordBoundary('a'.repeat(50), 20)).toBe('a'.repeat(20))
    })
})

describe('coerceContentMetadata', () => {
    it('brings every field inside the strict caps', () => {
        const coerced = coerceContentMetadata({
            metaTitle: 'T'.repeat(30) + ' ' + 'title words '.repeat(6),
            metaDescription: 'Description sentence. '.repeat(12),
            excerpt: PRODUCTION_ANSWER.excerpt,
            suggestedTags: [' a ', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'a'],
            readingTimeMinutes: 99,
            suggestedCategory: ' recovery ',
        })
        expect(coerced.metaTitle.length).toBeLessThanOrEqual(
            METADATA_LIMITS.metaTitle
        )
        expect(coerced.metaDescription.length).toBeLessThanOrEqual(
            METADATA_LIMITS.metaDescription
        )
        expect(coerced.excerpt.length).toBeLessThanOrEqual(
            METADATA_LIMITS.excerpt
        )
        expect(coerced.excerpt.endsWith('.')).toBe(true)
        expect(coerced.suggestedTags).toEqual([
            'a',
            'b',
            'c',
            'd',
            'e',
            'f',
            'g',
        ])
        expect(coerced.readingTimeMinutes).toBe(METADATA_LIMITS.readingTimeMax)
        expect(coerced.suggestedCategory).toBe('recovery')
    })

    it('clamps a nonsensical reading time to the minimum', () => {
        const coerced = coerceContentMetadata({
            metaTitle: 'A perfectly reasonable meta title for the test',
            metaDescription:
                'A perfectly reasonable meta description that is long enough to satisfy the strict minimum length of the schema here.',
            excerpt: 'Fine.',
            suggestedTags: ['a', 'b', 'c'],
            readingTimeMinutes: 0,
            suggestedCategory: 'recovery',
        })
        expect(coerced.readingTimeMinutes).toBe(METADATA_LIMITS.readingTimeMin)
    })
})

describe('createMetadataSalvage', () => {
    const salvage = createMetadataSalvage(contentMetadataSchema)

    it('turns the 2026-09-11 production answer into a strict-valid object', () => {
        expect(contentMetadataSchema.safeParse(PRODUCTION_ANSWER).success).toBe(
            false
        )
        const salvaged = salvage(JSON.stringify(PRODUCTION_ANSWER))
        expect(salvaged).not.toBeNull()
        expect(contentMetadataSchema.safeParse(salvaged).success).toBe(true)
        expect(salvaged!.excerpt.length).toBeLessThanOrEqual(300)
        expect(salvaged!.excerpt).toBe(
            'A mild odor after Brazilian butt lift surgery is common in the first week from liposuction drainage, sweat, and moisture trapped under compression garments. This post covers typical BBL smells versus infection warning signs plus practical steps to stay clean and dry.'
        )
        expect(salvaged!.metaTitle).toBe(PRODUCTION_ANSWER.metaTitle)
    })

    it('returns null for structurally broken answers', () => {
        expect(salvage('{not json')).toBeNull()
        expect(salvage(JSON.stringify({ metaTitle: 'only this' }))).toBeNull()
        expect(
            salvage(
                JSON.stringify({
                    ...PRODUCTION_ANSWER,
                    // Under the strict 30-character minimum even before any cut.
                    metaTitle: 'Too short',
                })
            )
        ).toBeNull()
    })
})
