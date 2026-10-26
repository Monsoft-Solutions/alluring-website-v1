/**
 * Price Line Table
 *
 * One line of the practice's price sheet: what the admin Pricing page edits
 * and every price on the site reads, through the pricing resolver (issue
 * #354). Seeded by migration 0060 from the 2026-09-15 sheet, which stays in
 * code as the fallback (`PRICE_SHEET` in `@workspace/shared/claims/prices`).
 *
 * `procedure_slug` is the claim procedure key (`bbl`, `tummy-tuck`, …), not
 * the page slug, and `line_key` is stable within it: blog posts name a line
 * as the token `[[price:tummy-tuck:mini]]`, so renaming a key breaks every
 * post that uses it. Change `label` and `usd` freely; retire a line with
 * `is_active = false` rather than deleting it.
 *
 * `unit` is text with a CHECK rather than a pgEnum, mirroring `PRICE_UNITS`
 * in `@workspace/shared/claims/pricing` (a test keeps the two in step).
 *
 * @module packages/db/src/schema/pricing/price-line.table
 */
import { sql } from 'drizzle-orm'
import {
    boolean,
    check,
    integer,
    pgTable,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core'

/** The units a line may be priced in. Mirrors `PRICE_UNITS`. */
export const PRICE_LINE_UNITS = [
    'each',
    'per-breast',
    'first-area',
    'additional-area',
] as const

export const priceLine = pgTable(
    'price_line',
    {
        id: uuid('id').primaryKey().defaultRandom(),

        /** Claim procedure key, e.g. `bbl`. Token-safe: `[a-z0-9-]`. */
        procedureSlug: varchar('procedure_slug', { length: 60 }).notNull(),

        /** Stable key within the procedure, e.g. `mini`. Token-safe. */
        lineKey: varchar('line_key', { length: 60 }).notNull(),

        /** How the line reads in a sentence: "mini tummy tuck (no muscle repair)". */
        label: varchar('label', { length: 160 }).notNull(),

        /** List price in whole US dollars, before any discount. */
        usd: integer('usd').notNull(),

        /** `each`, `per-breast`, `first-area` or `additional-area`. */
        unit: varchar('unit', { length: 20 }).notNull().default('each'),

        /** Priced on top of another procedure, never as a surgery on its own. */
        isAddOn: boolean('is_add_on').notNull().default(false),

        /** Order within the procedure. The seed leaves gaps of 10. */
        sortOrder: integer('sort_order').notNull().default(0),

        /** Inactive lines stay for the record and are never published. */
        isActive: boolean('is_active').notNull().default(true),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => sql`now()`),
    },
    (table) => [
        uniqueIndex('price_line_procedure_line_idx').on(
            table.procedureSlug,
            table.lineKey
        ),
        check('price_line_usd_check', sql`${table.usd} >= 0`),
        check(
            'price_line_unit_check',
            sql`${table.unit} in ('each', 'per-breast', 'first-area', 'additional-area')`
        ),
        check(
            'price_line_procedure_slug_check',
            sql`${table.procedureSlug} ~ '^[a-z0-9][a-z0-9-]*$'`
        ),
        check(
            'price_line_line_key_check',
            sql`${table.lineKey} ~ '^[a-z0-9][a-z0-9-]*$'`
        ),
    ]
)

export type PriceLineRow = typeof priceLine.$inferSelect
export type InsertPriceLineRow = typeof priceLine.$inferInsert
