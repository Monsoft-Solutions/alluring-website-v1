/**
 * Refresh Outcome Service
 *
 * The measurement leg of the refresh loop (epic #144 Phase 5): 28 days
 * after a refresh is applied, compare the post's clicks / impressions /
 * weighted position against the 28 days before the apply — drift-adjusted
 * by the site-median position movement over the same windows, so a core
 * update doesn't read as a refresh outcome.
 *
 * Eligibility requires the entire after-window to be covered by final
 * snapshot data (snapshots stop at `today − 3`), so measurement actually
 * lands ~31 days after the apply. The apply day itself belongs to neither
 * window — it is split-state.
 *
 * Idempotent by construction: a measured candidate carries `measured_at`
 * and never re-qualifies, so the daily cron can tick bare (no run lock).
 *
 * @module @/lib/services/refresh-outcome.service
 */
import { and, eq, isNull, lte } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost, contentRefresh } from '@workspace/db/schema/blog'

import {
    getPageWindowAggregates,
    getPostWindowAggregates,
    getSnapshotStatus,
} from '@/lib/queries/gsc-snapshot.query'
import { computeSiteMedianPositionDelta } from '@/lib/utils/decay-rules.util'
import { addDays, toDateString } from '@/lib/utils/gsc-snapshot.util'
import {
    computeRefreshOutcome,
    OUTCOME_WINDOW_DAYS,
    type OutcomeWindowMetrics,
} from '@/lib/utils/refresh-outcome.util'

const NO_TRAFFIC: OutcomeWindowMetrics = {
    clicks: 0,
    impressions: 0,
    position: null,
}

export type RefreshOutcomesJobResult = {
    outcome: 'measured' | 'nothing-due' | 'no-snapshots'
    measured: number
    verdicts?: { improved: number; flat: number; declined: number }
}

/**
 * Measure every applied-but-unmeasured candidate whose after-window is
 * fully covered by snapshots, and write the verdict onto the row.
 */
export async function runRefreshOutcomesJob(): Promise<RefreshOutcomesJobResult> {
    const snapshot = await getSnapshotStatus()
    if (!snapshot.latestDate) {
        return { outcome: 'no-snapshots', measured: 0 }
    }

    // Due once appliedDate + 28 ≤ latest snapshot date, i.e. the apply
    // happened on or before latestDate − 28.
    const latestEligibleApplyDate = addDays(
        snapshot.latestDate,
        -OUTCOME_WINDOW_DAYS
    )
    const dueCutoff = new Date(`${latestEligibleApplyDate}T23:59:59.999Z`)

    const due = await db
        .select({
            id: contentRefresh.id,
            blogPostId: contentRefresh.blogPostId,
            appliedAt: contentRefresh.appliedAt,
            postTitle: blogPost.title,
        })
        .from(contentRefresh)
        .innerJoin(blogPost, eq(contentRefresh.blogPostId, blogPost.id))
        .where(
            and(
                eq(contentRefresh.status, 'applied'),
                isNull(contentRefresh.measuredAt),
                lte(contentRefresh.appliedAt, dueCutoff)
            )
        )

    if (due.length === 0) {
        return { outcome: 'nothing-due', measured: 0 }
    }

    const verdicts = { improved: 0, flat: 0, declined: 0 }

    for (const candidate of due) {
        if (!candidate.appliedAt) continue

        const appliedDate = toDateString(candidate.appliedAt)
        const beforeStart = addDays(appliedDate, -OUTCOME_WINDOW_DAYS)
        const beforeEnd = addDays(appliedDate, -1)
        const afterStart = addDays(appliedDate, 1)
        const afterEnd = addDays(appliedDate, OUTCOME_WINDOW_DAYS)

        const [beforePosts, afterPosts, beforePages, afterPages] =
            await Promise.all([
                getPostWindowAggregates(beforeStart, beforeEnd),
                getPostWindowAggregates(afterStart, afterEnd),
                getPageWindowAggregates(beforeStart, beforeEnd),
                getPageWindowAggregates(afterStart, afterEnd),
            ])

        const before =
            beforePosts.find(
                (row) => row.blogPostId === candidate.blogPostId
            ) ?? NO_TRAFFIC
        const after =
            afterPosts.find((row) => row.blogPostId === candidate.blogPostId) ??
            NO_TRAFFIC
        const siteMedianPositionDelta = computeSiteMedianPositionDelta(
            afterPages,
            beforePages
        )

        const outcome = computeRefreshOutcome(
            before,
            after,
            siteMedianPositionDelta
        )

        await db
            .update(contentRefresh)
            .set({ outcome, measuredAt: new Date() })
            .where(eq(contentRefresh.id, candidate.id))

        verdicts[outcome.verdict] += 1
        console.log(
            `[refresh-outcomes] "${candidate.postTitle}" verdict=${outcome.verdict} ` +
                `clicks ${outcome.before.clicks}→${outcome.after.clicks} ` +
                `pos ${outcome.before.avgPosition}→${outcome.after.avgPosition} ` +
                `(site drift ${outcome.siteMedianPositionDelta})`
        )
    }

    return { outcome: 'measured', measured: due.length, verdicts }
}
