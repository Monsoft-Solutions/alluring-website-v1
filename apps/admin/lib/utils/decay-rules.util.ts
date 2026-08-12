/**
 * Decay Rules
 *
 * The pure detection rules of the refresh loop (epic #144, #147). Each rule
 * takes plain aggregates and returns a `RefreshSignal` with its triggering
 * metrics, or null — no DB, no API, so the issue's acceptance criteria run
 * as unit tests. The decay-detection service wires them to snapshot queries.
 *
 * Rules (windows are 28 snapshot days vs the prior 28):
 * - R1 position drop: impression-weighted position worsened by at least the
 *   configured threshold AFTER subtracting the site-median delta, so a core
 *   update that moves the whole site doesn't read as per-post decay.
 * - R2 CTR gap: position is stable but CTR runs below half the site's own
 *   benchmark for that position — the snippet, not the ranking, is the
 *   problem.
 * - R3 stale age: nothing touched the post for longer than the configured
 *   number of months (needs no snapshots).
 * - R4 cannibalization: a weekly report finding where ≥2 of our own blog
 *   posts split one query — every non-owner post gets a signal.
 *
 * @module @/lib/utils/decay-rules.util
 */
import type { CannibalizationFinding, RefreshSignal } from '@workspace/db/types'

import type {
    CtrBucket,
    PageWindowAggregate,
} from '@/lib/queries/gsc-snapshot.query'

// ============================================
// Constants
// ============================================

/** Both decay windows span this many snapshot days. */
export const DECAY_WINDOW_DAYS = 28

/** R1 ignores posts with fewer impressions than this in the current window. */
export const POSITION_DROP_MIN_IMPRESSIONS = 200

/** R2 needs more volume than R1 — CTR on thin impressions is noise. */
export const CTR_GAP_MIN_IMPRESSIONS = 500

/** R2 only fires when the position moved less than this (stable ranking). */
export const CTR_GAP_MAX_POSITION_DELTA = 1.0

/** R2 fires when CTR is below this fraction of the positional benchmark. */
export const CTR_GAP_RATIO = 0.5

/** CTR buckets with fewer impressions than this fall back to the static curve. */
export const CTR_BENCHMARK_MIN_BUCKET_IMPRESSIONS = 1000

/** Pages must have at least this many impressions in BOTH windows to vote
 * in the site-median drift. */
export const DRIFT_PAGE_MIN_IMPRESSIONS = 50

/** Average Gregorian month, in days — good enough for staleness ages. */
const DAYS_PER_MONTH = 30.44

/**
 * Fallback CTR-by-position curve, used until a bucket has enough of our own
 * data. Values are typical organic CTRs; precision doesn't matter because R2
 * compares against HALF the benchmark.
 */
const STATIC_CTR_BY_POSITION: Record<number, number> = {
    1: 0.28,
    2: 0.15,
    3: 0.1,
    4: 0.07,
    5: 0.05,
    6: 0.04,
    7: 0.03,
    8: 0.025,
    9: 0.02,
    10: 0.018,
}

/** Static fallback for positions 11–20. */
const STATIC_CTR_PAGE_TWO = 0.01

/** Static fallback for positions 21+. */
const STATIC_CTR_DEEP = 0.005

// ============================================
// Shared types
// ============================================

/** One post's (or page's) totals over a window, as the rules consume them. */
export type WindowMetrics = {
    clicks: number
    impressions: number
    /** Impression-weighted average position; null when the window is empty. */
    position: number | null
}

/** Positional CTR benchmark: expected CTR for an average position. */
export type CtrBenchmark = (position: number) => number

// ============================================
// Small helpers
// ============================================

function round(value: number, decimals: number): number {
    const factor = 10 ** decimals
    return Math.round(value * factor) / factor
}

/** Median of a list; 0 for an empty list. */
export function computeMedian(values: number[]): number {
    if (values.length === 0) return 0
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 1
        ? sorted[mid]!
        : (sorted[mid - 1]! + sorted[mid]!) / 2
}

/** Fractional months between a past date and now (never negative). */
export function monthsBetween(past: Date, now: Date): number {
    const days = (now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24)
    return Math.max(0, days / DAYS_PER_MONTH)
}

