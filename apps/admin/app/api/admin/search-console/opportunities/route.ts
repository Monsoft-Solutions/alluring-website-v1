import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
    getContentOpportunities,
    isSearchConsoleConfigured,
} from '@/lib/services/search-console'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(1).max(365).default(28),
    limit: z.coerce.number().int().min(1).max(100).default(25),
})

/**
 * GET /api/admin/search-console/opportunities
 * Get content opportunities - queries with high impressions but low CTR
 *
 * Query params:
 * - days: number (1-365, default: 28)
 * - limit: number (1-100, default: 25)
 */
export async function GET(request: NextRequest) {
    try {
        await requireAuth()

        // Check if Search Console is configured
        if (!isSearchConsoleConfigured()) {
            return NextResponse.json({
                configured: false,
                message: 'Google Search Console is not configured',
                data: [],
            })
        }

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
        const opportunities = await getContentOpportunities(days, limit)

        return NextResponse.json({
            configured: true,
            data: opportunities,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch content opportunities',
            'Error fetching content opportunities:'
        )
    }
}
