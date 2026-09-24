import type { NextRequest } from 'next/server'

import { getAdsChanges } from '@/lib/queries/ads/ads-tracking.query'
import { adsGetRoute } from '@/lib/utils/ads/ads-route.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ads/changes?from&to[&user=email]
 * The account's change log, kept past Google's 30 days.
 */
export async function GET(request: NextRequest) {
    return adsGetRoute(request, 'Ads changes', (range, searchParams) =>
        getAdsChanges(range, {
            user: searchParams.get('user')?.trim() || undefined,
        })
    )
}
