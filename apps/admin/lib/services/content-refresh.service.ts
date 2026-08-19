/**
 * Content Refresh Service
 *
 * Queue operations for the refresh loop (epic #144, #147): every entry path
 * — decay detection, cannibalization findings, the ideation gate, autopilot
 * refresh candidates, and manual admin requests — funnels through
 * `enqueueSignal`, so cooldown and merge semantics hold no matter who is
 * asking.
 *
 * One ACTIVE row per post (the partial unique index on content_refresh):
 * new signals merge into a pending row, replace-by-source (see
 * refresh-queue.util). A post whose refresh is already running keeps its
 * row untouched — late signals are dropped and simply re-detected after the
 * cooldown.
 *
 * @module @/lib/services/content-refresh.service
 */
import { and, desc, eq, inArray } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost, contentRefresh } from '@workspace/db/schema/blog'
import type { RefreshSignal } from '@workspace/db/types'
import { resolveBlogPathToSlug } from '@workspace/shared'

import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import { computeRefreshScore } from '@/lib/utils/decay-rules.util'
import { isWithinCooldown, mergeSignal } from '@/lib/utils/refresh-queue.util'

// ============================================
// Constants & types
// ============================================

/** Statuses covered by the one-active-row-per-post unique index. */
export const ACTIVE_REFRESH_STATUSES = [
    'pending',
    'in_progress',
    'ready_for_review',
] as const

export type EnqueueOutcome =
    /** A new candidate row was created. */
    | 'created'
    /** The signal merged into the post's pending candidate. */
    | 'merged'
    /** A refresh is already running for this post; the signal was dropped. */
    | 'skipped-active-run'
    /** The post was refreshed/dismissed recently (refresh_cooldown_days). */
    | 'skipped-cooldown'
    /** The post is not a published, non-working-copy post. */
    | 'skipped-not-eligible'

export type EnqueueResult = {
    outcome: EnqueueOutcome
    candidateId?: string
}

// ============================================
// Enqueue
// ============================================

/**
 * Merge a detection signal into the queue.
 *
 * @param blogPostId - The live post the signal is about
 * @param signal - The signal with its triggering metrics
 * @param options.bypassCooldown - Manual requests override the cooldown;
 *   detected signals never do
 */
export async function enqueueSignal(
    blogPostId: string,
    signal: RefreshSignal,
    options: { bypassCooldown?: boolean } = {}
): Promise<EnqueueResult> {
    const [post] = await db
        .select({
            id: blogPost.id,
            status: blogPost.status,
            refreshOfPostId: blogPost.refreshOfPostId,
        })
        .from(blogPost)
        .where(eq(blogPost.id, blogPostId))
        .limit(1)

    if (!post || post.status !== 'published' || post.refreshOfPostId) {
        return { outcome: 'skipped-not-eligible' }
    }

    if (!options.bypassCooldown && (await isPostInCooldown(blogPostId))) {
        return { outcome: 'skipped-cooldown' }
    }

    // Two attempts: if the insert races another enqueue into the partial
    // unique index, the second attempt finds the winner's row and merges.
    for (let attempt = 0; attempt < 2; attempt++) {
        const [active] = await db
            .select({
                id: contentRefresh.id,
                status: contentRefresh.status,
                sources: contentRefresh.sources,
            })
            .from(contentRefresh)
            .where(
                and(
                    eq(contentRefresh.blogPostId, blogPostId),
                    inArray(contentRefresh.status, [...ACTIVE_REFRESH_STATUSES])
                )
            )
            .limit(1)

        if (active) {
            if (active.status !== 'pending') {
                return { outcome: 'skipped-active-run' }
            }
            const sources = mergeSignal(active.sources, signal)
            await db
                .update(contentRefresh)
                .set({ sources, score: computeRefreshScore(sources) })
                .where(eq(contentRefresh.id, active.id))
            return { outcome: 'merged', candidateId: active.id }
        }

        try {
            const [created] = await db
                .insert(contentRefresh)
                .values({
                    blogPostId,
                    sources: [signal],
                    score: computeRefreshScore([signal]),
                })
                .returning({ id: contentRefresh.id })
            return { outcome: 'created', candidateId: created?.id }
        } catch (error) {
            // 23505 on the active index: another enqueue won the race.
            if (
                error instanceof Error &&
                'code' in error &&
                (error as { code?: string }).code === '23505'
            ) {
                continue
            }
            throw error
        }
    }

    return { outcome: 'skipped-active-run' }
}

