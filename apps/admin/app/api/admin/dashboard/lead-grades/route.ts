import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getLeadGradeDistribution } from '@/lib/queries/dashboard-chat.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(0).max(365).default(7),
})

/**
 * GET /api/admin/dashboard/lead-grades
 * Get lead grade distribution for dashboard chart filtered by date range
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

        const { days } = validationResult.data
        const data = await getLeadGradeDistribution(days)

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch lead grades',
            'Error fetching lead grades:'
        )
    }
}
