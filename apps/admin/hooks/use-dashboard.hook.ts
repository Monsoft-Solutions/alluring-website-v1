import { useQuery } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type {
    DashboardStats,
    RecentContact,
    DailyCount,
    TopPost,
} from '@/lib/queries/stats.query'
import type { ProcedureDemand } from '@/lib/queries/dashboard-procedure-demand.query'
import type {
    ChatSummary,
    LeadGradeDistribution,
} from '@/lib/queries/dashboard-chat.query'
import type { HighValueLead } from '@/lib/queries/dashboard-leads.query'
import type { DailyViewCount } from '@/lib/queries/analytics.query'

/**
 * Query keys for dashboard data.
 * Centralized for easy cache invalidation.
 */
export const dashboardKeys = {
    all: ['admin', 'dashboard'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
    traffic: (days: number) => [...dashboardKeys.all, 'traffic', days] as const,
    procedureDemand: (limit: number) =>
        [...dashboardKeys.all, 'procedure-demand', limit] as const,
    chat: {
        summary: () => [...dashboardKeys.all, 'chat', 'summary'] as const,
        leadGrades: () =>
            [...dashboardKeys.all, 'chat', 'lead-grades'] as const,
    },
    leads: {
        highValue: (limit: number) =>
            [...dashboardKeys.all, 'leads', 'high-value', limit] as const,
    },
    contacts: {
        recent: (limit: number) =>
            [...dashboardKeys.all, 'contacts', 'recent', limit] as const,
        chart: (days: number) =>
            [...dashboardKeys.all, 'contacts', 'chart', days] as const,
    },
    posts: {
        top: (limit: number) =>
            [...dashboardKeys.all, 'posts', 'top', limit] as const,
    },
} as const

/**
 * Hook to fetch dashboard summary statistics.
 */
export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: () => fetchApi<DashboardStats>('/api/admin/stats'),
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
 * Hook to fetch procedure demand breakdown.
 */
export function useProcedureDemand(limit = 10) {
    return useQuery({
        queryKey: dashboardKeys.procedureDemand(limit),
        queryFn: () =>
            fetchApi<ProcedureDemand[]>(
                buildUrl('/api/admin/dashboard/procedure-demand', { limit })
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch chat summary stats.
 */
export function useChatSummary() {
    return useQuery({
        queryKey: dashboardKeys.chat.summary(),
        queryFn: () =>
            fetchApi<ChatSummary>('/api/admin/dashboard/chat-summary'),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch lead grade distribution.
 */
export function useLeadGradesChart() {
    return useQuery({
        queryKey: dashboardKeys.chat.leadGrades(),
        queryFn: () =>
            fetchApi<LeadGradeDistribution[]>(
                '/api/admin/dashboard/lead-grades'
            ),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch recent high-value leads.
 */
export function useHighValueLeads(limit = 5) {
    return useQuery({
        queryKey: dashboardKeys.leads.highValue(limit),
        queryFn: () =>
            fetchApi<HighValueLead[]>(
                buildUrl('/api/admin/dashboard/high-value-leads', { limit })
            ),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch recent contact submissions.
 */
export function useRecentContacts(limit = 5) {
    return useQuery({
        queryKey: dashboardKeys.contacts.recent(limit),
        queryFn: () =>
            fetchApi<RecentContact[]>(
                buildUrl('/api/admin/contacts/recent', { limit })
            ),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch contacts over time for chart visualization.
 */
export function useContactsChart(days = 30) {
    return useQuery({
        queryKey: dashboardKeys.contacts.chart(days),
        queryFn: () =>
            fetchApi<DailyCount[]>(
                buildUrl('/api/admin/contacts/chart', { days })
            ),
        staleTime: 60_000,
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
