import type { NextRequest } from 'next/server'

import { getAdsOverview } from '@/lib/queries/ads/ads-overview.query'
import { adsGetRoute } from '@/lib/utils/ads/ads-route.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ads/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
 * KPIs, daily spend and leads, the campaign table and the attention list.
 */
export async function GET(request: NextRequest) {
    return adsGetRoute(request, 'Ads overview', (range) =>
        getAdsOverview(range)
    )
}
