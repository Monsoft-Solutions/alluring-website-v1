import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getRecentMedia } from '@/lib/queries/gallery.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

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
        return handleApiError(
            error,
            'Failed to fetch recent media',
            'Error fetching recent media:'
        )
    }
}
