/**
 * Google Ads Conversion Action Daily Snapshot
 *
 * What each conversion action counted per day, next to its settings — the
 * tracking-health panel compares these with the paid leads the website
 * actually stored. "Counted" is Google's Conversions column (primary actions
 * only, what bidding optimizes for); "recorded" is All conversions.
 *
 * @module packages/db/src/schema/ads/ads-conversion-daily.table
 */
import {
    boolean,
    date,
    numeric,
    pgTable,
    primaryKey,
    text,
    timestamp,
} from 'drizzle-orm/pg-core'

export const adsConversionDaily = pgTable(
    'ads_conversion_daily',
    {
        date: date('date').notNull(),
        conversionActionId: text('conversion_action_id').notNull(),
        actionName: text('action_name').notNull(),
        /** SUBMIT_LEAD_FORM, PHONE_CALL_LEAD, PAGE_VIEW… */
        category: text('category').notNull(),
        /** WEBSITE, GOOGLE_HOSTED, CALL_FROM_ADS, … */
        origin: text('origin').notNull(),
        type: text('type').notNull(),
        status: text('status').notNull(),
        /** Primary actions feed the Conversions column bidding optimizes for. */
        primaryForGoal: boolean('primary_for_goal').notNull(),
        conversions: numeric('conversions', {
            precision: 12,
            scale: 2,
            mode: 'number',
        })
            .notNull()
            .default(0),
        allConversions: numeric('all_conversions', {
            precision: 12,
            scale: 2,
            mode: 'number',
        })
            .notNull()
            .default(0),
        syncedAt: timestamp('synced_at').notNull().defaultNow(),
    },
    (table) => [primaryKey({ columns: [table.date, table.conversionActionId] })]
)

export type AdsConversionDaily = typeof adsConversionDaily.$inferSelect
export type InsertAdsConversionDaily = typeof adsConversionDaily.$inferInsert
