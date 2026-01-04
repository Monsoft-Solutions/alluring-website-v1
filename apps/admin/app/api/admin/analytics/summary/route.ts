import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getAnalyticsSummary } from '@/lib/queries/analytics.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(0).max(365).default(7),
})

/**
 * GET /api/admin/analytics/summary
 * Get analytics summary stats (total views, unique sessions, period views, top source)
 *
 * Query params:
 * - days: number (0-365, default: 7) - 0 means today only
 */
export async function GET(request: NextRequest) {
    try {
        await requireAuth()

        const searchParams = request.nextUrl.searchParams
        const rawParams = Object.fromEntries(searchParams.entries())

        const validationResult = querySchema.safeParse(rawParams)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid query parameters',
                    details: validationResult.error.format(),
                },
                { status: 400 }
            )
        }

        const { days } = validationResult.data
        const summary = await getAnalyticsSummary(days)

        return NextResponse.json(summary)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch analytics summary',
            'Error fetching analytics summary:'
        )
    }
}
