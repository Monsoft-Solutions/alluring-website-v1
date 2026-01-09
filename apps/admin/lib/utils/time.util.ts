/**
 * Calculate duration in milliseconds between two ISO date strings
 * @param startIso ISO date string for start time
 * @param endIso ISO date string for end time
 * @returns Duration in milliseconds, or 0 if invalid
 */
export function calculateDuration(
    startIso: string | undefined | null,
    endIso: string | undefined | null
): number {
    if (!startIso || !endIso) return 0

    const start = new Date(startIso).getTime()
    const end = new Date(endIso).getTime()

    if (isNaN(start) || isNaN(end)) return 0

    return Math.max(0, end - start)
}
