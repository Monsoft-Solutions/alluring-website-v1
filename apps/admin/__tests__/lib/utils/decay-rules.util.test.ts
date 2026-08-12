/**
 * Tests for the decay rules (issue #147).
 *
 * These ARE the issue's acceptance criteria: each rule fires on its
 * documented boundary and stays quiet on healthy data, with the triggering
 * metric recorded on the signal.
 */
import { describe, expect, it } from 'vitest'

import {
    buildCtrBenchmark,
    computeMedian,
    computeRefreshScore,
    computeSiteMedianPositionDelta,
    CTR_GAP_MIN_IMPRESSIONS,
    evaluateCtrGap,
    evaluatePositionDrop,
    evaluateStaleAge,
    monthsBetween,
    POSITION_DROP_MIN_IMPRESSIONS,
    signalsFromCannibalizationFinding,
    type WindowMetrics,
} from '@/lib/utils/decay-rules.util'
import type { CtrBucket } from '@/lib/queries/gsc-snapshot.query'
import type { CannibalizationFinding, RefreshSignal } from '@workspace/db/types'

const NOW = new Date('2026-08-12T06:40:00Z')
const WINDOW = { windowStart: '2026-07-13', windowEnd: '2026-08-09' }

function metrics(overrides: Partial<WindowMetrics>): WindowMetrics {
    return { clicks: 50, impressions: 1000, position: 5, ...overrides }
}

// ============================================
// R1 — position drop
// ============================================

describe('evaluatePositionDrop (R1)', () => {
    const base = {
        siteMedianPositionDelta: 0,
        threshold: 3,
        now: NOW,
        ...WINDOW,
    }

    it('fires at exactly the threshold and records the triggering metrics', () => {
        const signal = evaluatePositionDrop({
            ...base,
            current: metrics({ position: 8, impressions: 200 }),
            previous: metrics({ position: 5 }),
        })

        expect(signal).not.toBeNull()
        expect(signal!.source).toBe('position-drop')
        expect(signal!.metrics.positionDrop).toBe(3)
        expect(signal!.metrics.driftAdjustedDrop).toBe(3)
        expect(signal!.metrics.impressions).toBe(200)
        expect(signal!.metrics.windowStart).toBe(WINDOW.windowStart)
        expect(signal!.metrics.windowEnd).toBe(WINDOW.windowEnd)
    })

    it('stays quiet below the threshold', () => {
        const signal = evaluatePositionDrop({
            ...base,
            current: metrics({ position: 7.9 }),
            previous: metrics({ position: 5 }),
        })
        expect(signal).toBeNull()
    })

    it('subtracts a site-wide slip: a drop the whole site shares is not decay', () => {
        const signal = evaluatePositionDrop({
            ...base,
            // Raw drop of 5, but the site median slipped 3 → adjusted 2 < 3.
            siteMedianPositionDelta: 3,
            current: metrics({ position: 10 }),
            previous: metrics({ position: 5 }),
        })
        expect(signal).toBeNull()
    })

    it('adds back a site-wide gain: lagging an improving site IS decay', () => {
        const signal = evaluatePositionDrop({
            ...base,
            // Raw drop of 2 while the site median improved by 2 → adjusted 4.
            siteMedianPositionDelta: -2,
            current: metrics({ position: 7 }),
            previous: metrics({ position: 5 }),
        })
        expect(signal).not.toBeNull()
        expect(signal!.metrics.driftAdjustedDrop).toBe(4)
    })

    it('ignores posts below the impression floor', () => {
        const signal = evaluatePositionDrop({
            ...base,
            current: metrics({
                position: 10,
                impressions: POSITION_DROP_MIN_IMPRESSIONS - 1,
            }),
            previous: metrics({ position: 5 }),
        })
        expect(signal).toBeNull()
    })

    it('needs a position in both windows', () => {
        const signal = evaluatePositionDrop({
            ...base,
            current: metrics({ position: 10 }),
            previous: metrics({ position: null, impressions: 0 }),
        })
        expect(signal).toBeNull()
    })
})

// ============================================
// R2 — CTR gap
// ============================================

