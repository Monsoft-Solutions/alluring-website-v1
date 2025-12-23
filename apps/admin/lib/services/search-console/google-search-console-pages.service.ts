/**
 * Google Search Console Pages Service
 *
 * Fetches page-related data from Search Console.
 *
 * @module @/lib/services/search-console/google-search-console-pages
 */
import type {
    SearchPage,
    SortField,
    SortDirection,
    PageQueryData,
    QueryPageData,
} from '@/lib/types/search-console/search-console.type'

import {
    isSearchConsoleConfigured,
    getSearchConsoleClient,
    getSiteUrl,
} from './google-search-console-client.service'
import {
    fetchSearchAnalytics,
    sortRowsByField,
    sortByClicksDesc,
    getDateRange,
    DEFAULT_DAYS,
    DEFAULT_LIMIT,
} from './google-search-console-utils.service'

/**
 * Get top pages with search performance metrics
 */
export async function getTopPages(
    days: number = DEFAULT_DAYS,
    limit: number = DEFAULT_LIMIT,
    orderBy: SortField = 'clicks',
    orderDirection: SortDirection = 'desc'
): Promise<SearchPage[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const rows = await fetchSearchAnalytics({
            dimensions: ['page'],
            rowLimit: limit * 2, // Fetch more to allow for sorting
            days,
        })

        const sortedRows = sortRowsByField(rows, orderBy, orderDirection)

        return sortedRows.slice(0, limit).map((row) => ({
            page: row.keys?.[0] ?? '',
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
        }))
    } catch (error) {
        console.error('Error fetching top pages:', error)
        throw error
    }
}

/**
 * Get all queries driving traffic to a specific page
 * Used for the Page Deep Dive feature
 */
export async function getQueriesForPage(
    pageUrl: string,
    days: number = DEFAULT_DAYS,
    limit: number = 100
): Promise<PageQueryData[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const client = getSearchConsoleClient()
        const siteUrl = getSiteUrl()
        const { startDate, endDate } = getDateRange(days)

        const response = await client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['query'],
                dimensionFilterGroups: [
                    {
                        filters: [
                            {
                                dimension: 'page',
                                operator: 'equals',
                                expression: pageUrl,
                            },
                        ],
                    },
                ],
                rowLimit: limit,
            },
        })

        const rows = response.data.rows ?? []
        const sortedRows = sortByClicksDesc(rows)

        return sortedRows.map((row) => ({
            query: row.keys?.[0] ?? '',
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
        }))
    } catch (error) {
        console.error('Error fetching queries for page:', error)
        throw error
    }
}

/**
 * Get all pages ranking for a specific query
 * Used to understand which pages compete for a query
 *
 * @param query - The exact query to search for
 * @param days - Number of days to analyze (default: 28)
 * @param limit - Maximum number of pages (default: 25)
 */
export async function getPagesForQuery(
    query: string,
    days: number = DEFAULT_DAYS,
    limit: number = 25
): Promise<QueryPageData[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const client = getSearchConsoleClient()
        const siteUrl = getSiteUrl()
        const { startDate, endDate } = getDateRange(days)

        const response = await client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['page'],
                dimensionFilterGroups: [
                    {
                        filters: [
                            {
                                dimension: 'query',
                                operator: 'equals',
                                expression: query,
                            },
                        ],
                    },
                ],
                rowLimit: limit,
            },
        })

        const rows = response.data.rows ?? []
        const sortedRows = sortByClicksDesc(rows)

        return sortedRows.map((row) => ({
            page: row.keys?.[0] ?? '',
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
        }))
    } catch (error) {
        console.error('Error fetching pages for query:', error)
        throw error
    }
}
