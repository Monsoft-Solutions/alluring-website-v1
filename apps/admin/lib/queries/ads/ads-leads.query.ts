/**
 * Ads Leads + Sync Status Queries (epic #288)
 *
 * Every paid Google lead with the click that brought it (screen 3), the
 * "Ad click" card on a contact page, and the jobs' health for the header.
 *
 * @module @/lib/queries/ads/ads-leads.query
 */
import { sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { leadAdMatch, type LeadAdMatch } from '@workspace/db/schema/ads'

import type {
    AdsLeadRow,
    AdsLeadsReport,
    AdsRange,
    AdsRunSummary,
    AdsSyncStatus,
    ContactAdClick,
} from '@/lib/types/ads/ads.type'

type LeadRowRaw = {
    lead_id: string
    name: string
    created_at: string
    lead_date: string
    form: string | null
    procedure: string | null
    match: LeadAdMatch
    pending: boolean
    click_id_type: string | null
    click_id_source: string | null
    click_date: string | null
    campaign_id: string | null
    campaign_name: string | null
    ad_group_name: string | null
    keyword: string | null
    keyword_match_type: string | null
    device: string | null
    network: string | null
    landing_path: string | null
}

const LEAD_COLUMNS = sql`
    lac.lead_id,
    COALESCE(NULLIF(trim(concat_ws(' ', cs.first_name, cs.last_name)), ''), cs.name) AS name,
    to_char(cs.created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
    lac.lead_date::text AS lead_date,
    cs.source AS form,
    cs.procedure,
    lac.match,
    (lac.resolved_at IS NULL) AS pending,
    lac.click_id_type,
    lac.click_id_source,
    lac.click_date::text AS click_date,
    lac.campaign_id,
    COALESCE(lac.campaign_name, latest.campaign_name) AS campaign_name,
    lac.ad_group_name,
    lac.keyword,
    lac.keyword_match_type,
    lac.device,
    lac.network,
    lac.landing_path
`

/** Newest known name per campaign, for campaign-only matches. */
const LATEST_NAMES = sql`
    LEFT JOIN LATERAL (
        SELECT campaign_name FROM ads_campaign_daily d
        WHERE d.campaign_id = lac.campaign_id
        ORDER BY d.date DESC LIMIT 1
    ) latest ON true
`

function toLeadRow(row: LeadRowRaw): AdsLeadRow {
    return {
        leadId: row.lead_id,
        name: row.name,
        createdAt: row.created_at,
        leadDate: row.lead_date,
        form: row.form,
        procedure: row.procedure,
        match: row.match,
        pending: row.pending,
        clickIdType: row.click_id_type,
        clickIdSource: row.click_id_source,
        clickDate: row.click_date,
        campaignId: row.campaign_id,
        campaignName: row.campaign_name,
        adGroupName: row.ad_group_name,
        keyword: row.keyword,
        keywordMatchType: row.keyword_match_type,
        device: row.device,
        network: row.network,
        landingPath: row.landing_path,
    }
}

/**
 * Paid leads created in the window, newest first, with the match coverage
 * over the whole window (the filters narrow the table, not the coverage bar).
 */
export async function getAdsLeads(
    range: AdsRange,
    options: { match?: LeadAdMatch; campaignId?: string } = {}
): Promise<AdsLeadsReport> {
    const matchFilter = options.match
        ? sql`AND lac.match = ${options.match}`
        : sql``
    const campaignFilter = options.campaignId
        ? sql`AND lac.campaign_id = ${options.campaignId}`
        : sql``

    const [rows, coverage] = await Promise.all([
        db.execute<LeadRowRaw>(sql`
            SELECT ${LEAD_COLUMNS}
            FROM lead_ad_click lac
            JOIN contact_submission cs ON cs.id = lac.lead_id
            ${LATEST_NAMES}
            WHERE lac.lead_date BETWEEN ${range.from} AND ${range.to}
                ${matchFilter} ${campaignFilter}
            ORDER BY cs.created_at DESC
        `),
        db.execute<{ match: LeadAdMatch; leads: number }>(sql`
            SELECT match, COUNT(*)::int AS leads
            FROM lead_ad_click lac
            WHERE lead_date BETWEEN ${range.from} AND ${range.to}
                ${campaignFilter}
            GROUP BY match
        `),
    ])

    const counts = Object.fromEntries(
        leadAdMatch.enumValues.map((value) => [value, 0])
    ) as Record<LeadAdMatch, number>
    for (const row of coverage) counts[row.match] = Number(row.leads)

    return {
        range,
        leads: rows.map(toLeadRow),
        coverage: counts,
        total: Object.values(counts).reduce((sum, value) => sum + value, 0),
    }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** The contact page's "Ad click" card; null when the lead isn't a paid Google lead. */
export async function getContactAdClick(
    leadId: string
): Promise<ContactAdClick | null> {
    // A malformed id would make the uuid comparison throw, not miss.
    if (!UUID.test(leadId)) return null
    const [row] = await db.execute<
        LeadRowRaw & { resolved_at: string | null; attempts: number }
    >(sql`
        SELECT ${LEAD_COLUMNS},
            to_char(lac.resolved_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS resolved_at,
            lac.attempts
        FROM lead_ad_click lac
        JOIN contact_submission cs ON cs.id = lac.lead_id
        ${LATEST_NAMES}
        WHERE lac.lead_id = ${leadId}
    `)
    if (!row) return null
    const lead = toLeadRow(row)
    return {
        leadId: lead.leadId,
        createdAt: lead.createdAt,
        leadDate: lead.leadDate,
        match: lead.match,
        pending: lead.pending,
        clickIdType: lead.clickIdType,
        clickIdSource: lead.clickIdSource,
        clickDate: lead.clickDate,
        campaignId: lead.campaignId,
        campaignName: lead.campaignName,
        adGroupName: lead.adGroupName,
        keyword: lead.keyword,
        keywordMatchType: lead.keywordMatchType,
        device: lead.device,
        network: lead.network,
        landingPath: lead.landingPath,
        resolvedAt: row.resolved_at,
        attempts: Number(row.attempts),
    }
}

// ============================================
// Sync status
// ============================================

type RunRaw = {
    job: 'snapshot' | 'lead-clicks'
    status: AdsRunSummary['status']
    trigger: AdsRunSummary['trigger']
    started_at: string
    finished_at: string | null
    api_operations: number | null
    counts: Record<string, number> | null
    error: string | null
}

function toRunSummary(row: RunRaw | undefined): AdsRunSummary | null {
    if (!row) return null
    return {
        status: row.status,
        trigger: row.trigger,
        startedAt: row.started_at,
        finishedAt: row.finished_at,
        apiOperations: row.api_operations,
        counts: row.counts,
        error: row.error,
    }
}

/** The newest run of each job, the snapshot's span and today's quota use. */
export async function getAdsSyncStatus(): Promise<AdsSyncStatus> {
    const [runs, span, ops] = await Promise.all([
        db.execute<RunRaw>(sql`
            SELECT DISTINCT ON (job) job, status, trigger,
                to_char(started_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS started_at,
                to_char(finished_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS finished_at,
                api_operations, counts, error
            FROM ads_sync_run
            WHERE trigger <> 'backfill' OR status = 'completed'
            ORDER BY job, started_at DESC
        `),
        db.execute<{ earliest: string | null; latest: string | null }>(sql`
            SELECT MIN(date)::text AS earliest, MAX(date)::text AS latest
            FROM ads_campaign_daily
        `),
        db.execute<{ operations: number }>(sql`
            SELECT COALESCE(SUM(api_operations), 0)::int AS operations
            FROM ads_sync_run
            WHERE started_at::date = now()::date
        `),
    ])

    return {
        snapshot: toRunSummary(runs.find((row) => row.job === 'snapshot')),
        leadClicks: toRunSummary(runs.find((row) => row.job === 'lead-clicks')),
        earliestDate: span[0]?.earliest ?? null,
        latestDate: span[0]?.latest ?? null,
        operationsToday: Number(ops[0]?.operations ?? 0),
    }
}
