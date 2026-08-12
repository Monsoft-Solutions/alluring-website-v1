/**
 * Content Refresh Table
 *
 * The refresh queue AND the lifecycle record (epic #144): one row carries a
 * post from a decay/cannibalization/staleness signal, through an in-place
 * refresh run on a shadow working copy, to a measured 28-day outcome.
 *
 * A partial unique index allows one ACTIVE row per post (pending /
 * in_progress / ready_for_review) — new signals merge into the active row
 * instead of duplicating it, and the index doubles as the "no concurrent
 * refreshes of one post" lock. Terminal rows (applied / dismissed / failed)
 * remain as history and drive the post-apply cooldown.
 *
 * @module packages/db/src/schema/blog/content-refresh.table
 */
import { sql } from 'drizzle-orm'
import {
    doublePrecision,
    index,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

import type {
    RefreshBrief,
    RefreshOutcome,
    RefreshSignal,
} from '../../types/content-refresh.type'
import { blogPost } from './blog-post.table'
import { blogPostRevision } from './blog-post-revision.table'

/**
 * Candidate lifecycle.
 * - `pending`: detected, waiting for execution (or approval in suggest mode).
 * - `in_progress`: a refresh run is executing on a working copy.
 * - `ready_for_review`: refreshed draft awaits the admin's diff review.
 * - `applied`: merged onto the live post.
 * - `dismissed`: closed without applying; starts the cooldown.
 * - `failed`: the run errored; kept for the failure rail.
 */
export const contentRefreshStatus = pgEnum('content_refresh_status', [
    'pending',
    'in_progress',
    'ready_for_review',
    'applied',
    'dismissed',
    'failed',
])

export const contentRefresh = pgTable(
    'content_refresh',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /** The live post this candidate refreshes. */
        blogPostId: uuid('blog_post_id')
            .notNull()
            .references(() => blogPost.id, { onDelete: 'cascade' }),

        status: contentRefreshStatus('status').notNull().default('pending'),

        /** Accumulating detection signals with their triggering metrics. */
        sources: jsonb('sources').$type<RefreshSignal[]>().notNull(),

        /** Queue priority (formula in the epic #144 plan §0). */
        score: doublePrecision('score').notNull().default(0),

        /** The refresh brief handed to the pipeline (built at run start). */
        brief: jsonb('brief').$type<RefreshBrief>(),

        /** The shadow working copy while a run is in flight. */
        workingPostId: uuid('working_post_id').references(() => blogPost.id, {
            onDelete: 'set null',
        }),

        /** Pre-merge snapshot written by the apply step. */
        revisionId: uuid('revision_id').references(() => blogPostRevision.id, {
            onDelete: 'set null',
        }),

        /** AI-generated bullet summary of what the refresh changed. */
        changeSummary: text('change_summary'),

        /** Vercel Workflow run id, for the stale-run cross-check. */
        workflowRunId: varchar('workflow_run_id', { length: 191 }),

        error: text('error'),

        appliedAt: timestamp('applied_at'),
        measuredAt: timestamp('measured_at'),

        /** 28-day before/after comparison (drift-adjusted). */
        outcome: jsonb('outcome').$type<RefreshOutcome>(),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        // One active candidate per post; also the concurrent-refresh lock.
        uniqueIndex('content_refresh_active_idx')
            .on(table.blogPostId)
            .where(
                sql`${table.status} IN ('pending', 'in_progress', 'ready_for_review')`
            ),
        index('content_refresh_status_score_idx').on(table.status, table.score),
    ]
)

export type ContentRefresh = typeof contentRefresh.$inferSelect
export type InsertContentRefresh = typeof contentRefresh.$inferInsert
