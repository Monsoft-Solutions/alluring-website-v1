import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getHighValueLeads } from '@/lib/queries/dashboard-leads.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(0).max(365).default(7),
    limit: z.coerce.number().int().min(1).max(50).default(5),
})

/**
 * GET /api/admin/dashboard/high-value-leads
 * Get recent high-value leads for dashboard filtered by date range
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
        const data = await getHighValueLeads(days, limit)

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch high value leads',
            'Error fetching high value leads:'
        )
    }
}
