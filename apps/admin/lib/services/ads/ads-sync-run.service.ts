/**
 * Ads Sync Run Lock
 *
 * The run bookkeeping both Ads jobs share: the snapshot and the lead click
 * resolver each hold their own lock, a `running` row in `ads_sync_run`
 * guarded by a partial unique index (the gsc_sync_run pattern). Acquiring the
 * lock IS inserting the row; a stale row from a dead invocation is failed
 * after STALE_RUN_MINUTES so the lock frees itself.
 *
 * Times are compared and written with the database's `now()`: the database
 * runs in America/New_York and `started_at` defaults to that wall time, so a
 * JS Date (UTC wall time once stored) would sit four hours off and make every
 * running row look stale.
 *
 * @module @/lib/services/ads/ads-sync-run.service
 */
import { and, eq, lt, sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { adsSyncRun } from '@workspace/db/schema/ads'
import type { AdsSyncRun } from '@workspace/db/schema/ads'

/** A `running` row older than this is presumed dead and failed. */
export const STALE_RUN_MINUTES = 30

export type AdsSyncJob = AdsSyncRun['job']
export type AdsSyncTrigger = AdsSyncRun['trigger']

/** Fail the job's `running` row if it is old enough to be a dead invocation. */
export async function releaseStaleAdsLock(job: AdsSyncJob): Promise<void> {
    await db
        .update(adsSyncRun)
        .set({
            status: 'failed',
            error: `Presumed dead: still running after ${STALE_RUN_MINUTES} minutes`,
            finishedAt: sql`now()`,
        })
        .where(
            and(
                eq(adsSyncRun.job, job),
                eq(adsSyncRun.status, 'running'),
                lt(
                    adsSyncRun.startedAt,
                    sql`now() - make_interval(mins => ${STALE_RUN_MINUTES})`
                )
            )
        )
}

/**
 * Insert the job's running row.
 *
 * @returns The run id, or null when another run of the same job holds the lock
 */
export async function acquireAdsLock(
    job: AdsSyncJob,
    trigger: AdsSyncTrigger,
    window?: { startDate: string; endDate: string }
): Promise<string | null> {
    try {
        const [run] = await db
            .insert(adsSyncRun)
            .values({
                job,
                trigger,
                status: 'running',
                windowStart: window?.startDate,
                windowEnd: window?.endDate,
            })
            .returning({ id: adsSyncRun.id })
        return run?.id ?? null
    } catch (error) {
        // 23505 = unique violation on the partial running index. Drizzle
        // wraps the driver error, so the code can sit on `cause`.
        const code =
            (error as { code?: string }).code ??
            (error as { cause?: { code?: string } }).cause?.code
        if (code === '23505') return null
        throw error
    }
}

/** Close a run as completed or failed. */
export async function finishAdsRun(
    runId: string,
    result: {
        status: 'completed' | 'failed'
        counts?: Record<string, number>
        apiOperations?: number
        error?: string
    }
): Promise<void> {
    await db
        .update(adsSyncRun)
        .set({
            status: result.status,
            counts: result.counts,
            apiOperations: result.apiOperations,
            error: result.error,
            finishedAt: sql`now()`,
        })
        .where(eq(adsSyncRun.id, runId))
}
