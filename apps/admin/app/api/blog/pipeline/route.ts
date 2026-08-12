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
import { reapStuckPosts } from '@/lib/services/stuck-post-reaper.service'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
    try {
        await requireAuth()

        const searchParams = request.nextUrl.searchParams
        const view = searchParams.get('view') || 'kanban'

        // Lazy reap before reading: the board polls this route every 3s
        // while anything is processing, so a dead run surfaces here as a
        // retryable error within one threshold window even without cron.
        // Guarded — a reaper failure must not take the board down with it.
        try {
            await reapStuckPosts()
        } catch (error) {
            console.error('[Pipeline API] Stuck-post reaper failed:', error)
        }

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
