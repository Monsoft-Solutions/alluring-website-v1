/**
 * Google Search Console Service
 *
 * Handles authentication and data fetching from Google Search Console API
 * for SEO insights and content opportunity analysis.
 *
 * @module @/lib/services/google-search-console
 */
import { google } from 'googleapis'

import { env } from '@/env'
import type {
    SearchConsoleSummary,
    SearchQuery,
    SearchPage,
    SearchTrend,
    ContentOpportunity,
    PageQueryData,
    PositionChange,
    SitemapInfo,
    UrlInspectionResult,
    QueryPageData,
    QueryTrendData,
    SortField,
    SortDirection,
} from '@/lib/types/search-console/search-console.type'

// Default settings
const DEFAULT_DAYS = 28
const DEFAULT_LIMIT = 25
const BENCHMARK_CTR = 0.05 // 5% CTR benchmark for opportunity calculations
const MIN_IMPRESSIONS_FOR_OPPORTUNITY = 50

/**
 * Check if Google Search Console credentials are configured
 */
export function isSearchConsoleConfigured(): boolean {
    return Boolean(
        env.GOOGLE_CLIENT_EMAIL &&
            env.GOOGLE_PRIVATE_KEY &&
            env.GOOGLE_SEARCH_CONSOLE_SITE_URL
    )
}

/**
 * Get the site URL for Search Console queries
 *
 * Supports both property types:
 * - Domain properties: "sc-domain:example.com"
 * - URL-prefix properties: "https://example.com"
 */
function getSiteUrl(): string {
    const siteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL
    if (!siteUrl) {
        throw new Error('GOOGLE_SEARCH_CONSOLE_SITE_URL is not configured')
    }
    // For URL-prefix properties, remove trailing slash if present
    if (siteUrl.startsWith('http') && siteUrl.endsWith('/')) {
        return siteUrl.slice(0, -1)
    }
    return siteUrl
}

/**
 * Parse the private key to handle escaped newlines
 */
function parsePrivateKey(key: string): string {
    // Handle newlines in the private key (environment variables can escape them)
    return key.replace(/\\n/g, '\n')
}

/**
 * Get an authenticated Search Console client
 * Uses service account credentials for server-to-server authentication
 */
function getSearchConsoleClient() {
    if (!isSearchConsoleConfigured()) {
        throw new Error('Google Search Console credentials are not configured')
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: env.GOOGLE_CLIENT_EMAIL,
            private_key: parsePrivateKey(env.GOOGLE_PRIVATE_KEY!),
        },
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    })

    return google.searchconsole({
        version: 'v1',
        auth,
    })
}

/**
 * Calculate date range for queries
 * Note: Search Console data has a 2-3 day delay
 */
function getDateRange(days: number): { startDate: string; endDate: string } {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - 3) // Account for data delay

    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    return {
        startDate: startDate.toISOString().split('T')[0]!,
        endDate: endDate.toISOString().split('T')[0]!,
    }
}

/**
 * Fetch search analytics data from Google Search Console
 */
