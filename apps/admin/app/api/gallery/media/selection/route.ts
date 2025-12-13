import { NextRequest, NextResponse } from 'next/server'

import {
    getGalleryMediaForSelection,
    type GalleryMediaSortBy,
    type GalleryMediaSortOrder,
    type GalleryMediaStatusFilter,
    type GalleryMediaTypeFilter,
} from '@/lib/queries/gallery.query'
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

        const page = parseInt(searchParams.get('page') || '1', 10)
        const pageSize = parseInt(searchParams.get('pageSize') || '24', 10)
        const sortBy = (searchParams.get('sortBy') ||
            'createdAt') as GalleryMediaSortBy
        const sortOrder = (searchParams.get('sortOrder') ||
            'desc') as GalleryMediaSortOrder
        const status = (searchParams.get('status') ||
            'all') as GalleryMediaStatusFilter
        const type = (searchParams.get('type') ||
            'all') as GalleryMediaTypeFilter
        const search = searchParams.get('search') || undefined

        // Parse hasGroup
        const hasGroupParam = searchParams.get('hasGroup')
        const hasGroup =
            hasGroupParam === null ? null : hasGroupParam === 'true'

        // Parse excludeMediaIds
        const excludeMediaIdsParam = searchParams.get('excludeMediaIds')
        const excludeMediaIds = excludeMediaIdsParam
            ? excludeMediaIdsParam.split(',').filter(Boolean)
            : []

        const result = await getGalleryMediaForSelection({
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