// ============================================
// Drift guard + benchmark builders
// ============================================

/**
 * Median per-page position delta between two windows, over pages with
 * meaningful volume in both. Positive = the site as a whole slipped.
 * This is what R1 subtracts so only relative decay triggers.
 */
export function computeSiteMedianPositionDelta(
    currentPages: PageWindowAggregate[],
    previousPages: PageWindowAggregate[]
): number {
    const previousByPage = new Map(
        previousPages.map((page) => [page.page, page])
    )

    const deltas: number[] = []
    for (const current of currentPages) {
        const previous = previousByPage.get(current.page)
        if (!previous) continue
        if (current.position === null || previous.position === null) continue
        if (
            current.impressions < DRIFT_PAGE_MIN_IMPRESSIONS ||
            previous.impressions < DRIFT_PAGE_MIN_IMPRESSIONS
        ) {
            continue
        }
        deltas.push(current.position - previous.position)
    }

    return computeMedian(deltas)
}

/**
 * Build the positional CTR benchmark from our own trailing snapshot data,
 * falling back to the static curve for thin buckets. Positions round to
 * their bucket; everything past 20 shares one deep bucket.
 */
export function buildCtrBenchmark(buckets: CtrBucket[]): CtrBenchmark {
    const ctrByBucket = new Map<number, number>()
    for (const bucket of buckets) {
        if (bucket.impressions < CTR_BENCHMARK_MIN_BUCKET_IMPRESSIONS) continue
        ctrByBucket.set(
            bucket.positionBucket,
            bucket.clicks / bucket.impressions
        )
    }

    return (position: number) => {
        const bucket = Math.min(Math.max(Math.round(position), 1), 21)
        const measured = ctrByBucket.get(bucket)
        if (measured !== undefined) return measured
        if (bucket <= 10) return STATIC_CTR_BY_POSITION[bucket]!
        if (bucket <= 20) return STATIC_CTR_PAGE_TWO
        return STATIC_CTR_DEEP
    }
}

// ============================================
// R1 — position drop
// ============================================

export type PositionDropInput = {
    current: WindowMetrics
    previous: WindowMetrics
    /** Output of {@link computeSiteMedianPositionDelta} for the same windows. */
    siteMedianPositionDelta: number
    /** `blog_ai_config.refresh_position_drop_threshold`. */
    threshold: number
    windowStart: string
    windowEnd: string
    now: Date
}

/** R1: drift-adjusted position drop over 28d vs the prior 28d. */
export function evaluatePositionDrop(
    input: PositionDropInput
): RefreshSignal | null {
    const { current, previous } = input
    if (current.position === null || previous.position === null) return null
    if (current.impressions < POSITION_DROP_MIN_IMPRESSIONS) return null

    // Positive = worse (position numbers grow downwards in rankings).
    const positionDrop = current.position - previous.position
    const driftAdjustedDrop = positionDrop - input.siteMedianPositionDelta
    if (driftAdjustedDrop < input.threshold) return null

    return {
        source: 'position-drop',
        detectedAt: input.now.toISOString(),
        metrics: {
            positionDrop: round(positionDrop, 2),
            driftAdjustedDrop: round(driftAdjustedDrop, 2),
            siteMedianPositionDelta: round(input.siteMedianPositionDelta, 2),
            currentPosition: round(current.position, 2),
            previousPosition: round(previous.position, 2),
            impressions: current.impressions,
            windowStart: input.windowStart,
            windowEnd: input.windowEnd,
        },
    }
}

// ============================================
// R2 — CTR gap
// ============================================

export type CtrGapInput = {
    current: WindowMetrics
    previous: WindowMetrics
    benchmark: CtrBenchmark
    windowStart: string
    windowEnd: string
    now: Date
}

