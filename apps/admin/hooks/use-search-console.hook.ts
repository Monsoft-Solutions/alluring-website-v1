import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
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
} from '@/lib/types/search-console/search-console.type'

/**
 * API response wrapper for Search Console endpoints
 */
type SearchConsoleResponse<T> = {
    configured: boolean
    message?: string
    data: T
}

/**
 * Query keys for Search Console data.
 * Centralized for easy cache invalidation.
 */
export const searchConsoleKeys = {
    all: ['admin', 'search-console'] as const,
    summary: (days: number) =>
        [...searchConsoleKeys.all, 'summary', days] as const,
    queries: (
        days: number,
        limit: number,
        orderBy: string,
        orderDirection: string
    ) =>
        [
            ...searchConsoleKeys.all,
            'queries',
            days,
            limit,
            orderBy,
            orderDirection,
        ] as const,
    pages: (
        days: number,
        limit: number,
        orderBy: string,
        orderDirection: string
    ) =>
        [
            ...searchConsoleKeys.all,
            'pages',
            days,
            limit,
            orderBy,
            orderDirection,
        ] as const,
    trends: (days: number) =>
        [...searchConsoleKeys.all, 'trends', days] as const,
    opportunities: (days: number, limit: number) =>
        [...searchConsoleKeys.all, 'opportunities', days, limit] as const,
    pageQueries: (pageUrl: string, days: number) =>
        [...searchConsoleKeys.all, 'page-queries', pageUrl, days] as const,
    positionChanges: (days: number) =>
        [...searchConsoleKeys.all, 'position-changes', days] as const,
    sitemaps: () => [...searchConsoleKeys.all, 'sitemaps'] as const,
} as const

/**
 * Hook to fetch Search Console summary stats.
 *
 * Includes total clicks, impressions, CTR, position, and top query.
 *
 * @param days - Number of days to analyze (default: 28)
 */
export function useSearchConsoleSummary(days = 28) {
    return useQuery({
        queryKey: searchConsoleKeys.summary(days),
        queryFn: async () => {
            const response = await fetchApi<
                SearchConsoleResponse<SearchConsoleSummary | null>
            >(buildUrl('/api/admin/search-console/summary', { days }))
            return response
        },
        staleTime: 5 * 60_000, // 5 minutes - GSC data updates infrequently
    })
}

/** Sort field type */
type SortField = 'clicks' | 'impressions' | 'ctr' | 'position'

/** Sort direction type */
type SortDirection = 'asc' | 'desc'

/**
 * Hook to fetch top search queries.
 *
 * @param days - Number of days to analyze (default: 28)
 * @param limit - Number of queries to fetch (default: 25)
 * @param orderBy - Sort field (default: 'clicks')
 * @param orderDirection - Sort direction (default: 'desc')
 */
export function useSearchConsoleQueries(
    days = 28,
    limit = 25,
    orderBy: SortField = 'clicks',
    orderDirection: SortDirection = 'desc'
) {
    return useQuery({
        queryKey: searchConsoleKeys.queries(
            days,
            limit,
            orderBy,
            orderDirection
        ),
        queryFn: async () => {
            const response = await fetchApi<
                SearchConsoleResponse<SearchQuery[]>
            >(
                buildUrl('/api/admin/search-console/queries', {
                    days,
                    limit,
                    orderBy,
                    orderDirection,
                })
            )
            return response
        },
        staleTime: 5 * 60_000, // 5 minutes
    })
}

/**
 * Hook to fetch top pages by search performance.
 *
 * @param days - Number of days to analyze (default: 28)
 * @param limit - Number of pages to fetch (default: 25)
 * @param orderBy - Sort field (default: 'clicks')
 * @param orderDirection - Sort direction (default: 'desc')
 */
export function useSearchConsolePages(
    days = 28,
    limit = 25,
    orderBy: SortField = 'clicks',
    orderDirection: SortDirection = 'desc'
) {
    return useQuery({
        queryKey: searchConsoleKeys.pages(days, limit, orderBy, orderDirection),
        queryFn: async () => {
            const response = await fetchApi<
                SearchConsoleResponse<SearchPage[]>
            >(
                buildUrl('/api/admin/search-console/pages', {
                    days,
                    limit,
                    orderBy,
                    orderDirection,
                })
            )
            return response
        },
        staleTime: 5 * 60_000, // 5 minutes
    })
}

