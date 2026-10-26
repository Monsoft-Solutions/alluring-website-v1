/**
 * Pricing Settings Table
 *
 * The site-wide pricing record (issue #354): the default discount, the
 * Fla. Stat. 456.062 statement that travels with any discounted price, and
 * the combination discount.
 *
 * Exactly one row: `id` is always 1 (a CHECK enforces it), so the admin
 * upserts on it and the seed can be idempotent.
 *
 * @module packages/db/src/schema/pricing/pricing-settings.table
 */
import { sql } from 'drizzle-orm'
import {
    check,
    integer,
    pgTable,
    smallint,
    text,
    timestamp,
} from 'drizzle-orm/pg-core'

export const pricingSettings = pgTable(
    'pricing_settings',
    {
        /** Always 1. */
        id: smallint('id').primaryKey().default(1),

        /** Applies to every procedure whose own discount is `null`. 0–90. */
        defaultDiscountPercent: smallint('default_discount_percent')
            .notNull()
            .default(0),

        /**
         * The statement 456.062 requires on a discounted-fee advertisement,
         * as counsel confirms it. Rendered next to discounted prices; the
         * admin warns while a discount is on and this is empty.
         */
        discountStatement: text('discount_statement'),

        /** Dollars off the total when two procedures are combined. */
        comboDiscountTwoUsd: integer('combo_discount_two_usd').notNull(),

        /** Dollars off the total when three procedures are combined. */
        comboDiscountThreeUsd: integer('combo_discount_three_usd').notNull(),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at')
            .notNull()
            .defaultNow()
            .$onUpdate(() => sql`now()`),
    },
    (table) => [
        check('pricing_settings_singleton_check', sql`${table.id} = 1`),
        check(
            'pricing_settings_default_discount_percent_check',
            sql`${table.defaultDiscountPercent} between 0 and 90`
        ),
        check(
            'pricing_settings_combo_discount_check',
            sql`${table.comboDiscountTwoUsd} >= 0 and ${table.comboDiscountThreeUsd} >= 0`
        ),
    ]
)

export type PricingSettingsRow = typeof pricingSettings.$inferSelect
export type InsertPricingSettingsRow = typeof pricingSettings.$inferInsert
