/**
 * Google Search Console Summary Service
 *
 * Fetches aggregated summary statistics from Search Console.
 *
 * @module @/lib/services/search-console/google-search-console-summary
 */
import type { SearchConsoleSummary } from '@/lib/types/search-console/search-console.type'

import {
    isSearchConsoleConfigured,
    getSearchConsoleClient,
    getSiteUrl,
} from './google-search-console-client.service'
import {
    getDateRange,
    DEFAULT_DAYS,
} from './google-search-console-utils.service'

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
        const client = getSearchConsoleClient()
        const siteUrl = getSiteUrl()
        const { startDate, endDate } = getDateRange(days)

        const aggregatedResponse = await client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: [], // No dimensions = aggregated totals
            },
        })

        // Fetch top query
        const topQueryResponse = await client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['query'],
                rowLimit: 1,
            },
        })

        const aggregatedRow = aggregatedResponse.data.rows?.[0]
        const topQueryRow = topQueryResponse.data.rows?.[0]

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
