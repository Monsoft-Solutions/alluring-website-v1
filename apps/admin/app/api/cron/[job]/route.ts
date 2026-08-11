/**
 * Cron Dispatch Route
 *
 * Single entry point for all scheduled jobs. Vercel cron (see
 * apps/admin/vercel.json) GETs /api/cron/<job> with an
 * `Authorization: Bearer <CRON_SECRET>` header; locally,
 * scripts/trigger-cron.sh sends the same request against the dev server.
 *
 * This path is excluded from the cookie-auth middleware (PUBLIC_PATHS) —
 * auth happens here via the timing-safe CRON_SECRET check. Each job handles
 * its own locking and run recording; this route only authenticates,
 * dispatches, and logs.
 *
 * @route GET /api/cron/[job]
 */
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { verifyCronRequest } from '@/lib/utils/cron-auth.util'
import {
    runAutopilotIdeationJob,
    startAutopilotContentJob,
} from '@/lib/services/autopilot.service'

export const runtime = 'nodejs'
// Ideation runs inline in this invocation (one model call + gate + inserts);
// the content job only pre-flights and starts a durable workflow.
export const maxDuration = 300

/**
 * A job returns a small JSON-serializable summary; `outcome` is always
 * present and is what the log line and the heartbeat acceptance check read.
 */
type CronJobResult = { outcome: string } & Record<string, unknown>

const JOBS: Record<string, () => Promise<CronJobResult>> = {
    /** No-op job proving schedule + auth + middleware carve-out end-to-end. */
    heartbeat: () => Promise.resolve({ outcome: 'ok' }),

    /** Tops up the idea approval queue on its configured cadence. */
    'autopilot-ideation': async () => {
        const result = await runAutopilotIdeationJob('cron')
        return { outcome: result.outcome, ...result.detail }
    },

    /** Writes the next queued topic through the pipeline to Draft. */
    'autopilot-content': async () => {
        const result = await startAutopilotContentJob('cron')
        return { outcome: result.outcome, ...result.detail }
    },
}

type RouteParams = {
    params: Promise<{ job: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { job } = await params

    const unauthorized = verifyCronRequest(request)
    if (unauthorized) return unauthorized

    const handler = JOBS[job]
    if (!handler) {
        return NextResponse.json(
            { success: false, error: `Unknown cron job: ${job}` },
            { status: 404 }
        )
    }

    const startedAt = Date.now()
    try {
        const result = await handler()
        console.log(
            `[cron:${job}] outcome=${result.outcome} durationMs=${Date.now() - startedAt}`
        )
        return NextResponse.json({ success: true, job, ...result })
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(
            `[cron:${job}] failed durationMs=${Date.now() - startedAt} error=${message}`
        )
        return NextResponse.json(
            { success: false, job, error: message },
            { status: 500 }
        )
    }
}
