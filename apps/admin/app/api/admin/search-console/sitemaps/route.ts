/**
 * Sitemaps API Route
 *
 * Returns submitted sitemaps and their status from Google Search Console.
 */
import { NextResponse } from 'next/server'

import {
    getSitemaps,
    isSearchConsoleConfigured,
} from '@/lib/services/search-console'
import type { SitemapInfo } from '@/lib/types/search-console/search-console.type'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

type SitemapsResponse =
    | {
          configured: boolean
          message?: string
          data: SitemapInfo[]
      }
    | {
          success: false
          error: string
      }

/**
 * GET /api/admin/search-console/sitemaps
 * Get all submitted sitemaps and their status
 */
export async function GET(): Promise<NextResponse<SitemapsResponse>> {
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

        const data = await getSitemaps()

        return NextResponse.json({
            configured: true,
            data,
        })
    } catch (error) {
        console.error('Error fetching sitemaps:', error)

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
                        : 'Failed to fetch sitemaps',
            },
            { status: 500 }
        )
    }
}
