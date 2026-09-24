import type { NextRequest } from 'next/server'

import { getAdsKeywords } from '@/lib/queries/ads/ads-keywords.query'
import { adsGetRoute, numericParam } from '@/lib/utils/ads/ads-route.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ads/keywords?from&to[&campaignId]
 * Keyword spend with the leads their clicks produced.
 */
export async function GET(request: NextRequest) {
    return adsGetRoute(request, 'Ads keywords', (range, searchParams) =>
        getAdsKeywords(range, numericParam(searchParams, 'campaignId'))
    )
}
