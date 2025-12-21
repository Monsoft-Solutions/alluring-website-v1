import { NextResponse } from 'next/server'

import { getEmailStats } from '@/lib/queries/emails.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/emails/stats
 * Get email delivery statistics
 */
export async function GET() {
    try {
        await requireAuth()

        const stats = await getEmailStats()

        return NextResponse.json(stats)
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch email stats',
            'Error fetching email stats:'
        )
    }
}