/** R2: stable position, CTR below half the positional benchmark. */
export function evaluateCtrGap(input: CtrGapInput): RefreshSignal | null {
    const { current, previous } = input
    if (current.position === null || previous.position === null) return null
    if (current.impressions < CTR_GAP_MIN_IMPRESSIONS) return null

    // A moving position explains a moving CTR — R1's territory, not R2's.
    const positionDelta = Math.abs(current.position - previous.position)
    if (positionDelta >= CTR_GAP_MAX_POSITION_DELTA) return null

    const ctr = current.clicks / current.impressions
    const expectedCtr = input.benchmark(current.position)
    if (ctr >= CTR_GAP_RATIO * expectedCtr) return null

    return {
        source: 'ctr-gap',
        detectedAt: input.now.toISOString(),
        metrics: {
            ctr: round(ctr, 4),
            expectedCtr: round(expectedCtr, 4),
            ctrRatio: round(expectedCtr > 0 ? ctr / expectedCtr : 0, 2),
            position: round(current.position, 2),
            impressions: current.impressions,
            windowStart: input.windowStart,
            windowEnd: input.windowEnd,
        },
    }
}

// ============================================
// R3 — stale age
// ============================================

export type StaleAgeInput = {
    publishedAt: Date
    updatedAt: Date | null
    /** `blog_ai_config.refresh_stale_months`. */
    staleMonths: number
    now: Date
}

/** R3: nothing touched the post for `staleMonths` months. */
export function evaluateStaleAge(input: StaleAgeInput): RefreshSignal | null {
    const lastTouched =
        input.updatedAt && input.updatedAt > input.publishedAt
            ? input.updatedAt
            : input.publishedAt

    const ageMonths = monthsBetween(lastTouched, input.now)
    if (ageMonths < input.staleMonths) return null

    return {
        source: 'stale-age',
        detectedAt: input.now.toISOString(),
        metrics: {
            ageMonths: round(ageMonths, 1),
            staleMonthsThreshold: input.staleMonths,
            publishedAt: input.publishedAt.toISOString(),
            lastUpdatedAt: lastTouched.toISOString(),
        },
    }
}

// ============================================
// R4 — cannibalization findings → per-post signals
// ============================================

/**
 * R4: signals from one weekly cannibalization finding. Only fires when at
 * least two of the competing pages are our blog posts, and only on the
 * NON-owner posts — the owner is where the query should consolidate.
 */
export function signalsFromCannibalizationFinding(
    finding: CannibalizationFinding,
    now: Date
): Array<{ blogPostId: string; signal: RefreshSignal }> {
    const blogPages = finding.pages.filter((page) => page.blogPostId)
    if (blogPages.length < 2) return []

    const ownerUrl =
        finding.owner?.url ??
        // Defensive: the detector always sets an owner, but if one is ever
        // missing, the top performer plays that role.
        blogPages.reduce((top, page) =>
            page.impressions > top.impressions ? page : top
        ).page

    return blogPages
        .filter((page) => page.page !== ownerUrl)
        .map((page) => ({
            blogPostId: page.blogPostId!,
            signal: {
                source: 'cannibalization' as const,
                detectedAt: now.toISOString(),
                metrics: {
                    query: finding.query,
                    kind: finding.kind,
                    share: round(page.share, 2),
                    impressions: page.impressions,
                    totalImpressions: finding.totalImpressions,
                    ownerUrl,
                    page: page.page,
                },
            },
        }))
}

// ============================================
// Queue score
// ============================================

/**
 * Queue priority from a candidate's accumulated signals (plan §0):
 * `log10(impressions₂₈d + 10) × max(driftAdjustedDrop, 0) + ctrGapBonus +
 * staleBonus`, extended with flat bonuses for the non-metric sources.
 * Manual requests always outrank detected decay.
 */
export function computeRefreshScore(signals: RefreshSignal[]): number {
    let score = 0
    for (const signal of signals) {
        const impressions = Number(signal.metrics.impressions) || 0
        switch (signal.source) {
            case 'position-drop': {
                const drop = Number(signal.metrics.driftAdjustedDrop) || 0
                score += Math.log10(impressions + 10) * Math.max(drop, 0)
                break
            }
            case 'ctr-gap':
                score += Math.log10(impressions + 10)
                break
            case 'stale-age': {
                const ageMonths = Number(signal.metrics.ageMonths) || 0
                score += Math.min(ageMonths / 6, 3)
                break
            }
            case 'cannibalization':
                score += 2
                break
            case 'ideation-gate':
                score += 1.5
                break
            case 'manual':
                score += 10
                break
        }
    }
    return round(score, 2)
}