/**
 * Hook to fetch daily performance trends for charting.
 *
 * @param days - Number of days to fetch (default: 28)
 */
export function useSearchConsoleTrends(days = 28) {
    return useQuery({
        queryKey: searchConsoleKeys.trends(days),
        queryFn: async () => {
            const response = await fetchApi<
                SearchConsoleResponse<SearchTrend[]>
            >(buildUrl('/api/admin/search-console/trends', { days }))
            return response
        },
        staleTime: 5 * 60_000, // 5 minutes
    })
}

/**
 * Hook to fetch content opportunities.
 *
 * Returns queries with high impressions but low CTR -
 * these represent potential content gaps or optimization opportunities.
 *
 * @param days - Number of days to analyze (default: 28)
 * @param limit - Number of opportunities to fetch (default: 25)
 */
export function useContentOpportunities(days = 28, limit = 25) {
    return useQuery({
        queryKey: searchConsoleKeys.opportunities(days, limit),
        queryFn: async () => {
            const response = await fetchApi<
                SearchConsoleResponse<ContentOpportunity[]>
            >(
                buildUrl('/api/admin/search-console/opportunities', {
                    days,
                    limit,
                })
            )
            return response
        },
        staleTime: 5 * 60_000, // 5 minutes
    })
}

/**
 * Hook to fetch queries driving traffic to a specific page.
 * Used for the Page Deep Dive feature.
 *
 * @param pageUrl - The full URL of the page
 * @param days - Number of days to analyze (default: 28)
 * @param enabled - Whether to enable the query (default: true)
 */
export function usePageQueries(pageUrl: string, days = 28, enabled = true) {
    return useQuery({
        queryKey: searchConsoleKeys.pageQueries(pageUrl, days),
        queryFn: async () => {
            const response = await fetchApi<
                SearchConsoleResponse<PageQueryData[]>
            >(
                buildUrl('/api/admin/search-console/page-queries', {
                    pageUrl,
                    days,
                })
            )
            return response
        },
        staleTime: 5 * 60_000, // 5 minutes
        enabled: enabled && !!pageUrl,
    })
}

/**
 * Hook to fetch position changes between periods.
 * Shows keywords that improved or dropped in ranking.
 *
 * @param days - Number of days per period (default: 7)
 */
export function usePositionChanges(days = 7) {
    return useQuery({
        queryKey: searchConsoleKeys.positionChanges(days),
        queryFn: async () => {
            const response = await fetchApi<
                SearchConsoleResponse<{
                    winners: PositionChange[]
                    losers: PositionChange[]
                }>
            >(buildUrl('/api/admin/search-console/position-changes', { days }))
            return response
        },
        staleTime: 5 * 60_000, // 5 minutes
    })
}

/**
 * Hook to fetch sitemap status from Google Search Console.
 */
export function useSitemaps() {
    return useQuery({
        queryKey: searchConsoleKeys.sitemaps(),
        queryFn: async () => {
            const response = await fetchApi<
                SearchConsoleResponse<SitemapInfo[]>
            >('/api/admin/search-console/sitemaps')
            return response
        },
        staleTime: 5 * 60_000, // 5 minutes
    })
}

/**
 * Response type for sitemap submission
 */
type SubmitSitemapResponse = {
    success: boolean
    message?: string
    error?: string
}

/**
 * Hook to submit (or resubmit) a sitemap to Google Search Console.
 * Invalidates the sitemaps query on success to refresh the list.
 */
export function useSubmitSitemap() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (sitemapPath: string) => {
            const response = await fetchApi<SubmitSitemapResponse>(
                '/api/admin/search-console/sitemaps/submit',
                {
                    method: 'POST',
                    body: { sitemapPath },
                }
            )
            return response
        },
        onSuccess: () => {
            // Invalidate sitemaps query to refresh the list
            queryClient.invalidateQueries({
                queryKey: searchConsoleKeys.sitemaps(),
            })
        },
    })
}

/**
 * Hook to inspect URLs for indexing status.
 * Uses mutation since it's an on-demand operation.
 */
export function useUrlInspection() {
    return useMutation({
        mutationFn: async (urls: string[]) => {
            const response = await fetchApi<
                SearchConsoleResponse<UrlInspectionResult[]>
            >('/api/admin/search-console/url-inspection', {
                method: 'POST',
                body: { urls },
            })
            return response
        },
    })
}
