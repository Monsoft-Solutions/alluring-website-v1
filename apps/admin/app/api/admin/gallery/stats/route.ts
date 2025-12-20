import { NextResponse } from 'next/server'

import { getGalleryStats } from '@/lib/queries/gallery.query'
import { requireAuth } from '@/lib/utils/auth.util'

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
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching gallery stats:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch gallery stats' },
            { status: 500 }
        )
    }
}
