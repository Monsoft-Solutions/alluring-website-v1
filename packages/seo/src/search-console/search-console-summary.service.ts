/**
 * Google Search Console Summary Service
 *
 * Fetches aggregated summary statistics from Search Console.
 *
 * @module @workspace/seo/search-console — summary
 */
import type { SearchConsoleSummary } from './search-console.type.js'

import { isSearchConsoleConfigured } from './search-console-client.service.js'
import {
    DEFAULT_DAYS,
    fetchSearchAnalytics,
} from './search-console-analytics.util.js'

/**
 * Get summary statistics from Search Console
 */
export async function getSearchConsoleSummary(
    days: number = DEFAULT_DAYS
): Promise<SearchConsoleSummary> {
    if (!isSearchConsoleConfigured()) {
        return {
            totalClicks: 0,
            totalImpressions: 0,
            avgCtr: 0,
            avgPosition: 0,
            topQuery: null,
            periodDays: days,
        }
    }

    try {
        // Fetch aggregated data without dimensions for totals
        const aggregatedRows = await fetchSearchAnalytics({
            dimensions: [], // No dimensions = aggregated totals
            days,
        })

        // Fetch top query
        const topQueryRows = await fetchSearchAnalytics({
            dimensions: ['query'],
            rowLimit: 1,
            days,
        })

        const aggregatedRow = aggregatedRows[0]
        const topQueryRow = topQueryRows[0]

        return {
            totalClicks: aggregatedRow?.clicks ?? 0,
            totalImpressions: aggregatedRow?.impressions ?? 0,
            avgCtr: aggregatedRow?.ctr ?? 0,
            avgPosition: aggregatedRow?.position ?? 0,
            topQuery: topQueryRow?.keys?.[0] ?? null,
            periodDays: days,
        }
    } catch (error) {
        console.error('Error fetching Search Console summary:', error)
        throw error
    }
}
