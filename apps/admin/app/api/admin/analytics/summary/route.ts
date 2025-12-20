import { NextResponse } from 'next/server'

import { getAnalyticsSummary } from '@/lib/queries/analytics.query'
import { requireAuth } from '@/lib/utils/auth.util'

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
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching analytics summary:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch analytics summary' },
            { status: 500 }
        )
    }
}
