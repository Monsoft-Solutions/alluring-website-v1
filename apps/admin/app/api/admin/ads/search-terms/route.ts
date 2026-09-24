import type { NextRequest } from 'next/server'

import { getAdsSearchTerms } from '@/lib/queries/ads/ads-keywords.query'
import { adsGetRoute, numericParam } from '@/lib/utils/ads/ads-route.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ads/search-terms?from&to[&campaignId]
 * What people typed, classified brand / competitor / procedure / address.
 */
export async function GET(request: NextRequest) {
    return adsGetRoute(request, 'Ads search terms', (range, searchParams) =>
        getAdsSearchTerms(range, {
            campaignId: numericParam(searchParams, 'campaignId'),
        })
    )
}
