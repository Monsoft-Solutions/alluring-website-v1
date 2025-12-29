/**
 * Duration Utility
 *
 * Utilities for formatting durations, particularly for video SEO.
 *
 * @module lib/utils/duration
 */

/**
 * Convert seconds to ISO 8601 duration format
 *
 * Used for VideoObject schema's duration property.
 * Format: PT#H#M#S (e.g., PT1H30M, PT5M30S, PT45S)
 *
 * @param seconds - Duration in seconds
 * @returns ISO 8601 duration string
 *
 * @example
 * formatSecondsToISO8601(90)  // "PT1M30S"
 * formatSecondsToISO8601(3661) // "PT1H1M1S"
 * formatSecondsToISO8601(45)  // "PT45S"
 */
export function formatSecondsToISO8601(seconds: number): string {
    if (seconds <= 0) return 'PT0S'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    let result = 'PT'

    if (hours > 0) {
        result += `${hours}H`
    }

    if (minutes > 0) {
        result += `${minutes}M`
    }

    if (secs > 0 || result === 'PT') {
        result += `${secs}S`
    }

    return result
}
