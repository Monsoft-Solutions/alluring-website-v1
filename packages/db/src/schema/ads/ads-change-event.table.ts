/**
 * Google Ads Change Event Log
 *
 * Who changed what in the ad account. Google keeps `change_event` for 30
 * days only; the snapshot upserts every event it sees, keyed by Google's own
 * resource name, so the history here outlives the API's window.
 *
 * @module packages/db/src/schema/ads/ads-change-event.table
 */
import { sql } from 'drizzle-orm'
import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/** Per changed field, its value before and after the change. */
export type AdsChangeValues = Record<string, { old: unknown; new: unknown }>

export const adsChangeEvent = pgTable(
    'ads_change_event',
    {
        /** Google's resource name — stable, so re-pulling a day is idempotent. */
        resourceName: text('resource_name').primaryKey(),

        /**
         * Wall-clock time in the account zone (America/New_York), as the API
         * reports it — the same convention as `contact_submission.created_at`.
         */
        changedAt: timestamp('changed_at').notNull(),

        userEmail: text('user_email').notNull(),
        /** GOOGLE_ADS_WEB_CLIENT, GOOGLE_ADS_EDITOR, GOOGLE_ADS_BULK_UPLOAD… */
        clientType: text('client_type').notNull(),
        /** CAMPAIGN, CAMPAIGN_BUDGET, AD_GROUP_AD, AD_GROUP_CRITERION… */
        resourceType: text('resource_type').notNull(),
        /** CREATE / UPDATE / REMOVE. */
        operation: text('operation').notNull(),
        changedFields: text('changed_fields')
            .array()
            .notNull()
            .default(sql`'{}'::text[]`),

        campaignId: text('campaign_id'),
        campaignName: text('campaign_name'),
        adGroupId: text('ad_group_id'),
        adGroupName: text('ad_group_name'),

        values: jsonb('values').$type<AdsChangeValues>(),

        createdAt: timestamp('created_at').notNull().defaultNow(),
    },
    (table) => [
        index('ads_change_event_changed_at_idx').on(table.changedAt),
        index('ads_change_event_campaign_idx').on(
            table.campaignId,
            table.changedAt
        ),
    ]
)

export type AdsChangeEvent = typeof adsChangeEvent.$inferSelect
export type InsertAdsChangeEvent = typeof adsChangeEvent.$inferInsert
