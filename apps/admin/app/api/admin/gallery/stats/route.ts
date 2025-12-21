import { NextResponse } from 'next/server'

import { getGalleryStats } from '@/lib/queries/gallery.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/gallery/stats
 * Get gallery summary statistics
 */
export async function GET() {
    try {
        await requireAuth()

        const stats = await getGalleryStats()

        return NextResponse.json(stats)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch gallery stats',
            'Error fetching gallery stats:'
        )
    }
}
