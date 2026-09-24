import type { NextRequest } from 'next/server'

import { getAdsCampaigns } from '@/lib/queries/ads/ads-overview.query'
import { adsGetRoute } from '@/lib/utils/ads/ads-route.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ads/campaigns?from&to
 * Spend, Google conversions and paid leads per campaign.
 */
export async function GET(request: NextRequest) {
    return adsGetRoute(request, 'Ads campaigns', (range) =>
        getAdsCampaigns(range)
    )
}
