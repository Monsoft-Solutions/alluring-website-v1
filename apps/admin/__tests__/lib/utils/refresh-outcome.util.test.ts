/**
 * Tests for the refresh outcome rules (epic #144 Phase 5).
 *
 * These ARE the phase's acceptance criteria for measurement: each verdict
 * fires on its documented boundary, conflicting evidence resolves to flat,
 * thin data never produces a verdict, and the site-drift subtraction is
 * actually applied.
 */
import { describe, expect, it } from 'vitest'

import {
    computeRefreshOutcome,
    OUTCOME_CLICKS_RATIO,
    OUTCOME_MIN_CLICKS_DELTA,
    OUTCOME_MIN_TOTAL_IMPRESSIONS,
    OUTCOME_POSITION_DELTA,
    type OutcomeWindowMetrics,
} from '@/lib/utils/refresh-outcome.util'

/** A healthy baseline window: enough impressions to clear the floor. */
function window(overrides: Partial<OutcomeWindowMetrics> = {}) {
    return {
        clicks: 50,
        impressions: 1000,
        position: 8,
        ...overrides,
    } satisfies OutcomeWindowMetrics
}

describe('computeRefreshOutcome — clicks signals', () => {
    it('improves on the exact boundary: +10% AND +5 absolute clicks', () => {
        const outcome = computeRefreshOutcome(
            window({ clicks: 50 }),
            window({ clicks: 55 }),
            0
        )
        expect(outcome.verdict).toBe('improved')
    })

    it('stays flat just below the ratio boundary', () => {
        const outcome = computeRefreshOutcome(
            window({ clicks: 50 }),
            window({ clicks: 54 }),
            0
        )
        expect(outcome.verdict).toBe('flat')
    })

    it('stays flat when the ratio passes but the absolute delta is tiny', () => {
        // +20% but only +4 clicks — a 0→1-style blip scaled up slightly.
        const outcome = computeRefreshOutcome(
            window({ clicks: 20 }),
            window({ clicks: 24 }),
            0
        )
        expect(OUTCOME_MIN_CLICKS_DELTA).toBeGreaterThan(4)
        expect(outcome.verdict).toBe('flat')
    })

    it('declines on the exact boundary: −10% AND −5 absolute clicks', () => {
        const outcome = computeRefreshOutcome(
            window({ clicks: 50 }),
            window({ clicks: 45 }),
            0
        )
        expect(outcome.verdict).toBe('declined')
    })

    it('improves from a zero-click baseline when clicks genuinely arrive', () => {
        const outcome = computeRefreshOutcome(
            window({ clicks: 0, impressions: 400, position: null }),
            window({ clicks: 12, impressions: 600, position: 5 }),
            0
        )
        expect(outcome.verdict).toBe('improved')
        // Null positions serialize as 0 — the jsonb field is non-nullable.
        expect(outcome.before.avgPosition).toBe(0)
    })
})

describe('computeRefreshOutcome — position signals (drift-adjusted)', () => {
    it('improves on the exact −1.0 adjusted-position boundary', () => {
        const outcome = computeRefreshOutcome(
            window({ position: 9 }),
            window({ position: 8 }),
            0
        )
        expect(OUTCOME_POSITION_DELTA).toBe(1.0)
        expect(outcome.verdict).toBe('improved')
    })

    it('subtracts site drift: a site-wide gain is not a refresh win', () => {
        // The post moved 9 → 7.5, but the whole site moved −1.5 too.
        const outcome = computeRefreshOutcome(
            window({ position: 9 }),
            window({ position: 7.5 }),
            -1.5
        )
        expect(outcome.verdict).toBe('flat')
        expect(outcome.siteMedianPositionDelta).toBe(-1.5)
    })

    it('declines when the post stands still while the site improves', () => {
        // Post 8 → 8 while the site median moved −1.2: relative decline.
        const outcome = computeRefreshOutcome(
            window({ position: 8 }),
            window({ position: 8 }),
            -1.2
        )
        expect(outcome.verdict).toBe('declined')
    })

    it('ignores position when either window never ranked', () => {
        const outcome = computeRefreshOutcome(
            window({ position: null }),
            window({ position: 3 }),
            0
        )
        expect(outcome.verdict).toBe('flat')
    })
})

describe('computeRefreshOutcome — conflicts and floors', () => {
    it('resolves conflicting signals to flat', () => {
        // Clicks up 40% (+20) but adjusted position 1.5 worse.
        const outcome = computeRefreshOutcome(
            window({ clicks: 50, position: 6 }),
            window({ clicks: 70, position: 7.5 }),
            0
        )
        expect(outcome.verdict).toBe('flat')
    })

    it('never issues a verdict below the impressions floor', () => {
        const outcome = computeRefreshOutcome(
            window({ clicks: 2, impressions: 40 }),
            window({ clicks: 30, impressions: 59 }),
            0
        )
        expect(40 + 59).toBeLessThan(OUTCOME_MIN_TOTAL_IMPRESSIONS)
        expect(outcome.verdict).toBe('flat')
    })

    it('issues the verdict exactly at the impressions floor', () => {
        const outcome = computeRefreshOutcome(
            window({ clicks: 10, impressions: 50 }),
            window({ clicks: 20, impressions: 50 }),
            0
        )
        expect(outcome.verdict).toBe('improved')
    })
})

describe('computeRefreshOutcome — payload shape', () => {
    it('carries both windows verbatim with rounded positions', () => {
        const outcome = computeRefreshOutcome(
            window({ clicks: 50, impressions: 900, position: 8.126 }),
            window({ clicks: 61, impressions: 1100, position: 6.994 }),
            0.333333
        )
        expect(outcome.before).toEqual({
            clicks: 50,
            impressions: 900,
            avgPosition: 8.13,
        })
        expect(outcome.after).toEqual({
            clicks: 61,
            impressions: 1100,
            avgPosition: 6.99,
        })
        expect(outcome.siteMedianPositionDelta).toBe(0.33)
    })

    it('keeps the documented ratio constant honest', () => {
        expect(OUTCOME_CLICKS_RATIO).toBe(0.1)
    })
})
