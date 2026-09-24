/**
 * Ads Overview + Campaign Queries (epic #288)
 *
 * Spend from the Google Ads snapshot next to the paid leads the website
 * stored, per campaign and per day. Everything answers from Postgres; no API
 * call happens on a page view.
 *
 * Cost per lead = spend in the window ÷ paid leads created in the window
 * (last paid click, the one touch the site stores). Both sides use Miami
 * calendar days: the account reports in America/New_York and
 * `contact_submission.created_at` already holds Miami wall time.
 *
 * @module @/lib/queries/ads/ads-overview.query
 */
import { sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { addDays } from '@workspace/google-ads'

import type {
    AdsCampaignDetail,
    AdsCampaignRow,
    AdsChangeMarker,
    AdsDailyPoint,
    AdsKpis,
    AdsLeadMixEntry,
    AdsOverview,
    AdsRange,
} from '@/lib/types/ads/ads.type'
import {
    cplAlerts,
    costPerLead,
    noLeadStreakAlerts,
    overspendAlerts,
    shortDate,
    trackingGapAlert,
    type AttentionItem,
} from '@/lib/utils/ads/ads-attention.util'
import {
    isStatusOrBudgetChange,
    shortUser,
    summarizeChanges,
    type ChangeLike,
} from '@/lib/utils/ads/ads-changes.util'
import { getTrackingDays, IS_CALL } from '@/lib/queries/ads/ads-tracking.query'

// ============================================
// Helpers
// ============================================

/** Days the trailing cost-per-lead baseline covers, before the window. */
const BASELINE_DAYS = 90

function round2(value: number): number {
    return Math.round(value * 100) / 100
}

function cpc(cost: number, clicks: number): number | null {
    return clicks > 0 ? round2(cost / clicks) : null
}

type CampaignAggRow = {
    campaign_id: string
    campaign_name: string | null
    status: string | null
    channel: string | null
    bidding_strategy: string | null
    daily_budget: number | null
    impressions: number
    clicks: number
    cost: number
    conversions: number
    leads: number
}

/**
 * Per-campaign spend and leads in a window. Campaigns with leads but no spend
 * in the window are included (a click before the window, a lead inside it).
 * Name, status and budget come from each campaign's newest snapshot row.
 */
async function getCampaignRows(
    range: AdsRange,
    campaignId?: string
): Promise<AdsCampaignRow[]> {
    const filter = campaignId ? sql`AND campaign_id = ${campaignId}` : sql``
    const rows = await db.execute<CampaignAggRow>(sql`
        WITH spend AS (
            SELECT campaign_id,
                SUM(impressions)::int AS impressions,
                SUM(clicks)::int AS clicks,
                SUM(cost)::float8 AS cost,
                SUM(conversions)::float8 AS conversions
            FROM ads_campaign_daily
            WHERE date BETWEEN ${range.from} AND ${range.to} ${filter}
            GROUP BY campaign_id
        ),
        leads AS (
            SELECT campaign_id, COUNT(*)::int AS leads
            FROM lead_ad_click
            WHERE lead_date BETWEEN ${range.from} AND ${range.to}
                AND campaign_id IS NOT NULL ${filter}
            GROUP BY campaign_id
        ),
        latest AS (
            SELECT DISTINCT ON (campaign_id) campaign_id, campaign_name,
                status, channel, bidding_strategy, daily_budget::float8
            FROM ads_campaign_daily
            ORDER BY campaign_id, date DESC
        ),
        lead_names AS (
            SELECT DISTINCT ON (campaign_id) campaign_id, campaign_name
            FROM lead_ad_click
            WHERE campaign_name IS NOT NULL
            ORDER BY campaign_id, lead_date DESC
        )
        SELECT ids.campaign_id,
            COALESCE(latest.campaign_name, lead_names.campaign_name) AS campaign_name,
            latest.status, latest.channel, latest.bidding_strategy,
            latest.daily_budget,
            COALESCE(spend.impressions, 0) AS impressions,
            COALESCE(spend.clicks, 0) AS clicks,
            COALESCE(spend.cost, 0) AS cost,
            COALESCE(spend.conversions, 0) AS conversions,
            COALESCE(leads.leads, 0) AS leads
        FROM (SELECT campaign_id FROM spend UNION SELECT campaign_id FROM leads) ids
        LEFT JOIN spend USING (campaign_id)
        LEFT JOIN leads USING (campaign_id)
        LEFT JOIN latest USING (campaign_id)
        LEFT JOIN lead_names USING (campaign_id)
        ORDER BY COALESCE(spend.cost, 0) DESC, COALESCE(leads.leads, 0) DESC
    `)

    return rows.map((row) => {
        const cost = round2(Number(row.cost))
        return {
            campaignId: row.campaign_id,
            campaignName: row.campaign_name ?? `Campaign ${row.campaign_id}`,
            status: row.status,
            channel: row.channel,
            biddingStrategy: row.bidding_strategy,
            dailyBudget:
                row.daily_budget === null ? null : Number(row.daily_budget),
            impressions: Number(row.impressions),
            clicks: Number(row.clicks),
            cost,
            cpc: cpc(cost, Number(row.clicks)),
            googleConversions: round2(Number(row.conversions)),
            leads: Number(row.leads),
            costPerLead: costPerLead(cost, Number(row.leads)),
        }
    })
}

type DailyRow = {
    date: string
    cost: number
    clicks: number
    conversions: number
    budget: number | null
    leads: number
    changes: number
}

/** One row per day of the window, zeros included (a pause reads as a drop). */
async function getDailyPoints(
    range: AdsRange,
    campaignId?: string
): Promise<AdsDailyPoint[]> {
    const spendFilter = campaignId
        ? sql`AND campaign_id = ${campaignId}`
        : sql``
    const rows = await db.execute<DailyRow>(sql`
        WITH days AS (
            SELECT d::date AS date
            FROM generate_series(${range.from}::date, ${range.to}::date, interval '1 day') d
        ),
        spend AS (
            SELECT date,
                SUM(cost)::float8 AS cost,
                SUM(clicks)::int AS clicks,
                SUM(conversions)::float8 AS conversions,
                SUM(daily_budget) FILTER (WHERE cost > 0)::float8 AS budget
            FROM ads_campaign_daily
            WHERE date BETWEEN ${range.from} AND ${range.to} ${spendFilter}
            GROUP BY date
        ),
        leads AS (
            SELECT lead_date AS date, COUNT(*)::int AS leads
            FROM lead_ad_click
            WHERE lead_date BETWEEN ${range.from} AND ${range.to} ${spendFilter}
            GROUP BY lead_date
        ),
        changes AS (
            SELECT changed_at::date AS date, COUNT(*)::int AS changes
            FROM ads_change_event
            WHERE changed_at::date BETWEEN ${range.from} AND ${range.to} ${spendFilter}
            GROUP BY 1
        )
        SELECT days.date::text AS date,
            COALESCE(spend.cost, 0) AS cost,
            COALESCE(spend.clicks, 0) AS clicks,
            COALESCE(spend.conversions, 0) AS conversions,
            spend.budget,
            COALESCE(leads.leads, 0) AS leads,
            COALESCE(changes.changes, 0) AS changes
        FROM days
        LEFT JOIN spend USING (date)
        LEFT JOIN leads USING (date)
        LEFT JOIN changes USING (date)
        ORDER BY days.date
    `)

    return rows.map((row) => ({
        date: row.date,
        cost: round2(Number(row.cost)),
        clicks: Number(row.clicks),
        googleConversions: round2(Number(row.conversions)),
        budget: row.budget === null ? null : round2(Number(row.budget)),
        leads: Number(row.leads),
        changes: Number(row.changes),
    }))
}

type ChangeRow = ChangeLike & { date: string; campaign_id: string | null }

/** The window's change events, oldest first, for markers and attention. */
async function getChangesInWindow(range: AdsRange): Promise<ChangeRow[]> {
    const rows = await db.execute<{
        date: string
        user_email: string
        resource_type: string
        operation: string
        changed_fields: string[]
        values: Record<string, { old: unknown; new: unknown }> | null
        campaign_id: string | null
    }>(sql`
        SELECT changed_at::date::text AS date, user_email, resource_type,
            operation, changed_fields, values, campaign_id
        FROM ads_change_event
        WHERE changed_at::date BETWEEN ${range.from} AND ${range.to}
        ORDER BY changed_at
    `)
    return rows.map((row) => ({
        date: row.date,
        userEmail: row.user_email,
        resourceType: row.resource_type,
        operation: row.operation,
        changedFields: row.changed_fields,
        values: row.values,
        campaign_id: row.campaign_id,
    }))
}

function changeMarkers(changes: readonly ChangeRow[]): AdsChangeMarker[] {
    const byDate = new Map<string, Map<string, ChangeRow[]>>()
    for (const change of changes) {
        const byUser = byDate.get(change.date) ?? new Map<string, ChangeRow[]>()
        const list = byUser.get(change.userEmail) ?? []
        list.push(change)
        byUser.set(change.userEmail, list)
        byDate.set(change.date, byUser)
    }
    return [...byDate.entries()].map(([date, byUser]) => ({
        date,
        count: [...byUser.values()].reduce((sum, list) => sum + list.length, 0),
        summary: [...byUser.entries()]
            .map(
                ([user, list]) => `${shortUser(user)} ${summarizeChanges(list)}`
            )
            .join(' · '),
    }))
}

/** Status and budget changes in the window, one info item per day and person. */
function statusChangeItems(changes: readonly ChangeRow[]): AttentionItem[] {
    const groups = new Map<string, ChangeRow[]>()
    for (const change of changes) {
        if (!isStatusOrBudgetChange(change)) continue
        const key = `${change.date}|${change.userEmail}`
        const list = groups.get(key) ?? []
        list.push(change)
        groups.set(key, list)
    }
    return [...groups.entries()].map(([key, list]) => {
        const [date, user] = key.split('|') as [string, string]
        return {
            id: `status-${key}`,
            severity: 'info' as const,
            title: `${summarizeChanges(list)} on ${shortDate(date)}`,
            detail: `By ${user || 'Google'}.`,
            area: 'changes' as const,
        }
    })
}

/** Cost per lead over the BASELINE_DAYS before the window. */
async function getBaselineCostPerLead(range: AdsRange): Promise<number | null> {
    const from = addDays(range.from, -BASELINE_DAYS)
    const to = addDays(range.from, -1)
    const [row] = await db.execute<{ cost: number; leads: number }>(sql`
        SELECT
            (SELECT COALESCE(SUM(cost), 0)::float8 FROM ads_campaign_daily
                WHERE date BETWEEN ${from} AND ${to}) AS cost,
            (SELECT COUNT(*)::int FROM lead_ad_click
                WHERE lead_date BETWEEN ${from} AND ${to}) AS leads
    `)
    if (!row) return null
    return costPerLead(Number(row.cost), Number(row.leads))
}

/** Primary conversions in the window, forms vs calls. */
async function getConversionSplit(
    range: AdsRange
): Promise<{ forms: number; calls: number }> {
    const [row] = await db.execute<{ forms: number; calls: number }>(sql`
        SELECT
            COALESCE(SUM(conversions) FILTER (WHERE NOT ${IS_CALL}), 0)::float8 AS forms,
            COALESCE(SUM(conversions) FILTER (WHERE ${IS_CALL}), 0)::float8 AS calls
        FROM ads_conversion_daily
        WHERE date BETWEEN ${range.from} AND ${range.to} AND primary_for_goal
    `)
    return {
        forms: round2(Number(row?.forms ?? 0)),
        calls: round2(Number(row?.calls ?? 0)),
    }
}

/** Per campaign per day spend and leads, for the no-lead-streak rule. */
async function getCampaignDays(range: AdsRange) {
    const rows = await db.execute<{
        date: string
        campaign_id: string
        campaign_name: string
        cost: number
        leads: number
    }>(sql`
        WITH leads AS (
            SELECT lead_date AS date, campaign_id, COUNT(*)::int AS leads
            FROM lead_ad_click
            WHERE lead_date BETWEEN ${range.from} AND ${range.to}
                AND campaign_id IS NOT NULL
            GROUP BY 1, 2
        )
        SELECT d.date::text AS date, d.campaign_id, d.campaign_name,
            d.cost::float8 AS cost, COALESCE(leads.leads, 0) AS leads
        FROM ads_campaign_daily d
        LEFT JOIN leads USING (date, campaign_id)
        WHERE d.date BETWEEN ${range.from} AND ${range.to}
    `)
    return rows.map((row) => ({
        date: row.date,
        campaignId: row.campaign_id,
        campaignName: row.campaign_name,
        cost: Number(row.cost),
        leads: Number(row.leads),
    }))
}

// ============================================
// Public queries
// ============================================

/** Screen 1: what did the money buy? */
export async function getAdsOverview(range: AdsRange): Promise<AdsOverview> {
    const [
        campaigns,
        daily,
        changes,
        baseline,
        split,
        campaignDays,
        unassigned,
        trackingDays,
    ] = await Promise.all([
        getCampaignRows(range),
        getDailyPoints(range),
        getChangesInWindow(range),
        getBaselineCostPerLead(range),
        getConversionSplit(range),
        getCampaignDays(range),
        db.execute<{ leads: number }>(sql`
            SELECT COUNT(*)::int AS leads FROM lead_ad_click
            WHERE lead_date BETWEEN ${range.from} AND ${range.to}
                AND campaign_id IS NULL
        `),
        getTrackingDays(range),
    ])

    const unassignedLeads = Number(unassigned[0]?.leads ?? 0)
    const cost = round2(campaigns.reduce((sum, row) => sum + row.cost, 0))
    const clicks = campaigns.reduce((sum, row) => sum + row.clicks, 0)
    const leads =
        campaigns.reduce((sum, row) => sum + row.leads, 0) + unassignedLeads

    const [matched] = await db.execute<{ matched: number }>(sql`
        SELECT COUNT(*)::int AS matched FROM lead_ad_click
        WHERE lead_date BETWEEN ${range.from} AND ${range.to} AND match = 'click'
    `)

    const kpis: AdsKpis = {
        impressions: campaigns.reduce((sum, row) => sum + row.impressions, 0),
        clicks,
        cost,
        cpc: cpc(cost, clicks),
        googleConversions: round2(
            campaigns.reduce((sum, row) => sum + row.googleConversions, 0)
        ),
        leads,
        clickMatchedLeads: Number(matched?.matched ?? 0),
        costPerLead: costPerLead(cost, leads),
        formConversions: split.forms,
        callConversions: split.calls,
        baselineCostPerLead: baseline,
    }

    const gap = trackingGapAlert(trackingDays)
    const attention: AttentionItem[] = [
        ...cplAlerts(campaigns, baseline),
        ...(gap ? [gap] : []),
        ...overspendAlerts(daily),
        ...noLeadStreakAlerts(campaignDays),
        ...statusChangeItems(changes),
    ]

    return {
        range,
        kpis,
        daily,
        campaigns,
        unassignedLeads,
        attention,
        changeMarkers: changeMarkers(changes),
    }
}

/** The campaign table alone, for /ads/campaigns. */
export async function getAdsCampaigns(range: AdsRange) {
    const [campaigns, baseline] = await Promise.all([
        getCampaignRows(range),
        getBaselineCostPerLead(range),
    ])
    return { range, campaigns, baselineCostPerLead: baseline }
}

/** One campaign: its daily trend and what its leads asked for. */
export async function getAdsCampaignDetail(
    range: AdsRange,
    campaignId: string
): Promise<AdsCampaignDetail | null> {
    const [rows, daily, mix] = await Promise.all([
        getCampaignRows(range, campaignId),
        getDailyPoints(range, campaignId),
        db.execute<{ field: string; value: string; leads: number }>(sql`
            SELECT field, value, COUNT(*)::int AS leads
            FROM lead_ad_click lac
            JOIN contact_submission cs ON cs.id = lac.lead_id
            CROSS JOIN LATERAL (VALUES
                ('procedure', COALESCE(NULLIF(cs.procedure, ''), 'Not given')),
                ('timeline', COALESCE(NULLIF(cs.timeline, ''), 'Not given')),
                ('financingInterest', COALESCE(NULLIF(cs.financing_interest, ''), 'Not given'))
            ) AS answers(field, value)
            WHERE lac.campaign_id = ${campaignId}
                AND lac.lead_date BETWEEN ${range.from} AND ${range.to}
            GROUP BY field, value
            ORDER BY leads DESC
        `),
    ])

    const campaign = rows[0]
    if (!campaign) {
        // A campaign with no spend or leads in the window still has a page.
        const [latest] = await db.execute<{
            campaign_name: string
            status: string
            channel: string
            bidding_strategy: string
            daily_budget: number | null
        }>(sql`
            SELECT campaign_name, status, channel, bidding_strategy,
                daily_budget::float8
            FROM ads_campaign_daily WHERE campaign_id = ${campaignId}
            ORDER BY date DESC LIMIT 1
        `)
        if (!latest) return null
        return {
            range,
            campaign: {
                campaignId,
                campaignName: latest.campaign_name,
                status: latest.status,
                channel: latest.channel,
                biddingStrategy: latest.bidding_strategy,
                dailyBudget:
                    latest.daily_budget === null
                        ? null
                        : Number(latest.daily_budget),
                impressions: 0,
                clicks: 0,
                cost: 0,
                cpc: null,
                googleConversions: 0,
                leads: 0,
                costPerLead: null,
            },
            daily,
            leadMix: { procedure: [], timeline: [], financingInterest: [] },
        }
    }

    const pick = (field: string): AdsLeadMixEntry[] =>
        mix
            .filter((row) => row.field === field)
            .map((row) => ({ value: row.value, leads: Number(row.leads) }))

    return {
        range,
        campaign,
        daily,
        leadMix: {
            procedure: pick('procedure'),
            timeline: pick('timeline'),
            financingInterest: pick('financingInterest'),
        },
    }
}
