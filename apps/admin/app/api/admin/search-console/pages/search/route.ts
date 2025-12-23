/**
 * Page Search API Route
 *
 * Search pages by term and filter by page type from Google Search Console.
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
    searchPages,
    isSearchConsoleConfigured,
} from '@/lib/services/search-console'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    term: z.string().default(''),
    pageType: z
        .enum([
            'blog',
            'blog-listing',
            'procedure',
            'pages',
            'gallery',
            'promotion',
            'other',
            'all',
        ])
        .default('all'),
    days: z.coerce.number().int().min(1).max(365).default(28),
    limit: z.coerce.number().int().min(1).max(500).default(100),
    orderBy: z
        .enum(['clicks', 'impressions', 'ctr', 'position'])
        .default('clicks'),
    orderDirection: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * GET /api/admin/search-console/pages/search
 * Search pages by term and page type with filtering
 *
 * Query params:
 * - term: string (search term matching path, empty returns all)
 * - pageType: 'blog' | 'blog-listing' | 'procedure' | 'pages' | 'gallery' | 'promotion' | 'other' | 'all' (default: 'all')
 * - days: number (1-365, default: 28)
 * - limit: number (1-500, default: 100)
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

        const { term, pageType, days, limit, orderBy, orderDirection } =
            validationResult.data

        const pages = await searchPages(
            term,
            pageType,
            days,
            limit,
            orderBy,
            orderDirection
        )

        return NextResponse.json({
            configured: true,
            data: pages,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to search pages',
            'Error searching pages:'
        )
    }
}
