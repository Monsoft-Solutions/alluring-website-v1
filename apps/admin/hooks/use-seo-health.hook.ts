/**
 * SEO Health Hooks
 *
 * React Query hooks for the refresh-loop surfaces (epic #144): GSC snapshot
 * coverage and the weekly cannibalization report.
 *
 * @module @/hooks/use-seo-health.hook
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchApi } from '@/lib/utils/api-client.util'
import type { SnapshotStatus } from '@/lib/queries/gsc-snapshot.query'
import type { LatestCannibalizationReport } from '@/lib/queries/cannibalization-report.query'
import type { RefreshQueueSummary } from '@/lib/queries/content-refresh.query'
import type { GscSnapshotResult } from '@/lib/services/gsc-snapshot.service'
import type { CannibalizationReportResult } from '@/lib/services/cannibalization-report.service'

export const seoHealthKeys = {
    all: ['admin', 'seo-health'] as const,
    snapshots: () => [...seoHealthKeys.all, 'snapshots'] as const,
    cannibalization: () => [...seoHealthKeys.all, 'cannibalization'] as const,
    refreshQueue: () => [...seoHealthKeys.all, 'refresh-queue'] as const,
}

/** Snapshot coverage + last sync run. */
export function useSnapshotStatus() {
    return useQuery({
        queryKey: seoHealthKeys.snapshots(),
        queryFn: () =>
            fetchApi<{ data: SnapshotStatus }>('/api/admin/seo/snapshots'),
        staleTime: 60 * 1000,
    })
}

/** Latest weekly cannibalization report (null before the first run). */
export function useCannibalizationReport() {
    return useQuery({
        queryKey: seoHealthKeys.cannibalization(),
        queryFn: () =>
            fetchApi<{ data: LatestCannibalizationReport | null }>(
                '/api/admin/seo/cannibalization'
            ),
        staleTime: 5 * 60 * 1000,
    })
}

/** Refresh queue depth + top candidates (epic #144, #147). */
export function useRefreshQueueSummary() {
    return useQuery({
        queryKey: seoHealthKeys.refreshQueue(),
        queryFn: () =>
            fetchApi<{ data: RefreshQueueSummary }>(
                '/api/admin/seo/refresh-queue'
            ),
        staleTime: 60 * 1000,
    })
}

/** Manually run a snapshot sync (same job the daily cron runs). */
export function useRunSnapshotSync() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () =>
            fetchApi<{ data: GscSnapshotResult }>('/api/admin/seo/snapshots', {
                method: 'POST',
            }),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: seoHealthKeys.all,
            })
        },
    })
}

/** Re-run the cannibalization report now (bypasses the weekly due-check). */
export function useRunCannibalizationReport() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: () =>
            fetchApi<{ data: CannibalizationReportResult }>(
                '/api/admin/seo/cannibalization',
                { method: 'POST' }
            ),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: seoHealthKeys.cannibalization(),
            })
        },
    })
}
