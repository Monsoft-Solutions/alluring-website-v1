import { NextResponse } from 'next/server'

import { isGoogleAdsConfigured } from '@workspace/google-ads'

import { runAdsSnapshotJob } from '@/lib/services/ads/ads-snapshot.service'
import { runResolveLeadClicksJob } from '@/lib/services/ads/lead-ad-click.service'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'
// A snapshot is ≈8 API calls and a few thousand inserts; the resolver adds
// about one call per lead day.
export const maxDuration = 300

/**
 * POST /api/admin/ads/sync
 * Run the snapshot, then the lead click resolver, now — the "Sync now"
 * button. Each job holds its own lock, so a click during the cron run
 * answers `skipped-locked` instead of pulling twice.
 */
export async function POST() {
    try {
        await requireAuth()
        if (!isGoogleAdsConfigured()) {
            return NextResponse.json(
                { success: false, error: 'Google Ads is not configured' },
                { status: 400 }
            )
        }

        const snapshot = await runAdsSnapshotJob('manual')
        const leadClicks = await runResolveLeadClicksJob('manual')
        const failed =
            snapshot.outcome === 'failed' || leadClicks.outcome === 'failed'

        return NextResponse.json(
            {
                success: !failed,
                data: { snapshot, leadClicks },
                ...(failed
                    ? {
                          error:
                              snapshot.error ??
                              leadClicks.error ??
                              'Sync failed',
                      }
                    : {}),
            },
            { status: failed ? 502 : 200 }
        )
    } catch (error) {
        return handleApiError(
            error,
            'Failed to sync Google Ads',
            'Error syncing Google Ads:'
        )
    }
}
