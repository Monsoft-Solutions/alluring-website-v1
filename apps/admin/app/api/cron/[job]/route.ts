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
import { reapStuckPosts } from '@/lib/services/stuck-post-reaper.service'
import { runGscSnapshotJob } from '@/lib/services/gsc-snapshot.service'
import { runCannibalizationReportJob } from '@/lib/services/cannibalization-report.service'

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

    /** Flips posts stuck in 'processing' (dead invocation) to a retryable error. */
    'reap-stuck-posts': async () => {
        const reaped = await reapStuckPosts()
        return {
            outcome: reaped.length > 0 ? 'reaped' : 'clean',
            reaped: reaped.length,
            postIds: reaped.map((post) => post.id),
        }
    },

    /** Catches gsc_query_page_daily up to the newest final GSC date (#145). */
    'gsc-snapshot': async () => {
        const result = await runGscSnapshotJob('cron')
        return {
            outcome: result.outcome,
            datesPulled: result.datesPulled.length,
            rowsUpserted: result.rowsUpserted,
            ...(result.error ? { error: result.error } : {}),
        }
    },

    /** Weekly cannibalization findings + the SEO digest email (#146). */
    'cannibalization-report': async () => {
        const result = await runCannibalizationReportJob('cron')
        return { ...result }
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
