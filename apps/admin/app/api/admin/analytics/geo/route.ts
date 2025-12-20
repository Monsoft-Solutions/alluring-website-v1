import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getGeoDistribution } from '@/lib/queries/analytics.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
})

/**
 * GET /api/admin/analytics/geo
 * Get geographic distribution of visitors
 *
 * Query params:
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

        const { limit } = validationResult.data
        const data = await getGeoDistribution(limit)

        return NextResponse.json(data)
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching geo distribution:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch geo distribution' },
            { status: 500 }
        )
    }
}
