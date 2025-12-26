import { type NextRequest, NextResponse } from 'next/server'

import { getBlogIdeaById } from '@/lib/queries/ideas.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

type RouteContext = {
    params: Promise<{ id: string }>
}

/**
 * GET /api/blog/ideas/[id]
 * Get a single blog idea by ID with full details
 */
export async function GET(_request: NextRequest, context: RouteContext) {
    try {
        await requireAuth()

        const { id } = await context.params
        const idea = await getBlogIdeaById(id)

        if (!idea) {
            return NextResponse.json(
                { success: false, error: 'Idea not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(idea)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch blog idea',
            'Error fetching blog idea:'
        )
    }
}
