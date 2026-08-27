/**
 * Tests for content gap detection.
 *
 * The regression these guard against: `bbl smell` was reported as an uncovered
 * gap with ~10,800 impressions while `/why-do-bbl-stink` was ranking for every
 * one of them at position 10.1. See issue #204.
 */
import { describe, expect, it } from 'vitest'

import type { SearchAnalyticsRow } from '../../src/search-console/search-console-analytics.util.js'
import { buildContentGaps } from '../../src/search-console/search-console-opportunities.service.js'
import {
    COVERAGE_POSITION_THRESHOLD,
    classifyQueryCoverage,
    queryTerms,
    urlCoversQuery,
} from '../../src/search-console/query-coverage.util.js'

const SITE = 'https://www.alluringplasticsurgery.com'

/** Build one query×page row. */
function row(
    query: string,
    page: string,
    metrics: { clicks?: number; impressions?: number; position?: number } = {}
): SearchAnalyticsRow {
    const { clicks = 0, impressions = 100, position = 10 } = metrics
    return {
        keys: [query, page],
        clicks,
        impressions,
        ctr: impressions > 0 ? clicks / impressions : 0,
        position,
    }
}

/** Find one gap by query, failing loudly when it is absent. */
function gapFor(rows: SearchAnalyticsRow[], query: string) {
    const gap = buildContentGaps(rows).find((g) => g.query === query)
    if (!gap) throw new Error(`no gap reported for "${query}"`)
    return gap
}

describe('queryTerms', () => {
    it('keeps meaningful short words that the old length filter dropped', () => {
        // "bbl" is three characters — the length > 3 filter discarded it, which
        // is what let a BBL page claim every BBL query.
        expect(queryTerms('bbl smell')).toEqual(['bbl', 'smell'])
        expect(queryTerms('bbl cost')).toContain('cost')
        expect(queryTerms('what age can you get a bbl')).toEqual(['age', 'bbl'])
    })

    it('drops stopwords and punctuation', () => {
        expect(queryTerms('how long after a bbl can i fly?')).toEqual([
            'bbl',
            'fly',
        ])
    })

    it('returns nothing for an all-stopword query', () => {
        expect(queryTerms('how much is it')).toEqual([])
    })
})

describe('urlCoversQuery', () => {
    it('requires every meaningful term, not just one', () => {
        // The whole bug: matching on "bbl" alone would let the stink page
        // absorb the smell query and hide the mismatch.
        expect(urlCoversQuery(`${SITE}/why-do-bbl-stink`, 'bbl smell')).toBe(
            false
        )
        expect(
            urlCoversQuery(`${SITE}/why-do-bbl-stink`, 'why bbl stink')
        ).toBe(true)
    })

    it('matches across slug hyphens', () => {
        expect(
            urlCoversQuery(
                `${SITE}/procedures/brazilian-butt-lift-bbl-miami`,
                'brazilian butt lift miami'
            )
        ).toBe(true)
    })

    it('tolerates a plural where the slug is singular', () => {
        // Searchers pluralise ("do bbls stink") where slugs do not.
        expect(
            urlCoversQuery(`${SITE}/why-do-bbl-stink`, 'why do bbls stink')
        ).toBe(true)
    })

    it('does not strip a plural down to a two-letter stub', () => {
        // "gas" must not match via "ga"
        expect(urlCoversQuery(`${SITE}/ga-clinic`, 'gas')).toBe(false)
    })

    it('does not claim coverage for an all-stopword query', () => {
        expect(urlCoversQuery(`${SITE}/anything`, 'how much is it')).toBe(false)
    })
})

describe('classifyQueryCoverage', () => {
    it('treats a slug-matching page as covered', () => {
        expect(
            classifyQueryCoverage(
                'bbl recovery',
                `${SITE}/bbl-recovery`,
                40 // ranks badly, but the page was clearly built for this
            )
        ).toBe('covered')
    })

    it('treats a well-ranking page with different wording as weak', () => {
        expect(
            classifyQueryCoverage('bbl smell', `${SITE}/why-do-bbl-stink`, 10.1)
        ).toBe('weak')
    })

    it('treats a poorly-ranking unrelated page as no coverage', () => {
        expect(
            classifyQueryCoverage(
                'tummy tuck scars',
                `${SITE}/why-do-bbl-stink`,
                60
            )
        ).toBe('none')
    })

    it('reports no coverage when nothing ranked at all', () => {
        expect(classifyQueryCoverage('bbl smell', null, null)).toBe('none')
    })

    it('draws the weak/none line at the position threshold', () => {
        const at = classifyQueryCoverage(
            'bbl smell',
            `${SITE}/why-do-bbl-stink`,
            COVERAGE_POSITION_THRESHOLD
        )
        const past = classifyQueryCoverage(
            'bbl smell',
            `${SITE}/why-do-bbl-stink`,
            COVERAGE_POSITION_THRESHOLD + 0.1
        )
        expect([at, past]).toEqual(['weak', 'none'])
    })
})

