import { NextResponse } from 'next/server'

import { getBugsBySeverity } from '@/lib/queries/stats.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/bugs/chart
 * Get bugs grouped by severity for chart visualization
 */
export async function GET() {
    try {
        await requireAuth()

        const data = await getBugsBySeverity()

        return NextResponse.json(data)
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching bugs chart data:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch bugs chart data' },
            { status: 500 }
        )
    }
}
