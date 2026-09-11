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
 * - R2 CTR gap: position is stable but CTR runs below half the positional
 *   benchmark — the snippet, not the ranking, is the problem. The benchmark
 *   is the better of our own measured CTR and the industry curve, so a
 *   site-wide snippet problem can never lower the bar (#221).
 * - R3 stale age: nothing touched the post for longer than the configured
 *   number of months (needs no snapshots).
 * - R4 cannibalization: a weekly report finding where ≥2 of our own blog
 *   posts each hold a real stake in one query — every non-owner post with
 *   a stake gets a signal. Operator/brand queries are ignored (#221).
 *
 * @module @/lib/utils/decay-rules.util
 */
import type {
    CannibalizationFinding,
    CannibalizationFindingPage,
    RefreshSignal,
} from '@workspace/db/types'

import type {
    CtrBucket,
    PageWindowAggregate,
} from '@/lib/queries/gsc-snapshot.query'
import { isIgnorableCannibalizationQuery } from '@/lib/utils/cannibalization-detection.util'

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

/** R4 only signals a post holding at least this share of the query... */
export const CANNIBALIZATION_MIN_PAGE_SHARE = 0.1

/** ...and at least this many impressions on it in the analyzed week. */
export const CANNIBALIZATION_MIN_PAGE_IMPRESSIONS = 5

/**
 * R2 score weight over log10(clickGap + 1). Calibrated so a snippet leaving
 * ~20 clicks/month on the table scores like a 4-spot drop on a
 * 500-impression page (both ≈ 10.7).
 */
export const CTR_GAP_SCORE_WEIGHT = 8

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

/** Industry CTR for a position bucket (1–21). */
function staticCtrForBucket(bucket: number): number {
    if (bucket <= 10) return STATIC_CTR_BY_POSITION[bucket]!
    if (bucket <= 20) return STATIC_CTR_PAGE_TWO
    return STATIC_CTR_DEEP
}

/**
 * Build the positional CTR benchmark: the better of our own trailing CTR
 * per bucket and the static industry curve. Positions round to their
 * bucket; everything past 20 shares one deep bucket.
 *
 * Measured CTR only ever RAISES the bar. In production one page held half
 * of every bucket from position 6 to 12 with a 0.1% CTR, so "the site's
 * benchmark" was that page's own failure and R2 could never flag it.
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
        const curve = staticCtrForBucket(bucket)
        const measured = ctrByBucket.get(bucket)
        return measured !== undefined ? Math.max(measured, curve) : curve
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
            // Clicks per window the snippet leaves on the table — what the
            // queue score and the brief lead with.
            clickGap: Math.round(current.impressions * (expectedCtr - ctr)),
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
 * Whether a page in a finding actually competes for the query, rather than
 * merely appearing in the long tail of a spread-out result set.
 */
export function hasMeaningfulStake(
    page: Pick<CannibalizationFindingPage, 'share' | 'impressions'>
): boolean {
    return (
        page.share >= CANNIBALIZATION_MIN_PAGE_SHARE &&
        page.impressions >= CANNIBALIZATION_MIN_PAGE_IMPRESSIONS
    )
}

/**
 * Whether a stored `cannibalization` signal would still be produced by R4
 * today. Non-cannibalization signals are always actionable. Used by the
 * queue prune script to strip signals detected before the #221 filters.
 */
export function isActionableCannibalizationSignal(
    signal: RefreshSignal
): boolean {
    if (signal.source !== 'cannibalization') return true
    if (isIgnorableCannibalizationQuery(String(signal.metrics.query ?? ''))) {
        return false
    }
    return hasMeaningfulStake({
        share: Number(signal.metrics.share) || 0,
        impressions: Number(signal.metrics.impressions) || 0,
    })
}

/**
 * R4: signals from one weekly cannibalization finding. Only fires when at
 * least two of the competing pages are our blog posts with a real stake in
 * the query, and only on the NON-owner posts — the owner is where the
 * query should consolidate. Operator and brand queries never signal.
 */
export function signalsFromCannibalizationFinding(
    finding: CannibalizationFinding,
    now: Date
): Array<{ blogPostId: string; signal: RefreshSignal }> {
    if (isIgnorableCannibalizationQuery(finding.query)) return []

    const blogPages = finding.pages.filter(
        (page) => page.blogPostId && hasMeaningfulStake(page)
    )
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
 * Clicks per window a CTR-gap signal leaves on the table. Read from the
 * recorded metric; derived from CTR and impressions for signals stored
 * before the metric existed.
 */
function ctrGapClicks(metrics: RefreshSignal['metrics']): number {
    const recorded = Number(metrics.clickGap)
    if (Number.isFinite(recorded) && recorded > 0) return recorded

    const impressions = Number(metrics.impressions) || 0
    const expectedCtr = Number(metrics.expectedCtr) || 0
    const ctr = Number(metrics.ctr) || 0
    return Math.max(0, Math.round(impressions * (expectedCtr - ctr)))
}

/**
 * Queue priority from a candidate's accumulated signals (plan §0):
 * `log10(impressions₂₈d + 10) × max(driftAdjustedDrop, 0)` for a position
 * drop, `log10(clickGap + 1) × CTR_GAP_SCORE_WEIGHT` for a CTR gap, a
 * staleness bonus, and flat bonuses for the non-metric sources. Manual
 * requests always outrank detected decay.
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
                score +=
                    Math.log10(ctrGapClicks(signal.metrics) + 1) *
                    CTR_GAP_SCORE_WEIGHT
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
