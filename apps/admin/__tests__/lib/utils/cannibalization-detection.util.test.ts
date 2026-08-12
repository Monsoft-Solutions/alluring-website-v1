/**
 * Tests for cannibalization detection (issue #146).
 *
 * These ARE the issue's acceptance criteria: seeded duplicate data produces
 * a correct report; clean data produces none.
 */
import { describe, expect, it } from 'vitest'

import {
    detectCannibalization,
    MIN_WEEKLY_IMPRESSIONS,
    SHARE_THRESHOLD,
} from '@/lib/utils/cannibalization-detection.util'
import type { QueryPageAggregate } from '@/lib/queries/gsc-snapshot.query'

// Made-up queries that cannot match the keyword-ownership registry, so the
// owner enrichment deterministically falls back to the top performer.
const QUERY = 'zz-test-cannibal-query'

function row(overrides: Partial<QueryPageAggregate>): QueryPageAggregate {
    return {
        query: QUERY,
        page: 'https://example.com/blog/post-a',
        blogPostId: null,
        clicks: 10,
        impressions: 100,
        position: 8,
        ...overrides,
    }
}

describe('detectCannibalization — shared impressions', () => {
    it('flags a query where two pages each hold ≥30% of impressions', () => {
        const currentWeek = [
            row({ page: 'https://example.com/blog/post-a', impressions: 60 }),
            row({ page: 'https://example.com/blog/post-b', impressions: 40 }),
        ]

        const findings = detectCannibalization(currentWeek, [])

        expect(findings).toHaveLength(1)
        const finding = findings[0]!
        expect(finding.kind).toBe('shared-impressions')
        expect(finding.query).toBe(QUERY)
        expect(finding.totalImpressions).toBe(100)
        expect(finding.pages).toHaveLength(2)
        // Pages sorted by impressions, shares computed against the total
        expect(finding.pages[0]!.share).toBeCloseTo(0.6)
        expect(finding.pages[1]!.share).toBeCloseTo(0.4)
        // No registry match → current top performer owns it
        expect(finding.owner).toEqual({
            url: '/blog/post-a',
            source: 'top-performer',
        })
    })

    it('produces nothing for clean data (one clear owner per query)', () => {
        const currentWeek = [
            row({ page: 'https://example.com/blog/post-a', impressions: 90 }),
            row({ page: 'https://example.com/blog/post-b', impressions: 10 }),
        ]

        expect(detectCannibalization(currentWeek, [])).toEqual([])
    })

    it('ignores queries under the weekly impression floor', () => {
        const total = MIN_WEEKLY_IMPRESSIONS - 2
        const currentWeek = [
            row({
                page: 'https://example.com/blog/post-a',
                impressions: total / 2,
            }),
            row({
                page: 'https://example.com/blog/post-b',
                impressions: total / 2,
            }),
        ]

        expect(detectCannibalization(currentWeek, [])).toEqual([])
    })

    it('requires the share threshold, not just two pages', () => {
        const currentWeek = [
            row({ page: 'https://example.com/blog/post-a', impressions: 80 }),
            row({
                page: 'https://example.com/blog/post-b',
                impressions: Math.floor(100 * (SHARE_THRESHOLD - 0.1)),
            }),
        ]

        expect(detectCannibalization(currentWeek, [])).toEqual([])
    })
})

describe('detectCannibalization — flip-flop', () => {
    it('flags a query whose top URL changed between the two weeks', () => {
        const currentWeek = [
            row({ page: 'https://example.com/blog/post-a', impressions: 75 }),
            row({ page: 'https://example.com/blog/post-b', impressions: 25 }),
        ]
        const previousWeek = [
            row({ page: 'https://example.com/blog/post-b', impressions: 70 }),
            row({ page: 'https://example.com/blog/post-a', impressions: 30 }),
        ]

        const findings = detectCannibalization(currentWeek, previousWeek)

        expect(findings).toHaveLength(1)
        expect(findings[0]!.kind).toBe('flip-flop')
    })

    it('stays quiet when the same URL wins both weeks', () => {
        const week = [
            row({ page: 'https://example.com/blog/post-a', impressions: 75 }),
            row({ page: 'https://example.com/blog/post-b', impressions: 25 }),
        ]

        expect(detectCannibalization(week, week)).toEqual([])
    })

    it('ignores flip-flops under the two-week impression floor', () => {
        // Current week: 60 impressions, one clear holder (no share finding).
        const currentWeek = [
            row({ page: 'https://example.com/blog/post-a', impressions: 50 }),
            row({ page: 'https://example.com/blog/post-b', impressions: 10 }),
        ]
        // Previous week: 30 impressions, different top URL. Combined 90 is
        // under FLIP_FLOP_MIN_IMPRESSIONS (100), so the flip stays quiet.
        const previousWeek = [
            row({ page: 'https://example.com/blog/post-b', impressions: 25 }),
            row({ page: 'https://example.com/blog/post-a', impressions: 5 }),
        ]
        expect(detectCannibalization(currentWeek, previousWeek)).toEqual([])
    })

    it('sorts findings by total impressions, worst first', () => {
        const currentWeek = [
            row({ query: 'zz-small', impressions: 30 }),
            row({
                query: 'zz-small',
                page: 'https://example.com/blog/post-b',
                impressions: 30,
            }),
            row({ query: 'zz-big', impressions: 300 }),
            row({
                query: 'zz-big',
                page: 'https://example.com/blog/post-b',
                impressions: 200,
            }),
        ]

        const findings = detectCannibalization(currentWeek, [])
        expect(findings.map((finding) => finding.query)).toEqual([
            'zz-big',
            'zz-small',
        ])
    })
})
