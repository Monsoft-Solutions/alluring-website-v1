import { NextResponse } from 'next/server'

import { getEmailStats } from '@/lib/queries/emails.query'
import { requireAuth } from '@/lib/utils/auth.util'

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
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching email stats:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch email stats' },
            { status: 500 }
        )
    }
}
