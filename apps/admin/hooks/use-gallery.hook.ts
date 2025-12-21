import { useQuery } from '@tanstack/react-query'

import { fetchApi, buildUrl } from '@/lib/utils/api-client.util'
import type { GalleryStats } from '@/lib/types/gallery/gallery-stats.type'
import type { RecentMediaItem } from '@/lib/types/gallery/gallery-media.type'

/**
 * Query keys for gallery data.
 * Centralized for easy cache invalidation.
 */
export const galleryKeys = {
    all: ['admin', 'gallery'] as const,
    stats: () => [...galleryKeys.all, 'stats'] as const,
    media: {
        recent: (limit: number) =>
            [...galleryKeys.all, 'media', 'recent', limit] as const,
    },
} as const

/**
 * Hook to fetch gallery summary statistics.
 */
export function useGalleryStats() {
    return useQuery({
        queryKey: galleryKeys.stats(),
        queryFn: () => fetchApi<GalleryStats>('/api/admin/gallery/stats'),
        staleTime: 30_000, // 30 seconds
    })
}

/**
 * Hook to fetch recent gallery media.
 *
 * @param limit - Number of media items to fetch (default: 8)
 */
export function useRecentMedia(limit = 8) {
    return useQuery({
        queryKey: galleryKeys.media.recent(limit),
        queryFn: () =>
            fetchApi<RecentMediaItem[]>(
                buildUrl('/api/admin/gallery/recent-media', { limit })
            ),
        staleTime: 30_000,
    })
}
