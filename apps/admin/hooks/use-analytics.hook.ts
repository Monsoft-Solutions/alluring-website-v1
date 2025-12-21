import { useQuery } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type {
    AnalyticsSummary,
    DailyViewCount,
    TopPage,
    TrafficSource,
    DeviceStats,
    BrowserStats,
    GeoStats,
} from '@/lib/types/analytics/analytics.type'

/**
 * Query keys for analytics data.
 * Centralized for easy cache invalidation.
 */
export const analyticsKeys = {
    all: ['admin', 'analytics'] as const,
    summary: () => [...analyticsKeys.all, 'summary'] as const,
    pageviews: (days: number) =>
        [...analyticsKeys.all, 'pageviews', days] as const,
    pages: (days: number, limit: number) =>
        [...analyticsKeys.all, 'pages', days, limit] as const,
    sources: (limit: number) =>
        [...analyticsKeys.all, 'sources', limit] as const,
    devices: () => [...analyticsKeys.all, 'devices'] as const,
    browsers: (limit: number) =>
        [...analyticsKeys.all, 'browsers', limit] as const,
    geo: (limit: number) => [...analyticsKeys.all, 'geo', limit] as const,
} as const

/**
 * Hook to fetch analytics summary stats.
 *
 * Includes total views, unique sessions, today's views, and top source.
 */
export function useAnalyticsSummary() {
    return useQuery({
        queryKey: analyticsKeys.summary(),
        queryFn: () =>
            fetchApi<AnalyticsSummary>('/api/admin/analytics/summary'),
        staleTime: 30_000, // 30 seconds
    })
}

/**
 * Hook to fetch page views over time.
 *
 * @param days - Number of days to fetch (default: 30)
 */
export function usePageViewsChart(days = 30) {
    return useQuery({
        queryKey: analyticsKeys.pageviews(days),
        queryFn: () =>
            fetchApi<DailyViewCount[]>(
                buildUrl('/api/admin/analytics/pageviews', { days })
            ),
        staleTime: 60_000, // 1 minute for chart data
    })
}

/**
 * Hook to fetch top pages by views.
 *
 * @param days - Number of days to analyze (default: 30)
 * @param limit - Number of pages to fetch (default: 10)
 */
export function useTopPages(days = 30, limit = 10) {
    return useQuery({
        queryKey: analyticsKeys.pages(days, limit),
        queryFn: () =>
            fetchApi<TopPage[]>(
                buildUrl('/api/admin/analytics/pages', { days, limit })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch traffic sources breakdown.
 *
 * @param limit - Number of sources to fetch (default: 10)
 */
export function useTrafficSources(limit = 10) {
    return useQuery({
        queryKey: analyticsKeys.sources(limit),
        queryFn: () =>
            fetchApi<TrafficSource[]>(
                buildUrl('/api/admin/analytics/sources', { limit })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch device breakdown (mobile, desktop, tablet).
 */
export function useDeviceBreakdown() {
    return useQuery({
        queryKey: analyticsKeys.devices(),
        queryFn: () => fetchApi<DeviceStats[]>('/api/admin/analytics/devices'),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch browser breakdown.
 *
 * @param limit - Number of browsers to fetch (default: 5)
 */
export function useBrowserBreakdown(limit = 5) {
    return useQuery({
        queryKey: analyticsKeys.browsers(limit),
        queryFn: () =>
            fetchApi<BrowserStats[]>(
                buildUrl('/api/admin/analytics/browsers', { limit })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch geographic distribution.
 *
 * @param limit - Number of countries to fetch (default: 10)
 */
export function useGeoDistribution(limit = 10) {
    return useQuery({
        queryKey: analyticsKeys.geo(limit),
        queryFn: () =>
            fetchApi<GeoStats[]>(
                buildUrl('/api/admin/analytics/geo', { limit })
            ),
        staleTime: 60_000,
    })
}
