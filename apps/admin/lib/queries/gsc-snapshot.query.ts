/**
 * GSC Snapshot Queries
 *
 * Read side of the snapshot tables (epic #144). Per-post trends and window
 * aggregates answer from our own DB — no Search Console call, no 16-month
 * wall, and windows older than the API retains stay queryable forever.
 *
 * Weighted positions use impressions as the weight (a position only matters
 * as often as it was seen), with a NULLIF guard for zero-impression groups.
 *
 * @module @/lib/queries/gsc-snapshot.query
 */
import { desc, eq, sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { gscQueryPageDaily, gscSyncRun } from '@workspace/db/schema/gsc'
import type { GscSyncRun } from '@workspace/db/schema/gsc'

// ============================================
// Types
// ============================================

/** One day of a post's search performance, summed across its queries. */
export type SnapshotTrendPoint = {
    date: string
    clicks: number
    impressions: number
    /** Impression-weighted average position (null when no impressions). */
    position: number | null
}

/** Aggregated (query, page) performance over a date window. */
export type QueryPageAggregate = {
    query: string
    page: string
    blogPostId: string | null
    clicks: number
    impressions: number
    /** Impression-weighted average position over the window. */
    position: number
}

/** Snapshot coverage + last sync, for the dashboard health card. */
export type SnapshotStatus = {
    earliestDate: string | null
    latestDate: string | null
    totalRows: number
    coveredDays: number
    lastRun:
        | (Pick<GscSyncRun, 'status' | 'trigger' | 'rowsUpserted' | 'error'> & {
              startedAt: string
              finishedAt: string | null
              datesPulled: number
          })
        | null
}

// ============================================
// Queries
// ============================================

/**
 * Per-day trend for one post over its most recent `days` snapshot dates.
 * Answers from the DB alone — the #145 acceptance check.
 */
export async function getPostTrendFromSnapshots(
    blogPostId: string,
    days: number = 28
): Promise<SnapshotTrendPoint[]> {
    const rows = await db
        .select({
            date: gscQueryPageDaily.date,
            clicks: sql<number>`sum(${gscQueryPageDaily.clicks})::int`,
            impressions: sql<number>`sum(${gscQueryPageDaily.impressions})::int`,
            position: sql<number | null>`
                sum(${gscQueryPageDaily.position} * ${gscQueryPageDaily.impressions})
                / nullif(sum(${gscQueryPageDaily.impressions}), 0)
            `,
        })
        .from(gscQueryPageDaily)
        .where(eq(gscQueryPageDaily.blogPostId, blogPostId))
        .groupBy(gscQueryPageDaily.date)
        .orderBy(desc(gscQueryPageDaily.date))
        .limit(days)

    return rows
        .map((row) => ({
            date: row.date,
            clicks: row.clicks,
            impressions: row.impressions,
            position: row.position === null ? null : Number(row.position),
        }))
        .reverse()
}

/**
 * Per-(query, page) aggregates over an inclusive date window — the input
 * shape the cannibalization detector and the decay rules consume.
 */
export async function getQueryPageAggregatesForWindow(
    startDate: string,
    endDate: string
): Promise<QueryPageAggregate[]> {
    const rows = await db
        .select({
            query: gscQueryPageDaily.query,
            page: gscQueryPageDaily.page,
            blogPostId: sql<
                string | null
            >`max(${gscQueryPageDaily.blogPostId}::text)`,
            clicks: sql<number>`sum(${gscQueryPageDaily.clicks})::int`,
            impressions: sql<number>`sum(${gscQueryPageDaily.impressions})::int`,
            position: sql<number>`
                coalesce(
                    sum(${gscQueryPageDaily.position} * ${gscQueryPageDaily.impressions})
                        / nullif(sum(${gscQueryPageDaily.impressions}), 0),
                    avg(${gscQueryPageDaily.position})
                )
            `,
        })
        .from(gscQueryPageDaily)
        .where(
            sql`${gscQueryPageDaily.date} BETWEEN ${startDate} AND ${endDate}`
        )
        .groupBy(gscQueryPageDaily.query, gscQueryPageDaily.page)

    return rows.map((row) => ({
        ...row,
        position: Number(row.position),
    }))
}

/**
 * Snapshot coverage and the most recent sync run, for the SEO dashboard.
 */
export async function getSnapshotStatus(): Promise<SnapshotStatus> {
    const [coverage] = await db
        .select({
            earliestDate: sql<
                string | null
            >`min(${gscQueryPageDaily.date})::text`,
            latestDate: sql<
                string | null
            >`max(${gscQueryPageDaily.date})::text`,
            totalRows: sql<number>`count(*)::int`,
            coveredDays: sql<number>`count(distinct ${gscQueryPageDaily.date})::int`,
        })
        .from(gscQueryPageDaily)

    const [lastRun] = await db
        .select()
        .from(gscSyncRun)
        .orderBy(desc(gscSyncRun.startedAt))
        .limit(1)

    return {
        earliestDate: coverage?.earliestDate ?? null,
        latestDate: coverage?.latestDate ?? null,
        totalRows: coverage?.totalRows ?? 0,
        coveredDays: coverage?.coveredDays ?? 0,
        lastRun: lastRun
            ? {
                  status: lastRun.status,
                  trigger: lastRun.trigger,
                  rowsUpserted: lastRun.rowsUpserted,
                  error: lastRun.error,
                  startedAt: lastRun.startedAt.toISOString(),
                  finishedAt: lastRun.finishedAt?.toISOString() ?? null,
                  datesPulled: lastRun.datesPulled?.length ?? 0,
              }
            : null,
    }
}
