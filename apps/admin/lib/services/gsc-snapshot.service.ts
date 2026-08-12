/**
 * GSC Snapshot Sync Service
 *
 * Pulls Search Console ['query','page'] rows into gsc_query_page_daily, one
 * final day at a time (issue #145) — our own copy of the data GSC deletes
 * after 16 months, and the substrate every other epic #144 job reads.
 *
 * Catch-up model: each run pulls every date missing between `max(date)` in
 * the table and the newest final date (today−3), capped per run. A date that
 * fails stays missing and is re-selected next run — partial-day retry needs
 * no bookkeeping.
 *
 * The run lock is the gsc_sync_run partial unique index (one `running` row);
 * acquiring the lock IS inserting the running row, per the autopilot
 * pattern. A stale `running` row (dead invocation) is failed after
 * STALE_SYNC_MINUTES so the lock frees itself.
 *
 * @module @/lib/services/gsc-snapshot.service
 */
import { and, eq, lt, max, sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { gscQueryPageDaily, gscSyncRun } from '@workspace/db/schema/gsc'
import type { InsertGscQueryPageDaily } from '@workspace/db/schema/gsc'

import {
    fetchAllSearchAnalytics,
    GSC_MAX_ROW_LIMIT,
} from '@/lib/services/search-console/google-search-console-utils.service'
import { isSearchConsoleConfigured } from '@/lib/services/search-console/google-search-console-client.service'
import { withGscRetry } from '@/lib/services/search-console/gsc-retry.util'
import {
    createBlogPostUrlResolver,
    type BlogPostUrlResolver,
} from '@/lib/services/blog-post-resolver.service'
import { computeMissingDates } from '@/lib/utils/gsc-snapshot.util'

// ============================================
// Constants
// ============================================

/** A `running` sync older than this is presumed dead and failed. */
const STALE_SYNC_MINUTES = 30

/** Rows per insert statement (well under the pg parameter limit). */
const UPSERT_CHUNK_SIZE = 500

// ============================================
// Types
// ============================================

export type GscSnapshotTrigger = 'cron' | 'manual' | 'backfill'

export type GscSnapshotResult = {
    outcome:
        | 'synced'
        | 'up-to-date'
        | 'skipped-unconfigured'
        | 'skipped-locked'
        | 'failed'
    datesPulled: string[]
    rowsUpserted: number
    error?: string
}

// ============================================
// Lock plumbing
// ============================================

/** Fail any `running` row old enough to be a dead invocation. */
async function releaseStaleSyncLock(now: Date): Promise<void> {
    const cutoff = new Date(now.getTime() - STALE_SYNC_MINUTES * 60_000)
    await db
        .update(gscSyncRun)
        .set({
            status: 'failed',
            error: `Presumed dead: still running after ${STALE_SYNC_MINUTES} minutes`,
            finishedAt: now,
        })
        .where(
            and(
                eq(gscSyncRun.status, 'running'),
                lt(gscSyncRun.startedAt, cutoff)
            )
        )
}

/** Insert the running row; null means another sync holds the lock. */
async function acquireSyncLock(
    trigger: GscSnapshotTrigger
): Promise<string | null> {
    try {
        const [run] = await db
            .insert(gscSyncRun)
            .values({ trigger, status: 'running' })
            .returning({ id: gscSyncRun.id })
        return run?.id ?? null
    } catch (error) {
        // 23505 = unique violation on the partial running index
        if (
            typeof error === 'object' &&
            error !== null &&
            (error as { code?: string }).code === '23505'
        ) {
            return null
        }
        throw error
    }
}

// ============================================
// Pull
// ============================================

/** Pull one final day of ['query','page'] rows and upsert them. */
async function pullDate(
    date: string,
    resolvePost: BlogPostUrlResolver
): Promise<number> {
    const rows = await withGscRetry(() =>
        fetchAllSearchAnalytics({
            dimensions: ['query', 'page'],
            startDate: date,
            endDate: date,
            rowLimit: GSC_MAX_ROW_LIMIT,
        })
    )

    const values: InsertGscQueryPageDaily[] = []
    for (const row of rows) {
        const query = row.keys?.[0]
        const page = row.keys?.[1]
        if (!query || !page) continue

        values.push({
            date,
            query,
            page,
            blogPostId: resolvePost(page),
            clicks: row.clicks ?? 0,
            impressions: row.impressions ?? 0,
            ctr: row.ctr ?? 0,
            position: row.position ?? 0,
        })
    }

    for (let i = 0; i < values.length; i += UPSERT_CHUNK_SIZE) {
        const chunk = values.slice(i, i + UPSERT_CHUNK_SIZE)
        await db
            .insert(gscQueryPageDaily)
            .values(chunk)
            .onConflictDoUpdate({
                target: [
                    gscQueryPageDaily.date,
                    gscQueryPageDaily.query,
                    gscQueryPageDaily.page,
                ],
                set: {
                    blogPostId: sql`excluded.blog_post_id`,
                    clicks: sql`excluded.clicks`,
                    impressions: sql`excluded.impressions`,
                    ctr: sql`excluded.ctr`,
                    position: sql`excluded.position`,
                },
            })
    }

    return values.length
}

// ============================================
// The job
// ============================================

/**
 * Run one snapshot sync: catch up every missing final date (capped per run).
 *
 * Dates are pulled oldest-first and committed per day, so a mid-run failure
 * keeps everything already pulled; the failed date re-selects next run.
 */
export async function runGscSnapshotJob(
    trigger: GscSnapshotTrigger = 'cron',
    now: Date = new Date()
): Promise<GscSnapshotResult> {
    if (!isSearchConsoleConfigured()) {
        return {
            outcome: 'skipped-unconfigured',
            datesPulled: [],
            rowsUpserted: 0,
        }
    }

    await releaseStaleSyncLock(now)

    const [latest] = await db
        .select({ latestDate: max(gscQueryPageDaily.date) })
        .from(gscQueryPageDaily)

    const missingDates = computeMissingDates(latest?.latestDate ?? null, now)
    if (missingDates.length === 0) {
        return { outcome: 'up-to-date', datesPulled: [], rowsUpserted: 0 }
    }

    const runId = await acquireSyncLock(trigger)
    if (!runId) {
        return { outcome: 'skipped-locked', datesPulled: [], rowsUpserted: 0 }
    }

    const datesPulled: string[] = []
    let rowsUpserted = 0

    try {
        const resolvePost = await createBlogPostUrlResolver()

        for (const date of missingDates) {
            rowsUpserted += await pullDate(date, resolvePost)
            datesPulled.push(date)
        }

        await db
            .update(gscSyncRun)
            .set({
                status: 'completed',
                datesPulled,
                rowsUpserted,
                finishedAt: new Date(),
            })
            .where(eq(gscSyncRun.id, runId))

        return { outcome: 'synced', datesPulled, rowsUpserted }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(
            `[gsc-snapshot] failed after ${datesPulled.length}/${missingDates.length} dates: ${message}`
        )

        await db
            .update(gscSyncRun)
            .set({
                status: 'failed',
                datesPulled,
                rowsUpserted,
                error: message,
                finishedAt: new Date(),
            })
            .where(eq(gscSyncRun.id, runId))

        return {
            outcome: 'failed',
            datesPulled,
            rowsUpserted,
            error: message,
        }
    }
}
