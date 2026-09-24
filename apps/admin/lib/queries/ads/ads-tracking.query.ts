/**
 * Ads Changes + Tracking Queries (epic #288)
 *
 * Accountability (who changed what, kept past Google's 30 days) and tracking
 * health (Google's counted conversions against the paid leads the website
 * stored). Google only bids on what it counts, so when the two drift apart
 * the account is optimizing on a partial signal.
 *
 * @module @/lib/queries/ads/ads-tracking.query
 */
import { sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'

import type {
    AdsChangeEventRow,
    AdsChangesReport,
    AdsConversionActionRow,
    AdsRange,
    AdsTrackingDay,
    AdsTrackingReport,
} from '@/lib/types/ads/ads.type'
import {
    silentActionAlerts,
    trackingGapAlert,
} from '@/lib/utils/ads/ads-attention.util'

/**
 * A conversion action counts as a call when its origin or category says so.
 * Calls are judged apart from forms: the website database only holds forms.
 */
export const IS_CALL = sql`(origin = 'CALL_FROM_ADS' OR category = 'PHONE_CALL_LEAD' OR type LIKE '%CALL%')`

function round2(value: number): number {
    return Math.round(value * 100) / 100
}

/**
 * Per day: Google's counted primary conversions (forms vs calls) and the paid
 * leads the website stored.
 */
export async function getTrackingDays(
    range: AdsRange
): Promise<AdsTrackingDay[]> {
    const rows = await db.execute<{
        date: string
        forms: number
        calls: number
        leads: number
    }>(sql`
        WITH days AS (
            SELECT d::date AS date
            FROM generate_series(${range.from}::date, ${range.to}::date, interval '1 day') d
        ),
        conv AS (
            SELECT date,
                SUM(conversions) FILTER (WHERE NOT ${IS_CALL})::float8 AS forms,
                SUM(conversions) FILTER (WHERE ${IS_CALL})::float8 AS calls
            FROM ads_conversion_daily
            WHERE date BETWEEN ${range.from} AND ${range.to} AND primary_for_goal
            GROUP BY date
        ),
        leads AS (
            SELECT lead_date AS date, COUNT(*)::int AS leads
            FROM lead_ad_click
            WHERE lead_date BETWEEN ${range.from} AND ${range.to}
            GROUP BY lead_date
        )
        SELECT days.date::text AS date,
            COALESCE(conv.forms, 0) AS forms,
            COALESCE(conv.calls, 0) AS calls,
            COALESCE(leads.leads, 0) AS leads
        FROM days
        LEFT JOIN conv USING (date)
        LEFT JOIN leads USING (date)
        ORDER BY days.date
    `)
    return rows.map((row) => ({
        date: row.date,
        formConversions: round2(Number(row.forms)),
        callConversions: round2(Number(row.calls)),
        paidLeads: Number(row.leads),
    }))
}

/** Screen 4 (right): conversion actions against paid leads. */
export async function getAdsTracking(
    range: AdsRange
): Promise<AdsTrackingReport> {
    const [actions, days, actionDays] = await Promise.all([
        db.execute<{
            conversion_action_id: string
            action_name: string
            category: string
            origin: string
            primary_for_goal: boolean
            is_call: boolean
            counted: number
            recorded: number
        }>(sql`
            SELECT conversion_action_id,
                (array_agg(action_name ORDER BY date DESC))[1] AS action_name,
                (array_agg(category ORDER BY date DESC))[1] AS category,
                (array_agg(origin ORDER BY date DESC))[1] AS origin,
                bool_or(primary_for_goal) AS primary_for_goal,
                bool_or(${IS_CALL}) AS is_call,
                SUM(conversions)::float8 AS counted,
                SUM(all_conversions)::float8 AS recorded
            FROM ads_conversion_daily
            WHERE date BETWEEN ${range.from} AND ${range.to}
            GROUP BY conversion_action_id
            ORDER BY bool_or(primary_for_goal) DESC, SUM(all_conversions) DESC
        `),
        getTrackingDays(range),
        db.execute<{
            date: string
            conversion_action_id: string
            action_name: string
            conversions: number
        }>(sql`
            SELECT date::text AS date, conversion_action_id, action_name,
                conversions::float8 AS conversions
            FROM ads_conversion_daily
            WHERE date BETWEEN ${range.from} AND ${range.to}
                AND primary_for_goal AND NOT ${IS_CALL}
        `),
    ])

    const actionRows: AdsConversionActionRow[] = actions.map((row) => ({
        conversionActionId: row.conversion_action_id,
        actionName: row.action_name,
        category: row.category,
        origin: row.origin,
        primaryForGoal: row.primary_for_goal,
        isCall: row.is_call,
        counted: round2(Number(row.counted)),
        recorded: round2(Number(row.recorded)),
    }))

    const gap = trackingGapAlert(days)
    const silent = silentActionAlerts(
        actionDays.map((row) => ({
            date: row.date,
            actionId: row.conversion_action_id,
            actionName: row.action_name,
            conversions: Number(row.conversions),
        })),
        days
    )

    return {
        range,
        actions: actionRows,
        days,
        paidLeads: days.reduce((sum, day) => sum + day.paidLeads, 0),
        alerts: [...(gap ? [gap] : []), ...silent],
    }
}

/** Screen 4 (left): the change log, newest first. */
export async function getAdsChanges(
    range: AdsRange,
    options: { user?: string; limit?: number } = {}
): Promise<AdsChangesReport> {
    // `__google__` stands for changes with no user email (Google's own).
    const userFilter =
        options.user === undefined
            ? sql``
            : sql`AND user_email = ${options.user === '__google__' ? '' : options.user}`
    const [events, users, oldest] = await Promise.all([
        db.execute<{
            resource_name: string
            changed_at: string
            date: string
            user_email: string
            client_type: string
            resource_type: string
            operation: string
            changed_fields: string[]
            campaign_name: string | null
            ad_group_name: string | null
            values: Record<string, { old: unknown; new: unknown }> | null
        }>(sql`
            SELECT resource_name,
                to_char(changed_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS changed_at,
                changed_at::date::text AS date,
                user_email, client_type, resource_type, operation,
                changed_fields, campaign_name, ad_group_name, values
            FROM ads_change_event
            WHERE changed_at::date BETWEEN ${range.from} AND ${range.to}
                ${userFilter}
            ORDER BY changed_at DESC
            LIMIT ${options.limit ?? 2000}
        `),
        db.execute<{ user_email: string }>(sql`
            SELECT DISTINCT user_email FROM ads_change_event
            WHERE changed_at::date BETWEEN ${range.from} AND ${range.to}
            ORDER BY user_email
        `),
        db.execute<{ oldest: string | null }>(sql`
            SELECT MIN(changed_at)::date::text AS oldest FROM ads_change_event
        `),
    ])

    const rows: AdsChangeEventRow[] = events.map((row) => ({
        resourceName: row.resource_name,
        changedAt: row.changed_at,
        date: row.date,
        userEmail: row.user_email,
        clientType: row.client_type,
        resourceType: row.resource_type,
        operation: row.operation,
        changedFields: row.changed_fields,
        campaignName: row.campaign_name,
        adGroupName: row.ad_group_name,
        values: row.values,
    }))

    return {
        range,
        events: rows,
        users: users.map((row) => row.user_email),
        oldestStored: oldest[0]?.oldest ?? null,
    }
}
