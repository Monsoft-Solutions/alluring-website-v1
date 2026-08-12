/**
 * Autopilot Run Queries
 *
 * Read side of the autopilot run history for the settings page.
 *
 * @module lib/queries/autopilot-run
 */
import { and, count, desc, eq, isNull } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { autopilotRun, blogPost } from '@workspace/db/schema/blog'
import type { AutopilotRun } from '@workspace/db/schema/blog'

/** Recent runs, newest first (both kinds interleaved). */
export async function getRecentAutopilotRuns(
    limit = 10
): Promise<AutopilotRun[]> {
    return db
        .select()
        .from(autopilotRun)
        .orderBy(desc(autopilotRun.startedAt))
        .limit(limit)
}

export type AutopilotStatusSummary = {
    draftsAwaitingReview: number
    pendingIdeas: number
    approvedIdeas: number
    lastIdeationRun: AutopilotRun | null
    lastContentRun: AutopilotRun | null
    unacknowledgedFailures: AutopilotRun[]
}

/** Everything the settings status strip needs, in one place. */
export async function getAutopilotStatusSummary(): Promise<AutopilotStatusSummary> {
    const [draftsRow] = await db
        .select({ value: count() })
        .from(blogPost)
        .where(eq(blogPost.status, 'draft'))

    const [pendingRow] = await db
        .select({ value: count() })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'ideation'),
                eq(blogPost.ideaApproval, 'pending')
            )
        )

    const [approvedRow] = await db
        .select({ value: count() })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'ideation'),
                eq(blogPost.ideaApproval, 'approved')
            )
        )

    const [lastIdeation] = await db
        .select()
        .from(autopilotRun)
        .where(eq(autopilotRun.kind, 'ideation'))
        .orderBy(desc(autopilotRun.startedAt))
        .limit(1)

    const [lastContent] = await db
        .select()
        .from(autopilotRun)
        .where(eq(autopilotRun.kind, 'content'))
        .orderBy(desc(autopilotRun.startedAt))
        .limit(1)

    const unacknowledgedFailures = await db
        .select()
        .from(autopilotRun)
        .where(
            and(
                eq(autopilotRun.status, 'failed'),
                isNull(autopilotRun.acknowledgedAt)
            )
        )
        .orderBy(desc(autopilotRun.startedAt))

    return {
        draftsAwaitingReview: draftsRow?.value ?? 0,
        pendingIdeas: pendingRow?.value ?? 0,
        approvedIdeas: approvedRow?.value ?? 0,
        lastIdeationRun: lastIdeation ?? null,
        lastContentRun: lastContent ?? null,
        unacknowledgedFailures,
    }
}
