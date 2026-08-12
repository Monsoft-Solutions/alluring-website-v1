/**
 * Refresh Brief Service
 *
 * Builds the data-driven brief a refresh run hands to the writer (epic
 * #144, #148): why the post was queued, which queries decayed, which rising
 * queries the content doesn't cover, and the invariant instructions. Built
 * at execution start from snapshots + the candidate's signals; stored on
 * `content_refresh.brief` and injected into the working copy's
 * `planningData.refresh`.
 *
 * Degrades gracefully: with fewer than 56 covered snapshot days the query
 * lists are empty and the brief still carries reasons + staleness — the
 * writer then leans on research alone.
 *
 * @module @/lib/services/refresh-brief.service
 */
import { eq } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'
import type { RefreshBrief, RefreshSignal } from '@workspace/db/types'

import {
    getPostQueryWindows,
    getSnapshotStatus,
} from '@/lib/queries/gsc-snapshot.query'
import { DECAY_WINDOW_DAYS, monthsBetween } from '@/lib/utils/decay-rules.util'
import { addDays } from '@/lib/utils/gsc-snapshot.util'
import {
    buildCoverageCorpus,
    buildRefreshInstructions,
    deriveDecayedQueries,
    deriveRisingQueriesNotCovered,
    deriveTopQueries,
    describeSignalsAsReasons,
} from '@/lib/utils/refresh-brief.util'

/** R1/R2 window math needs both 28-day windows covered. */
const REQUIRED_SNAPSHOT_DAYS = DECAY_WINDOW_DAYS * 2

/**
 * Build the refresh brief for one candidate.
 *
 * @param blogPostId - The LIVE post being refreshed (not the working copy)
 * @param signals - The candidate's accumulated detection signals
 */
export async function buildRefreshBrief(
    blogPostId: string,
    signals: RefreshSignal[],
    now: Date = new Date()
): Promise<RefreshBrief> {
    const [post] = await db
        .select({
            title: blogPost.title,
            content: blogPost.content,
            faqs: blogPost.faqs,
            publishedAt: blogPost.publishedAt,
            updatedAt: blogPost.updatedAt,
        })
        .from(blogPost)
        .where(eq(blogPost.id, blogPostId))
        .limit(1)

    if (!post) {
        throw new Error(`Post ${blogPostId} not found for refresh brief`)
    }

    // Query windows: same 28v28 layout the decay rules detect on.
    const snapshot = await getSnapshotStatus()
    const windows =
        snapshot.latestDate !== null &&
        snapshot.coveredDays >= REQUIRED_SNAPSHOT_DAYS
            ? await getPostQueryWindows(blogPostId, {
                  currentStart: addDays(
                      snapshot.latestDate,
                      -(DECAY_WINDOW_DAYS - 1)
                  ),
                  currentEnd: snapshot.latestDate,
                  previousStart: addDays(
                      snapshot.latestDate,
                      -(DECAY_WINDOW_DAYS * 2 - 1)
                  ),
                  previousEnd: addDays(snapshot.latestDate, -DECAY_WINDOW_DAYS),
              })
            : []

    const corpus = buildCoverageCorpus({
        title: post.title,
        content: post.content ?? '',
        faqs: post.faqs,
    })

    const decayedQueries = deriveDecayedQueries(windows)
    const risingQueriesNotCovered = deriveRisingQueriesNotCovered(
        windows,
        corpus
    )

    // The cannibalization signal, when present, names the query being split
    // and the page that should own it.
    const cannibalizationSignal = signals.find(
        (signal) => signal.source === 'cannibalization'
    )
    const cannibalizationContext = cannibalizationSignal
        ? `This post splits the query "${cannibalizationSignal.metrics.query}" with ${cannibalizationSignal.metrics.ownerUrl} (the stronger page). Sharpen this post's distinct angle so the two pages stop competing.`
        : undefined

    const lastTouch = maxDate(post.publishedAt, post.updatedAt)

    return {
        reasons: describeSignalsAsReasons(signals),
        topQueries: deriveTopQueries(windows),
        risingQueriesNotCovered,
        decayedQueries,
        ...(cannibalizationContext ? { cannibalizationContext } : {}),
        staleness: {
            publishedAt: post.publishedAt?.toISOString() ?? null,
            lastUpdatedAt: post.updatedAt?.toISOString() ?? null,
            ageMonths: lastTouch
                ? Math.round(monthsBetween(lastTouch, now) * 10) / 10
                : 0,
        },
        instructions: buildRefreshInstructions({
            risingQueriesNotCovered,
            decayedQueries,
        }),
    }
}

function maxDate(a: Date | null, b: Date | null): Date | null {
    if (!a) return b
    if (!b) return a
    return a.getTime() >= b.getTime() ? a : b
}
