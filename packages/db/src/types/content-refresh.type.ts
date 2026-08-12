/**
 * Content Refresh Types
 *
 * JSONB payload types for the content_refresh table (epic #144) — the
 * lifecycle record that carries a post from a decay signal through an
 * in-place refresh to a measured outcome.
 *
 * @module packages/db/src/types/content-refresh.type
 */

/**
 * Where a refresh signal came from.
 *
 * - `position-drop` / `ctr-gap` / `stale-age`: the decay rules (#147).
 * - `cannibalization`: a weekly report finding involving ≥2 blog posts.
 * - `ideation-gate`: an autopilot ideation topic judged `refresh` by the
 *   ownership gate.
 * - `manual`: queued by an admin (or any external process).
 */
export type RefreshSignalSource =
    | 'position-drop'
    | 'ctr-gap'
    | 'stale-age'
    | 'cannibalization'
    | 'ideation-gate'
    | 'manual'

/**
 * One detection signal on a refresh candidate. Signals accumulate on the
 * active row — a post can decay in several ways at once.
 */
export type RefreshSignal = {
    source: RefreshSignalSource
    /** ISO timestamp of when the signal was detected. */
    detectedAt: string
    /** The triggering metric, e.g. positionDrop, windows, impressions. */
    metrics: Record<string, number | string>
}

/**
 * The brief a refresh run hands to the pipeline (built at execution start,
 * Phase 4 of the plan). Stored here so the queue row is self-describing.
 */
export type RefreshBrief = {
    reasons: string[]
    topQueries: {
        query: string
        impressions: number
        position: number
        positionDelta: number
        ctr: number
    }[]
    /** Queries earning impressions that the content doesn't cover yet. */
    risingQueriesNotCovered: string[]
    decayedQueries: string[]
    cannibalizationContext?: string
    staleness: {
        publishedAt: string | null
        lastUpdatedAt: string | null
        ageMonths: number
    }
    instructions: string[]
}

/**
 * Before/after comparison measured 28 days after an applied refresh.
 */
export type RefreshOutcome = {
    before: { clicks: number; impressions: number; avgPosition: number }
    after: { clicks: number; impressions: number; avgPosition: number }
    /** Site-median position delta over the same windows (drift guard). */
    siteMedianPositionDelta: number
    verdict: 'improved' | 'flat' | 'declined'
}
