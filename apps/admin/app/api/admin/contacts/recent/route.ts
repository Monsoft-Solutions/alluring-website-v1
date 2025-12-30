import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getRecentContacts } from '@/lib/queries/stats.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    days: z.coerce.number().int().min(0).max(365).default(7),
    limit: z.coerce.number().int().min(1).max(50).default(5),
})

/**
 * GET /api/admin/contacts/recent
 * Get recent contact submissions filtered by date range
 *
 * Query params:
 * - days: number (0-365, default: 7)
 * - limit: number (1-50, default: 5)
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

        const { days, limit } = validationResult.data
        const contacts = await getRecentContacts(days, limit)

        return NextResponse.json(contacts)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch recent contacts',
            'Error fetching recent contacts:'
        )
    }
}
