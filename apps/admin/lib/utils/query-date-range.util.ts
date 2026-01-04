/**
 * Shared date range utility for dashboard queries.
 *
 * Provides consistent date calculation across all query functions,
 * handling special cases like "yesterday only" correctly.
 */

export type QueryDateRange = {
    /** Date object for Drizzle ORM queries */
    startDate: Date
    /** Date object for Drizzle ORM queries */
    endDate: Date
    /** ISO string for raw SQL queries */
    startDateStr: string
    /** ISO string for raw SQL queries */
    endDateStr: string
}

/**
 * Calculate start and end dates for a given days parameter.
 *
 * @param days - Number of days to query:
 *   - 0 = Today only
 *   - 1 = Yesterday only
 *   - 7 = Last 7 days (includes today)
 *   - 28 = Last 28 days (includes today)
 *   - 90 = Last 90 days (includes today)
 *
 * @returns Object with startDate, endDate (Date objects for ORM) and
 *          startDateStr, endDateStr (ISO strings for raw SQL)
 */
export function getQueryDateRange(days: number): QueryDateRange {
    const now = new Date()
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)

    if (days === 0) {
        // Today only - no change needed
    } else if (days === 1) {
        // Yesterday only - both start and end go back 1 day
        startDate.setDate(startDate.getDate() - 1)
        endDate.setDate(endDate.getDate() - 1)
    } else {
        // Last N days (includes today)
        startDate.setDate(startDate.getDate() - (days - 1))
    }

    return {
        startDate,
        endDate,
        startDateStr: startDate.toISOString(),
        endDateStr: endDate.toISOString(),
    }
}
