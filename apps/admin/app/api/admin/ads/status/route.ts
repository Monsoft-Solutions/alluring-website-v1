import { NextResponse } from 'next/server'

import { isGoogleAdsConfigured } from '@workspace/google-ads'

import { getAdsSyncStatus } from '@/lib/queries/ads/ads-leads.query'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ads/status
 * The Ads jobs' newest runs, the snapshot's span and today's API use.
 */
export async function GET() {
    try {
        await requireAuth()
        if (!isGoogleAdsConfigured()) {
            return NextResponse.json({ configured: false, data: null })
        }
        return NextResponse.json({
            configured: true,
            data: await getAdsSyncStatus(),
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to load Ads sync status',
            'Error loading Ads sync status:'
        )
    }
}
