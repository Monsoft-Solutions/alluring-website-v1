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
    startRefreshRunJob,
} from '@/lib/services/autopilot.service'
import { reapStuckPosts } from '@/lib/services/stuck-post-reaper.service'
import { runGscSnapshotJob } from '@/lib/services/gsc-snapshot.service'
import { runCannibalizationReportJob } from '@/lib/services/cannibalization-report.service'
import { runDecayDetectionJob } from '@/lib/services/decay-detection.service'
import { runRefreshOutcomesJob } from '@/lib/services/refresh-outcome.service'
import { getSnapshotStatus } from '@/lib/queries/gsc-snapshot.query'
import {
    countActiveRefreshRuns,
    getRefreshQueueDepth,
} from '@/lib/queries/content-refresh.query'
import { gscFinalDate } from '@/lib/utils/gsc-snapshot.util'

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
    /**
     * Loop-health check: snapshot lag (days the newest snapshot trails the
     * newest final GSC date; 0 = healthy) and refresh queue depth, one log
     * line for ops.
     */
    heartbeat: async () => {
        const [snapshot, queueDepth, activeRuns] = await Promise.all([
            getSnapshotStatus(),
            getRefreshQueueDepth(),
            countActiveRefreshRuns(),
        ])
        const snapshotLagDays = snapshot.latestDate
            ? Math.round(
                  (new Date(`${gscFinalDate(new Date())}T00:00:00Z`).getTime() -
                      new Date(`${snapshot.latestDate}T00:00:00Z`).getTime()) /
                      (24 * 60 * 60 * 1000)
              )
            : null
        console.log(
            `[cron:heartbeat] snapshotLagDays=${snapshotLagDays ?? 'no-snapshots'} refreshQueueDepth=${queueDepth} activeRefreshRuns=${activeRuns}`
        )
        return {
            outcome: 'ok',
            snapshotLagDays,
            refreshQueueDepth: queueDepth,
            activeRefreshRuns: activeRuns,
        }
    },

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

    /** Runs the decay rules and feeds the refresh queue (#147). */
    'detect-decay': async () => {
        const result = await runDecayDetectionJob('cron')
        return { ...result }
    },

    /** Auto mode: starts a durable refresh run for the top candidate (#144). */
    'autopilot-refresh': async () => {
        const result = await startRefreshRunJob('cron')
        return { outcome: result.outcome, ...result.detail }
    },

    /** Scores applied refreshes 28 days out from snapshots (#144). */
    'refresh-outcomes': async () => {
        const result = await runRefreshOutcomesJob()
        return {
            outcome: result.outcome,
            measured: result.measured,
            ...(result.verdicts ? { verdicts: result.verdicts } : {}),
        }
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
