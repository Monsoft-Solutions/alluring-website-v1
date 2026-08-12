import { NextResponse } from 'next/server'

import { getLatestCannibalizationReport } from '@/lib/queries/cannibalization-report.query'
import { runCannibalizationReportJob } from '@/lib/services/cannibalization-report.service'
import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'

export const runtime = 'nodejs'

/**
 * GET /api/admin/seo/cannibalization
 * The latest weekly cannibalization report (null before the first run).
 */
export async function GET() {
    try {
        await requireAuth()
        const report = await getLatestCannibalizationReport()
        return NextResponse.json({ data: report })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to fetch cannibalization report',
            'Error fetching cannibalization report:'
        )
    }
}

/**
 * POST /api/admin/seo/cannibalization
 * Re-run the report now (bypasses the weekly due-check).
 */
export async function POST() {
    try {
        await requireAuth()
        const result = await runCannibalizationReportJob('manual')
        return NextResponse.json({ data: result })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to run cannibalization report',
            'Error running cannibalization report:'
        )
    }
}
