/**
 * Sitemap Submit API Route
 *
 * Submits (or resubmits) a sitemap to Google Search Console.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
    submitSitemap,
    isSearchConsoleConfigured,
} from '@/lib/services/search-console'
import { requireAuth, UnauthorizedError } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

const submitSitemapSchema = z.object({
    sitemapPath: z.string().url('Invalid sitemap URL'),
})

type SubmitSitemapResponse =
    | {
          success: true
          message: string
      }
    | {
          success: false
          error: string
      }

/**
 * POST /api/admin/search-console/sitemaps/submit
 * Submit a sitemap to Google Search Console
 */
export async function POST(
    request: NextRequest
): Promise<NextResponse<SubmitSitemapResponse>> {
    try {
        await requireAuth()

        // Check if GSC is configured
        if (!isSearchConsoleConfigured()) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Google Search Console is not configured',
                },
                { status: 400 }
            )
        }

        // Parse and validate request body
        const body = await request.json()
        const validationResult = submitSitemapSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        validationResult.error.issues[0]?.message ??
                        'Invalid request body',
                },
                { status: 400 }
            )
        }

        const { sitemapPath } = validationResult.data

        await submitSitemap(sitemapPath)

        return NextResponse.json({
            success: true,
            message: `Sitemap "${sitemapPath}" submitted successfully`,
        })
    } catch (error) {
        console.error('Error submitting sitemap:', error)

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
                        : 'Failed to submit sitemap',
            },
            { status: 500 }
        )
    }
}
