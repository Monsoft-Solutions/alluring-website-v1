/**
 * Run Refresh API
 *
 * Executes the full refresh flow for a pending candidate (epic #144, #148):
 * brief → working copy → generate → review → extract → ready_for_review.
 * A route handler rather than a server action for the same reason as the
 * pipeline phase routes — the run needs the long function budget.
 *
 * @route POST /api/admin/refresh/[id]/run
 */
import { NextResponse } from 'next/server'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { runRefreshForCandidate } from '@/lib/services/refresh-execution.service'

export const runtime = 'nodejs'
export const maxDuration = 300

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteParams) {
    const { id } = await params

    try {
        await requireAuth()

        const result = await runRefreshForCandidate(id)
        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: result.error?.includes('not pending') ? 409 : 500 }
            )
        }

        return NextResponse.json({
            success: true,
            workingPostId: result.workingPostId,
        })
    } catch (error) {
        return handleApiError(
            error,
            'Failed to run the refresh',
            'Error running refresh:'
        )
    }
}
