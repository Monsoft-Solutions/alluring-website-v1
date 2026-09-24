/**
 * Google Ads Landing Page Daily Snapshot
 *
 * One row per (day, campaign, page) from `landing_page_view` (configured
 * final URLs) or `expanded_landing_page_view` (URLs actually served,
 * including pages Performance Max picked). Every campaign, device and network
 * tags the same page differently, so tagged variants are rolled up to the
 * page — its URL without query string — at pull time.
 *
 * @module packages/db/src/schema/ads/ads-landing-page-daily.table
 */
import {
    boolean,
    date,
    index,
    integer,
    pgTable,
    primaryKey,
    text,
} from 'drizzle-orm/pg-core'

import { adsDeliveryColumns } from './ads-metrics.columns'

export const adsLandingPageDaily = pgTable(
    'ads_landing_page_daily',
    {
        date: date('date').notNull(),
        campaignId: text('campaign_id').notNull(),
        /** Final URL without its query string or `{ignore}` marker. */
        page: text('page').notNull(),
        /** True for expanded (served) URLs, false for configured final URLs. */
        expanded: boolean('expanded').notNull(),
        /** How many tagged URL variants rolled up into this row. */
        urlVariants: integer('url_variants').notNull().default(1),
        /** The busiest tagged URL — shows which tracking template is in use. */
        sampleUrl: text('sample_url').notNull(),
        ...adsDeliveryColumns(),
    },
    (table) => [
        primaryKey({
            columns: [table.date, table.campaignId, table.page, table.expanded],
        }),
        index('ads_landing_page_daily_page_date_idx').on(
            table.page,
            table.date
        ),
    ]
)

export type AdsLandingPageDaily = typeof adsLandingPageDaily.$inferSelect
export type InsertAdsLandingPageDaily = typeof adsLandingPageDaily.$inferInsert
