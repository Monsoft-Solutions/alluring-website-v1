/**
 * Decay Detection Service
 *
 * The detect-decay job (epic #144, #147): runs the four pure decay rules
 * over snapshot aggregates, post ages and the latest cannibalization report,
 * and funnels every resulting signal through `enqueueSignal`.
 *
 * The cron ticks daily; a weekly due-check keyed on the newest non-manual
 * `detectedAt` across all candidates keeps the queue from churning daily.
 * A run that detects NOTHING leaves no marker, so it re-runs the next day —
 * deliberate: an empty detection is cheap (a few SQL aggregates), and
 * re-checking daily until something is found beats missing a fresh decay by
 * a week. Manual runs bypass the due-check.
 *
 * Rules degrade independently: R1/R2 need 56 covered snapshot days, R4 needs
 * a cannibalization report, R3 only needs the posts table — whatever has
 * data runs.
 *
 * @module @/lib/services/decay-detection.service
 */
import { and, eq, isNull, sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost, contentRefresh } from '@workspace/db/schema/blog'
import type { RefreshSignal } from '@workspace/db/types'

import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import { getLatestCannibalizationReport } from '@/lib/queries/cannibalization-report.query'
import {
    getCtrBuckets,
    getPageWindowAggregates,
    getPostWindowAggregates,
    getSnapshotStatus,
} from '@/lib/queries/gsc-snapshot.query'
import {
    buildCtrBenchmark,
    computeSiteMedianPositionDelta,
    DECAY_WINDOW_DAYS,
    evaluateCtrGap,
    evaluatePositionDrop,
    evaluateStaleAge,
    signalsFromCannibalizationFinding,
} from '@/lib/utils/decay-rules.util'
import { addDays } from '@/lib/utils/gsc-snapshot.util'
import {
    enqueueSignal,
    type EnqueueOutcome,
} from '@/lib/services/content-refresh.service'

// ============================================
// Constants
// ============================================

/** Weekly cadence as an interval (same as the cannibalization report). */
const DETECTION_DUE_HOURS = 144

/** R1/R2 need both 28-day windows covered. */
const REQUIRED_SNAPSHOT_DAYS = DECAY_WINDOW_DAYS * 2

/** The CTR benchmark reads this much trailing history. */
const CTR_BENCHMARK_DAYS = 90

// ============================================
// Types
// ============================================

export type DecayDetectionResult = {
    outcome: 'detected' | 'skipped-mode-off' | 'skipped-not-due'
    /** Signals produced by the rules (before queue semantics). */
    signalsDetected?: number
    created?: number
    merged?: number
    skipped?: number
    postsEvaluated?: number
    snapshotDaysCovered?: number
    /** Which rules had the data they need this run. */
    rulesRun?: {
        positionDrop: boolean
        ctrGap: boolean
        staleAge: boolean
        cannibalization: boolean
    }
}

// ============================================
// The job
// ============================================

/**
 * Run decay detection and feed the refresh queue.
 *
 * @param trigger - `cron` respects the weekly due-check; `manual` bypasses
 *   it (queue page button and local testing)
 */
