/**
 * Procedure Pricing Table
 *
 * One row per procedure: which price line it quotes as "starting at", and
 * its discount (issue #354). A procedure with no row takes its defaults from
 * `DEFAULT_STARTING_LINES` in `@workspace/shared/claims/prices`.
 *
 * `starting_line_key` names a `price_line.line_key` of the same procedure.
 * It is not a foreign key: a composite key would null `procedure_slug` (the
 * primary key) on delete. The admin validates it, and the resolver publishes
 * no starting price when it points at a missing or inactive line.
 *
 * @module packages/db/src/schema/pricing/procedure-pricing.table
 */
import { sql } from 'drizzle-orm'
import {
    check,
    integer,
    pgTable,
    smallint,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core'

export const procedurePricing = pgTable(
    'procedure_pricing',
    {
        /** Claim procedure key, e.g. `bbl`. */
        procedureSlug: varchar('procedure_slug', { length: 60 }).primaryKey(),

        /** The line quoted as "starting at"; `null` publishes none (mommy makeover). */
        startingLineKey: varchar('starting_line_key', { length: 60 }),

        /**
         * Discount off every line of the procedure, 0–90. `null` inherits
         * `pricing_settings.default_discount_percent`; an explicit 0 turns the
         * site-wide default off for this procedure. A discount is a
         * discounted-fee advertisement (Fla. Stat. 456.062) and renders with
         * `pricing_settings.discount_statement`.
         */
        discountPercent: smallint('discount_percent'),

        /** Optional short name for the offer, for components that show one. */
        discountLabel: varchar('discount_label', { length: 80 }),

        /** Admin-only notes: why the discount, who approved it. Never published. */
        notes: text('notes'),

        /**
         * Top of the "most patients pay between …" range. Published for BBL
         * only (claims canon §5); the resolver ignores it elsewhere.
         */
        typicalMaxUsd: integer('typical_max_usd'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => sql`now()`),
    },
    (table) => [
        check(
            'procedure_pricing_discount_percent_check',
            sql`${table.discountPercent} is null or ${table.discountPercent} between 0 and 90`
        ),
        check(
            'procedure_pricing_typical_max_usd_check',
            sql`${table.typicalMaxUsd} is null or ${table.typicalMaxUsd} >= 0`
        ),
    ]
)

export type ProcedurePricingRow = typeof procedurePricing.$inferSelect
export type InsertProcedurePricingRow = typeof procedurePricing.$inferInsert
