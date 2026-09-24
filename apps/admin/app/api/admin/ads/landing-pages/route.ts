import type { NextRequest } from 'next/server'

import { getAdsLandingPages } from '@/lib/queries/ads/ads-keywords.query'
import { adsGetRoute, numericParam } from '@/lib/utils/ads/ads-route.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ads/landing-pages?from&to[&expanded=true][&campaignId]
 * Spend per landing page with the paid leads that landed there.
 */
export async function GET(request: NextRequest) {
    return adsGetRoute(request, 'Ads landing pages', (range, searchParams) =>
        getAdsLandingPages(range, {
            expanded: searchParams.get('expanded') === 'true',
            campaignId: numericParam(searchParams, 'campaignId'),
        })
    )
}
