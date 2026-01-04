import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getTrafficSources } from '@/lib/queries/analytics.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(0).max(365).default(30),
    limit: z.coerce.number().int().min(1).max(100).default(10),
})

/**
 * GET /api/admin/analytics/sources
 * Get traffic sources breakdown
 *
 * Query params:
 * - days: number (0-365, default: 30)
 * - limit: number (1-100, default: 10)
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

        const { days, limit } = validationResult.data
        const data = await getTrafficSources(days, limit)

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch traffic sources',
            'Error fetching traffic sources:'
        )
    }
}