export async function runDecayDetectionJob(
    trigger: 'cron' | 'manual' = 'cron',
    now: Date = new Date()
): Promise<DecayDetectionResult> {
    const config = await getBlogAiConfig()
    if (config.refreshMode === 'off') {
        return { outcome: 'skipped-mode-off' }
    }

    if (trigger === 'cron' && !(await isDetectionDue(now))) {
        return { outcome: 'skipped-not-due' }
    }

    const publishedPosts = await db
        .select({
            id: blogPost.id,
            publishedAt: blogPost.publishedAt,
            updatedAt: blogPost.updatedAt,
        })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'published'),
                isNull(blogPost.refreshOfPostId)
            )
        )
    const publishedIds = new Set(publishedPosts.map((post) => post.id))

    const detected: Array<{ blogPostId: string; signal: RefreshSignal }> = []

    // R3 — stale age (no snapshots needed).
    for (const post of publishedPosts) {
        if (!post.publishedAt) continue
        const signal = evaluateStaleAge({
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            staleMonths: config.refreshStaleMonths,
            now,
        })
        if (signal) detected.push({ blogPostId: post.id, signal })
    }

    // R1 + R2 — snapshot-window rules.
    const snapshot = await getSnapshotStatus()
    const hasWindows =
        snapshot.latestDate !== null &&
        snapshot.coveredDays >= REQUIRED_SNAPSHOT_DAYS

    if (hasWindows) {
        const windowEnd = snapshot.latestDate!
        const windowStart = addDays(windowEnd, -(DECAY_WINDOW_DAYS - 1))
        const previousEnd = addDays(windowEnd, -DECAY_WINDOW_DAYS)
        const previousStart = addDays(windowEnd, -(DECAY_WINDOW_DAYS * 2 - 1))

        const [
            currentPosts,
            previousPosts,
            currentPages,
            previousPages,
            ctrBuckets,
        ] = await Promise.all([
            getPostWindowAggregates(windowStart, windowEnd),
            getPostWindowAggregates(previousStart, previousEnd),
            getPageWindowAggregates(windowStart, windowEnd),
            getPageWindowAggregates(previousStart, previousEnd),
            getCtrBuckets(
                addDays(windowEnd, -(CTR_BENCHMARK_DAYS - 1)),
                windowEnd
            ),
        ])

        const siteMedianPositionDelta = computeSiteMedianPositionDelta(
            currentPages,
            previousPages
        )
        const benchmark = buildCtrBenchmark(ctrBuckets)
        const previousByPost = new Map(
            previousPosts.map((row) => [row.blogPostId, row])
        )

        for (const current of currentPosts) {
            if (!publishedIds.has(current.blogPostId)) continue
            const previous = previousByPost.get(current.blogPostId)
            if (!previous) continue

            const positionDrop = evaluatePositionDrop({
                current,
                previous,
                siteMedianPositionDelta,
                threshold: config.refreshPositionDropThreshold,
                windowStart,
                windowEnd,
                now,
            })
            if (positionDrop) {
                detected.push({
                    blogPostId: current.blogPostId,
                    signal: positionDrop,
                })
            }

            const ctrGap = evaluateCtrGap({
                current,
                previous,
                benchmark,
                windowStart,
                windowEnd,
                now,
            })
            if (ctrGap) {
                detected.push({
                    blogPostId: current.blogPostId,
                    signal: ctrGap,
                })
            }
        }
    }

    // R4 — latest cannibalization report.
    const report = await getLatestCannibalizationReport()
    if (report) {
        for (const finding of report.findings) {
            for (const entry of signalsFromCannibalizationFinding(
                finding,
                now
            )) {
                if (!publishedIds.has(entry.blogPostId)) continue
                detected.push(entry)
            }
        }
    }

    // Funnel everything through the queue's merge/cooldown semantics.
    const counts: Record<EnqueueOutcome, number> = {
        created: 0,
        merged: 0,
        'skipped-active-run': 0,
        'skipped-cooldown': 0,
        'skipped-not-eligible': 0,
    }
    for (const entry of detected) {
        const result = await enqueueSignal(entry.blogPostId, entry.signal)
        counts[result.outcome]++
    }

    return {
        outcome: 'detected',
        signalsDetected: detected.length,
        created: counts.created,
        merged: counts.merged,
        skipped:
            counts['skipped-active-run'] +
            counts['skipped-cooldown'] +
            counts['skipped-not-eligible'],
        postsEvaluated: publishedPosts.length,
        snapshotDaysCovered: snapshot.coveredDays,
        rulesRun: {
            positionDrop: hasWindows,
            ctrGap: hasWindows,
            staleAge: true,
            cannibalization: report !== null,
        },
    }
}

/**
 * Weekly due-check: the newest non-manual, non-ideation-gate `detectedAt`
 * across every candidate (active or terminal). ISO-8601 strings compare
 * lexically in temporal order, so max() over the jsonb text is safe.
 */
async function isDetectionDue(now: Date): Promise<boolean> {
    const result = await db.execute<{ latest: string | null }>(sql`
        select max(s ->> 'detectedAt') as latest
        from ${contentRefresh},
             jsonb_array_elements(${contentRefresh.sources}) as s
        where s ->> 'source' in
            ('position-drop', 'ctr-gap', 'stale-age', 'cannibalization')
    `)

    const row = result[0]
    if (!row?.latest) return true

    const lastDetectedAt = new Date(row.latest)
    return (
        now.getTime() - lastDetectedAt.getTime() >=
        DETECTION_DUE_HOURS * 60 * 60 * 1000
    )
}
