/**
 * Google Ads Sync Run Table
 *
 * One row per Ads job run — the daily report snapshot or the hourly lead
 * click resolver — and the run lock for each, in one table.
 *
 * The lock follows the gsc_sync_run pattern: a partial unique index allows at
 * most one `running` row per job, so acquiring the lock IS inserting the
 * running row. DB-backed on purpose: the app runs serverless and the Supabase
 * transaction pooler makes advisory locks unreliable.
 *
 * @module packages/db/src/schema/ads/ads-sync-run.table
 */
import { sql } from 'drizzle-orm'
import {
    date,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core'

/** Which job the run belongs to; each has its own lock. */
export const adsSyncJob = pgEnum('ads_sync_job', ['snapshot', 'lead-clicks'])

/** How the run was started. */
export const adsSyncTrigger = pgEnum('ads_sync_trigger', [
    'cron',
    'manual',
    'backfill',
])

/** Run lifecycle. */
export const adsSyncStatus = pgEnum('ads_sync_status', [
    'running',
    'completed',
    'failed',
])

export const adsSyncRun = pgTable(
    'ads_sync_run',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        job: adsSyncJob('job').notNull(),
        trigger: adsSyncTrigger('trigger').notNull().default('cron'),
        status: adsSyncStatus('status').notNull().default('running'),

        /** Report window the run covered (account-zone days). */
        windowStart: date('window_start'),
        windowEnd: date('window_end'),

        /** Rows written per table, or leads per match state for the resolver. */
        counts: jsonb('counts').$type<Record<string, number>>(),

        /** Google Ads API operations the run spent (quota is per day). */
        apiOperations: integer('api_operations'),

        error: text('error'),

        startedAt: timestamp('started_at').notNull().defaultNow(),
        finishedAt: timestamp('finished_at'),
    },
    (table) => [
        index('ads_sync_run_job_started_idx').on(table.job, table.startedAt),
        // The run lock: at most one running row per job.
        uniqueIndex('ads_sync_run_single_running_idx')
            .on(table.job)
            .where(sql`${table.status} = 'running'`),
    ]
)

export type AdsSyncRun = typeof adsSyncRun.$inferSelect
export type InsertAdsSyncRun = typeof adsSyncRun.$inferInsert
