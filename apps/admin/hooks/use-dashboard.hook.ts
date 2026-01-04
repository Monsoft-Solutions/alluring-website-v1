import { useQuery } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type { DailyCount, HourlyCount } from '@/lib/types/common/common.type'
import type { DashboardStats } from '@/lib/types/analytics/dashboard-stats.type'
import type { RecentContact } from '@/lib/types/contacts/recent-contact.type'
import type { TopPost } from '@/lib/types/blog/top-post.type'
import type { ProcedureDemand } from '@/lib/types/analytics/procedure-demand.type'
import type { ChatSummary } from '@/lib/types/chat/chat-summary.type'
import type { LeadGradeDistribution } from '@/lib/types/analytics/lead-grade-distribution.type'
import type { HighValueLead } from '@/lib/types/analytics/high-value-lead.type'
import type { DailyViewCount } from '@/lib/types/analytics/analytics.type'

/**
 * Query keys for dashboard data.
 * Centralized for easy cache invalidation.
 */
export const dashboardKeys = {
    all: ['admin', 'dashboard'] as const,
    stats: (days: number) => [...dashboardKeys.all, 'stats', days] as const,
    traffic: (days: number) => [...dashboardKeys.all, 'traffic', days] as const,
    procedureDemand: (days: number, limit: number) =>
        [...dashboardKeys.all, 'procedure-demand', days, limit] as const,
    chat: {
        summary: (days: number) =>
            [...dashboardKeys.all, 'chat', 'summary', days] as const,
        leadGrades: (days: number) =>
            [...dashboardKeys.all, 'chat', 'lead-grades', days] as const,
    },
    leads: {
        highValue: (days: number, limit: number) =>
            [...dashboardKeys.all, 'leads', 'high-value', days, limit] as const,
    },
    contacts: {
        recent: (days: number, limit: number) =>
            [...dashboardKeys.all, 'contacts', 'recent', days, limit] as const,
        chart: (days: number) =>
            [...dashboardKeys.all, 'contacts', 'chart', days] as const,
        chartHourly: (dateStr: string) =>
            [
                ...dashboardKeys.all,
                'contacts',
                'chart',
                'hourly',
                dateStr,
            ] as const,
    },
    posts: {
        top: (limit: number) =>
            [...dashboardKeys.all, 'posts', 'top', limit] as const,
    },
} as const

/**
 * Hook to fetch dashboard summary statistics filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 */
export function useDashboardStats(days = 7) {
    return useQuery({
        queryKey: dashboardKeys.stats(days),
        queryFn: () =>
            fetchApi<DashboardStats>(buildUrl('/api/admin/stats', { days })),
        staleTime: 30_000, // 30 seconds
    })
}

/**
 * Hook to fetch traffic data (views + sessions) for dashboard.
 */
export function useDashboardTraffic(days = 30) {
    return useQuery({
        queryKey: dashboardKeys.traffic(days),
        queryFn: () =>
            fetchApi<DailyViewCount[]>(
                buildUrl('/api/admin/dashboard/traffic', { days })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch procedure demand breakdown filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 * @param limit - Maximum number of procedures to return (default 10)
 */
export function useProcedureDemand(days = 7, limit = 10) {
    return useQuery({
        queryKey: dashboardKeys.procedureDemand(days, limit),
        queryFn: () =>
            fetchApi<ProcedureDemand[]>(
                buildUrl('/api/admin/dashboard/procedure-demand', {
                    days,
                    limit,
                })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch chat summary stats filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 */
export function useChatSummary(days = 7) {
    return useQuery({
        queryKey: dashboardKeys.chat.summary(days),
        queryFn: () =>
            fetchApi<ChatSummary>(
                buildUrl('/api/admin/dashboard/chat-summary', { days })
            ),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch lead grade distribution filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 */
export function useLeadGradesChart(days = 7) {
    return useQuery({
        queryKey: dashboardKeys.chat.leadGrades(days),
        queryFn: () =>
            fetchApi<LeadGradeDistribution[]>(
                buildUrl('/api/admin/dashboard/lead-grades', { days })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch recent high-value leads filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 * @param limit - Maximum number of leads to return (default 5)
 */
export function useHighValueLeads(days = 7, limit = 5) {
    return useQuery({
        queryKey: dashboardKeys.leads.highValue(days, limit),
        queryFn: () =>
            fetchApi<HighValueLead[]>(
                buildUrl('/api/admin/dashboard/high-value-leads', {
                    days,
                    limit,
                })
            ),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch recent contact submissions filtered by date range.
 *
 * @param days - Number of days to filter by (default 7)
 * @param limit - Maximum number of contacts to return (default 5)
 */
export function useRecentContacts(days = 7, limit = 5) {
    return useQuery({
        queryKey: dashboardKeys.contacts.recent(days, limit),
        queryFn: () =>
            fetchApi<RecentContact[]>(
                buildUrl('/api/admin/contacts/recent', { days, limit })
            ),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch contacts over time for chart visualization.
 *
 * @param days - Number of days to include in the chart (default 30)
 * @param options - Query options (e.g., enabled)
 */
export function useContactsChart(days = 30, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: dashboardKeys.contacts.chart(days),
        queryFn: () =>
            fetchApi<DailyCount[]>(
                buildUrl('/api/admin/contacts/chart', { days })
            ),
        staleTime: 60_000,
        enabled: options?.enabled ?? true, // Default to true
    })
}

/**
 * Hook to fetch contacts grouped by hour for a specific date.
 * Used for Today/Yesterday hourly breakdown.
 *
 * @param targetDate - The date to get hourly data for
 * @param options - Query options (e.g., enabled)
 */
export function useContactsChartHourly(
    targetDate: Date,
    options?: { enabled?: boolean }
) {
    // Build YYYY-MM-DD from local date components (en-CA locale gives YYYY-MM-DD format)
    const dateStr = targetDate.toLocaleDateString('en-CA')
    return useQuery({
        queryKey: dashboardKeys.contacts.chartHourly(dateStr),
        queryFn: () =>
            fetchApi<HourlyCount[]>(
                buildUrl('/api/admin/contacts/hourly', { date: dateStr })
            ),
        staleTime: 30_000, // 30 seconds for today's data
        enabled: options?.enabled ?? true, // Default to true
    })
}

/**
 * Hook to fetch top blog posts by views.
 */
export function useTopPosts(limit = 5) {
    return useQuery({
        queryKey: dashboardKeys.posts.top(limit),
        queryFn: () =>
            fetchApi<TopPost[]>(buildUrl('/api/admin/posts/top', { limit })),
        staleTime: 60_000,
    })
}
