import type { NextRequest } from 'next/server'

import { getAdsTracking } from '@/lib/queries/ads/ads-tracking.query'
import { adsGetRoute } from '@/lib/utils/ads/ads-route.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ads/tracking?from&to
 * Google's counted conversions per action against paid leads, per day.
 */
export async function GET(request: NextRequest) {
    return adsGetRoute(request, 'Ads tracking health', (range) =>
        getAdsTracking(range)
    )
}
