/**
 * Position Changes API Route
 *
 * Returns keyword position changes between current and previous periods.
 * Shows both winners (improved rankings) and losers (dropped rankings).
 */
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import {
    getPositionChanges,
    isSearchConsoleConfigured,
} from '@/lib/services/google-search-console.service'
import type { PositionChange } from '@/lib/types/search-console/search-console.type'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(1).max(90).default(7),
    limit: z.coerce.number().int().min(1).max(50).default(20),
})

type PositionChangesResponse =
    | {
          configured: boolean
          message?: string
          data: {
              winners: PositionChange[]
              losers: PositionChange[]
          }
      }
    | {
          success: false
          error: string
      }

/**
 * GET /api/admin/search-console/position-changes
 * Get keyword position changes between periods
 */
export async function GET(
    request: NextRequest
): Promise<NextResponse<PositionChangesResponse>> {
    try {
        await requireAuth()

        // Check if GSC is configured
        if (!isSearchConsoleConfigured()) {
            return NextResponse.json({
                configured: false,
                message: 'Google Search Console is not configured',
                data: { winners: [], losers: [] },
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

        const { days, limit } = validationResult.data

        const data = await getPositionChanges(days, limit)

        return NextResponse.json({
            configured: true,
            data,
        })
    } catch (error) {
        console.error('Error fetching position changes:', error)

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
                        : 'Failed to fetch position changes',
            },
            { status: 500 }
        )
    }
}