describe('buildContentGaps', () => {
    it('does not call the bbl smell family uncovered (issue #204)', () => {
        const rows = [
            row('bbl smell', `${SITE}/why-do-bbl-stink`, {
                clicks: 22,
                impressions: 10854,
                position: 10.1,
            }),
            row('do bbls smell', `${SITE}/why-do-bbl-stink`, {
                clicks: 7,
                impressions: 2772,
                position: 8.6,
            }),
            row('what is bbl smell', `${SITE}/why-do-bbl-stink`, {
                clicks: 4,
                impressions: 2436,
                position: 11.7,
            }),
        ]

        const gaps = buildContentGaps(rows)

        expect(gaps.map((g) => g.coverage)).toEqual(['weak', 'weak', 'weak'])
        for (const gap of gaps) {
            expect(gap.topPage).toBe(`${SITE}/why-do-bbl-stink`)
            expect(gap.recommendation).toContain('already ranks')
            expect(gap.recommendation).not.toContain('Create dedicated content')
        }
    })

    it('still reports a genuine gap as uncovered', () => {
        const rows = [
            row('breast augmentation financing', `${SITE}/why-do-bbl-stink`, {
                clicks: 0,
                impressions: 900,
                position: 62,
            }),
        ]

        const gap = gapFor(rows, 'breast augmentation financing')
        expect(gap.coverage).toBe('none')
        expect(gap.recommendation).toContain('Create dedicated content')
    })

    it('omits queries whose page carries the vocabulary', () => {
        const rows = [
            row(
                'mommy makeover miami',
                `${SITE}/procedures/mommy-makeover-miami`,
                {
                    clicks: 7,
                    impressions: 3960,
                    position: 60.3,
                }
            ),
        ]

        expect(buildContentGaps(rows)).toEqual([])
    })

    it('sums impressions across every page instead of reporting only the top one', () => {
        // The old implementation took the top page's row as the query's totals,
        // understating any query spread over several pages.
        const rows = [
            row('bbl smell', `${SITE}/why-do-bbl-stink`, {
                clicks: 20,
                impressions: 1000,
                position: 10,
            }),
            row('bbl smell', `${SITE}/blog/liposuction-vs-bbl-miami`, {
                clicks: 1,
                impressions: 500,
                position: 30,
            }),
        ]

        const gap = gapFor(rows, 'bbl smell')
        expect(gap.impressions).toBe(1500)
        expect(gap.clicks).toBe(21)
        expect(gap.ctr).toBeCloseTo(21 / 1500)
        // Impression-weighted: (10*1000 + 30*500) / 1500
        expect(gap.position).toBeCloseTo(50 / 3)
        expect(gap.topPage).toBe(`${SITE}/why-do-bbl-stink`)
    })

    it('breaks a zero-click tie on the better position', () => {
        const rows = [
            row('bbl smell', `${SITE}/blog/liposuction-vs-bbl-miami`, {
                clicks: 0,
                impressions: 300,
                position: 40,
            }),
            row('bbl smell', `${SITE}/why-do-bbl-stink`, {
                clicks: 0,
                impressions: 300,
                position: 9,
            }),
        ]

        const gap = gapFor(rows, 'bbl smell')
        expect(gap.topPage).toBe(`${SITE}/why-do-bbl-stink`)
        expect(gap.coverage).toBe('weak')
    })

    it('ignores queries below the impression floor', () => {
        const rows = [
            row('obscure query here', `${SITE}/unrelated`, {
                impressions: 10,
                position: 80,
            }),
        ]

        expect(buildContentGaps(rows)).toEqual([])
    })

    it('ranks the biggest opportunity first regardless of coverage', () => {
        const rows = [
            row('small genuine gap', `${SITE}/unrelated-page`, {
                impressions: 200,
                position: 70,
            }),
            row('bbl smell', `${SITE}/why-do-bbl-stink`, {
                impressions: 10854,
                position: 10.1,
            }),
        ]

        expect(buildContentGaps(rows).map((g) => g.query)).toEqual([
            'bbl smell',
            'small genuine gap',
        ])
    })

    it('skips rows missing a query or a page', () => {
        const rows: SearchAnalyticsRow[] = [
            {
                keys: ['orphan query'],
                impressions: 5000,
                clicks: 0,
                position: 50,
            },
            { keys: [], impressions: 5000, clicks: 0, position: 50 },
        ]

        expect(buildContentGaps(rows)).toEqual([])
    })
})
