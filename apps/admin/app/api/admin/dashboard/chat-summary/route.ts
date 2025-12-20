import { NextResponse } from 'next/server'

import { getChatSummary } from '@/lib/queries/dashboard-chat.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/dashboard/chat-summary
 * Get chat summary stats for dashboard
 */
export async function GET() {
    try {
        await requireAuth()

        const data = await getChatSummary()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching chat summary:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
