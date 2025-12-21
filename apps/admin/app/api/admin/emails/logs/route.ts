import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getEmailLogs } from '@/lib/queries/emails.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

const querySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(15),
    status: z.enum(['sent', 'failed', 'pending', 'all']).default('all'),
})

/**
 * GET /api/admin/emails/logs
 * Get paginated email delivery logs
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

        const { page, pageSize, status } = validationResult.data
        const data = await getEmailLogs(page, pageSize, { status })

        return NextResponse.json(data)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch email logs',
            'Error fetching email logs:'
        )
    }
}
