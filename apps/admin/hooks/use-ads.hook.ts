/**
 * Data hooks for the Ads console (epic #288). Every screen reads Postgres
 * through `/api/admin/ads/*`; nothing here calls Google.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { buildUrl, fetchApi } from '@/lib/utils/api-client.util'
import type {
    AdsCampaignDetail,
    AdsCampaignRow,
    AdsChangesReport,
    AdsKeywordsReport,
    AdsLandingPagesReport,
    AdsLeadsReport,
    AdsOverview,
    AdsRange,
    AdsResponse,
    AdsSearchTermsReport,
    AdsSyncStatus,
    AdsTermClassEntry,
    AdsTrackingReport,
    LeadAdMatch,
    TermClassName,
} from '@/lib/types/ads/ads.type'

/** Snapshot data changes once a day; a minute of staleness is plenty. */
const STALE_TIME = 60_000

export const adsKeys = {
    all: ['admin', 'ads'] as const,
    status: () => [...adsKeys.all, 'status'] as const,
    report: (name: string, range: AdsRange, extra?: object) =>
        [...adsKeys.all, name, range.from, range.to, extra ?? {}] as const,
    termClasses: () => [...adsKeys.all, 'term-classes'] as const,
}

function useAdsReport<T>(
    name: string,
    endpoint: string,
    range: AdsRange,
    params: Record<string, string | undefined> = {},
    enabled = true
) {
    return useQuery({
        queryKey: adsKeys.report(name, range, params),
        queryFn: () =>
            fetchApi<AdsResponse<T>>(
                buildUrl(endpoint, {
                    from: range.from,
                    to: range.to,
                    ...params,
                })
            ),
        staleTime: STALE_TIME,
        enabled,
    })
}

export function useAdsStatus() {
    return useQuery({
        queryKey: adsKeys.status(),
        queryFn: () =>
            fetchApi<AdsResponse<AdsSyncStatus>>('/api/admin/ads/status'),
        staleTime: STALE_TIME,
    })
}

export function useAdsOverview(range: AdsRange) {
    return useAdsReport<AdsOverview>(
        'overview',
        '/api/admin/ads/overview',
        range
    )
}

export function useAdsCampaigns(range: AdsRange) {
    return useAdsReport<{
        range: AdsRange
        campaigns: AdsCampaignRow[]
        baselineCostPerLead: number | null
    }>('campaigns', '/api/admin/ads/campaigns', range)
}

export function useAdsCampaignDetail(range: AdsRange, campaignId: string) {
    return useAdsReport<AdsCampaignDetail | null>(
        `campaign-${campaignId}`,
        `/api/admin/ads/campaigns/${campaignId}`,
        range
    )
}

export function useAdsKeywords(range: AdsRange, campaignId?: string) {
    return useAdsReport<AdsKeywordsReport>(
        'keywords',
        '/api/admin/ads/keywords',
        range,
        { campaignId }
    )
}

export function useAdsSearchTerms(
    range: AdsRange,
    campaignId?: string,
    enabled = true
) {
    return useAdsReport<AdsSearchTermsReport>(
        'search-terms',
        '/api/admin/ads/search-terms',
        range,
        { campaignId },
        enabled
    )
}

export function useAdsLandingPages(
    range: AdsRange,
    options: { expanded?: boolean; campaignId?: string } = {},
    enabled = true
) {
    return useAdsReport<AdsLandingPagesReport>(
        'landing-pages',
        '/api/admin/ads/landing-pages',
        range,
        {
            expanded: options.expanded ? 'true' : undefined,
            campaignId: options.campaignId,
        },
        enabled
    )
}

export function useAdsLeads(
    range: AdsRange,
    options: { match?: LeadAdMatch; campaignId?: string } = {}
) {
    return useAdsReport<AdsLeadsReport>(
        'leads',
        '/api/admin/ads/leads',
        range,
        { match: options.match, campaignId: options.campaignId }
    )
}

export function useAdsChanges(range: AdsRange, user?: string) {
    return useAdsReport<AdsChangesReport>(
        'changes',
        '/api/admin/ads/changes',
        range,
        { user }
    )
}

export function useAdsTracking(range: AdsRange) {
    return useAdsReport<AdsTrackingReport>(
        'tracking',
        '/api/admin/ads/tracking',
        range
    )
}

export function useTermClasses() {
    return useQuery({
        queryKey: adsKeys.termClasses(),
        queryFn: () =>
            fetchApi<{ success: boolean; data: AdsTermClassEntry[] }>(
                '/api/admin/ads/term-classes'
            ),
        staleTime: STALE_TIME,
    })
}

/** Add, reclassify or delete a term pattern; refreshes the terms report. */
export function useTermClassMutations() {
    const queryClient = useQueryClient()
    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: adsKeys.all })

    const save = useMutation({
        mutationFn: (input: { pattern: string; termClass: TermClassName }) =>
            fetchApi<{ success: boolean; data: AdsTermClassEntry }>(
                '/api/admin/ads/term-classes',
                { method: 'POST', body: input }
            ),
        onSuccess: invalidate,
    })

    const remove = useMutation({
        mutationFn: (id: string) =>
            fetchApi<{ success: boolean }>('/api/admin/ads/term-classes', {
                method: 'DELETE',
                body: { id },
            }),
        onSuccess: invalidate,
    })

    return { save, remove }
}

type SyncResult = {
    success: boolean
    data?: {
        snapshot: { outcome: string; apiOperations: number }
        leadClicks: { outcome: string; written: number; apiOperations: number }
    }
    error?: string
}

/** The "Sync now" button: snapshot + lead resolver, then refetch everything. */
export function useAdsSync() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () =>
            fetchApi<SyncResult>('/api/admin/ads/sync', { method: 'POST' }),
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: adsKeys.all }),
    })
}
