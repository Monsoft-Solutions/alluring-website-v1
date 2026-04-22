import type { Granularity } from '@/lib/types/analytics/lead-trends.type'

/**
 * Date range preset values for analytics filtering.
 *
 * - `today`: From midnight today
 * - `yesterday`: Yesterday only
 * - `7d`: Last 7 days
 * - `28d`: Last 28 days
 * - `90d`: Last 3 months
 * - `custom`: User-defined date range
 */
export type DateRangePreset =
    | 'today'
    | 'yesterday'
    | '7d'
    | '28d'
    | '90d'
    | 'custom'

/**
 * Date range preset configuration with label and days value.
 */
export type DateRangeOption = {
    value: DateRangePreset
    label: string
    days: number
}

/**
 * Available date range options for the selector.
 */
export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
    { value: 'today', label: 'Today', days: 0 },
    { value: 'yesterday', label: 'Yesterday', days: 1 },
    { value: '7d', label: 'Last 7 days', days: 7 },
    { value: '28d', label: 'Last 28 days', days: 28 },
    { value: '90d', label: 'Last 3 months', days: 90 },
    { value: 'custom', label: 'Custom…', days: 0 },
]

/**
 * Default date range preset.
 */
export const DEFAULT_DATE_RANGE: DateRangePreset = '7d'

/**
 * Get the number of days for a given preset.
 *
 * @param preset - The date range preset
 * @returns Number of days for the preset
 */
export function getDaysFromPreset(preset: DateRangePreset): number {
    const option = DATE_RANGE_OPTIONS.find((opt) => opt.value === preset)
    return option?.days ?? 7
}

/**
 * Get the label for a given preset.
 *
 * @param preset - The date range preset
 * @returns Human-readable label for the preset
 */
export function getLabelFromPreset(preset: DateRangePreset): string {
    const option = DATE_RANGE_OPTIONS.find((opt) => opt.value === preset)
    return option?.label ?? 'Last 7 days'
}

/**
 * Calculate start and end dates for a given preset.
 *
 * @param preset - The date range preset
 * @returns Object with startDate and endDate
 */
export function getDateRangeFromPreset(preset: DateRangePreset): {
    startDate: Date
    endDate: Date
} {
    const now = new Date()
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date(now)
    startDate.setHours(0, 0, 0, 0)

    switch (preset) {
        case 'today':
            // Start and end are both today
            break
        case 'yesterday':
            startDate.setDate(startDate.getDate() - 1)
            endDate.setDate(endDate.getDate() - 1)
            break
        case '7d':
            startDate.setDate(startDate.getDate() - 6)
            break
        case '28d':
            startDate.setDate(startDate.getDate() - 27)
            break
        case '90d':
            startDate.setDate(startDate.getDate() - 89)
            break
        case 'custom':
            // 'custom' ranges are managed by DateRangeProvider via setCustomRange.
            // When called directly, fall back to the default 7-day range.
            startDate.setDate(startDate.getDate() - 6)
            break
    }

    return { startDate, endDate }
}

/**
 * Pick a chart granularity from a date range.
 *   - 0–1 day inclusive  → 'hour'
 *   - 2–30 days          → 'day'
 *   - > 30 days          → 'week'
 */
export function deriveGranularityFromRange(
    startDate: Date,
    endDate: Date
): Granularity {
    const diffDays =
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays <= 1) return 'hour'
    if (diffDays <= 30) return 'day'
    return 'week'
}
