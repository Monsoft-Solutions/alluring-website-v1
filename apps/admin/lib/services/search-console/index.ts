/**
 * Google Search Console Service
 *
 * Public API for Search Console data fetching inside the admin app.
 *
 * The data layer itself lives in `@workspace/seo/search-console` so that the
 * MCP server (`packages/mcp-gsc`) can expose the same numbers to Claude agents.
 * What stays here is the part that needs the admin app's database and Next.js
 * caching: sitemap-backed page classification.
 *
 * @module @/lib/services/search-console
 */
import { searchPages as searchPagesUnclassified } from '@workspace/seo/search-console'
import type {
    SearchPagesOptions,
    SearchPageWithType,
} from '@workspace/seo/search-console'

import { classifyPagesBySitemap } from '@/lib/services/sitemap/url-registry.service'

export {
    // Client & configuration
    isSearchConsoleConfigured,
    getSiteUrl,
    getSearchConsoleClient,
    getSearchConsoleWriteClient,

    // Low-level fetch + shared utilities
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

    // Retry
    isTransientGscError,
    withGscRetry,

    // Summary
    getSearchConsoleSummary,

    // Queries
    getTopQueries,
    getQueriesByTerm,
    getQueryTrend,

    // Pages
    getTopPages,
    getQueriesForPage,
    getPagesForQuery,
    getPageTrend,
    extractPath,

    // Trends
    getPerformanceTrend,

    // Opportunities
    getContentOpportunities,
    getContentGaps,

    // Position Changes
    getPositionChanges,

    // Sitemaps
    getSitemaps,
    submitSitemap,

    // URL Inspection
    inspectUrl,
    inspectUrls,
} from '@workspace/seo/search-console'

// Page Classification
export {
    classifyPageBySitemap,
    classifyPagesBySitemap,
} from '@/lib/services/sitemap/url-registry.service'

/**
 * Search pages with sitemap-backed page-type classification.
 *
 * Wraps the shared `searchPages` with the admin app's database-backed
 * classifier, which is the only one that recognises pre-2026 blog posts living
 * at root level (e.g. /best-plastic-surgeon-miami).
 */
export async function searchPages(
    options: Omit<SearchPagesOptions, 'classifyPages'> = {}
): Promise<SearchPageWithType[]> {
    return searchPagesUnclassified({
        ...options,
        classifyPages: classifyPagesBySitemap,
    })
}