describe('evaluateCtrGap (R2)', () => {
    // Static fallback benchmark: position 3 → 0.10 expected CTR.
    const benchmark = buildCtrBenchmark([])
    const base = { benchmark, now: NOW, ...WINDOW }

    it('fires when CTR runs below half the positional benchmark', () => {
        const signal = evaluateCtrGap({
            ...base,
            // Position 3 expects 10% — 2% is well under the 5% line.
            current: metrics({ clicks: 20, impressions: 1000, position: 3 }),
            previous: metrics({ position: 3.5 }),
        })

        expect(signal).not.toBeNull()
        expect(signal!.source).toBe('ctr-gap')
        expect(signal!.metrics.ctr).toBe(0.02)
        expect(signal!.metrics.expectedCtr).toBe(0.1)
    })

    it('stays quiet at exactly half the benchmark', () => {
        const signal = evaluateCtrGap({
            ...base,
            current: metrics({ clicks: 50, impressions: 1000, position: 3 }),
            previous: metrics({ position: 3 }),
        })
        expect(signal).toBeNull()
    })

    it('defers to R1 when the position moved a full spot or more', () => {
        const signal = evaluateCtrGap({
            ...base,
            current: metrics({ clicks: 20, impressions: 1000, position: 3 }),
            previous: metrics({ position: 2 }),
        })
        expect(signal).toBeNull()
    })

    it('ignores posts below the impression floor', () => {
        const signal = evaluateCtrGap({
            ...base,
            current: metrics({
                clicks: 1,
                impressions: CTR_GAP_MIN_IMPRESSIONS - 1,
                position: 3,
            }),
            previous: metrics({ position: 3 }),
        })
        expect(signal).toBeNull()
    })
})

// ============================================
// R3 — stale age
// ============================================

describe('evaluateStaleAge (R3)', () => {
    it('fires once nothing touched the post for the configured months', () => {
        const signal = evaluateStaleAge({
            publishedAt: new Date('2025-11-01T00:00:00Z'),
            updatedAt: null,
            staleMonths: 6,
            now: NOW,
        })

        expect(signal).not.toBeNull()
        expect(signal!.source).toBe('stale-age')
        expect(Number(signal!.metrics.ageMonths)).toBeGreaterThanOrEqual(6)
    })

    it('counts from the update, not the publish, when the post was touched', () => {
        const signal = evaluateStaleAge({
            publishedAt: new Date('2025-01-01T00:00:00Z'),
            updatedAt: new Date('2026-06-01T00:00:00Z'),
            staleMonths: 6,
            now: NOW,
        })
        expect(signal).toBeNull()
    })

    it('stays quiet for a fresh post', () => {
        const signal = evaluateStaleAge({
            publishedAt: new Date('2026-05-01T00:00:00Z'),
            updatedAt: null,
            staleMonths: 6,
            now: NOW,
        })
        expect(signal).toBeNull()
    })
})

// ============================================
// R4 — cannibalization findings
// ============================================

function finding(
    overrides: Partial<CannibalizationFinding>
): CannibalizationFinding {
    return {
        query: 'mommy makeover recovery',
        totalImpressions: 400,
        kind: 'shared-impressions',
        pages: [],
        ...overrides,
    }
}

describe('signalsFromCannibalizationFinding (R4)', () => {
    const pageA = {
        page: 'https://example.com/blog/post-a',
        blogPostId: 'post-a',
        impressions: 240,
        share: 0.6,
        clicks: 12,
        position: 6,
    }
    const pageB = {
        page: 'https://example.com/blog/post-b',
        blogPostId: 'post-b',
        impressions: 160,
        share: 0.4,
        clicks: 5,
        position: 9,
    }

    it('signals only the non-owner post when a post owns the query', () => {
        const signals = signalsFromCannibalizationFinding(
            finding({
                pages: [pageA, pageB],
                owner: { url: pageA.page, source: 'top-performer' },
            }),
            NOW
        )

        expect(signals).toHaveLength(1)
        expect(signals[0]!.blogPostId).toBe('post-b')
        expect(signals[0]!.signal.source).toBe('cannibalization')
        expect(signals[0]!.signal.metrics.ownerUrl).toBe(pageA.page)
        expect(signals[0]!.signal.metrics.query).toBe('mommy makeover recovery')
    })

    it('signals every post when a money page owns the query', () => {
        const signals = signalsFromCannibalizationFinding(
            finding({
                pages: [pageA, pageB],
                owner: {
                    url: 'https://example.com/procedures/mommy-makeover',
                    source: 'registry',
                },
            }),
            NOW
        )
        expect(signals.map((entry) => entry.blogPostId).sort()).toEqual([
            'post-a',
            'post-b',
        ])
    })

    it('needs at least two blog posts among the competing pages', () => {
        const signals = signalsFromCannibalizationFinding(
            finding({
                pages: [pageA, { ...pageB, blogPostId: undefined }],
                owner: { url: pageA.page, source: 'top-performer' },
            }),
            NOW
        )
        expect(signals).toHaveLength(0)
    })

    it('treats the top performer as owner when none is recorded', () => {
        const signals = signalsFromCannibalizationFinding(
            finding({ pages: [pageA, pageB] }),
            NOW
        )
        expect(signals).toHaveLength(1)
        expect(signals[0]!.blogPostId).toBe('post-b')
    })
})

