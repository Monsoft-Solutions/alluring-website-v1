/**
 * Run Refresh API
 *
 * Starts the durable refresh workflow for a pending candidate (epic #144
 * Phase 5): pre-flight rails → run lock → candidate claim → workflow
 * start. Returns immediately — the run continues in the workflow, the
 * queue row tracks in_progress → ready_for_review, and the admin is
 * emailed when the draft is ready. This replaced the Phase 4 inline
 * execution that gambled on a single 800s request surviving.
 *
 * @route POST /api/admin/refresh/[id]/run
 */
import { NextResponse } from 'next/server'

import { requireAuth } from '@/lib/utils/auth.util'
import { handleApiError } from '@/lib/utils/api-error-handler.util'
import { startRefreshRunJob } from '@/lib/services/autopilot.service'

export const runtime = 'nodejs'

/** The pre-flight skip reasons a manual start can actually hit. */
const SKIP_MESSAGES: Record<string, string> = {
    'mode-off':
        'Refresh mode is off — enable suggest or auto in Blog AI Settings',
    'unacknowledged-failure':
        'A failed refresh run needs acknowledgment in Blog AI Settings first',
    locked: 'Another refresh run is already in progress',
    'draft-cap':
        'The refresh draft cap is reached — review or dismiss the waiting refresh drafts first',
    'candidate-not-pending':
        'This candidate is not pending — it may already be running or closed',
}

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: RouteParams) {
    const { id } = await params

    try {
        await requireAuth()

        const result = await startRefreshRunJob('manual', id)

        if (result.outcome === 'started') {
            return NextResponse.json({ success: true, ...result.detail })
        }

        if (result.outcome === 'skipped') {
            const reason =
                typeof result.detail.reason === 'string'
                    ? result.detail.reason
                    : 'unknown'
            return NextResponse.json(
                {
                    success: false,
                    reason,
                    error:
                        SKIP_MESSAGES[reason] ??
                        `The refresh could not start (${reason})`,
                },
                { status: 409 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error:
                    typeof result.detail.error === 'string'
                        ? result.detail.error
                        : 'Failed to start the refresh',
            },
            { status: 500 }
        )
    } catch (error) {
        return handleApiError(
            error,
            'Failed to start the refresh',
            'Error starting refresh:'
        )
    }
}
