/**
 * Google Search Console Pages Service
 *
 * Fetches page-related data from Search Console.
 *
 * @module @/lib/services/search-console/google-search-console-pages
 */
import type { SortDirection } from '@/lib/types/shared/sorting.type'
import type {
    SearchPage,
    SortField,
    PageQueryData,
    QueryPageData,
    PageType,
    SearchPageWithType,
    PageTrendData,
} from '@/lib/types/search-console/search-console.type'

import { isSearchConsoleConfigured } from './google-search-console-client.service'
import {
    fetchSearchAnalytics,
    sortRowsByField,
    sortByClicksDesc,
    sortByDateAsc,
    DEFAULT_DAYS,
    DEFAULT_LIMIT,
} from './google-search-console-utils.service'
import { classifyPagesBySitemap } from '@/lib/services/sitemap/url-registry.service'

/**
 * Extract path from a full URL
 */
export function extractPath(url: string): string {
    try {
        return new URL(url).pathname || '/'
    } catch {
        return url
    }
}

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
        const rows = await fetchSearchAnalytics({
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
            days,
        })

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
        const rows = await fetchSearchAnalytics({
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
            days,
        })

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

// ============================================================================
// Page Search and Trend Functions
// ============================================================================

/**
 * Search pages with optional filtering by term and page type
 *
 * Uses sitemap-based classification for accurate page type detection,
 * especially for blog posts that live at root level (e.g., /best-plastic-surgeon-miami).
 *
 * @param term - Optional search term to filter pages by path
 * @param pageType - Optional page type filter
 * @param days - Number of days to analyze (default: 28)
 * @param limit - Maximum number of pages (default: 100)
 * @param orderBy - Sort field (default: 'clicks')
 * @param orderDirection - Sort direction (default: 'desc')
 */
export async function searchPages(
    term: string = '',
    pageType: PageType | 'all' = 'all',
    days: number = DEFAULT_DAYS,
    limit: number = 100,
    orderBy: SortField = 'clicks',
    orderDirection: SortDirection = 'desc'
): Promise<SearchPageWithType[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        // Fetch more rows to allow for filtering and sorting
        const rows = await fetchSearchAnalytics({
            dimensions: ['page'],
            rowLimit: 500,
            days,
        })

        // Extract page URLs for batch classification
        const pageUrls = rows.map((row) => row.keys?.[0] ?? '')

        // Classify all pages in a single batch (more efficient than individual calls)
        const pageTypes = await classifyPagesBySitemap(pageUrls)

        // Map to SearchPageWithType with classified page types
        let pages: SearchPageWithType[] = rows.map((row, index) => {
            const pageUrl = row.keys?.[0] ?? ''
            return {
                page: pageUrl,
                path: extractPath(pageUrl),
                pageType: pageTypes[index] ?? 'other',
                clicks: row.clicks ?? 0,
                impressions: row.impressions ?? 0,
                ctr: row.ctr ?? 0,
                position: row.position ?? 0,
            }
        })

        // Filter by search term (matches path)
        if (term.trim()) {
            const lowerTerm = term.toLowerCase()
            pages = pages.filter((p) =>
                p.path.toLowerCase().includes(lowerTerm)
            )
        }

        // Filter by page type
        if (pageType !== 'all') {
            pages = pages.filter((p) => p.pageType === pageType)
        }

        // Sort by the specified field
        pages.sort((a, b) => {
            let comparison: number
            switch (orderBy) {
                case 'clicks':
                    comparison = b.clicks - a.clicks
                    break
                case 'impressions':
                    comparison = b.impressions - a.impressions
                    break
                case 'ctr':
                    comparison = b.ctr - a.ctr
                    break
                case 'position':
                    // For position, lower is better
                    comparison = a.position - b.position
                    break
                default:
                    comparison = b.clicks - a.clicks
            }
            return orderDirection === 'asc' ? -comparison : comparison
        })

        return pages.slice(0, limit)
    } catch (error) {
        console.error('Error searching pages:', error)
        throw error
    }
}

/**
 * Get historical performance trend for a specific page
 *
 * @param pageUrl - The full URL of the page
 * @param days - Number of days to fetch (default: 28)
 */
export async function getPageTrend(
    pageUrl: string,
    days: number = DEFAULT_DAYS
): Promise<PageTrendData[]> {
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
                            dimension: 'page',
                            operator: 'equals',
                            expression: pageUrl,
                        },
                    ],
                },
            ],
            rowLimit: days + 5, // Extra buffer for any missing days
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
        console.error('Error fetching page trend:', error)
        throw error
    }
}
