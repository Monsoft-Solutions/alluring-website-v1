import { NextResponse } from 'next/server'

import { getAnalyticsSummary } from '@/lib/queries/analytics.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/analytics/summary
 * Get analytics summary stats (total views, unique sessions, today's views, top source)
 */
export async function GET() {
    try {
        await requireAuth()

        const summary = await getAnalyticsSummary()

        return NextResponse.json(summary)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch analytics summary',
            'Error fetching analytics summary:'
        )
    }
}
