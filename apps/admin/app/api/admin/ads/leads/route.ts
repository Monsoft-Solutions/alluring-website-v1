import type { NextRequest } from 'next/server'

import { getAdsLeads } from '@/lib/queries/ads/ads-leads.query'
import {
    adsGetRoute,
    numericParam,
    parseMatch,
} from '@/lib/utils/ads/ads-route.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ads/leads?from&to[&match][&campaignId]
 * Every paid Google lead with the click that brought it.
 */
export async function GET(request: NextRequest) {
    return adsGetRoute(request, 'Ads leads', (range, searchParams) =>
        getAdsLeads(range, {
            match: parseMatch(searchParams.get('match')),
            campaignId: numericParam(searchParams, 'campaignId'),
        })
    )
}
