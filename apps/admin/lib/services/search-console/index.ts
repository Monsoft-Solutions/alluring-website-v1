/**
 * Google Search Console Service
 *
 * Public API for Search Console data fetching.
 * Import from this file for all Search Console functionality.
 *
 * @module @/lib/services/search-console
 */

// Client & Configuration
export { isSearchConsoleConfigured } from './google-search-console-client.service'

// Summary
export { getSearchConsoleSummary } from './google-search-console-summary.service'

// Queries
export {
    getTopQueries,
    getQueriesByTerm,
    getQueryTrend,
} from './google-search-console-queries.service'

// Pages
export {
    getTopPages,
    getQueriesForPage,
    getPagesForQuery,
    searchPages,
    getPageTrend,
    extractPath,
} from './google-search-console-pages.service'

// Page Classification
export {
    classifyPageBySitemap,
    classifyPagesBySitemap,
} from '@/lib/services/sitemap/url-registry.service'

// Trends
export { getPerformanceTrend } from './google-search-console-trends.service'

// Opportunities
export {
    getContentOpportunities,
    getContentGaps,
} from './google-search-console-opportunities.service'

// Position Changes
export { getPositionChanges } from './google-search-console-position-changes.service'

// Sitemaps
export {
    getSitemaps,
    submitSitemap,
} from './google-search-console-sitemaps.service'

// URL Inspection
export {
    inspectUrl,
    inspectUrls,
} from './google-search-console-inspection.service'
