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
// The full run (generate with research → 7-agent review → extract) has
// taken 5-20 minutes in practice — a fact-heavy article makes the
// verifier slow. 800s is the Fluid compute ceiling; a run the platform
// still kills is recovered by reapStaleRefreshRuns (candidate → failed)
// on the next detection tick. Phase 5's durable workflow replaces this
// single-request execution entirely.
export const maxDuration = 800

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
