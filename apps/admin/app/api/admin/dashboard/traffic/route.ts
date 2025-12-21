import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getPageViewsOverTime } from '@/lib/queries/analytics.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(1).max(365).default(30),
})

/**
 * GET /api/admin/dashboard/traffic
 * Get traffic data (views + sessions) for dashboard chart
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
        const data = await getPageViewsOverTime(days)

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching dashboard traffic:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
