import { useQuery } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type { LeadTrendsResponse } from '@/lib/types/analytics/lead-trends.type'

export const leadTrendsKeys = {
    all: ['admin', 'lead-trends'] as const,
    range: (startIso: string, endIso: string) =>
        [...leadTrendsKeys.all, startIso, endIso] as const,
} as const

/**
 * Compute the prior-period window, same length as the provided range,
 * ending 1 ms before startDate. Returns ISO strings so the result can be
 * used directly as a React Query key.
 */
export function computePriorRange(startDate: Date, endDate: Date) {
    const duration = endDate.getTime() - startDate.getTime()
    const priorEnd = new Date(startDate.getTime() - 1)
    const priorStart = new Date(priorEnd.getTime() - duration)
    return { priorStart, priorEnd }
}

function useLeadTrendsRange(startDate: Date, endDate: Date) {
    const startIso = startDate.toISOString()
    const endIso = endDate.toISOString()
    return useQuery({
        queryKey: leadTrendsKeys.range(startIso, endIso),
        queryFn: () =>
            fetchApi<LeadTrendsResponse>(
                buildUrl('/api/admin/analytics/lead-trends', {
                    startDate: startIso,
                    endDate: endIso,
                })
            ),
        staleTime: 60_000,
    })
}

/**
 * Fetch lead trends for the selected range plus the equivalent prior period.
 * Two independent React Query calls — React Query de-dupes if the same
 * window is used elsewhere.
 */
export function useLeadTrends(startDate: Date, endDate: Date) {
    const current = useLeadTrendsRange(startDate, endDate)
    const { priorStart, priorEnd } = computePriorRange(startDate, endDate)
    const prior = useLeadTrendsRange(priorStart, priorEnd)
    return { current, prior }
}
