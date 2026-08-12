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
import { desc, eq, isNotNull, sql } from 'drizzle-orm'

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

/** One post's totals over a date window (input to the decay rules). */
export type PostWindowAggregate = {
    blogPostId: string
    clicks: number
    impressions: number
    /** Impression-weighted average position (null when no impressions). */
    position: number | null
}

/** One page's totals over a date window (input to the site-drift median). */
export type PageWindowAggregate = {
    page: string
    impressions: number
    /** Impression-weighted average position (null when no impressions). */
    position: number | null
}

/** One query's performance on a post, current window vs the prior one. */
export type PostQueryWindow = {
    query: string
    current: {
        clicks: number
        impressions: number
        /** Impression-weighted average position (null when absent). */
        position: number | null
    }
    previous: {
        clicks: number
        impressions: number
        position: number | null
    }
}

/** Aggregated CTR sample for one rounded position (benchmark input). */
export type CtrBucket = {
    /** round(position), 1-based. */
    positionBucket: number
    clicks: number
    impressions: number
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
 * Per-post totals over an inclusive date window — one row per post that had
 * any snapshot rows resolved to it. The decay rules (R1/R2) compare two of
 * these windows.
 */
export async function getPostWindowAggregates(
    startDate: string,
    endDate: string
): Promise<PostWindowAggregate[]> {
    const rows = await db
        .select({
            blogPostId: sql<string>`${gscQueryPageDaily.blogPostId}::text`,
            clicks: sql<number>`sum(${gscQueryPageDaily.clicks})::int`,
            impressions: sql<number>`sum(${gscQueryPageDaily.impressions})::int`,
            position: sql<number | null>`
                sum(${gscQueryPageDaily.position} * ${gscQueryPageDaily.impressions})
                / nullif(sum(${gscQueryPageDaily.impressions}), 0)
            `,
        })
        .from(gscQueryPageDaily)
        .where(
            sql`${gscQueryPageDaily.date} BETWEEN ${startDate} AND ${endDate}
                AND ${isNotNull(gscQueryPageDaily.blogPostId)}`
        )
        .groupBy(gscQueryPageDaily.blogPostId)

    return rows.map((row) => ({
        ...row,
        position: row.position === null ? null : Number(row.position),
    }))
}

/**
 * Per-page totals over an inclusive date window — every page, not just blog
 * posts. The site-median position delta (R1's drift guard) is computed over
 * these, so a core update that moves the whole site doesn't read as per-post
 * decay.
 */
export async function getPageWindowAggregates(
    startDate: string,
    endDate: string
): Promise<PageWindowAggregate[]> {
    const rows = await db
        .select({
            page: gscQueryPageDaily.page,
            impressions: sql<number>`sum(${gscQueryPageDaily.impressions})::int`,
            position: sql<number | null>`
                sum(${gscQueryPageDaily.position} * ${gscQueryPageDaily.impressions})
                / nullif(sum(${gscQueryPageDaily.impressions}), 0)
            `,
        })
        .from(gscQueryPageDaily)
        .where(
            sql`${gscQueryPageDaily.date} BETWEEN ${startDate} AND ${endDate}`
        )
        .groupBy(gscQueryPageDaily.page)

    return rows.map((row) => ({
        ...row,
        position: row.position === null ? null : Number(row.position),
    }))
}

/**
 * Per-query windows for one post: each query's clicks/impressions/weighted
 * position in the current window vs the prior one. The refresh brief builder
 * reads these to name the queries that decayed, rose, or stayed put.
 *
 * Both windows are fetched in one scan using FILTER clauses; queries with
 * rows in either window appear (zeros in the other).
 */
export async function getPostQueryWindows(
    blogPostId: string,
    windows: {
        currentStart: string
        currentEnd: string
        previousStart: string
        previousEnd: string
    }
): Promise<PostQueryWindow[]> {
    const { currentStart, currentEnd, previousStart, previousEnd } = windows
    const inCurrent = sql`${gscQueryPageDaily.date} BETWEEN ${currentStart} AND ${currentEnd}`
    const inPrevious = sql`${gscQueryPageDaily.date} BETWEEN ${previousStart} AND ${previousEnd}`

    const rows = await db
        .select({
            query: gscQueryPageDaily.query,
            currentClicks: sql<number>`coalesce(sum(${gscQueryPageDaily.clicks}) filter (where ${inCurrent}), 0)::int`,
            currentImpressions: sql<number>`coalesce(sum(${gscQueryPageDaily.impressions}) filter (where ${inCurrent}), 0)::int`,
            currentPosition: sql<number | null>`
                sum(${gscQueryPageDaily.position} * ${gscQueryPageDaily.impressions})
                    filter (where ${inCurrent})
                / nullif(sum(${gscQueryPageDaily.impressions}) filter (where ${inCurrent}), 0)
            `,
            previousClicks: sql<number>`coalesce(sum(${gscQueryPageDaily.clicks}) filter (where ${inPrevious}), 0)::int`,
            previousImpressions: sql<number>`coalesce(sum(${gscQueryPageDaily.impressions}) filter (where ${inPrevious}), 0)::int`,
            previousPosition: sql<number | null>`
                sum(${gscQueryPageDaily.position} * ${gscQueryPageDaily.impressions})
                    filter (where ${inPrevious})
                / nullif(sum(${gscQueryPageDaily.impressions}) filter (where ${inPrevious}), 0)
            `,
        })
        .from(gscQueryPageDaily)
        .where(
            sql`${eq(gscQueryPageDaily.blogPostId, blogPostId)}
                AND ${gscQueryPageDaily.date} BETWEEN ${previousStart} AND ${currentEnd}`
        )
        .groupBy(gscQueryPageDaily.query)

    return rows.map((row) => ({
        query: row.query,
        current: {
            clicks: row.currentClicks,
            impressions: row.currentImpressions,
            position:
                row.currentPosition === null
                    ? null
                    : Number(row.currentPosition),
        },
        previous: {
            clicks: row.previousClicks,
            impressions: row.previousImpressions,
            position:
                row.previousPosition === null
                    ? null
                    : Number(row.previousPosition),
        },
    }))
}

/**
 * Site-wide CTR samples grouped by rounded position over a window —
 * the raw material for the CTR benchmark curve (R2). Positions beyond 20
 * are collapsed into one bucket; their CTRs are noise-level anyway.
 */
export async function getCtrBuckets(
    startDate: string,
    endDate: string
): Promise<CtrBucket[]> {
    const bucket = sql<number>`least(round(${gscQueryPageDaily.position})::int, 21)`
    const rows = await db
        .select({
            positionBucket: bucket,
            clicks: sql<number>`sum(${gscQueryPageDaily.clicks})::int`,
            impressions: sql<number>`sum(${gscQueryPageDaily.impressions})::int`,
        })
        .from(gscQueryPageDaily)
        .where(
            sql`${gscQueryPageDaily.date} BETWEEN ${startDate} AND ${endDate}`
        )
        .groupBy(bucket)

    return rows
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
