/**
 * Google Search Console
 *
 * Shared, runtime-agnostic Search Console data layer. Consumed by the admin
 * app's API routes and by the `@workspace/mcp-gsc` server that exposes this
 * data to Claude agents.
 *
 * Authenticates with a Google service account — see `GOOGLE_CLIENT_EMAIL`,
 * `GOOGLE_PRIVATE_KEY` and `GOOGLE_SEARCH_CONSOLE_SITE_URL`. Every read
 * function returns empty data rather than throwing when credentials are
 * absent, so callers can degrade gracefully; check `isSearchConsoleConfigured`
 * to tell "no data" from "not wired up".
 *
 * @module @workspace/seo/search-console
 */

// Client & configuration
export {
    isSearchConsoleConfigured,
    getSiteUrl,
    getSearchConsoleClient,
    getSearchConsoleWriteClient,
} from './search-console-client.service.js'

// Low-level fetch + shared utilities
export {
    fetchSearchAnalytics,
    fetchAllSearchAnalytics,
    getDateRange,
    sortRowsByField,
    sortByClicksDesc,
    sortByDateAsc,
    DEFAULT_DAYS,
    DEFAULT_LIMIT,
    BENCHMARK_CTR,
    MIN_IMPRESSIONS_FOR_OPPORTUNITY,
    GSC_MAX_ROW_LIMIT,
    type SearchAnalyticsRow,
    type SearchAnalyticsOptions,
} from './search-console-analytics.util.js'

// Retry
export {
    isTransientGscError,
    withGscRetry,
} from './search-console-retry.util.js'

// Summary
export { getSearchConsoleSummary } from './search-console-summary.service.js'

// Queries
export {
    getTopQueries,
    getQueriesByTerm,
    getQueryTrend,
} from './search-console-queries.service.js'

// Pages
export {
    getTopPages,
    getQueriesForPage,
    getPagesForQuery,
    searchPages,
    getPageTrend,
    extractPath,
    type SearchPagesOptions,
} from './search-console-pages.service.js'

// Page classification (path heuristic; inject a better one where available)
export {
    classifyPathHeuristic,
    classifyPathsHeuristic,
    type PageClassifier,
} from './page-classification.util.js'

// Trends
export { getPerformanceTrend } from './search-console-trends.service.js'

// Opportunities
export {
    getContentOpportunities,
    getContentGaps,
} from './search-console-opportunities.service.js'

// Position changes
export { getPositionChanges } from './search-console-position-changes.service.js'

// Sitemaps
export {
    getSitemaps,
    submitSitemap,
} from './search-console-sitemaps.service.js'

// URL inspection
export { inspectUrl, inspectUrls } from './search-console-inspection.service.js'

// Types
export type * from './search-console.type.js'
