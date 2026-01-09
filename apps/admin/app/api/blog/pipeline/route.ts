/**
 * Pipeline Kanban API
 *
 * Returns blog posts grouped by pipeline status for the Kanban board.
 *
 * @route GET /api/blog/pipeline
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
    getPostsByStatus,
    getPipelineStats,
} from '@/lib/queries/pipeline.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        await requireAuth()

        const searchParams = request.nextUrl.searchParams
        const view = searchParams.get('view') || 'kanban'

        if (view === 'stats') {
            const stats = await getPipelineStats()
            return NextResponse.json(stats)
        }

        // Default: kanban view with posts grouped by status
        const postsByStatus = await getPostsByStatus()
        return NextResponse.json(postsByStatus)
    } catch (error) {
        return handleApiError(error, 'Failed to fetch pipeline data')
    }
}