async function fetchSearchAnalytics(options: {
    dimensions: ('query' | 'page' | 'date')[]
    rowLimit?: number
    days?: number
    orderBy?: 'clicks' | 'impressions' | 'ctr' | 'position'
    orderDirection?: 'ascending' | 'descending'
}) {
    const client = getSearchConsoleClient()
    const siteUrl = getSiteUrl()
    const { startDate, endDate } = getDateRange(options.days ?? DEFAULT_DAYS)

    const response = await client.searchanalytics.query({
        siteUrl,
        requestBody: {
            startDate,
            endDate,
            dimensions: options.dimensions,
            rowLimit: options.rowLimit ?? DEFAULT_LIMIT,
            ...(options.orderBy &&
                {
                    // Search Console API doesn't support direct orderBy in the way we want
                    // We'll sort results ourselves after fetching
                }),
        },
    })

    return response.data.rows ?? []
}

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

        // Sort by the specified field and direction
        const sortedRows = [...rows].sort((a, b) => {
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

        // Sort by the specified field and direction
        const sortedRows = [...rows].sort((a, b) => {
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

        // Sort by date ascending
        const sortedRows = [...rows].sort((a, b) => {
            const dateA = a.keys?.[0] ?? ''
            const dateB = b.keys?.[0] ?? ''
            return dateA.localeCompare(dateB)
        })

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

/**
 * Get content opportunities - queries with high impressions but low CTR
 * These represent potential content gaps or optimization opportunities
 */
export async function getContentOpportunities(
    days: number = DEFAULT_DAYS,
    limit: number = DEFAULT_LIMIT
): Promise<ContentOpportunity[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const rows = await fetchSearchAnalytics({
            dimensions: ['query'],
            rowLimit: 500, // Fetch more to find opportunities
            days,
        })

        // Filter for opportunities: high impressions, low CTR
        const opportunities = rows
            .filter((row) => {
                const impressions = row.impressions ?? 0
                const ctr = row.ctr ?? 0
                return (
                    impressions >= MIN_IMPRESSIONS_FOR_OPPORTUNITY &&
                    ctr < BENCHMARK_CTR
                )
            })
            .map((row) => {
                const impressions = row.impressions ?? 0
                const clicks = row.clicks ?? 0
                const ctr = row.ctr ?? 0

                // Calculate potential additional clicks if CTR improved to benchmark
                const potentialClicks =
                    Math.round(impressions * BENCHMARK_CTR) - clicks

                // Generate suggestion based on position and CTR
                const position = row.position ?? 0
                let suggestion: string
                if (position > 10) {
                    suggestion = 'Create dedicated content to improve ranking'
                } else if (position > 5) {
                    suggestion =
                        'Optimize existing content and meta descriptions'
                } else {
                    suggestion =
                        'Improve title and meta description for better CTR'
                }

                return {
                    query: row.keys?.[0] ?? '',
                    clicks,
                    impressions,
                    ctr,
                    position,
                    potentialClicks: Math.max(0, potentialClicks),
                    suggestion,
                }
            })
            // Sort by potential clicks descending (highest opportunity first)
            .sort((a, b) => b.potentialClicks - a.potentialClicks)
            .slice(0, limit)

        return opportunities
    } catch (error) {
        console.error('Error fetching content opportunities:', error)
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

        // Sort by clicks descending
        const sortedRows = [...rows].sort(
            (a, b) => (b.clicks ?? 0) - (a.clicks ?? 0)
        )

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
 * Get position changes between two periods
 * Compares current period vs previous period of same length
 */
export async function getPositionChanges(
    days: number = 7,
    limit: number = 20
): Promise<{ winners: PositionChange[]; losers: PositionChange[] }> {
    if (!isSearchConsoleConfigured()) {
        return { winners: [], losers: [] }
    }

    try {
        const client = getSearchConsoleClient()
        const siteUrl = getSiteUrl()

        // Current period
        const currentEnd = new Date()
        currentEnd.setDate(currentEnd.getDate() - 3) // Account for data delay
        const currentStart = new Date(currentEnd)
        currentStart.setDate(currentStart.getDate() - days)

        // Previous period (same length, immediately before current)
        const previousEnd = new Date(currentStart)
        previousEnd.setDate(previousEnd.getDate() - 1)
        const previousStart = new Date(previousEnd)
        previousStart.setDate(previousStart.getDate() - days)

        // Fetch current period data
        const currentResponse = await client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: currentStart.toISOString().split('T')[0]!,
                endDate: currentEnd.toISOString().split('T')[0]!,
                dimensions: ['query'],
                rowLimit: 500,
            },
        })

        // Fetch previous period data
        const previousResponse = await client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate: previousStart.toISOString().split('T')[0]!,
                endDate: previousEnd.toISOString().split('T')[0]!,
                dimensions: ['query'],
                rowLimit: 500,
            },
        })

        const currentRows = currentResponse.data.rows ?? []
        const previousRows = previousResponse.data.rows ?? []

        // Create a map of previous positions
        const previousPositions = new Map<string, number>()
        for (const row of previousRows) {
            const query = row.keys?.[0]
            if (query) {
                previousPositions.set(query, row.position ?? 0)
            }
        }

        // Calculate position changes
        const changes: PositionChange[] = []
        for (const row of currentRows) {
            const query = row.keys?.[0]
            if (!query) continue

            const currentPosition = row.position ?? 0
            const previousPosition = previousPositions.get(query)

            // Only include queries that existed in both periods
            if (previousPosition !== undefined) {
                const delta = currentPosition - previousPosition
                // Negative delta = improved (moved up in rankings)
                // Positive delta = dropped (moved down in rankings)
                changes.push({
                    query,
                    currentPosition,
                    previousPosition,
                    positionDelta: delta,
                    clicks: row.clicks ?? 0,
                    impressions: row.impressions ?? 0,
                })
            }
        }

        // Separate into winners (improved) and losers (dropped)
        // Filter for significant changes (at least 1 position)
        const winners = changes
            .filter((c) => c.positionDelta < -0.5) // Improved by at least 0.5 position
            .sort((a, b) => a.positionDelta - b.positionDelta) // Most improved first
            .slice(0, limit)

        const losers = changes
            .filter((c) => c.positionDelta > 0.5) // Dropped by at least 0.5 position
            .sort((a, b) => b.positionDelta - a.positionDelta) // Biggest drops first
            .slice(0, limit)

        return { winners, losers }
    } catch (error) {
        console.error('Error fetching position changes:', error)
        throw error
    }
}

