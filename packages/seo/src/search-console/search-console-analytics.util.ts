/**
 * Google Search Console Utilities
 *
 * Shared utilities for date calculations, sorting, and data fetching.
 *
 * @module @workspace/seo/search-console — utils
 */
import type { searchconsole_v1 } from 'googleapis'

import type { SortDirection } from './search-console.type.js'
import type { SortField } from './search-console.type.js'

import {
    getSearchConsoleClient,
    getSiteUrl,
} from './search-console-client.service.js'

/** Default number of days for queries */
export const DEFAULT_DAYS = 28

/** Default result limit */
export const DEFAULT_LIMIT = 25

/** CTR benchmark for opportunity calculations (5%) */
export const BENCHMARK_CTR = 0.05

/** Minimum impressions to be considered an opportunity */
export const MIN_IMPRESSIONS_FOR_OPPORTUNITY = 50

/**
 * Calculate date range for queries
 * Note: Search Console data has a 2-3 day delay
 */
export function getDateRange(days: number): {
    startDate: string
    endDate: string
} {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - 3) // Account for data delay

    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    return {
        startDate: startDate.toISOString().split('T')[0]!,
        endDate: endDate.toISOString().split('T')[0]!,
    }
}

/** Row type from Search Console API response */
export type SearchAnalyticsRow = {
    keys?: string[] | null
    clicks?: number | null
    impressions?: number | null
    ctr?: number | null
    position?: number | null
}

/** Maximum rows per request accepted by the Search Console API */
export const GSC_MAX_ROW_LIMIT = 25000

/** Options accepted by fetchSearchAnalytics */
export type SearchAnalyticsOptions = {
    dimensions: ('query' | 'page' | 'date')[]
    dimensionFilterGroups?: searchconsole_v1.Schema$ApiDimensionFilterGroup[]
    rowLimit?: number
    startRow?: number
    days?: number
    startDate?: string
    endDate?: string
}

/**
 * Fetch search analytics data from Google Search Console.
 * Returns a single page of at most `rowLimit` rows starting at `startRow`;
 * use fetchAllSearchAnalytics for site-wide pulls that may exceed one page.
 */
export async function fetchSearchAnalytics(
    options: SearchAnalyticsOptions
): Promise<SearchAnalyticsRow[]> {
    const client = getSearchConsoleClient()
    const siteUrl = getSiteUrl()

    let startDate: string
    let endDate: string

    if (options.startDate && options.endDate) {
        startDate = options.startDate
        endDate = options.endDate
    } else {
        const range = getDateRange(options.days ?? DEFAULT_DAYS)
        startDate = range.startDate
        endDate = range.endDate
    }

    const response = await client.searchanalytics.query({
        siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: options.dimensions,
            dimensionFilterGroups: options.dimensionFilterGroups,
            rowLimit: options.rowLimit ?? DEFAULT_LIMIT,
            ...(options.startRow ? { startRow: options.startRow } : {}),
        },
    })

    return response.data.rows ?? []
}

/**
 * Fetch search analytics data across multiple pages via startRow pagination.
 * Keeps requesting full pages of `rowLimit` (default: the API max of 25,000)
 * until a short page signals the end of the result set or `maxRows` is hit.
 *
 * @param options - Same as fetchSearchAnalytics minus paging fields
 * @param maxRows - Safety cap on total rows fetched (default 100,000)
 */
export async function fetchAllSearchAnalytics(
    options: Omit<SearchAnalyticsOptions, 'startRow'>,
    maxRows: number = 100000
): Promise<SearchAnalyticsRow[]> {
    const rowLimit = Math.min(options.rowLimit ?? GSC_MAX_ROW_LIMIT, maxRows)
    const rows: SearchAnalyticsRow[] = []

    let startRow = 0
    for (;;) {
        const page = await fetchSearchAnalytics({
            ...options,
            rowLimit: Math.min(rowLimit, maxRows - rows.length),
            startRow,
        })
        rows.push(...page)

        if (page.length < rowLimit || rows.length >= maxRows) break
        startRow += page.length
    }

    return rows.slice(0, maxRows)
}

/**
 * Sort rows by the specified field and direction
 * Extracted to avoid code duplication across query functions
 */
export function sortRowsByField(
    rows: SearchAnalyticsRow[],
    orderBy: SortField,
    orderDirection: SortDirection
): SearchAnalyticsRow[] {
    return [...rows].sort((a, b) => {
        let comparison: number
        switch (orderBy) {
            case 'clicks':
                comparison = (b.clicks ?? 0) - (a.clicks ?? 0)
                break
            case 'impressions':
                comparison = (b.impressions ?? 0) - (a.impressions ?? 0)
                break
            case 'ctr':
                comparison = (b.ctr ?? 0) - (a.ctr ?? 0)
                break
            case 'position':
                // For position, lower is better, so default desc means best first
                comparison = (a.position ?? 0) - (b.position ?? 0)
                break
            default:
                comparison = (b.clicks ?? 0) - (a.clicks ?? 0)
        }
        return orderDirection === 'asc' ? -comparison : comparison
    })
}

/**
 * Sort rows by clicks descending (common pattern)
 */
export function sortByClicksDesc(
    rows: SearchAnalyticsRow[]
): SearchAnalyticsRow[] {
    return [...rows].sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0))
}

/**
 * Sort rows by date ascending (for charts)
 */
export function sortByDateAsc(
    rows: SearchAnalyticsRow[]
): SearchAnalyticsRow[] {
    return [...rows].sort((a, b) => {
        const dateA = a.keys?.[0] ?? ''
        const dateB = b.keys?.[0] ?? ''
        return dateA.localeCompare(dateB)
    })
}
