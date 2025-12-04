/**
 * Shared Date Utilities
 *
 * Provides consistent date formatting across analytics and stats queries.
 * Uses local timezone to match database DATE() function behavior.
 *
 * @module lib/utils/date
 */

/**
 * Format a date as YYYY-MM-DD in local timezone.
 *
 * Uses local date components instead of toISOString() to avoid
 * timezone mismatch with database DATE() function which operates
 * in the database's timezone.
 *
 * @param date - The date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatLocalDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * Daily count type for time series data
 */
export type DailyCount = {
    date: string
    count: number
}

/**
 * Daily view count type for analytics time series
 */
export type DailyViewCount = {
    date: string
    views: number
    sessions: number
}

/**
 * Fill in missing dates with zero values for simple count data.
 *
 * Ensures continuous date series for charts by filling gaps with zeros.
 * Uses local date formatting to match database DATE() results.
 *
 * @param results - Query results with date and count
 * @param days - Number of days to fill
 * @returns Complete array with all dates filled
 */
export function fillMissingDatesSimple(
    results: { date: string | null; count: number }[],
    days: number
): DailyCount[] {
    const dateMap = new Map(
        results
            .filter(
                (r): r is { date: string; count: number } => r.date !== null
            )
            .map((r) => [r.date, r.count])
    )
    const filledResults: DailyCount[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = formatLocalDate(date)
        filledResults.push({
            date: dateStr,
            count: dateMap.get(dateStr) ?? 0,
        })
    }

    return filledResults
}

/**
 * Fill in missing dates with zero values for view/session data.
 *
 * Similar to fillMissingDatesSimple but handles views and sessions fields.
 * Uses local date formatting to match database DATE() results.
 *
 * @param results - Query results with date, views, and sessions
 * @param days - Number of days to fill
 * @returns Complete array with all dates filled
 */
export function fillMissingDatesWithViews(
    results: { date: string | null; views: number; sessions: number }[],
    days: number
): DailyViewCount[] {
    const dateMap = new Map(
        results
            .filter(
                (r): r is { date: string; views: number; sessions: number } =>
                    r.date !== null
            )
            .map((r) => [r.date, { views: r.views, sessions: r.sessions }])
    )

    const filledResults: DailyViewCount[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = formatLocalDate(date)
        const data = dateMap.get(dateStr)
        filledResults.push({
            date: dateStr,
            views: data?.views ?? 0,
            sessions: data?.sessions ?? 0,
        })
    }

    return filledResults
}