/**
 * Get submitted sitemaps and their status
 */
export async function getSitemaps(): Promise<SitemapInfo[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const client = getSearchConsoleClient()
        const siteUrl = getSiteUrl()

        const response = await client.sitemaps.list({
            siteUrl,
        })

        const sitemaps = response.data.sitemap ?? []

        return sitemaps.map((sitemap) => ({
            path: sitemap.path ?? '',
            lastSubmitted: sitemap.lastSubmitted ?? null,
            lastDownloaded: sitemap.lastDownloaded ?? null,
            isPending: sitemap.isPending ?? false,
            isSitemapsIndex: sitemap.isSitemapsIndex ?? false,
            type: sitemap.type ?? 'unknown',
            warnings: sitemap.warnings ? Number(sitemap.warnings) : 0,
            errors: sitemap.errors ? Number(sitemap.errors) : 0,
            contents:
                sitemap.contents?.map((c) => ({
                    type: c.type ?? 'unknown',
                    submitted: c.submitted ? Number(c.submitted) : 0,
                    indexed: c.indexed ? Number(c.indexed) : 0,
                })) ?? [],
        }))
    } catch (error) {
        console.error('Error fetching sitemaps:', error)
        throw error
    }
}

/**
 * Submit (or resubmit) a sitemap to Google Search Console
 *
 * This notifies Google that the sitemap should be re-crawled.
 * Note: Uses full webmasters scope (not readonly) for write access.
 *
 * @param sitemapPath - The full URL of the sitemap (e.g., https://example.com/sitemap.xml)
 */
export async function submitSitemap(sitemapPath: string): Promise<void> {
    if (!isSearchConsoleConfigured()) {
        throw new Error('Google Search Console is not configured')
    }

    try {
        // Use full webmasters scope for write operations
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: env.GOOGLE_CLIENT_EMAIL,
                private_key: parsePrivateKey(env.GOOGLE_PRIVATE_KEY!),
            },
            scopes: ['https://www.googleapis.com/auth/webmasters'],
        })

        const client = google.searchconsole({
            version: 'v1',
            auth,
        })

        const siteUrl = getSiteUrl()

        await client.sitemaps.submit({
            siteUrl,
            feedpath: sitemapPath,
        })
    } catch (error) {
        console.error('Error submitting sitemap:', error)
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
                                dimension: 'query',
                                operator: 'contains',
                                expression: searchTerm.toLowerCase(),
                            },
                        ],
                    },
                ],
                rowLimit: limit * 2, // Fetch more to allow for sorting
            },
        })

        const rows = response.data.rows ?? []

        // Sort by the specified field and direction
        const sortedRows = [...rows].sort((a, b) => {
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
                    comparison = (a.position ?? 0) - (b.position ?? 0)
                    break
                default:
                    comparison = (b.clicks ?? 0) - (a.clicks ?? 0)
            }
            return orderDirection === 'asc' ? -comparison : comparison
        })

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

        // Sort by clicks descending (best performing page first)
        const sortedRows = [...rows].sort(
            (a, b) => (b.clicks ?? 0) - (a.clicks ?? 0)
        )

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
        const client = getSearchConsoleClient()
        const siteUrl = getSiteUrl()
        const { startDate, endDate } = getDateRange(days)

        const response = await client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
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
            },
        })

        const rows = response.data.rows ?? []

        // Sort by date ascending for charting
        const sortedRows = [...rows].sort((a, b) => {
            const dateA = a.keys?.[0] ?? ''
            const dateB = b.keys?.[0] ?? ''
            return dateA.localeCompare(dateB)
        })

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

/**
 * Identify content gaps - queries with high impressions but no dedicated page
 * These are opportunities to create new content
 *
 * A content gap is defined as a query where:
 * - The query has significant impressions (>= MIN_IMPRESSIONS_FOR_OPPORTUNITY)
 * - The top-ranking page doesn't contain the query terms in the URL
 *
 * @param days - Number of days to analyze (default: 28)
 * @param limit - Maximum number of results (default: 25)
 */
