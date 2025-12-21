import { useQuery } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type {
    EmailStats,
    EmailLogListItem,
} from '@/lib/types/emails/emails.type'

export const emailKeys = {
    all: ['admin', 'emails'] as const,
    stats: () => [...emailKeys.all, 'stats'] as const,
    logs: (params: { page: number; pageSize: number; status: string }) =>
        [...emailKeys.all, 'logs', params] as const,
} as const

/**
 * Hook to fetch email delivery statistics.
 */
export function useEmailStats() {
    return useQuery({
        queryKey: emailKeys.stats(),
        queryFn: () => fetchApi<EmailStats>('/api/admin/emails/stats'),
        staleTime: 30_000, // 30 seconds
    })
}

/**
 * Hook to fetch paginated email delivery logs.
 *
 * @param page - Page number
 * @param pageSize - Items per page
 * @param status - Status filter
 */
export function useEmailLogs(page = 1, pageSize = 15, status = 'all') {
    return useQuery({
        queryKey: emailKeys.logs({ page, pageSize, status }),
        queryFn: () =>
            fetchApi<{ emails: EmailLogListItem[]; total: number }>(
                buildUrl('/api/admin/emails/logs', { page, pageSize, status })
            ),
        staleTime: 30_000,
    })
}
