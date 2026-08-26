/**
 * Refresh Outcome Rules
 *
 * Pure verdict math for the 28-day before/after measurement of an applied
 * refresh (epic #144 Phase 5). IO lives in refresh-outcome.service; this
 * module is deliberately free of it so the boundaries are testable.
 *
 * A verdict only fires when exactly one direction signals: a refresh that
 * gained clicks while its drift-adjusted position worsened (or vice versa)
 * is `flat` — conflicting evidence must not trigger digest alarms or
 * rollback suggestions.
 *
 * @module @/lib/utils/refresh-outcome.util
 */
import type { RefreshOutcome } from '@workspace/db/types'

/** Window length (days) on each side of the apply date. */
export const OUTCOME_WINDOW_DAYS = 28

/**
 * Below this many impressions summed across both windows the percentages
 * are noise — the verdict stays `flat` regardless of movement.
 */
export const OUTCOME_MIN_TOTAL_IMPRESSIONS = 100

/** Relative click movement that counts (±10%). */
export const OUTCOME_CLICKS_RATIO = 0.1

/**
 * Clicks must also move by this many absolute clicks — a 0 → 1 "increase"
 * passes any ratio test but means nothing.
 */
export const OUTCOME_MIN_CLICKS_DELTA = 5

/** Drift-adjusted weighted-position movement that counts (rank points). */
export const OUTCOME_POSITION_DELTA = 1.0

/** One window's aggregates (shape of getPostWindowAggregates rows). */
export type OutcomeWindowMetrics = {
    clicks: number
    impressions: number
    /** Impression-weighted average position; null when no impressions. */
    position: number | null
}

const round2 = (value: number): number => Math.round(value * 100) / 100

/** Float guard for the inclusive boundaries: 50 × 1.1 is 55.000000000000007. */
const EPSILON = 1e-9

/**
 * Score an applied refresh: before vs after, with the site-median position
 * delta over the same windows subtracted so a core update that moves the
 * whole site doesn't read as a refresh outcome (same drift guard as decay
 * rule R1).
 */
export function computeRefreshOutcome(
    before: OutcomeWindowMetrics,
    after: OutcomeWindowMetrics,
    siteMedianPositionDelta: number
): RefreshOutcome {
    const clicksImproved =
        after.clicks >= before.clicks * (1 + OUTCOME_CLICKS_RATIO) - EPSILON &&
        after.clicks - before.clicks >= OUTCOME_MIN_CLICKS_DELTA
    const clicksDeclined =
        after.clicks <= before.clicks * (1 - OUTCOME_CLICKS_RATIO) + EPSILON &&
        before.clicks - after.clicks >= OUTCOME_MIN_CLICKS_DELTA

    // Position is only comparable when both windows actually ranked.
    const adjustedPositionDelta =
        before.position !== null && after.position !== null
            ? after.position - before.position - siteMedianPositionDelta
            : null
    const positionImproved =
        adjustedPositionDelta !== null &&
        adjustedPositionDelta <= -OUTCOME_POSITION_DELTA
    const positionDeclined =
        adjustedPositionDelta !== null &&
        adjustedPositionDelta >= OUTCOME_POSITION_DELTA

    const improvedSignal = clicksImproved || positionImproved
    const declinedSignal = clicksDeclined || positionDeclined
    const hasEnoughData =
        before.impressions + after.impressions >= OUTCOME_MIN_TOTAL_IMPRESSIONS

    let verdict: RefreshOutcome['verdict'] = 'flat'
    if (hasEnoughData) {
        if (improvedSignal && !declinedSignal) verdict = 'improved'
        else if (declinedSignal && !improvedSignal) verdict = 'declined'
    }

    return {
        before: {
            clicks: before.clicks,
            impressions: before.impressions,
            avgPosition: round2(before.position ?? 0),
        },
        after: {
            clicks: after.clicks,
            impressions: after.impressions,
            avgPosition: round2(after.position ?? 0),
        },
        siteMedianPositionDelta: round2(siteMedianPositionDelta),
        verdict,
    }
}
