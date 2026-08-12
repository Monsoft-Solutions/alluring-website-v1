/**
 * Autopilot Run Table
 *
 * One row per scheduled (or manually triggered) autopilot job execution —
 * the run history the admin reviews, and the run lock in one table.
 *
 * The lock: a partial unique index allows at most one `running` row per job
 * kind. Acquiring the lock IS inserting the running row — a unique-violation
 * means another run holds it, so there is no check-then-write race. This is
 * deliberately DB-backed: the app runs serverless (no shared memory) and the
 * Supabase transaction pooler makes advisory locks unreliable.
 *
 * @module packages/db/src/schema/blog/autopilot-run.table
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
    varchar,
} from 'drizzle-orm/pg-core'

import type {
    AutopilotPhaseOutcome,
    RefreshCandidate,
} from '../../types/autopilot.type'
import { blogPost } from './blog-post.table'

/**
 * Which scheduled job produced this run.
 * - `ideation`: tops up the idea approval queue.
 * - `content`: writes a post from the queue through the pipeline to Draft.
 * - `refresh`: runs a queued refresh candidate through the pipeline on a
 *   working copy (epic #144).
 */
export const autopilotRunKind = pgEnum('autopilot_run_kind', [
    'ideation',
    'content',
    'refresh',
])

/** How the run was started. */
export const autopilotTrigger = pgEnum('autopilot_trigger', ['cron', 'manual'])

/** Run lifecycle. `skipped` runs record why nothing happened. */
export const autopilotRunStatus = pgEnum('autopilot_run_status', [
    'running',
    'completed',
    'skipped',
    'failed',
])

export const autopilotRun = pgTable(
    'autopilot_run',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        kind: autopilotRunKind('kind').notNull(),
        trigger: autopilotTrigger('trigger').notNull().default('cron'),

        /** Autopilot mode snapshot at run time (`off`/`ideas`/`full`). */
        mode: varchar('mode', { length: 10 }).notNull(),

        status: autopilotRunStatus('status').notNull().default('running'),

        /** Why a `skipped` run did nothing (AutopilotSkipReason). */
        skipReason: varchar('skip_reason', { length: 40 }),

        /** Topic written by a content run (or summary of an ideation run). */
        topicTitle: text('topic_title'),

        /** The post a content run produced. */
        postId: uuid('post_id').references(() => blogPost.id, {
            onDelete: 'set null',
        }),

        /** Vercel Workflow run id, for the stale-run cross-check. */
        workflowRunId: varchar('workflow_run_id', { length: 120 }),

        /** Per-phase outcomes of a content run. */
        phaseOutcomes: jsonb('phase_outcomes').$type<AutopilotPhaseOutcome[]>(),

        /** Ideas created by an ideation run (titles), for the history UI. */
        ideasCreated: integer('ideas_created'),

        /** Gate `refresh` verdicts — input for the future refresh flow. */
        refreshCandidates:
            jsonb('refresh_candidates').$type<RefreshCandidate[]>(),

        /** Average review score of the written post, when available. */
        qualityScore: integer('quality_score'),

        error: text('error'),

        /**
         * Failed runs block the next run of the same kind until an admin
         * acknowledges them; this records the acknowledgment.
         */
        acknowledgedAt: timestamp('acknowledged_at'),

        startedAt: timestamp('started_at').notNull().defaultNow(),
        finishedAt: timestamp('finished_at'),
        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        index('autopilot_run_status_idx').on(table.status),
        index('autopilot_run_kind_started_idx').on(table.kind, table.startedAt),
        // The run lock: at most one running row per job kind.
        uniqueIndex('autopilot_run_single_running_idx')
            .on(table.kind)
            .where(sql`${table.status} = 'running'`),
    ]
)

export type AutopilotRun = typeof autopilotRun.$inferSelect
export type InsertAutopilotRun = typeof autopilotRun.$inferInsert
