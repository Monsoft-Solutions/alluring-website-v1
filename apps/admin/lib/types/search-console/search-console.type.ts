/**
 * Google Search Console data types for SEO insights
 */
import type { SortDirection } from '@/lib/types/shared/sorting.type'

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
 * Sort field options for search console data
 */
export type SortField = 'clicks' | 'impressions' | 'ctr' | 'position'

/**
 * Parameters for querying search console data
 */
export type SearchConsoleQueryParams = {
    days?: number
    limit?: number
    orderBy?: SortField
    orderDirection?: SortDirection
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

/**
 * Page data for a specific query (Query Performance Analysis)
 * Shows how a page ranks for a particular query
 */
export type QueryPageData = {
    page: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

/**
 * Query with associated pages and content gap analysis
 * Used for comprehensive query performance analysis
 */
export type QueryWithPages = {
    query: string
    clicks: number
    impressions: number
    ctr: number
    position: number
    pages: QueryPageData[]
    /** True if no dedicated page exists for this query */
    hasContentGap: boolean
}

/**
 * Historical trend data for a single query
 * Used to track query performance over time
 */
export type QueryTrendData = {
    date: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

// ============================================================================
// Page Performance Analysis Types
// ============================================================================

/**
 * Page type classification for filtering and analysis.
 * Maps to the different XML sitemaps the web app generates.
 *
 * - blog: Individual blog posts (at root level, e.g., /best-plastic-surgeon-miami)
 * - blog-listing: Blog index, categories, and tags pages
 * - procedure: Individual procedure pages and procedures index
 * - pages: Static marketing pages (home, about, contact) and surgeon profiles
 * - gallery: Gallery pages
 * - promotion: Promotion/specials pages
 * - other: Any page not matching the above categories
 */
export type PageType =
    | 'blog'
    | 'blog-listing'
    | 'procedure'
    | 'pages'
    | 'gallery'
    | 'promotion'
    | 'other'

/**
 * Page with type classification for filtering
 */
export type SearchPageWithType = SearchPage & {
    pageType: PageType
    /** Extracted path from the full URL */
    path: string
}

/**
 * Historical trend data for a single page
 * Used to track page performance over time
 */
export type PageTrendData = {
    date: string
    clicks: number
    impressions: number
    ctr: number
    position: number
}

/**
 * SEO recommendation priority levels
 */
export type RecommendationPriority = 'high' | 'medium' | 'low'

/**
 * SEO recommendation for a page based on performance metrics
 */
export type PageSeoRecommendation = {
    /** Unique identifier for the recommendation */
    id: string
    /** Short title for the recommendation */
    title: string
    /** Detailed description of what to do */
    description: string
    /** Priority level for sorting */
    priority: RecommendationPriority
    /** Icon identifier for UI display */
    icon: 'trending-up' | 'eye' | 'mouse-pointer' | 'search' | 'file-text'
}
