/**
 * Lead Ad Click Resolver
 *
 * The hourly `resolve-lead-clicks` job (epic #288): finds every paid Google
 * lead that has no final answer yet, looks its gclid up in Google's click
 * report while the click is inside the report's 90 days, and stores which
 * campaign, ad group and keyword it came from in `lead_ad_click`.
 *
 * Click ids are read from their columns first and from the stored landing
 * URL second — between July and September 2026 the gclid column stayed
 * empty on every lead while the URL still carried it (#276).
 *
 * Budget: one API operation per (lead day × day searched), stopping as soon
 * as every gclid of that day is found — about one per lead-day in practice.
 * Each lead day is written as soon as its lookup returns, and a run stops
 * starting lookups past RUN_TIME_BUDGET_MS / RUN_OPERATION_BUDGET, so a
 * backlog drains over a few hours instead of timing out. A lookup that throws
 * counts as an attempt; the lead retries hourly, and an old one settles on
 * its fallback after MAX_FAILED_LOOKUPS.
 *
 * @module @/lib/services/ads/lead-ad-click.service
 */
import { and, desc, eq, gte, isNull, lt, or, sql } from 'drizzle-orm'
import type { PgInsertValue } from 'drizzle-orm/pg-core'

import { db } from '@workspace/db/client'
import {
    adsCampaignDaily,
    leadAdClick,
    type LeadAdMatch,
} from '@workspace/db/schema/ads'
import { contactSubmission } from '@workspace/db/schema/contact'
import {
    addDays,
    getGoogleAdsConfig,
    getOperationCount,
    isGoogleAdsConfigured,
    lookupClicks,
    todayIn,
} from '@workspace/google-ads'

import {
    acquireAdsLock,
    finishAdsRun,
    releaseStaleAdsLock,
    type AdsSyncTrigger,
} from '@/lib/services/ads/ads-sync-run.service'
import {
    assessLead,
    CLICK_LOOKBACK_DAYS,
    CLICK_VIEW_RETENTION_DAYS,
    daysSince,
    decideMatch,
    type ClickDetails,
    type LeadAssessment,
    type LeadForMatching,
} from '@/lib/utils/ads/lead-ad-match.util'

// ============================================
// Constants
// ============================================

/** How far back the hourly run looks for leads without a final answer. */
export const DEFAULT_LOOKBACK_DAYS = CLICK_VIEW_RETENTION_DAYS

/** A pending lead is looked up again no sooner than this. */
const RETRY_AFTER_MINUTES = 50

/** click_view takes at most this many gclids per query. */
const LOOKUP_BATCH_SIZE = 100

const UPSERT_CHUNK_SIZE = 200

/**
 * A run stops starting new lookups past either budget; what is left waits
 * for the next hour. Keeps a backlog (first run, an outage) inside the cron's
 * 300-second limit and a small slice of the 2,880 daily operations.
 */
const RUN_TIME_BUDGET_MS = 200_000
const RUN_OPERATION_BUDGET = 300

/**
 * Lookups that failed outright (not "not found") before an old lead is
 * settled on its fallback, so one bad batch can't hold a day forever.
 */
const MAX_FAILED_LOOKUPS = 3

// ============================================
// Types
// ============================================

export type ResolveLeadClicksResult = {
    outcome:
        | 'resolved'
        | 'nothing-to-do'
        | 'skipped-unconfigured'
        | 'skipped-locked'
        | 'failed'
    /** Candidate leads read (paid or not). */
    examined: number
    /** Rows written to lead_ad_click. */
    written: number
    /** Leads left for the next run because the run's budget ran out. */
    deferred?: number
    byMatch: Partial<Record<LeadAdMatch, number>>
    /** Lead days whose lookup failed; their leads retry next run. */
    failedLookups: number
    apiOperations: number
    error?: string
}

/** An insert row; timestamps are sql`now()` (see the table's note). */
type LeadAdClickRow = PgInsertValue<typeof leadAdClick>

type Candidate = LeadForMatching & {
    id: string
    leadDate: string
    attempts: number | null
}

// ============================================
// Reads
// ============================================

/**
 * Leads in the window with no final answer: no row yet, or a pending row
 * whose last lookup is older than RETRY_AFTER_MINUTES. Pre-filtered to leads
 * with any Google trace; `assessLead` makes the real call.
 */
