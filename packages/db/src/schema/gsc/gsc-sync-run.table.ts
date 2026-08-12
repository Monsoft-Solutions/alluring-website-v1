/**
 * GSC Sync Run Table
 *
 * One row per snapshot pull (cron, manual trigger, or backfill script) — the
 * run history the admin reviews, and the run lock in one table.
 *
 * The lock follows the autopilot_run pattern: a partial unique index allows
 * at most one `running` row, so acquiring the lock IS inserting the running
 * row (a unique violation means another pull holds it). DB-backed on purpose:
 * the app runs serverless and the Supabase transaction pooler makes advisory
 * locks unreliable.
 *
 * @module packages/db/src/schema/gsc/gsc-sync-run.table
 */
import { sql } from 'drizzle-orm'
import {
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

/** How the pull was started. */
export const gscSyncTrigger = pgEnum('gsc_sync_trigger', [
    'cron',
    'manual',
    'backfill',
])

/** Pull lifecycle. */
export const gscSyncStatus = pgEnum('gsc_sync_status', [
    'running',
    'completed',
    'failed',
])

export const gscSyncRun = pgTable(
    'gsc_sync_run',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        trigger: gscSyncTrigger('trigger').notNull().default('cron'),
        status: gscSyncStatus('status').notNull().default('running'),

        /** ISO dates (YYYY-MM-DD) this run upserted, in pull order. */
        datesPulled: jsonb('dates_pulled').$type<string[]>(),

        rowsUpserted: integer('rows_upserted'),

        error: text('error'),

        startedAt: timestamp('started_at').notNull().defaultNow(),
        finishedAt: timestamp('finished_at'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('gsc_sync_run_started_idx').on(table.startedAt),
        // The run lock: at most one running pull.
        uniqueIndex('gsc_sync_run_single_running_idx')
            .on(table.status)
            .where(sql`${table.status} = 'running'`),
    ]
)

export type GscSyncRun = typeof gscSyncRun.$inferSelect
export type InsertGscSyncRun = typeof gscSyncRun.$inferInsert
