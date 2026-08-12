/**
 * Blog AI Configuration Table
 *
 * Singleton configuration row controlling which AI models the blog content
 * pipeline uses. Lets an admin repoint content generation, review and image
 * generation at different models without a code deploy.
 *
 * Model ids are stored as free-form strings rather than enums on purpose: any
 * OpenRouter `vendor/model` id is accepted, so the column must not be
 * constrained to the curated `AVAILABLE_MODELS` list. Validation lives in the
 * server action via `isValidModelId`.
 *
 * @module packages/db/src/schema/blog/blog-ai-config.table
 */
import {
    doublePrecision,
    integer,
    pgEnum,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

/**
 * Autopilot autonomy mode.
 *
 * - `off`: nothing runs on a schedule.
 * - `ideas`: the ideation job tops up an approval queue; the content job
 *   writes approved ideas only.
 * - `full`: as `ideas`, but the content job may also write the best
 *   gate-passing pending idea (or ideate inline) when nothing is approved.
 */
export const autopilotMode = pgEnum('autopilot_mode', ['off', 'ideas', 'full'])

/**
 * Autopilot cadence presets. The cron ticks daily; each job's due-check is
 * interval-based (self-healing) against its configured cadence.
 */
export const autopilotCadence = pgEnum('autopilot_cadence', [
    'daily',
    'weekdays',
    'weekly',
])

/**
 * Refresh loop autonomy mode (epic #144).
 *
 * - `off`: decay detection still snapshots GSC data but queues nothing.
 * - `suggest`: detection fills the refresh queue; an admin starts each run.
 * - `auto`: the autopilot-refresh job also executes queued candidates; the
 *   apply (merge onto the live post) always stays human-gated.
 */
export const refreshMode = pgEnum('refresh_mode', ['off', 'suggest', 'auto'])

/**
 * Blog AI configuration table.
 *
 * Only one row is ever expected — the query layer reads the first row and the
 * action layer upserts it.
 */
export const blogAiConfig = pgTable('blog_ai_config', {
    id: uuid('id').primaryKey().defaultRandom(),

    /**
     * Model used for the ideation phase (topic generation).
     */
    ideationModelId: varchar('ideation_model_id', { length: 120 })
        .notNull()
        .default('claude-opus-5'),

    /**
     * Model used for the content generation phase (research + drafting).
     */
    contentModelId: varchar('content_model_id', { length: 120 })
        .notNull()
        .default('claude-opus-5'),

    /**
     * Model used for the review/orchestration phase (review agents + editor).
     */
    reviewModelId: varchar('review_model_id', { length: 120 })
        .notNull()
        .default('claude-opus-5'),

    /**
     * Model used for the metadata extraction phase (SEO title, meta
     * description, slug, FAQs).
     */
    extractionModelId: varchar('extraction_model_id', { length: 120 })
        .notNull()
        .default('claude-opus-5'),

    /**
     * Image generation model id — one of `IMAGE_MODELS` in the admin fal
     * service (`gpt-image-2`, `gpt-image-1.5`, `nano-banana-pro`).
     */
    imageModelId: varchar('image_model_id', { length: 40 })
        .notNull()
        .default('gpt-image-2'),

    /**
     * Forced artistic image style preset id.
     *
     * `null` means "auto" — the pipeline's AI picks the preset per topic, which
     * is the recommended behaviour. A non-null value pins every generated image
     * to that preset.
     */
    artisticStyleId: varchar('artistic_style_id', { length: 60 }),

    // ------------------------------------------------------------------
    // Autopilot (epic #122) — scheduled content loop configuration
    // ------------------------------------------------------------------

    /** Autonomy mode; `off` disables both scheduled jobs. */
    autopilotMode: autopilotMode('autopilot_mode').notNull().default('off'),

    /** How often the ideation job tops up the idea approval queue. */
    autopilotIdeationCadence: autopilotCadence('autopilot_ideation_cadence')
        .notNull()
        .default('weekly'),

    /** How often the content job writes a post from the queue. */
    autopilotContentCadence: autopilotCadence('autopilot_content_cadence')
        .notNull()
        .default('weekly'),

    /** Posts written per content run (1–3, enforced in the action layer). */
    autopilotPostsPerRun: integer('autopilot_posts_per_run')
        .notNull()
        .default(1),

    /** Content runs pause while at least this many posts sit in Draft. */
    autopilotDraftCap: integer('autopilot_draft_cap').notNull().default(3),

    /** The ideation job tops the pending-idea queue up to this size. */
    autopilotIdeasPerRun: integer('autopilot_ideas_per_run')
        .notNull()
        .default(5),

    // ------------------------------------------------------------------
    // Refresh loop (epic #144) — decay detection + in-place refresh
    // ------------------------------------------------------------------

    /** Refresh autonomy mode; `off` disables detection queueing. */
    refreshMode: refreshMode('refresh_mode').notNull().default('off'),

    /** Posts older than this many months are flagged stale (rule R3). */
    refreshStaleMonths: integer('refresh_stale_months').notNull().default(6),

    /**
     * Drift-adjusted position drop (28d vs prior 28d) that flags decay
     * (rule R1).
     */
    refreshPositionDropThreshold: doublePrecision(
        'refresh_position_drop_threshold'
    )
        .notNull()
        .default(3),

    /** Days after an applied/dismissed refresh before a post can re-queue. */
    refreshCooldownDays: integer('refresh_cooldown_days').notNull().default(60),

    /** Auto mode pauses while this many refresh drafts await review. */
    refreshDraftCap: integer('refresh_draft_cap').notNull().default(2),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull()
        .$onUpdate(() => new Date()),
})

export type BlogAiConfig = typeof blogAiConfig.$inferSelect
export type InsertBlogAiConfig = typeof blogAiConfig.$inferInsert
