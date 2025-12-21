import { NextResponse } from 'next/server'

import { getDeviceBreakdown } from '@/lib/queries/analytics.query'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

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
        return handleApiError(
            error,
            'Failed to fetch device breakdown',
            'Error fetching device breakdown:'
        )
    }
}
