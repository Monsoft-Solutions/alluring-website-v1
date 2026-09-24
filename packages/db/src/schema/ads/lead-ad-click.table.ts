/**
 * Lead → Ad Click
 *
 * One row per paid Google lead: which click brought it, and how sure we are.
 * Every Ads console screen that counts leads joins through this table, so a
 * "paid lead" is exactly a row here.
 *
 * Google keeps click details (`click_view`) for 90 days. The hourly
 * `resolve-lead-clicks` job looks each new paid lead up while its click is
 * fresh and stores the answer, so a lead from March still shows its keyword
 * in December.
 *
 * The match ladder — the first rung that answers wins:
 *   click       gclid found in the click report → campaign, ad group, keyword
 *   ios_click   gbraid/wbraid only (iPhone traffic) → campaign when known
 *   campaign    gad_campaignid / utm_id on the landing URL → campaign
 *   tagged_only utm tags say Google Ads, nothing identifies the campaign
 *   not_found   gclid present, not in the click report (retried for 3 days)
 *   expired     gclid present, but the click was already past Google's 90 days
 *
 * @module packages/db/src/schema/ads/lead-ad-click.table
 */
import {
    date,
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from 'drizzle-orm/pg-core'

import { contactSubmission } from '../contact/contact-submission.table'

export const leadAdMatch = pgEnum('lead_ad_match', [
    'click',
    'ios_click',
    'campaign',
    'tagged_only',
    'not_found',
    'expired',
])

export type LeadAdMatch = (typeof leadAdMatch.enumValues)[number]

export type LeadClickIdType = 'gclid' | 'gbraid' | 'wbraid'

/** Where the click id was read: its own column, or recovered from the landing URL. */
export type LeadClickIdSource = 'column' | 'landing_url'

export const leadAdClick = pgTable(
    'lead_ad_click',
    {
        leadId: uuid('lead_id')
            .primaryKey()
            .references(() => contactSubmission.id, { onDelete: 'cascade' }),

        /** The lead's calendar day (created_at is already Miami wall time). */
        leadDate: date('lead_date').notNull(),

        match: leadAdMatch('match').notNull(),

        clickIdType: text('click_id_type').$type<LeadClickIdType>(),
        clickId: text('click_id'),
        clickIdSource: text('click_id_source').$type<LeadClickIdSource>(),

        /** Account-zone day of the click, from the click report. */
        clickDate: date('click_date'),

        campaignId: text('campaign_id'),
        campaignName: text('campaign_name'),
        /** Null for Performance Max and campaign-only matches. */
        adGroupId: text('ad_group_id'),
        adGroupName: text('ad_group_name'),
        keyword: text('keyword'),
        keywordMatchType: text('keyword_match_type'),
        /** MOBILE / DESKTOP / TABLET. */
        device: text('device'),
        /** SEARCH / SEARCH_PARTNERS / CONTENT / YOUTUBE / MIXED… */
        network: text('network'),

        /** Path of the lead's landing page, without query string. */
        landingPath: text('landing_path'),

        // Times below are DB `now()` — Miami wall time, like every
        // `timestamp` column here (the database runs in America/New_York).
        // Writers set them with sql`now()`, never a JS Date, which would
        // land as UTC wall time and sit four hours off.

        /** Click-report lookups made so far. */
        attempts: integer('attempts').notNull().default(0),
        lastAttemptAt: timestamp('last_attempt_at'),
        /** Set once the answer is final; null while a lookup will be retried. */
        resolvedAt: timestamp('resolved_at'),

        createdAt: timestamp('created_at').notNull().defaultNow(),
        updatedAt: timestamp('updated_at').notNull().defaultNow(),
    },
    (table) => [
        index('lead_ad_click_lead_date_idx').on(table.leadDate),
        index('lead_ad_click_campaign_idx').on(
            table.campaignId,
            table.leadDate
        ),
        index('lead_ad_click_ad_group_keyword_idx').on(
            table.adGroupId,
            table.keyword
        ),
    ]
)

export type LeadAdClick = typeof leadAdClick.$inferSelect
export type InsertLeadAdClick = typeof leadAdClick.$inferInsert
