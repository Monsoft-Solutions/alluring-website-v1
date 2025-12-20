import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { galleryMediaSelectionParamsSchema } from '@/lib/schemas/gallery-media-selection-params.schema'
import { getGalleryMedia } from '@/lib/queries/gallery.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

/**
 * GET /api/gallery/media/selection
 * Get gallery media for selection dialog with advanced filtering
 */
export async function GET(request: NextRequest) {
    try {
        await requireAuth()

        const searchParams = request.nextUrl.searchParams

        // Convert URLSearchParams to plain object for Zod validation
        const rawParams = Object.fromEntries(searchParams.entries())

        // Validate and parse query parameters with Zod
        const validationResult =
            galleryMediaSelectionParamsSchema.safeParse(rawParams)

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

        const {
            page,
            pageSize,
            sortBy,
            sortOrder,
            status,
            type,
            hasGroup,
            excludeMediaIds,
            search,
        } = validationResult.data

        const result = await getGalleryMedia({
            page,
            pageSize,
            sortBy,
            sortOrder,
            status,
            type,
            hasGroup,
            excludeMediaIds,
            search,
        })

        return NextResponse.json(result)
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching gallery media for selection:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch media' },
            { status: 500 }
        )
    }
}
