/**
 * URL Inspection API Route
 *
 * Inspects URLs using the Google Search Console URL Inspection API.
 * Note: Has quota limits (2,000 requests/day).
 */
import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'

import {
    inspectUrls,
    isSearchConsoleConfigured,
} from '@/lib/services/google-search-console.service'
import type { UrlInspectionResult } from '@/lib/types/search-console/search-console.type'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'
export const maxDuration = 60 // URL inspection can take time

const requestSchema = z.object({
    urls: z.array(z.string().url()).min(1).max(10), // Limit to 10 URLs per request
})

type UrlInspectionResponse =
    | {
          configured: boolean
          message?: string
          data: UrlInspectionResult[]
      }
    | {
          success: false
          error: string
      }

/**
 * POST /api/admin/search-console/url-inspection
 * Inspect multiple URLs for indexing status
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<UrlInspectionResponse>> {
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

        const body = (await request.json()) as unknown
        const validationResult = requestSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request parameters. Provide an array of 1-10 valid URLs.',
                },
                { status: 400 }
            )
        }

        const { urls } = validationResult.data

        const data = await inspectUrls(urls)

        return NextResponse.json({
            configured: true,
            data,
        })
    } catch (error) {
        console.error('Error inspecting URLs:', error)

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
                        : 'Failed to inspect URLs',
            },
            { status: 500 }
        )
    }
}
