import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getProcedureDemand } from '@/lib/queries/dashboard-procedure-demand.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(0).max(365).default(7),
    limit: z.coerce.number().int().min(1).max(50).default(10),
})

/**
 * GET /api/admin/dashboard/procedure-demand
 * Get procedure demand for dashboard chart filtered by date range
 */
export async function GET(request: NextRequest) {
    try {
        await requireAuth()

        const searchParams = request.nextUrl.searchParams
        const rawParams = Object.fromEntries(searchParams.entries())
        const validationResult = querySchema.safeParse(rawParams)

        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid parameters' },
                { status: 400 }
            )
        }

        const { days, limit } = validationResult.data
        const data = await getProcedureDemand(days, limit)

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch procedure demand',
            'Error fetching procedure demand:'
        )
    }
}
