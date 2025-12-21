import { NextResponse } from 'next/server'

import { getDashboardStats } from '@/lib/queries/stats.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

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
        return handleApiError(
            error,
            'Failed to fetch dashboard stats',
            'Error fetching dashboard stats:'
        )
    }
}