export async function getContentGaps(
    days: number = DEFAULT_DAYS,
    limit: number = DEFAULT_LIMIT
): Promise<SearchQuery[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    try {
        const client = getSearchConsoleClient()
        const siteUrl = getSiteUrl()
        const { startDate, endDate } = getDateRange(days)

        // Fetch queries with their associated pages
        const response = await client.searchanalytics.query({
            siteUrl,
            requestBody: {
                startDate,
                endDate,
                dimensions: ['query', 'page'],
                rowLimit: 1000, // Fetch more to analyze
            },
        })

        const rows = response.data.rows ?? []

        // Group by query and find the best page for each
        const queryMap = new Map<
            string,
            {
                query: string
                clicks: number
                impressions: number
                ctr: number
                position: number
                topPage: string
            }
        >()

        for (const row of rows) {
            const query = row.keys?.[0] ?? ''
            const page = row.keys?.[1] ?? ''

            if (!query || !page) continue

            const existing = queryMap.get(query)

            // Keep track of the best performing page for each query
            if (!existing || (row.clicks ?? 0) > existing.clicks) {
                queryMap.set(query, {
                    query,
                    clicks: row.clicks ?? 0,
                    impressions: row.impressions ?? 0,
                    ctr: row.ctr ?? 0,
                    position: row.position ?? 0,
                    topPage: page,
                })
            }
        }

        // Filter for content gaps:
        // - Significant impressions
        // - Top page URL doesn't contain query terms (simplified check)
        const contentGaps: SearchQuery[] = []

        for (const data of queryMap.values()) {
            if (data.impressions < MIN_IMPRESSIONS_FOR_OPPORTUNITY) continue

            // Check if the top page URL contains any meaningful query terms
            const queryTerms = data.query
                .toLowerCase()
                .split(/\s+/)
                .filter((term) => term.length > 3) // Skip short words

            const pageUrlLower = data.topPage.toLowerCase()

            // Check if the page seems dedicated to this query
            const hasDedicatedPage = queryTerms.some(
                (term) =>
                    pageUrlLower.includes(term.replace(/[^a-z]/g, '')) ||
                    pageUrlLower.includes(term)
            )

            if (!hasDedicatedPage) {
                contentGaps.push({
                    query: data.query,
                    clicks: data.clicks,
                    impressions: data.impressions,
                    ctr: data.ctr,
                    position: data.position,
                })
            }
        }

        // Sort by impressions descending (biggest opportunity first)
        return contentGaps
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, limit)
    } catch (error) {
        console.error('Error fetching content gaps:', error)
        throw error
    }
}

/**
 * Inspect a URL using the URL Inspection API
 * Note: This has quota limits (2,000 requests/day), use sparingly
 */
export async function inspectUrl(url: string): Promise<UrlInspectionResult> {
    if (!isSearchConsoleConfigured()) {
        throw new Error('Google Search Console is not configured')
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: env.GOOGLE_CLIENT_EMAIL,
                private_key: parsePrivateKey(env.GOOGLE_PRIVATE_KEY!),
            },
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        })

        const searchConsole = google.searchconsole({
            version: 'v1',
            auth,
        })

        const siteUrl = getSiteUrl()

        const response = await searchConsole.urlInspection.index.inspect({
            requestBody: {
                inspectionUrl: url,
                siteUrl,
            },
        })

        const result = response.data.inspectionResult
        const indexStatus = result?.indexStatusResult
        const mobileUsability = result?.mobileUsabilityResult

        return {
            url,
            indexingState: indexStatus?.indexingState ?? 'UNKNOWN',
            coverageState: indexStatus?.coverageState ?? 'UNKNOWN',
            robotsTxtState: indexStatus?.robotsTxtState ?? 'UNKNOWN',
            lastCrawlTime: indexStatus?.lastCrawlTime ?? null,
            pageFetchState: indexStatus?.pageFetchState ?? 'UNKNOWN',
            referringUrls: indexStatus?.referringUrls ?? [],
            mobileUsability:
                mobileUsability?.verdict ?? 'MOBILE_USABILITY_UNSPECIFIED',
        }
    } catch (error) {
        console.error('Error inspecting URL:', error)
        throw error
    }
}

/**
 * Inspect multiple URLs (batch inspection)
 * Respects quota by limiting concurrent requests
 */
export async function inspectUrls(
    urls: string[]
): Promise<UrlInspectionResult[]> {
    if (!isSearchConsoleConfigured()) {
        return []
    }

    // Process URLs sequentially to avoid rate limiting
    const results: UrlInspectionResult[] = []

    for (const url of urls) {
        try {
            const result = await inspectUrl(url)
            results.push(result)
            // Small delay between requests to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 200))
        } catch (err) {
            console.error(`Failed to inspect URL: ${url}`, err)
            // Add a placeholder result for failed inspections
            results.push({
                url,
                indexingState: 'ERROR',
                coverageState: 'ERROR',
                robotsTxtState: 'UNKNOWN',
                lastCrawlTime: null,
                pageFetchState: 'ERROR',
                referringUrls: [],
                mobileUsability: 'MOBILE_USABILITY_UNSPECIFIED',
            })
        }
    }

    return results
}
