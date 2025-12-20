import { NextResponse } from 'next/server'

import { getDeviceBreakdown } from '@/lib/queries/analytics.query'
import { requireAuth } from '@/lib/utils/auth.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/analytics/devices
 * Get device type breakdown (mobile, desktop, tablet)
 */
export async function GET() {
    try {
        await requireAuth()

        const data = await getDeviceBreakdown()

        return NextResponse.json(data)
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        console.error('Error fetching device breakdown:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch device breakdown' },
            { status: 500 }
        )
    }
}
