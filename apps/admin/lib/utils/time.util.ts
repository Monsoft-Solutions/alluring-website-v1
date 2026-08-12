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

/**
 * Format a millisecond duration for display ("45s", "2m 5s", "—" for none)
 * @param ms Duration in milliseconds
 * @returns Human-readable duration
 */
export function formatDurationMs(ms: number): string {
    if (ms <= 0) return '—'

    const totalSeconds = Math.round(ms / 1000)
    if (totalSeconds < 1) return '<1s'
    if (totalSeconds < 60) return `${totalSeconds}s`

    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
}
