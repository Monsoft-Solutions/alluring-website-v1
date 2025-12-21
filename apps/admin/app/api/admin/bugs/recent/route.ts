import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getRecentBugReports } from '@/lib/queries/stats.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(5),
})

/**
 * GET /api/admin/bugs/recent
 * Get recent bug reports
 *
 * Query params:
 * - limit: number (1-50, default: 5)
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

        const { limit } = validationResult.data
        const reports = await getRecentBugReports(limit)

        return NextResponse.json(reports)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch recent bug reports',
            'Error fetching recent bug reports:'
        )
    }
}
