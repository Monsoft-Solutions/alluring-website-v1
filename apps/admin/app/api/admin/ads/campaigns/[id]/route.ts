import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { getAdsCampaignDetail } from '@/lib/queries/ads/ads-overview.query'
import { adsGetRoute } from '@/lib/utils/ads/ads-route.util'

export const runtime = 'nodejs'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/admin/ads/campaigns/[id]?from&to
 * One campaign's daily trend and its leads' answers (procedure, timeline,
 * financing interest).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params
    if (!/^\d+$/.test(id)) {
        return NextResponse.json(
            { success: false, error: 'Campaign id must be numeric' },
            { status: 400 }
        )
    }
    return adsGetRoute(request, 'Ads campaign', (range) =>
        getAdsCampaignDetail(range, id)
    )
}
