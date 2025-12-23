/**
 * Page Queries API Route
 *
 * Returns all search queries driving traffic to a specific page.
 * Used for the Page Deep Dive feature.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import {
    getQueriesForPage,
    isSearchConsoleConfigured,
} from '@/lib/services/google-search-console.service'
import type { PageQueryData } from '@/lib/types/search-console/search-console.type'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    pageUrl: z.string().min(1, 'Page URL is required'),
    days: z.coerce.number().int().min(1).max(365).default(28),
    limit: z.coerce.number().int().min(1).max(500).default(100),
})

type PageQueriesResponse =
    | {
          configured: boolean
          message?: string
          data: PageQueryData[]
      }
    | {
          success: false
          error: string
      }

/**
 * GET /api/admin/search-console/page-queries
 * Get all queries driving traffic to a specific page
 */
export async function GET(
    request: NextRequest
): Promise<NextResponse<PageQueriesResponse>> {
    try {
        await requireAuth()

        // Check if GSC is configured
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
                },
                { status: 400 }
            )
        }

        const { pageUrl, days, limit } = validationResult.data

        const data = await getQueriesForPage(pageUrl, days, limit)

        return NextResponse.json({
            configured: true,
            data,
        })
    } catch (error) {
        console.error('Error fetching page queries:', error)

        if (error instanceof UnauthorizedError) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch page queries',
            },
            { status: 500 }
        )
    }
}
