/**
 * Google Ads Search Term Daily Snapshot
 *
 * One row per (day, ad group, search term, match type) from
 * `search_term_view` — what people actually typed. Search campaigns only:
 * Performance Max terms are not exposed row by row. Terms are judged on spend
 * and Google's conversions; the click report never names the term behind a
 * lead, so there is no lead join here.
 *
 * @module packages/db/src/schema/ads/ads-search-term-daily.table
 */
import { date, index, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'

import { adsDeliveryColumns } from './ads-metrics.columns'

export const adsSearchTermDaily = pgTable(
    'ads_search_term_daily',
    {
        date: date('date').notNull(),
        adGroupId: text('ad_group_id').notNull(),
        searchTerm: text('search_term').notNull(),
        /** How the term matched a keyword: EXACT, PHRASE, BROAD, NEAR_EXACT… */
        matchType: text('match_type').notNull(),
        campaignId: text('campaign_id').notNull(),
        campaignName: text('campaign_name').notNull(),
        adGroupName: text('ad_group_name').notNull(),
        /** ADDED / EXCLUDED / NONE — already a keyword, already a negative, or neither. */
        status: text('status').notNull(),
        ...adsDeliveryColumns(),
    },
    (table) => [
        primaryKey({
            columns: [
                table.date,
                table.adGroupId,
                table.searchTerm,
                table.matchType,
            ],
        }),
        index('ads_search_term_daily_campaign_date_idx').on(
            table.campaignId,
            table.date
        ),
    ]
)

export type AdsSearchTermDaily = typeof adsSearchTermDaily.$inferSelect
export type InsertAdsSearchTermDaily = typeof adsSearchTermDaily.$inferInsert
