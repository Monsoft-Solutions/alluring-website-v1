import { NextResponse } from 'next/server'

import { getDashboardStats } from '@/lib/queries/stats.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/stats
 * Get dashboard summary statistics (blog posts, contacts, emails, feedback)
 */
export async function GET() {
    try {
        await requireAuth()

        const stats = await getDashboardStats()

        return NextResponse.json(stats)
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching dashboard stats:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        )
    }
}