/** Whether the post's last applied/dismissed refresh is inside the cooldown. */
async function isPostInCooldown(blogPostId: string): Promise<boolean> {
    const [lastClosed] = await db
        .select({
            appliedAt: contentRefresh.appliedAt,
            updatedAt: contentRefresh.updatedAt,
        })
        .from(contentRefresh)
        .where(
            and(
                eq(contentRefresh.blogPostId, blogPostId),
                inArray(contentRefresh.status, ['applied', 'dismissed'])
            )
        )
        .orderBy(desc(contentRefresh.updatedAt))
        .limit(1)

    if (!lastClosed) return false

    const config = await getBlogAiConfig()
    return isWithinCooldown(
        lastClosed.appliedAt ?? lastClosed.updatedAt,
        config.refreshCooldownDays,
        new Date()
    )
}

// ============================================
// Manual entry points
// ============================================

/**
 * Queue a post for refresh because an admin (or any external process) asked.
 * Bypasses the cooldown — human intent overrides the rate limit.
 */
export async function queueManualRefresh(
    blogPostId: string
): Promise<EnqueueResult> {
    return enqueueSignal(
        blogPostId,
        {
            source: 'manual',
            detectedAt: new Date().toISOString(),
            metrics: { requestedBy: 'admin' },
        },
        { bypassCooldown: true }
    )
}

/**
 * Close a candidate without refreshing. Starts the cooldown clock; the post
 * re-queues only after `refresh_cooldown_days` (or a manual request).
 *
 * Only pending and ready_for_review candidates can be dismissed — an
 * in_progress run must finish or fail first. Dismissing a reviewed
 * candidate also deletes its working copy, so no orphaned hidden draft
 * lingers on the Kanban.
 */
export async function dismissRefreshCandidate(
    id: string
): Promise<{ success: boolean; error?: string }> {
    const [updated] = await db
        .update(contentRefresh)
        .set({ status: 'dismissed' })
        .where(
            and(
                eq(contentRefresh.id, id),
                inArray(contentRefresh.status, ['pending', 'ready_for_review'])
            )
        )
        .returning({
            id: contentRefresh.id,
            workingPostId: contentRefresh.workingPostId,
        })

    if (!updated) {
        return {
            success: false,
            error: 'Candidate not found, already closed, or currently running',
        }
    }

    if (updated.workingPostId) {
        await db.delete(blogPost).where(eq(blogPost.id, updated.workingPostId))
    }

    return { success: true }
}

// ============================================
// Ideation-gate seam
// ============================================

/**
 * Queue the post that owns a topic the ideation gate judged `refresh` —
 * the demand evidence behind the topic belongs to an existing post, so
 * instead of a new article, that post gets a refresh candidate.
 *
 * No-ops (returns null) when the refresh loop is off, when the gate found
 * no owning URL, or when the owner is a money page rather than a blog post.
 */
export async function enqueueIdeationGateSignal(input: {
    owningUrl?: string
    topicTitle: string
    primaryKeyword?: string | null
    reason?: string
}): Promise<EnqueueResult | null> {
    if (!input.owningUrl) return null

    const config = await getBlogAiConfig()
    if (config.refreshMode === 'off') return null

    const postId = await resolveOwningUrlToPostId(input.owningUrl)
    if (!postId) return null

    return enqueueSignal(postId, {
        source: 'ideation-gate',
        detectedAt: new Date().toISOString(),
        metrics: {
            topicTitle: input.topicTitle,
            owningUrl: input.owningUrl,
            ...(input.primaryKeyword
                ? { primaryKeyword: input.primaryKeyword }
                : {}),
            ...(input.reason ? { reason: input.reason } : {}),
        },
    })
}

// ============================================
// Owning-URL resolution (ideation-gate seam)
// ============================================

/**
 * Resolve an ideation-gate `owningUrl` (a path like `/blog/slug` or
 * `/blog/YYYY/MM/slug`, occasionally a full URL) to a blog post id.
 * Returns null for money pages and unknown slugs — only blog posts can be
 * refreshed through the pipeline.
 */
export async function resolveOwningUrlToPostId(
    owningUrl: string
): Promise<string | null> {
    let path = owningUrl
    if (/^https?:\/\//.test(owningUrl)) {
        try {
            path = new URL(owningUrl).pathname
        } catch {
            return null
        }
    }
    if (path !== '/' && path.endsWith('/')) path = path.slice(0, -1)

    const slug = resolveBlogPathToSlug(path)
    if (!slug) return null

    const [post] = await db
        .select({ id: blogPost.id })
        .from(blogPost)
        .where(eq(blogPost.slug, slug))
        .limit(1)

    return post?.id ?? null
}
