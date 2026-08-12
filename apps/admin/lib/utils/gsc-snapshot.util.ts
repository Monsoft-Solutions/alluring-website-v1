/**
 * GSC Snapshot Utilities
 *
 * Pure date and URL helpers for the snapshot sync job (epic #144, #145).
 * Kept free of DB/API access so the catch-up logic is unit-testable.
 *
 * All dates are handled as YYYY-MM-DD strings in UTC — the same shape GSC's
 * searchanalytics API uses for its `date` dimension.
 *
 * @module @/lib/utils/gsc-snapshot.util
 */
import { resolveBlogPathToSlug } from '@workspace/shared'

/**
 * GSC data is final after ~3 days; the sync only pulls dates at or before
 * this offset so stored rows never need revising.
 */
export const GSC_DATA_DELAY_DAYS = 3

/** First pull (empty table) reaches back this many days before the final date. */
export const SNAPSHOT_BACKSTOP_DAYS = 14

/** Cap on dates pulled per run, so a long outage catches up over a few runs. */
export const MAX_DATES_PER_RUN = 30

/** Format a Date as a UTC YYYY-MM-DD string. */
export function toDateString(date: Date): string {
    return date.toISOString().split('T')[0]!
}

/** Add days to a YYYY-MM-DD string (UTC-safe). */
export function addDays(dateString: string, days: number): string {
    const date = new Date(`${dateString}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + days)
    return toDateString(date)
}

/** The newest date GSC considers final (now − GSC_DATA_DELAY_DAYS). */
export function gscFinalDate(now: Date): string {
    const date = new Date(now)
    date.setUTCDate(date.getUTCDate() - GSC_DATA_DELAY_DAYS)
    return toDateString(date)
}

/**
 * Compute which dates a sync run should pull, oldest first.
 *
 * Self-healing by construction: a failed date stays absent from the table,
 * so the next run selects it again. With no stored data the window starts at
 * the backstop; the backfill script is the path for deeper history.
 *
 * @param latestStoredDate - `max(date)` currently in gsc_query_page_daily, or null
 * @param now - Current time (injected for tests)
 * @returns YYYY-MM-DD strings from the day after the latest stored date
 *   through the newest final date, capped at MAX_DATES_PER_RUN
 */
export function computeMissingDates(
    latestStoredDate: string | null,
    now: Date
): string[] {
    const finalDate = gscFinalDate(now)

    const firstMissing = latestStoredDate
        ? addDays(latestStoredDate, 1)
        : addDays(finalDate, -(SNAPSHOT_BACKSTOP_DAYS - 1))

    const dates: string[] = []
    for (
        let date = firstMissing;
        date <= finalDate && dates.length < MAX_DATES_PER_RUN;
        date = addDays(date, 1)
    ) {
        dates.push(date)
    }

    return dates
}

/**
 * Extract the site path from a GSC page URL, normalized the way the sitemap
 * URL registry normalizes paths (trailing slash stripped, root kept as `/`).
 * Returns null for values that don't parse as URLs.
 */
export function extractPathFromPageUrl(pageUrl: string): string | null {
    try {
        const path = new URL(pageUrl).pathname
        return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path
    } catch {
        return null
    }
}

/**
 * Resolve a GSC page URL to a candidate blog slug (both URL shapes), or null
 * for non-post paths. Callers must verify the slug against real posts.
 */
export function resolvePageUrlToSlugCandidate(pageUrl: string): string | null {
    const path = extractPathFromPageUrl(pageUrl)
    if (!path) return null
    return resolveBlogPathToSlug(path)
}
