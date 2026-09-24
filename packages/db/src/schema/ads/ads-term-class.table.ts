/**
 * Search Term Classes
 *
 * A small editable list that sorts search terms into brand, competitor,
 * procedure, address or other. A term takes the class of the first pattern it
 * contains (longest pattern first). Brand patterns are seeded from the site
 * config; competitor names are added as they show up in the terms report.
 * Nothing here is pushed to Google.
 *
 * @module packages/db/src/schema/ads/ads-term-class.table
 */
import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from 'drizzle-orm/pg-core'

export const adsTermClassName = pgEnum('ads_term_class_name', [
    'brand',
    'competitor',
    'procedure',
    'address',
    'other',
])

export const adsTermClass = pgTable(
    'ads_term_class',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        /** Lower-case substring matched against the search term. */
        pattern: text('pattern').notNull(),
        termClass: adsTermClassName('term_class').notNull(),
        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [uniqueIndex('ads_term_class_pattern_idx').on(table.pattern)]
)

export type AdsTermClass = typeof adsTermClass.$inferSelect
export type InsertAdsTermClass = typeof adsTermClass.$inferInsert
