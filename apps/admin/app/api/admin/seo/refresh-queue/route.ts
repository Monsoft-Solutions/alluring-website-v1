import { NextResponse } from 'next/server'

import { getRefreshQueueSummary } from '@/lib/queries/content-refresh.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/seo/refresh-queue
 * Refresh queue depth + top candidates, for the SEO dashboard card (#147).
 */
export async function GET() {
    try {
        await requireAuth()
        const summary = await getRefreshQueueSummary()
        return NextResponse.json({ data: summary })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch refresh queue',
            'Error fetching refresh queue:'
        )
    }
}
