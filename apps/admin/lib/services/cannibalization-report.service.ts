/**
 * Cannibalization Report Service
 *
 * The weekly cannibalization job (issue #146): reads two 7-day windows of
 * snapshot aggregates, runs the pure detector, persists the report row, and
 * sends the weekly SEO digest.
 *
 * Windows anchor to the newest snapshot date rather than the calendar: the
 * analyzed week is the last 7 stored days, the comparison week the 7 before
 * that. The cron ticks daily with an interval due-check (144h), the same
 * self-healing pattern as autopilot — Vercel does not retry crons, so a
 * weekly schedule would silently skip a failed week.
 *
 * @module @/lib/services/cannibalization-report.service
 */
import { desc } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { cannibalizationReport } from '@workspace/db/schema/gsc'

import {
    getQueryPageAggregatesForWindow,
    getSnapshotStatus,
} from '@/lib/queries/gsc-snapshot.query'
import { detectCannibalization } from '@/lib/utils/cannibalization-detection.util'
import { addDays } from '@/lib/utils/gsc-snapshot.util'
import { notifySeoWeeklyDigest } from '@/lib/services/seo-digest-notification.service'

// ============================================
// Constants
// ============================================

/** Weekly cadence as an interval (matches autopilot's CADENCE_HOURS.weekly). */
const REPORT_DUE_HOURS = 144

/** Both windows must be covered: 14 days of snapshots. */
const REQUIRED_COVERED_DAYS = 14

// ============================================
// Types
// ============================================

export type CannibalizationReportResult = {
    outcome: 'reported' | 'skipped-not-due' | 'skipped-insufficient-data'
    findingsCount?: number
    weekStart?: string
    digestSent?: boolean
}

// ============================================
// The job
// ============================================

/**
 * Run the weekly cannibalization report.
 *
 * @param trigger - `cron` respects the weekly due-check; `manual` bypasses
 *   it (the dashboard's refresh action and local testing)
 */
export async function runCannibalizationReportJob(
    trigger: 'cron' | 'manual' = 'cron',
    now: Date = new Date()
): Promise<CannibalizationReportResult> {
    if (trigger === 'cron') {
        const [lastReport] = await db
            .select({ createdAt: cannibalizationReport.createdAt })
            .from(cannibalizationReport)
            .orderBy(desc(cannibalizationReport.createdAt))
            .limit(1)

        if (
            lastReport &&
            now.getTime() - lastReport.createdAt.getTime() <
                REPORT_DUE_HOURS * 60 * 60 * 1000
        ) {
            return { outcome: 'skipped-not-due' }
        }
    }

    const snapshot = await getSnapshotStatus()
    if (!snapshot.latestDate || snapshot.coveredDays < REQUIRED_COVERED_DAYS) {
        console.log(
            `[cannibalization-report] Need ${REQUIRED_COVERED_DAYS} covered days, have ${snapshot.coveredDays} — run the backfill or wait for the daily sync`
        )
        return { outcome: 'skipped-insufficient-data' }
    }

    const weekEnd = snapshot.latestDate
    const weekStart = addDays(weekEnd, -6)
    const previousEnd = addDays(weekEnd, -7)
    const previousStart = addDays(weekEnd, -13)

    const [currentWeek, previousWeek] = await Promise.all([
        getQueryPageAggregatesForWindow(weekStart, weekEnd),
        getQueryPageAggregatesForWindow(previousStart, previousEnd),
    ])

    const findings = detectCannibalization(currentWeek, previousWeek)

    await db
        .insert(cannibalizationReport)
        .values({
            weekStart,
            findings,
            findingsCount: findings.length,
        })
        .onConflictDoUpdate({
            target: [cannibalizationReport.weekStart],
            set: {
                findings,
                findingsCount: findings.length,
                createdAt: new Date(),
            },
        })

    const digestSent = await notifySeoWeeklyDigest({
        weekStart,
        weekEnd,
        findings,
        snapshot,
    })

    return {
        outcome: 'reported',
        findingsCount: findings.length,
        weekStart,
        digestSent,
    }
}
