import { NextResponse } from 'next/server'

import { getSnapshotStatus } from '@/lib/queries/gsc-snapshot.query'
import { runGscSnapshotJob } from '@/lib/services/gsc-snapshot.service'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'
// A manual catch-up can pull several days of paginated rows.
export const maxDuration = 300

/**
 * GET /api/admin/seo/snapshots
 * Snapshot coverage + last sync run, for the SEO dashboard health card.
 */
export async function GET() {
    try {
        await requireAuth()
        const status = await getSnapshotStatus()
        return NextResponse.json({ data: status })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch snapshot status',
            'Error fetching snapshot status:'
        )
    }
}

/**
 * POST /api/admin/seo/snapshots
 * Run a manual snapshot sync (same job the daily cron runs).
 */
export async function POST() {
    try {
        await requireAuth()
        const result = await runGscSnapshotJob('manual')
        return NextResponse.json({ data: result })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to run snapshot sync',
            'Error running snapshot sync:'
        )
    }
}
