import { useQuery } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type {
    DashboardStats,
    RecentContact,
    RecentBugReport,
    DailyCount,
    SeverityCount,
    TopPost,
    EmailStatusCount,
} from '@/lib/queries/stats.query'

/**
 * Query keys for dashboard data.
 * Centralized for easy cache invalidation.
 */
export const dashboardKeys = {
    all: ['admin', 'dashboard'] as const,
    stats: () => [...dashboardKeys.all, 'stats'] as const,
    contacts: {
        recent: (limit: number) =>
            [...dashboardKeys.all, 'contacts', 'recent', limit] as const,
        chart: (days: number) =>
            [...dashboardKeys.all, 'contacts', 'chart', days] as const,
    },
    bugs: {
        recent: (limit: number) =>
            [...dashboardKeys.all, 'bugs', 'recent', limit] as const,
        chart: () => [...dashboardKeys.all, 'bugs', 'chart'] as const,
    },
    posts: {
        top: (limit: number) =>
            [...dashboardKeys.all, 'posts', 'top', limit] as const,
    },
    emails: {
        chart: () => [...dashboardKeys.all, 'emails', 'chart'] as const,
    },
} as const

/**
 * Hook to fetch dashboard summary statistics.
 *
 * Includes blog posts, contacts, emails, and feedback counts.
 */
export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: () => fetchApi<DashboardStats>('/api/admin/stats'),
        staleTime: 30_000, // 30 seconds
    })
}

/**
 * Hook to fetch recent contact submissions.
 *
 * @param limit - Number of contacts to fetch (default: 5)
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
 *
 * @param days - Number of days to fetch (default: 30)
 */
export function useContactsChart(days = 30) {
    return useQuery({
        queryKey: dashboardKeys.contacts.chart(days),
        queryFn: () =>
            fetchApi<DailyCount[]>(
                buildUrl('/api/admin/contacts/chart', { days })
            ),
        staleTime: 60_000, // 1 minute for chart data
    })
}

/**
 * Hook to fetch recent bug reports.
 *
 * @param limit - Number of reports to fetch (default: 5)
 */
export function useRecentBugReports(limit = 5) {
    return useQuery({
        queryKey: dashboardKeys.bugs.recent(limit),
        queryFn: () =>
            fetchApi<RecentBugReport[]>(
                buildUrl('/api/admin/bugs/recent', { limit })
            ),
        staleTime: 30_000,
    })
}

/**
 * Hook to fetch bugs by severity for chart visualization.
 */
export function useBugsChart() {
    return useQuery({
        queryKey: dashboardKeys.bugs.chart(),
        queryFn: () => fetchApi<SeverityCount[]>('/api/admin/bugs/chart'),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch top blog posts by views.
 *
 * @param limit - Number of posts to fetch (default: 5)
 */
export function useTopPosts(limit = 5) {
    return useQuery({
        queryKey: dashboardKeys.posts.top(limit),
        queryFn: () =>
            fetchApi<TopPost[]>(buildUrl('/api/admin/posts/top', { limit })),
        staleTime: 60_000,
    })
}

/**
 * Hook to fetch emails by status for chart visualization.
 */
export function useEmailsChart() {
    return useQuery({
        queryKey: dashboardKeys.emails.chart(),
        queryFn: () => fetchApi<EmailStatusCount[]>('/api/admin/emails/chart'),
        staleTime: 60_000,
    })
}