async function loadCandidates(startDay: string): Promise<Candidate[]> {
    const rows = await db
        .select({
            id: contactSubmission.id,
            leadDate: sql<string>`${contactSubmission.createdAt}::date::text`,
            utmSource: contactSubmission.utmSource,
            utmMedium: contactSubmission.utmMedium,
            utmCampaign: contactSubmission.utmCampaign,
            source: contactSubmission.source,
            referrer: contactSubmission.referrer,
            gclid: contactSubmission.gclid,
            gbraid: contactSubmission.gbraid,
            wbraid: contactSubmission.wbraid,
            gadCampaignId: contactSubmission.gadCampaignId,
            fbclid: contactSubmission.fbclid,
            ttclid: contactSubmission.ttclid,
            landingPage: contactSubmission.landingPage,
            landingParams: contactSubmission.landingParams,
            attempts: leadAdClick.attempts,
        })
        .from(contactSubmission)
        .leftJoin(leadAdClick, eq(leadAdClick.leadId, contactSubmission.id))
        .where(
            and(
                // created_at is Miami wall time, so a Miami date compares as-is.
                gte(contactSubmission.createdAt, sql`${startDay}::date`),
                or(
                    isNull(leadAdClick.leadId),
                    and(
                        isNull(leadAdClick.resolvedAt),
                        or(
                            isNull(leadAdClick.lastAttemptAt),
                            lt(
                                leadAdClick.lastAttemptAt,
                                sql`now() - make_interval(mins => ${RETRY_AFTER_MINUTES})`
                            )
                        )
                    )
                ),
                sql`(
                    ${contactSubmission.gclid} IS NOT NULL
                    OR ${contactSubmission.gbraid} IS NOT NULL
                    OR ${contactSubmission.wbraid} IS NOT NULL
                    OR ${contactSubmission.gadCampaignId} IS NOT NULL
                    OR ${contactSubmission.landingPage} ~* '[?&](gclid|gbraid|wbraid|gad_campaignid|utm_id)='
                    OR ${contactSubmission.utmSource} ILIKE '%google%'
                    OR ${contactSubmission.utmSource} ILIKE 'adwords'
                )`
            )
        )

    return rows
}

/** Latest name per campaign id, and id per name, from the snapshot. */
async function loadCampaignNames(): Promise<{
    nameById: Map<string, string>
    idByName: Map<string, string>
}> {
    const rows = await db
        .selectDistinctOn([adsCampaignDaily.campaignId], {
            campaignId: adsCampaignDaily.campaignId,
            campaignName: adsCampaignDaily.campaignName,
        })
        .from(adsCampaignDaily)
        .orderBy(adsCampaignDaily.campaignId, desc(adsCampaignDaily.date))

    return {
        nameById: new Map(
            rows.map((row) => [row.campaignId, row.campaignName])
        ),
        idByName: new Map(
            rows.map((row) => [row.campaignName, row.campaignId])
        ),
    }
}

// ============================================
// Lookups
// ============================================

/**
 * Look one lead day's gclids up. click_view answers one day per query and
 * the walk back starts at the lead's day. Batches of 100 fail on their own,
 * so one gclid the API rejects only holds back its own batch.
 *
 * @returns Found clicks by gclid, and the gclids whose batch threw
 */
async function lookUpDay(
    date: string,
    gclids: string[]
): Promise<{ found: Map<string, ClickDetails>; failed: Set<string> }> {
    const found = new Map<string, ClickDetails>()
    const failed = new Set<string>()
    const unique = [...new Set(gclids)]

    for (let i = 0; i < unique.length; i += LOOKUP_BATCH_SIZE) {
        const batch = unique.slice(i, i + LOOKUP_BATCH_SIZE)
        try {
            const result = await lookupClicks({
                gclids: batch,
                date,
                daysBefore: CLICK_LOOKBACK_DAYS,
            })
            for (const click of result.clicks) {
                found.set(click.gclid, {
                    date: click.date,
                    campaignId: click.campaignId,
                    campaignName: click.campaignName,
                    adGroupId: click.adGroupId,
                    adGroupName: click.adGroupName,
                    keyword: click.keyword,
                    keywordMatchType: click.keywordMatchType,
                    device: click.device,
                    network: click.network,
                })
            }
        } catch (error) {
            for (const gclid of batch) failed.add(gclid)
            const message =
                error instanceof Error ? error.message : String(error)
            console.error(
                `[resolve-lead-clicks] lookup failed for ${date} (${batch.length} gclids): ${message}`
            )
        }
    }

    return { found, failed }
}

