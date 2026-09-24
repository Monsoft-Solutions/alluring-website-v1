/**
 * Google Ads Snapshot Service
 *
 * Copies the account's daily reports into Postgres (epic #288) so the Ads
 * console's pages are SQL joins against the website's own leads — no API
 * call per page view, no quota spent on reading, and history kept past
 * Google's 30-day (change events) and 90-day (click details) limits.
 *
 * Replace-the-window model: each run re-pulls the trailing
 * SNAPSHOT_WINDOW_DAYS (conversions keep arriving for days after the click)
 * and, in one transaction, deletes and re-inserts that window in every daily
 * table. A stored day therefore always equals what the API reported at the
 * last pull, rows Google no longer reports included. Change events are
 * upserted by resource name and never deleted — that is the history.
 *
 * The run lock is the `ads_sync_run` partial unique index (one running
 * snapshot at a time); see ads-sync-run.service.
 *
 * @module @/lib/services/ads/ads-snapshot.service
 */
import { between, sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import {
    adsCampaignDaily,
    adsChangeEvent,
    adsConversionDaily,
    adsKeywordDaily,
    adsLandingPageDaily,
    adsSearchTermDaily,
    type InsertAdsChangeEvent,
} from '@workspace/db/schema/ads'
import {
    addDays,
    CHANGE_HISTORY_MAX_DAYS,
    getCampaignDaily,
    getChangeHistory,
    getConversionDaily,
    getGoogleAdsConfig,
    getKeywordDaily,
    getLandingPageDaily,
    getOperationCount,
    getSearchTermDaily,
    isGoogleAdsConfigured,
    todayIn,
    type ChangeEventRow,
    type DailyRange,
} from '@workspace/google-ads'

import { wallTimeToDate } from '@/lib/utils/ads/ads-changes.util'
import {
    acquireAdsLock,
    finishAdsRun,
    releaseStaleAdsLock,
    type AdsSyncTrigger,
} from '@/lib/services/ads/ads-sync-run.service'

// ============================================
// Constants
// ============================================

/** Days re-pulled every run, ending today (account zone). */
export const SNAPSHOT_WINDOW_DAYS = 30

/** Rows per insert statement (well under the pg parameter limit). */
const INSERT_CHUNK_SIZE = 500

// ============================================
// Types
// ============================================

export type AdsSnapshotResult = {
    outcome: 'synced' | 'skipped-unconfigured' | 'skipped-locked' | 'failed'
    window: DailyRange | null
    counts: Record<string, number>
    apiOperations: number
    error?: string
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

// ============================================
// Helpers
// ============================================

/** The default window: the trailing SNAPSHOT_WINDOW_DAYS through today. */
export function defaultSnapshotWindow(now: Date = new Date()): DailyRange {
    const endDate = todayIn(getGoogleAdsConfig().timeZone, now)
    return {
        startDate: addDays(endDate, -(SNAPSHOT_WINDOW_DAYS - 1)),
        endDate,
    }
}

function toChangeEventRow(event: ChangeEventRow): InsertAdsChangeEvent {
    return {
        resourceName: event.resourceName,
        changedAt: wallTimeToDate(event.changedAt),
        userEmail: event.userEmail,
        clientType: event.clientType,
        resourceType: event.resourceType,
        operation: event.operation,
        changedFields: event.changedFields,
        campaignId: event.campaignId,
        campaignName: event.campaignName,
        adGroupId: event.adGroupId,
        adGroupName: event.adGroupName,
        values: event.values ?? null,
    }
}

async function insertChunks<T>(
    rows: T[],
    insert: (chunk: T[]) => Promise<unknown>
): Promise<void> {
    for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
        await insert(rows.slice(i, i + INSERT_CHUNK_SIZE))
    }
}

// ============================================
// Pull + write
// ============================================

type PulledWindow = Awaited<ReturnType<typeof pullWindow>>

/** Every daily report for the window, fetched in parallel (≈6 operations). */
async function pullWindow(range: DailyRange) {
    const [campaigns, keywords, terms, pages, expandedPages, conversions] =
        await Promise.all([
            getCampaignDaily(range),
            getKeywordDaily(range),
            getSearchTermDaily(range),
            getLandingPageDaily(range, false),
            getLandingPageDaily(range, true),
            getConversionDaily(range),
        ])
    return {
        campaigns,
        keywords,
        terms,
        pages: [...pages, ...expandedPages],
        conversions,
    }
}

/** Replace the window in every daily table, atomically. */
async function writeWindow(range: DailyRange, pulled: PulledWindow) {
    const { startDate, endDate } = range

    await db.transaction(async (tx: Tx) => {
        await tx
            .delete(adsCampaignDaily)
            .where(between(adsCampaignDaily.date, startDate, endDate))
        await insertChunks(pulled.campaigns, (chunk) =>
            tx.insert(adsCampaignDaily).values(chunk)
        )

        await tx
            .delete(adsKeywordDaily)
            .where(between(adsKeywordDaily.date, startDate, endDate))
        await insertChunks(pulled.keywords, (chunk) =>
            tx.insert(adsKeywordDaily).values(chunk)
        )

        await tx
            .delete(adsSearchTermDaily)
            .where(between(adsSearchTermDaily.date, startDate, endDate))
        await insertChunks(pulled.terms, (chunk) =>
            tx.insert(adsSearchTermDaily).values(chunk)
        )

        await tx
            .delete(adsLandingPageDaily)
            .where(between(adsLandingPageDaily.date, startDate, endDate))
        await insertChunks(pulled.pages, (chunk) =>
            tx.insert(adsLandingPageDaily).values(chunk)
        )

        await tx
            .delete(adsConversionDaily)
            .where(between(adsConversionDaily.date, startDate, endDate))
        await insertChunks(pulled.conversions, (chunk) =>
            tx.insert(adsConversionDaily).values(chunk)
        )
    })
}

/** Upsert change events by resource name; returns how many were written. */
async function writeChangeEvents(events: ChangeEventRow[]): Promise<number> {
    const rows = events
        .filter((event) => event.resourceName)
        .map(toChangeEventRow)

    await insertChunks(rows, (chunk) =>
        db
            .insert(adsChangeEvent)
            .values(chunk)
            .onConflictDoUpdate({
                target: adsChangeEvent.resourceName,
                set: {
                    campaignName: sql`excluded.campaign_name`,
                    adGroupName: sql`excluded.ad_group_name`,
                    values: sql`excluded.values`,
                },
            })
    )
    return rows.length
}

// ============================================
// The job
// ============================================

/**
 * Run one snapshot: pull the window's daily reports and the change log, and
 * store them.
 *
 * @param trigger - What started the run
 * @param options.startDate / endDate - An explicit window (the backfill);
 *   defaults to the trailing SNAPSHOT_WINDOW_DAYS
 * @param options.includeChanges - Pull the change log too (default: when the
 *   window reaches into the API's last 30 days)
 */
export async function runAdsSnapshotJob(
    trigger: AdsSyncTrigger = 'cron',
    options: {
        startDate?: string
        endDate?: string
        includeChanges?: boolean
        now?: Date
    } = {}
): Promise<AdsSnapshotResult> {
    if (!isGoogleAdsConfigured()) {
        return {
            outcome: 'skipped-unconfigured',
            window: null,
            counts: {},
            apiOperations: 0,
        }
    }

    const now = options.now ?? new Date()
    const fallback = defaultSnapshotWindow(now)
    const window: DailyRange = {
        startDate: options.startDate ?? fallback.startDate,
        endDate: options.endDate ?? fallback.endDate,
    }
    const today = todayIn(getGoogleAdsConfig().timeZone, now)
    const includeChanges =
        options.includeChanges ??
        window.endDate >= addDays(today, -(CHANGE_HISTORY_MAX_DAYS - 1))

    await releaseStaleAdsLock('snapshot')
    const runId = await acquireAdsLock('snapshot', trigger, window)
    if (!runId) {
        return {
            outcome: 'skipped-locked',
            window,
            counts: {},
            apiOperations: 0,
        }
    }

    const operationsBefore = getOperationCount()
    const spent = () => getOperationCount() - operationsBefore

    try {
        const pulled = await pullWindow(window)
        await writeWindow(window, pulled)

        const changeEvents = includeChanges
            ? await writeChangeEvents(
                  (
                      await getChangeHistory({
                          days: CHANGE_HISTORY_MAX_DAYS,
                          includeValues: true,
                          limit: 10_000,
                      })
                  ).events
              )
            : 0

        const counts = {
            campaigns: pulled.campaigns.length,
            keywords: pulled.keywords.length,
            searchTerms: pulled.terms.length,
            landingPages: pulled.pages.length,
            conversions: pulled.conversions.length,
            changeEvents,
        }
        await finishAdsRun(runId, {
            status: 'completed',
            counts,
            apiOperations: spent(),
        })
        return {
            outcome: 'synced',
            window,
            counts,
            apiOperations: spent(),
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(
            `[ads-snapshot] failed for ${window.startDate}…${window.endDate}: ${message}`
        )
        await finishAdsRun(runId, {
            status: 'failed',
            apiOperations: spent(),
            error: message,
        })
        return {
            outcome: 'failed',
            window,
            counts: {},
            apiOperations: spent(),
            error: message,
        }
    }
}
