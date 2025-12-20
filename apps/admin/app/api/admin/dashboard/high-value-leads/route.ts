import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getHighValueLeads } from '@/lib/queries/dashboard-leads.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(5),
})

/**
 * GET /api/admin/dashboard/high-value-leads
 * Get recent high-value leads for dashboard
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

        const { limit } = validationResult.data
        const data = await getHighValueLeads(limit)

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching high value leads:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
