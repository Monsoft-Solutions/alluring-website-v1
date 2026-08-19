/**
 * Refresh brief derivations (epic #144, #148): coverage matching for
 * rising queries, decayed-query selection, and top-query stats.
 */
import { describe, expect, it } from 'vitest'

import type { PostQueryWindow } from '@/lib/queries/gsc-snapshot.query'
import {
    BRIEF_MIN_IMPRESSIONS,
    buildCoverageCorpus,
    buildRefreshInstructions,
    deriveDecayedQueries,
    deriveRisingQueriesNotCovered,
    deriveTopQueries,
    describeSignalsAsReasons,
    isQueryCovered,
} from '@/lib/utils/refresh-brief.util'

function windowRow(
    query: string,
    current: Partial<PostQueryWindow['current']> = {},
    previous: Partial<PostQueryWindow['previous']> = {}
): PostQueryWindow {
    return {
        query,
        current: { clicks: 0, impressions: 0, position: null, ...current },
        previous: { clicks: 0, impressions: 0, position: null, ...previous },
    }
}

describe('buildCoverageCorpus / isQueryCovered', () => {
    const corpus = buildCoverageCorpus({
        title: 'BBL Recovery Timeline',
        content: [
            '# BBL Recovery Timeline',
            'Intro paragraph mentioning compression garments in passing.',
            '## How long does swelling last',
            '## Sitting after surgery',
        ].join('\n'),
        faqs: [{ question: 'When can I drive after a BBL?' }],
    })

    it('covers queries whose words all appear in title, headings, or FAQs', () => {
        expect(isQueryCovered('bbl recovery timeline', corpus)).toBe(true)
        expect(isQueryCovered('how long does swelling last', corpus)).toBe(true)
        expect(isQueryCovered('drive after bbl', corpus)).toBe(true)
    })

    it('does not cover queries answered only in body prose', () => {
        // "compression garments" appears in a paragraph, not a heading/FAQ.
        expect(isQueryCovered('bbl compression garment', corpus)).toBe(false)
    })

    it('ignores stopwords and naive plurals', () => {
        expect(isQueryCovered('the swelling', corpus)).toBe(true)
        expect(isQueryCovered('timelines for recovery', corpus)).toBe(true)
    })
})

describe('deriveRisingQueriesNotCovered', () => {
    const corpus = buildCoverageCorpus({
        title: 'Tummy Tuck Guide',
        content: '## Cost breakdown',
        faqs: null,
    })

    it('lists uncovered queries with volume, ranked by impressions', () => {
        const windows = [
            windowRow('tummy tuck drains', { impressions: 300 }),
            windowRow('tummy tuck cost breakdown', { impressions: 900 }),
            windowRow('tummy tuck scar cream', { impressions: 500 }),
        ]
        expect(deriveRisingQueriesNotCovered(windows, corpus)).toEqual([
            'tummy tuck scar cream',
            'tummy tuck drains',
        ])
    })

    it('drops queries below the impression floor or shrinking vs the prior window', () => {
        const windows = [
            windowRow('tummy tuck drains', {
                impressions: BRIEF_MIN_IMPRESSIONS - 1,
            }),
            windowRow(
                'tummy tuck belt',
                { impressions: 200 },
                { impressions: 400 }
            ),
        ]
        expect(deriveRisingQueriesNotCovered(windows, corpus)).toEqual([])
    })
})

describe('deriveDecayedQueries', () => {
    it('names queries that lost 2+ spots with real volume', () => {
        const windows = [
            windowRow(
                'mini tummy tuck miami',
                { impressions: 400, position: 9 },
                { impressions: 350, position: 4 }
            ),
            windowRow(
                'stable query',
                { impressions: 400, position: 5.5 },
                { impressions: 380, position: 5 }
            ),
            windowRow(
                'thin query',
                { impressions: 10, position: 30 },
                { impressions: 5, position: 3 }
            ),
        ]
        expect(deriveDecayedQueries(windows)).toEqual(['mini tummy tuck miami'])
    })
})

describe('deriveTopQueries', () => {
    it('computes delta and CTR per query, capped and sorted by impressions', () => {
        const windows = [
            windowRow(
                'big query',
                { clicks: 30, impressions: 1000, position: 4 },
                { impressions: 900, position: 3 }
            ),
            windowRow('small query', {
                clicks: 1,
                impressions: 60,
                position: 8,
            }),
        ]
        const top = deriveTopQueries(windows)
        expect(top[0]).toEqual({
            query: 'big query',
            impressions: 1000,
            position: 4,
            positionDelta: 1,
            ctr: 0.03,
        })
        expect(top).toHaveLength(2)
    })
})

describe('reasons & instructions', () => {
    it('describes each signal source as a human sentence', () => {
        const reasons = describeSignalsAsReasons([
            {
                source: 'position-drop',
                detectedAt: '2026-08-01T00:00:00Z',
                metrics: { driftAdjustedDrop: 4.2, impressions: 1200 },
            },
            {
                source: 'manual',
                detectedAt: '2026-08-01T00:00:00Z',
                metrics: {},
            },
        ])
        expect(reasons[0]).toContain('4.2 spots')
        expect(reasons[1]).toContain('admin')
    })

    it('adds gap instructions only when the lists are non-empty', () => {
        const bare = buildRefreshInstructions({
            risingQueriesNotCovered: [],
            decayedQueries: [],
        })
        const full = buildRefreshInstructions({
            risingQueriesNotCovered: ['q'],
            decayedQueries: ['q2'],
        })
        expect(full.length).toBe(bare.length + 2)
        expect(bare.join(' ')).toContain('existing article as the base')
    })
})
