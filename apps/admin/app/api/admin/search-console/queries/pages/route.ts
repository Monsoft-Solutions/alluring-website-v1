/**
 * Query Pages API Route
 *
 * Get all pages ranking for a specific query from Google Search Console.
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
    getPagesForQuery,
    isSearchConsoleConfigured,
} from '@/lib/services/google-search-console.service'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    query: z.string().min(1, 'Query is required'),
    days: z.coerce.number().int().min(1).max(365).default(28),
    limit: z.coerce.number().int().min(1).max(100).default(25),
})

/**
 * GET /api/admin/search-console/queries/pages
 * Get all pages ranking for a specific query
 *
 * Query params:
 * - query: string (required - the search query)
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

        const { query, days, limit } = validationResult.data

        const pages = await getPagesForQuery(query, days, limit)

        return NextResponse.json({
            configured: true,
            data: pages,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch pages for query',
            'Error fetching pages for query:'
        )
    }
}
