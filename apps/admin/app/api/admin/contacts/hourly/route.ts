import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getContactsHourly } from '@/lib/queries/stats.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    date: z.string().refine(
        (val) => {
            const date = new Date(val)
            return !isNaN(date.getTime())
        },
        { message: 'Invalid date format' }
    ),
})

/**
 * GET /api/admin/contacts/hourly
 * Get contacts grouped by hour for a specific date
 *
 * Query params:
 * - date: ISO date string (required)
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

        const { date } = validationResult.data
        const targetDate = new Date(date)
        const data = await getContactsHourly(targetDate)

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch hourly contacts data',
            'Error fetching hourly contacts data:'
        )
    }
}
