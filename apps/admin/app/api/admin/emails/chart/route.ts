import { NextResponse } from 'next/server'

import { getEmailsByStatus } from '@/lib/queries/stats.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

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
        return handleApiError(
            error,
            'Failed to fetch emails chart data',
            'Error fetching emails chart data:'
        )
    }
}
