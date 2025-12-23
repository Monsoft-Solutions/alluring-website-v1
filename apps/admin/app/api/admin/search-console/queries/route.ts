import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
    getTopQueries,
    isSearchConsoleConfigured,
} from '@/lib/services/google-search-console.service'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(1).max(365).default(28),
    limit: z.coerce.number().int().min(1).max(100).default(25),
    orderBy: z
        .enum(['clicks', 'impressions', 'ctr', 'position'])
        .default('clicks'),
})

/**
 * GET /api/admin/search-console/queries
 * Get top search queries with performance metrics
 *
 * Query params:
 * - days: number (1-365, default: 28)
 * - limit: number (1-100, default: 25)
 * - orderBy: 'clicks' | 'impressions' | 'ctr' | 'position' (default: 'clicks')
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

        const { days, limit, orderBy } = validationResult.data
        const queries = await getTopQueries(days, limit, orderBy)

        return NextResponse.json({
            configured: true,
            data: queries,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch search queries',
            'Error fetching search queries:'
        )
    }
}
