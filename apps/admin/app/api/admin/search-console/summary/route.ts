import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
    getSearchConsoleSummary,
    isSearchConsoleConfigured,
} from '@/lib/services/google-search-console.service'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(1).max(365).default(28),
})

/**
 * GET /api/admin/search-console/summary
 * Get Search Console summary stats (clicks, impressions, CTR, position, top query)
 *
 * Query params:
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
                data: null,
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

        const { days } = validationResult.data
        const summary = await getSearchConsoleSummary(days)

        return NextResponse.json({
            configured: true,
            data: summary,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch Search Console summary',
            'Error fetching Search Console summary:'
        )
    }
}
