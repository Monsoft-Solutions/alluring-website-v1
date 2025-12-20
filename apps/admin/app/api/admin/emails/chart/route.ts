import { NextResponse } from 'next/server'

import { getEmailsByStatus } from '@/lib/queries/stats.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/emails/chart
 * Get emails grouped by status for chart visualization
 */
export async function GET() {
    try {
        await requireAuth()

        const data = await getEmailsByStatus()

        return NextResponse.json(data)
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching emails chart data:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch emails chart data' },
            { status: 500 }
        )
    }
}
