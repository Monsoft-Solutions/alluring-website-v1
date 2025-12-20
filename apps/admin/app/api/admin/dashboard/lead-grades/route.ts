import { NextResponse } from 'next/server'

import { getLeadGradeDistribution } from '@/lib/queries/dashboard-chat.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/dashboard/lead-grades
 * Get lead grade distribution for dashboard chart
 */
export async function GET() {
    try {
        await requireAuth()

        const data = await getLeadGradeDistribution()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching lead grades:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
