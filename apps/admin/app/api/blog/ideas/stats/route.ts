import { NextResponse } from 'next/server'

import { getIdeaStageStats } from '@/lib/queries/ideas.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

/**
 * GET /api/blog/ideas/stats
 * Get count of ideas by stage for dashboard stats
 */
export async function GET() {
    try {
        await requireAuth()

        const stats = await getIdeaStageStats()

        return NextResponse.json(stats)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch idea stats',
            'Error fetching idea stats:'
        )
    }
}
