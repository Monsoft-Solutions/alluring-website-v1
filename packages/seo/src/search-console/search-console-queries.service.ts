/**
 * Google Search Console Queries Service
 *
 * Fetches query-related data from Search Console.
 *
 * @module @workspace/seo/search-console — queries
 */
import type { SortDirection } from './search-console.type.js'
import type {
    SearchQuery,
    SortField,
    QueryTrendData,
} from './search-console.type.js'

import { isSearchConsoleConfigured } from './search-console-client.service.js'
import {
    fetchSearchAnalytics,
    sortRowsByField,
    sortByDateAsc,
    DEFAULT_DAYS,
    DEFAULT_LIMIT,
} from './search-console-analytics.util.js'

/**
 * Get top search queries with performance metrics
 */
export async function getTopQueries(
    days: number = DEFAULT_DAYS,
    limit: number = DEFAULT_LIMIT,
    orderBy: SortField = 'clicks',
    orderDirection: SortDirection = 'desc'
): Promise<SearchQuery[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const rows = await fetchSearchAnalytics({
            dimensions: ['query'],
            rowLimit: limit * 2, // Fetch more to allow for sorting
            days,
        })

        const sortedRows = sortRowsByField(rows, orderBy, orderDirection)

        return sortedRows.slice(0, limit).map((row) => ({
            query: row.keys?.[0] ?? '',
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
        }))
    } catch (error) {
        console.error('Error fetching top queries:', error)
        throw error
    }
}

/**
 * Search queries by term using contains filter
 * Returns queries matching the search term with performance metrics
 *
 * @param searchTerm - The term to search for (case-insensitive contains match)
 * @param days - Number of days to analyze (default: 28)
 * @param limit - Maximum number of results (default: 50)
 * @param orderBy - Field to sort by (default: 'clicks')
 * @param orderDirection - Sort direction (default: 'desc')
 */
export async function getQueriesByTerm(
    searchTerm: string,
    days: number = DEFAULT_DAYS,
    limit: number = 50,
    orderBy: SortField = 'clicks',
    orderDirection: SortDirection = 'desc'
): Promise<SearchQuery[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    // If no search term, return top queries
    if (!searchTerm.trim()) {
        return getTopQueries(days, limit, orderBy, orderDirection)
    }

    try {
        const rows = await fetchSearchAnalytics({
            dimensions: ['query'],
            dimensionFilterGroups: [
                {
                    filters: [
                        {
                            dimension: 'query',
                            operator: 'contains',
                            expression: searchTerm.toLowerCase(),
                        },
                    ],
                },
            ],
            rowLimit: limit * 2, // Fetch more to allow for sorting
            days,
        })

        const sortedRows = sortRowsByField(rows, orderBy, orderDirection)

        return sortedRows.slice(0, limit).map((row) => ({
            query: row.keys?.[0] ?? '',
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
        }))
    } catch (error) {
        console.error('Error searching queries by term:', error)
        throw error
    }
}

/**
 * Get daily performance trend for a specific query
 * Used for tracking query performance over time
 *
 * @param query - The exact query to get trend for
 * @param days - Number of days to analyze (default: 28)
 */
export async function getQueryTrend(
    query: string,
    days: number = DEFAULT_DAYS
): Promise<QueryTrendData[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const rows = await fetchSearchAnalytics({
            dimensions: ['date'],
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
        console.error('Error fetching query trend:', error)
        throw error
    }
}
