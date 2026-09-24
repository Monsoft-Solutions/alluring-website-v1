/**
 * Google Ads Campaign Daily Snapshot
 *
 * One row per (account-zone day, campaign). The `ads-snapshot` cron re-pulls
 * the trailing 30 days every run — conversions keep arriving for days after
 * the click — replacing the window, so a stored day always matches the API.
 *
 * Name, status, channel and budget are as of the pull, not as of the day.
 *
 * @module packages/db/src/schema/ads/ads-campaign-daily.table
 */
import {
    date,
    doublePrecision,
    index,
    numeric,
    pgTable,
    primaryKey,
    text,
} from 'drizzle-orm/pg-core'

import { adsDeliveryColumns } from './ads-metrics.columns'

export const adsCampaignDaily = pgTable(
    'ads_campaign_daily',
    {
        /** Calendar day in the account zone (America/New_York). */
        date: date('date').notNull(),
        campaignId: text('campaign_id').notNull(),
        campaignName: text('campaign_name').notNull(),
        /** ENABLED / PAUSED / REMOVED. */
        status: text('status').notNull(),
        /** SEARCH / PERFORMANCE_MAX / … */
        channel: text('channel').notNull(),
        biddingStrategy: text('bidding_strategy').notNull(),
        /** Daily budget in dollars; null for shared or missing budgets. */
        dailyBudget: numeric('daily_budget', {
            precision: 12,
            scale: 2,
            mode: 'number',
        }),
        ...adsDeliveryColumns(),
        /** Search campaigns only; null elsewhere. */
        searchImpressionShare: doublePrecision('search_impression_share'),
        searchBudgetLostImpressionShare: doublePrecision(
            'search_budget_lost_impression_share'
        ),
        searchRankLostImpressionShare: doublePrecision(
            'search_rank_lost_impression_share'
        ),
    },
    (table) => [
        primaryKey({ columns: [table.date, table.campaignId] }),
        index('ads_campaign_daily_campaign_date_idx').on(
            table.campaignId,
            table.date
        ),
    ]
)

export type AdsCampaignDaily = typeof adsCampaignDaily.$inferSelect
export type InsertAdsCampaignDaily = typeof adsCampaignDaily.$inferInsert
