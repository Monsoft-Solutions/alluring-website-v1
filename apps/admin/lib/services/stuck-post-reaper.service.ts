/**
 * Stuck-Post Reaper
 *
 * Flips posts whose `processing_status='processing'` marker belongs to a
 * dead invocation into a retryable `error` state with a clear message.
 * Invoked from the cron dispatch (safety net while nobody is watching) and
 * lazily before the Kanban board query (fast feedback while an admin is).
 *
 * `processing_started_at` is intentionally left in place: the phase-state
 * writers derive phase timings from it, and it documents when the dead run
 * began. The successful completion of a later retry clears it as usual.
 *
 * @module @admin/lib/services/stuck-post-reaper
 */
import { and, eq, isNull, lt, or } from 'drizzle-orm'
import { db } from '@workspace/db/client'
import { blogPost } from '@workspace/db/schema/blog'

import {
    STUCK_POST_ERROR_MESSAGE,
    STUCK_THRESHOLD_MINUTES,
    stuckCutoff,
} from '@/lib/utils/stuck-post.util'

export type ReapedPost = {
    id: string
    title: string
    status: string | null
}

/**
 * Mark every stuck post as errored so it becomes retryable.
 *
 * A single conditional UPDATE keyed on the processing-status index; posts
 * whose phase started within the threshold are untouched, so a reap racing
 * a live phase can only ever lose to the phase's own final write.
 */
export async function reapStuckPosts(
    now: Date = new Date()
): Promise<ReapedPost[]> {
    const cutoff = stuckCutoff(now)

    const reaped = await db
        .update(blogPost)
        .set({
            pipelineProcessingStatus: 'error',
            processingError: STUCK_POST_ERROR_MESSAGE,
        })
        .where(
            and(
                eq(blogPost.pipelineProcessingStatus, 'processing'),
                or(
                    isNull(blogPost.processingStartedAt),
                    lt(blogPost.processingStartedAt, cutoff)
                )
            )
        )
        .returning({
            id: blogPost.id,
            title: blogPost.title,
            status: blogPost.status,
        })

    if (reaped.length > 0) {
        console.warn(
            `[Stuck-Post Reaper] Marked ${reaped.length} post(s) stuck in processing for over ${STUCK_THRESHOLD_MINUTES} minutes as errored:`,
            reaped.map((post) => `${post.id} (${post.status})`).join(', ')
        )
    }

    return reaped
}
