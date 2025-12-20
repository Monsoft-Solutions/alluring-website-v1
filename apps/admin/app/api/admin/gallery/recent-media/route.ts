import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getRecentMedia } from '@/lib/queries/gallery.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).default(8),
})

/**
 * GET /api/admin/gallery/recent-media
 * Get recently uploaded gallery media
 */
export async function GET(request: NextRequest) {
    try {
        await requireAuth()

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

        const { limit } = validationResult.data
        const media = await getRecentMedia(limit)

        return NextResponse.json(media)
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching recent media:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch recent media' },
            { status: 500 }
        )
    }
}
