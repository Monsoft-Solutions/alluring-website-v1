import { NextResponse } from 'next/server'

import { getBugsBySeverity } from '@/lib/queries/stats.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

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
        return handleApiError(
            error,
            'Failed to fetch bugs chart data',
            'Error fetching bugs chart data:'
        )
    }
}
