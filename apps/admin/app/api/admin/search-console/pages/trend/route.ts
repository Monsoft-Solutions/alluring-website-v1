/**
 * Page Trend API Route
 *
 * Get daily performance trend for a specific page from Google Search Console.
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
    getPageTrend,
    isSearchConsoleConfigured,
} from '@/lib/services/search-console'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    pageUrl: z.string().min(1, 'Page URL is required'),
    days: z.coerce.number().int().min(1).max(365).default(28),
})

/**
 * GET /api/admin/search-console/pages/trend
 * Get daily performance trend for a specific page
 *
 * Query params:
 * - pageUrl: string (required - the full page URL)
 * - days: number (1-365, default: 28)
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

        const { pageUrl, days } = validationResult.data

        const trend = await getPageTrend(pageUrl, days)

        return NextResponse.json({
            configured: true,
            data: trend,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch page trend',
            'Error fetching page trend:'
        )
    }
}
