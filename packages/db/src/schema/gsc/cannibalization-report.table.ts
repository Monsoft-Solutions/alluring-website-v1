/**
 * Cannibalization Report Table
 *
 * One row per analyzed ISO week: queries where our own pages compete against
 * each other, computed from gsc_query_page_daily snapshots by the weekly
 * `cannibalization-report` cron (issue #146). Kept as history so week-over-
 * week trends stay queryable after the snapshot windows slide.
 *
 * @module packages/db/src/schema/gsc/cannibalization-report.table
 */
import {
    date,
    integer,
    jsonb,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core'

import type { CannibalizationFinding } from '../../types/gsc.type'

export const cannibalizationReport = pgTable(
    'cannibalization_report',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /**
         * First day of the analyzed 7-day window, which ends at the newest
         * snapshot date (data-anchored, not calendar-anchored).
         */
        weekStart: date('week_start').notNull(),

        findings: jsonb('findings').$type<CannibalizationFinding[]>().notNull(),

        findingsCount: integer('findings_count').notNull(),

        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        // Re-running a week replaces its report (upsert target).
        uniqueIndex('cannibalization_report_week_start_idx').on(
            table.weekStart
        ),
    ]
)

export type CannibalizationReport = typeof cannibalizationReport.$inferSelect
export type InsertCannibalizationReport =
    typeof cannibalizationReport.$inferInsert