// ============================================
// Benchmark + drift helpers
// ============================================

describe('buildCtrBenchmark', () => {
    it('uses measured CTR when a bucket has enough volume', () => {
        const buckets: CtrBucket[] = [
            { positionBucket: 3, clicks: 90, impressions: 1000 },
        ]
        expect(buildCtrBenchmark(buckets)(3.4)).toBe(0.09)
    })

    it('falls back to the static curve for thin buckets', () => {
        const buckets: CtrBucket[] = [
            { positionBucket: 3, clicks: 9, impressions: 100 },
        ]
        expect(buildCtrBenchmark(buckets)(3)).toBe(0.1)
    })

    it('collapses deep positions into the page-two and deep buckets', () => {
        const benchmark = buildCtrBenchmark([])
        expect(benchmark(15)).toBe(0.01)
        expect(benchmark(30)).toBe(0.005)
    })

    it('clamps sub-1 positions up to position 1', () => {
        expect(buildCtrBenchmark([])(0.6)).toBe(0.28)
    })
})

describe('computeSiteMedianPositionDelta', () => {
    const page = (
        name: string,
        position: number | null,
        impressions = 100
    ) => ({ page: name, position, impressions })

    it('takes the median delta over pages present in both windows', () => {
        const delta = computeSiteMedianPositionDelta(
            [page('/a', 6), page('/b', 12), page('/c', 5)],
            [page('/a', 5), page('/b', 10), page('/c', 5)]
        )
        // Deltas: +1, +2, 0 → median 1.
        expect(delta).toBe(1)
    })

    it('excludes thin pages and pages missing from either window', () => {
        const delta = computeSiteMedianPositionDelta(
            [page('/a', 9), page('/thin', 50, 10), page('/new', 2)],
            [page('/a', 5), page('/thin', 5, 10)]
        )
        // Only /a qualifies → median is its delta.
        expect(delta).toBe(4)
    })

    it('returns 0 with no qualifying pages', () => {
        expect(computeSiteMedianPositionDelta([], [])).toBe(0)
    })
})

describe('computeMedian', () => {
    it('handles odd, even and empty lists', () => {
        expect(computeMedian([3, 1, 2])).toBe(2)
        expect(computeMedian([4, 1, 2, 3])).toBe(2.5)
        expect(computeMedian([])).toBe(0)
    })
})

describe('monthsBetween', () => {
    it('never goes negative and approximates calendar months', () => {
        expect(monthsBetween(NOW, new Date('2020-01-01'))).toBe(0)
        const sixMonthsAgo = new Date('2026-02-12T06:40:00Z')
        const months = monthsBetween(sixMonthsAgo, NOW)
        expect(months).toBeGreaterThan(5.8)
        expect(months).toBeLessThan(6.2)
    })
})

// ============================================
// Queue score
// ============================================

function signal(
    source: RefreshSignal['source'],
    signalMetrics: Record<string, number | string> = {}
): RefreshSignal {
    return { source, detectedAt: NOW.toISOString(), metrics: signalMetrics }
}

describe('computeRefreshScore', () => {
    it('scores a position drop as log10(impressions + 10) × drop', () => {
        const score = computeRefreshScore([
            signal('position-drop', {
                impressions: 990,
                driftAdjustedDrop: 4,
            }),
        ])
        // log10(1000) = 3, × 4 = 12.
        expect(score).toBe(12)
    })

    it('clamps a negative drop to zero contribution', () => {
        const score = computeRefreshScore([
            signal('position-drop', {
                impressions: 990,
                driftAdjustedDrop: -2,
            }),
        ])
        expect(score).toBe(0)
    })

    it('puts manual requests ahead of any single detected signal', () => {
        const manual = computeRefreshScore([signal('manual')])
        const stale = computeRefreshScore([
            signal('stale-age', { ageMonths: 12 }),
        ])
        const cannibal = computeRefreshScore([signal('cannibalization')])
        expect(manual).toBeGreaterThan(stale)
        expect(manual).toBeGreaterThan(cannibal)
    })

    it('accumulates across sources', () => {
        const score = computeRefreshScore([
            signal('cannibalization'),
            signal('ideation-gate'),
            signal('stale-age', { ageMonths: 6 }),
        ])
        expect(score).toBe(4.5)
    })
})
