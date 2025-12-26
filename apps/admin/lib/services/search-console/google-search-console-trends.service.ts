/**
 * Google Search Console Trends Service
 *
 * Fetches performance trend data for charting.
 *
 * @module @/lib/services/search-console/google-search-console-trends
 */
import type { SearchTrend } from '@/lib/types/search-console/search-console.type'

import { isSearchConsoleConfigured } from './google-search-console-client.service'
import {
    fetchSearchAnalytics,
    sortByDateAsc,
    DEFAULT_DAYS,
} from './google-search-console-utils.service'

/**
 * Get daily performance trend for charting
 */
export async function getPerformanceTrend(
    days: number = DEFAULT_DAYS
): Promise<SearchTrend[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const rows = await fetchSearchAnalytics({
            dimensions: ['date'],
            rowLimit: days,
            days,
        })

        const sortedRows = sortByDateAsc(rows)

        return sortedRows.map((row) => ({
            date: row.keys?.[0] ?? '',
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
        }))
    } catch (error) {
        console.error('Error fetching performance trend:', error)
        throw error
    }
}
