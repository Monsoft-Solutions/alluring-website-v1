import { useQuery } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type {
    AnalyticsSummary,
    DailyViewCount,
    HourlyViewCount,
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
    summary: (days: number) => [...analyticsKeys.all, 'summary', days] as const,
    pageviews: (days: number) =>
        [...analyticsKeys.all, 'pageviews', days] as const,
    pageviewsHourly: (dateStr: string) =>
        [...analyticsKeys.all, 'pageviews-hourly', dateStr] as const,
    pages: (days: number, limit: number) =>
        [...analyticsKeys.all, 'pages', days, limit] as const,
    sources: (days: number, limit: number) =>
        [...analyticsKeys.all, 'sources', days, limit] as const,
    devices: (days: number) => [...analyticsKeys.all, 'devices', days] as const,
    browsers: (days: number, limit: number) =>
        [...analyticsKeys.all, 'browsers', days, limit] as const,
    geo: (days: number, limit: number) =>
        [...analyticsKeys.all, 'geo', days, limit] as const,
} as const

/**
 * Hook to fetch analytics summary stats.
 *
 * Includes total views, unique sessions, period views, and top source.
 *
 * @param days - Number of days to fetch (default: 7)
 */
export function useAnalyticsSummary(days = 7) {
    return useQuery({
        queryKey: analyticsKeys.summary(days),
        queryFn: () =>
            fetchApi<AnalyticsSummary>(
                buildUrl('/api/admin/analytics/summary', { days })
            ),
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
 * Hook to fetch page views grouped by hour for a specific date.
 * Used for Today/Yesterday hourly breakdown.
 *
 * @param targetDate - The date to get hourly data for
 */
export function usePageViewsHourly(targetDate: Date) {
    const isoString = targetDate.toISOString()
    const dateStr = isoString.slice(0, 10) // YYYY-MM-DD format
    return useQuery({
        queryKey: analyticsKeys.pageviewsHourly(dateStr),
        queryFn: () =>
            fetchApi<HourlyViewCount[]>(
                buildUrl('/api/admin/analytics/pageviews-hourly', {
                    date: isoString,
                })
            ),
        staleTime: 30_000, // 30 seconds for today's data
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
 * @param days - Number of days to analyze (default: 30)
 * @param limit - Number of sources to fetch (default: 10)
 */
export function useTrafficSources(days = 30, limit = 10) {
    return useQuery({
        queryKey: analyticsKeys.sources(days, limit),
        queryFn: () =>
            fetchApi<TrafficSource[]>(
                buildUrl('/api/admin/analytics/sources', { days, limit })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch device breakdown (mobile, desktop, tablet).
 *
 * @param days - Number of days to analyze (default: 30)
 */
export function useDeviceBreakdown(days = 30) {
    return useQuery({
        queryKey: analyticsKeys.devices(days),
        queryFn: () =>
            fetchApi<DeviceStats[]>(
                buildUrl('/api/admin/analytics/devices', { days })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch browser breakdown.
 *
 * @param days - Number of days to analyze (default: 30)
 * @param limit - Number of browsers to fetch (default: 5)
 */
export function useBrowserBreakdown(days = 30, limit = 5) {
    return useQuery({
        queryKey: analyticsKeys.browsers(days, limit),
        queryFn: () =>
            fetchApi<BrowserStats[]>(
                buildUrl('/api/admin/analytics/browsers', { days, limit })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch geographic distribution.
 *
 * @param days - Number of days to analyze (default: 30)
 * @param limit - Number of countries to fetch (default: 10)
 */
export function useGeoDistribution(days = 30, limit = 10) {
    return useQuery({
        queryKey: analyticsKeys.geo(days, limit),
        queryFn: () =>
            fetchApi<GeoStats[]>(
                buildUrl('/api/admin/analytics/geo', { days, limit })
            ),
        staleTime: 60_000,
    })
}
