/**
 * Query Search API Route
 *
 * Search queries by term with contains filter from Google Search Console.
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
    getQueriesByTerm,
    isSearchConsoleConfigured,
} from '@/lib/services/google-search-console.service'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    term: z.string().default(''),
    days: z.coerce.number().int().min(1).max(365).default(28),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    orderBy: z
        .enum(['clicks', 'impressions', 'ctr', 'position'])
        .default('clicks'),
    orderDirection: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * GET /api/admin/search-console/queries/search
 * Search queries by term with contains filter
 *
 * Query params:
 * - term: string (search term, empty returns all)
 * - days: number (1-365, default: 28)
 * - limit: number (1-100, default: 50)
 * - orderBy: 'clicks' | 'impressions' | 'ctr' | 'position' (default: 'clicks')
 * - orderDirection: 'asc' | 'desc' (default: 'desc')
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

        const { term, days, limit, orderBy, orderDirection } =
            validationResult.data

        const queries = await getQueriesByTerm(
            term,
            days,
            limit,
            orderBy,
            orderDirection
        )

        return NextResponse.json({
            configured: true,
            data: queries,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to search queries',
            'Error searching queries:'
        )
    }
}
