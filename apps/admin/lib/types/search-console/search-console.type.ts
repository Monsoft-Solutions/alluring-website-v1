/**
 * Google Search Console data types for SEO insights
 */

/**
 * Summary statistics from Google Search Console
 */
export type SearchConsoleSummary = {
    totalClicks: number
    totalImpressions: number
    avgCtr: number
    avgPosition: number
    topQuery: string | null
    periodDays: number
}

/**
 * Individual search query performance data
 */
export type SearchQuery = {
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

/**
 * Individual page performance in search results
 */
export type SearchPage = {
    page: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

/**
 * Daily performance trend data for charting
 */
export type SearchTrend = {
    date: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

/**
 * Content opportunity - query with high impressions but low CTR
 * These represent potential content gaps or optimization opportunities
 */
export type ContentOpportunity = {
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
    /** Potential additional clicks if CTR improved to benchmark */
    potentialClicks: number
    /** Suggested action for this opportunity */
    suggestion: string
}

/**
 * Parameters for querying search console data
 */
export type SearchConsoleQueryParams = {
    days?: number
    limit?: number
    orderBy?: 'clicks' | 'impressions' | 'ctr' | 'position'
    orderDirection?: 'asc' | 'desc'
}

/**
 * Query performance for a specific page (Page Deep Dive)
 */
export type PageQueryData = {
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

/**
 * Position change data for keyword tracking
 */
export type PositionChange = {
    query: string
    currentPosition: number
    previousPosition: number
    positionDelta: number
    clicks: number
    impressions: number
}

/**
 * Sitemap status from Google Search Console
 */
export type SitemapInfo = {
    path: string
    lastSubmitted: string | null
    lastDownloaded: string | null
    isPending: boolean
    isSitemapsIndex: boolean
    type: string
    warnings: number
    errors: number
    contents: Array<{
        type: string
        submitted: number
        indexed: number
    }>
}

/**
 * URL Inspection result from Google Search Console
 */
export type UrlInspectionResult = {
    url: string
    indexingState: string
    coverageState: string
    robotsTxtState: string
    lastCrawlTime: string | null
    pageFetchState: string
    referringUrls: string[]
    mobileUsability: string
}
