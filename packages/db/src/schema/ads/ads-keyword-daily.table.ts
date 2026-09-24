/**
 * Google Ads Keyword Daily Snapshot
 *
 * One row per (day, ad group, keyword criterion) from `keyword_view`.
 * Search campaigns only — Performance Max has no keywords. Leads join to
 * keywords through `lead_ad_click` (ad group id + keyword text + match type),
 * since Google's click report names the keyword, never the criterion id.
 *
 * @module packages/db/src/schema/ads/ads-keyword-daily.table
 */
import {
    date,
    index,
    integer,
    pgTable,
    primaryKey,
    text,
} from 'drizzle-orm/pg-core'

import { adsDeliveryColumns } from './ads-metrics.columns'

export const adsKeywordDaily = pgTable(
    'ads_keyword_daily',
    {
        date: date('date').notNull(),
        adGroupId: text('ad_group_id').notNull(),
        criterionId: text('criterion_id').notNull(),
        campaignId: text('campaign_id').notNull(),
        campaignName: text('campaign_name').notNull(),
        adGroupName: text('ad_group_name').notNull(),
        keyword: text('keyword').notNull(),
        /** EXACT / PHRASE / BROAD. */
        matchType: text('match_type').notNull(),
        status: text('status').notNull(),
        qualityScore: integer('quality_score'),
        ...adsDeliveryColumns(),
    },
    (table) => [
        primaryKey({
            columns: [table.date, table.adGroupId, table.criterionId],
        }),
        index('ads_keyword_daily_campaign_date_idx').on(
            table.campaignId,
            table.date
        ),
    ]
)

export type AdsKeywordDaily = typeof adsKeywordDaily.$inferSelect
export type InsertAdsKeywordDaily = typeof adsKeywordDaily.$inferInsert