/** Insert or update rows, in chunks. */
async function upsertRows(rows: LeadAdClickRow[]): Promise<void> {
    for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
        await db
            .insert(leadAdClick)
            .values(rows.slice(i, i + UPSERT_CHUNK_SIZE))
            .onConflictDoUpdate({
                target: leadAdClick.leadId,
                set: {
                    leadDate: sql`excluded.lead_date`,
                    match: sql`excluded.match`,
                    clickIdType: sql`excluded.click_id_type`,
                    clickId: sql`excluded.click_id`,
                    clickIdSource: sql`excluded.click_id_source`,
                    clickDate: sql`excluded.click_date`,
                    campaignId: sql`excluded.campaign_id`,
                    campaignName: sql`excluded.campaign_name`,
                    adGroupId: sql`excluded.ad_group_id`,
                    adGroupName: sql`excluded.ad_group_name`,
                    keyword: sql`excluded.keyword`,
                    keywordMatchType: sql`excluded.keyword_match_type`,
                    device: sql`excluded.device`,
                    network: sql`excluded.network`,
                    landingPath: sql`excluded.landing_path`,
                    attempts: sql`excluded.attempts`,
                    lastAttemptAt: sql`coalesce(excluded.last_attempt_at, ${leadAdClick.lastAttemptAt})`,
                    resolvedAt: sql`excluded.resolved_at`,
                    updatedAt: sql`now()`,
                },
            })
    }
}

// ============================================
// The job
// ============================================

function toRow(
    lead: Candidate,
    assessment: LeadAssessment,
    decision: ReturnType<typeof decideMatch>,
    lookedUp: boolean,
    nameById: Map<string, string>
): LeadAdClickRow {
    const click = decision.click
    return {
        leadId: lead.id,
        leadDate: lead.leadDate,
        match: decision.match,
        clickIdType: assessment.clickId?.type ?? null,
        clickId: assessment.clickId?.id ?? null,
        clickIdSource: assessment.clickId?.source ?? null,
        clickDate: click?.date ?? null,
        campaignId: decision.campaignId,
        campaignName:
            click?.campaignName ??
            (decision.campaignId
                ? (nameById.get(decision.campaignId) ?? null)
                : null),
        adGroupId: click?.adGroupId ?? null,
        adGroupName: click?.adGroupName ?? null,
        keyword: click?.keyword ?? null,
        keywordMatchType: click?.keywordMatchType ?? null,
        device: click?.device ?? null,
        network: click?.network ?? null,
        landingPath: assessment.landingPath,
        attempts: (lead.attempts ?? 0) + (lookedUp ? 1 : 0),
        lastAttemptAt: lookedUp ? sql`now()` : undefined,
        resolvedAt: decision.final ? sql`now()` : null,
        updatedAt: sql`now()`,
    }
}

/**
 * Resolve paid Google leads to their ad clicks.
 *
 * @param trigger - What started the run
 * @param options.lookbackDays - How far back to look for unresolved leads.
 *   Leads older than the click report's 90 days are still placed on the
 *   ladder (campaign, iPhone click, tagged), just without a lookup — the
 *   backfill uses this to cover the whole snapshot history.
 */
