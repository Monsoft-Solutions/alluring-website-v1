/**
 * Formatting Utilities
 *
 * @module lib/utils/format
 */

/**
 * Format large numbers with K/M suffix
 *
 * @param num - Number to format
 * @returns Formatted string (e.g., 1.2K, 3.5M)
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}
