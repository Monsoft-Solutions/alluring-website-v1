import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getBlogIdeas, getIdeasByStage } from '@/lib/queries/ideas.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
    sortBy: z
        .enum(['createdAt', 'priority', 'aiGeneratedScore'])
        .default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    stage: z
        .enum([
            'backlog',
            'researching',
            'approved',
            'in_progress',
            'published',
        ])
        .optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    contentType: z
        .enum([
            'tutorial',
            'guide',
            'how_to',
            'case_study',
            'comparison',
            'faq',
            'listicle',
            'announcement',
            'thought_leadership',
        ])
        .optional(),
    search: z.string().optional(),
    view: z.enum(['list', 'kanban']).default('list'),
})

/**
 * GET /api/blog/ideas
 * Get list of blog ideas with filtering, sorting, and pagination
 * Supports both list view and kanban view (grouped by stage)
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

        const { view, ...options } = validationResult.data

        // Return kanban view (grouped by stage) or list view
        if (view === 'kanban') {
            const ideasByStage = await getIdeasByStage()
            return NextResponse.json(ideasByStage)
        }

        const result = await getBlogIdeas(options)
        return NextResponse.json(result)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch blog ideas',
            'Error fetching blog ideas:'
        )
    }
}