export async function runResolveLeadClicksJob(
    trigger: AdsSyncTrigger = 'cron',
    options: { lookbackDays?: number; now?: Date } = {}
): Promise<ResolveLeadClicksResult> {
    const empty = {
        examined: 0,
        written: 0,
        byMatch: {},
        failedLookups: 0,
        apiOperations: 0,
    }
    if (!isGoogleAdsConfigured()) {
        return { outcome: 'skipped-unconfigured', ...empty }
    }

    await releaseStaleAdsLock('lead-clicks')
    const runId = await acquireAdsLock('lead-clicks', trigger)
    if (!runId) return { outcome: 'skipped-locked', ...empty }

    const operationsBefore = getOperationCount()
    const spent = () => getOperationCount() - operationsBefore

    try {
        const today = todayIn(getGoogleAdsConfig().timeZone, options.now)
        const lookbackDays = options.lookbackDays ?? DEFAULT_LOOKBACK_DAYS
        const startDay = addDays(today, -(lookbackDays - 1))

        const candidates = await loadCandidates(startDay)
        const assessed = candidates
            .map((lead) => ({ lead, assessment: assessLead(lead) }))
            .filter(
                (
                    entry
                ): entry is { lead: Candidate; assessment: LeadAssessment } =>
                    entry.assessment !== null
            )

        if (assessed.length === 0) {
            await finishAdsRun(runId, {
                status: 'completed',
                counts: { examined: candidates.length, written: 0 },
                apiOperations: 0,
            })
            return {
                outcome: 'nothing-to-do',
                ...empty,
                examined: candidates.length,
            }
        }

        const names = await loadCampaignNames()
        const startedAt = Date.now()
        const byMatch: Partial<Record<LeadAdMatch, number>> = {}
        let written = 0
        let failures = 0
        let deferred = 0

        type Entry = { lead: Candidate; assessment: LeadAssessment }

        /** Place one lead on the ladder as a row to upsert. */
        const place = (
            { lead, assessment }: Entry,
            click: ClickDetails | null,
            attempted: boolean,
            lookupFailed: boolean
        ): LeadAdClickRow => {
            const leadAgeDays = daysSince(lead.leadDate, today)
            const decision = decideMatch(assessment, {
                leadAgeDays,
                click,
                lookedUp: attempted,
                campaignIdByName: names.idByName,
            })
            // A lookup that threw says nothing about the click: settle an
            // old lead on its fallback only after MAX_FAILED_LOOKUPS tries.
            const final = lookupFailed
                ? decision.final &&
                  (lead.attempts ?? 0) + 1 >= MAX_FAILED_LOOKUPS
                : decision.final
            byMatch[decision.match] = (byMatch[decision.match] ?? 0) + 1
            return toRow(
                lead,
                assessment,
                { ...decision, final },
                attempted,
                names.nameById
            )
        }

        // Gclids still inside the click report's retention, by lead day;
        // everything else is placed without a lookup and written first.
        const byDay = new Map<string, Entry[]>()
        const direct: Entry[] = []
        for (const entry of assessed) {
            const needsLookup =
                entry.assessment.clickId?.type === 'gclid' &&
                daysSince(entry.lead.leadDate, today) <
                    CLICK_VIEW_RETENTION_DAYS
            if (!needsLookup) {
                direct.push(entry)
                continue
            }
            const list = byDay.get(entry.lead.leadDate) ?? []
            list.push(entry)
            byDay.set(entry.lead.leadDate, list)
        }

        const directRows = direct.map((entry) =>
            place(entry, null, false, false)
        )
        await upsertRows(directRows)
        written += directRows.length

        // Newest days first: fresh leads matter most if the budget runs out.
        const days = [...byDay.keys()].sort().reverse()
        for (const date of days) {
            const entries = byDay.get(date)!
            if (
                Date.now() - startedAt > RUN_TIME_BUDGET_MS ||
                spent() >= RUN_OPERATION_BUDGET
            ) {
                deferred += entries.length
                continue
            }
            const gclidOf = (entry: Entry) => entry.assessment.clickId!.id
            const { found, failed } = await lookUpDay(
                date,
                entries.map(gclidOf)
            )
            if (failed.size > 0) failures += 1

            // Written as soon as the day is known, so a killed run keeps it.
            const rows = entries.map((entry) => {
                const gclid = gclidOf(entry)
                return place(
                    entry,
                    found.get(gclid) ?? null,
                    true,
                    failed.has(gclid)
                )
            })
            await upsertRows(rows)
            written += rows.length
        }

        const counts = {
            examined: candidates.length,
            paid: assessed.length,
            written,
            deferred,
            failedLookups: failures,
            ...byMatch,
        }
        const notes = [
            failures > 0
                ? `${failures} lead day(s) had a failed lookup; retried next run`
                : null,
            deferred > 0
                ? `${deferred} lead(s) deferred to the next run (budget)`
                : null,
        ].filter(Boolean)
        await finishAdsRun(runId, {
            status: 'completed',
            counts,
            apiOperations: spent(),
            ...(notes.length > 0 ? { error: notes.join('; ') } : {}),
        })

        return {
            outcome: 'resolved',
            examined: candidates.length,
            written,
            byMatch,
            deferred,
            failedLookups: failures,
            apiOperations: spent(),
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[resolve-lead-clicks] failed: ${message}`)
        await finishAdsRun(runId, {
            status: 'failed',
            apiOperations: spent(),
            error: message,
        })
        return {
            outcome: 'failed',
            ...empty,
            apiOperations: spent(),
            error: message,
        }
    }
}
