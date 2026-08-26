/**
 * Content Refresh Queries
 *
 * Read side of the refresh queue (epic #144, #147): the queue page, the SEO
 * dashboard stat card, and (Phase 5) the auto-mode picker all read from
 * here.
 *
 * @module @/lib/queries/content-refresh.query
 */
import {
    and,
    desc,
    eq,
    gte,
    inArray,
    isNotNull,
    isNull,
    notExists,
    sql,
} from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost, contentRefresh } from '@workspace/db/schema/blog'
import type { BlogPost, ContentRefresh } from '@workspace/db/schema/blog'
import type { RefreshOutcome, RefreshSignal } from '@workspace/db/types'

import {
    getBlogAiConfig,
    type RefreshMode,
} from '@/lib/queries/blog-ai-config.query'
import { ACTIVE_REFRESH_STATUSES } from '@/lib/services/content-refresh.service'

// ============================================
// Types
// ============================================

/** One queue row joined with its post, serialized for the UI boundary. */
export type RefreshQueueEntry = {
    id: string
    blogPostId: string
    postTitle: string
    postSlug: string | null
    status: ContentRefresh['status']
    sources: RefreshSignal[]
    score: number
    error: string | null
    createdAt: string
    updatedAt: string
}

// ============================================
// Queries
// ============================================

/** Active candidates (pending / in_progress / ready_for_review), best first. */
export async function getRefreshQueue(): Promise<RefreshQueueEntry[]> {
    const rows = await db
        .select({
            id: contentRefresh.id,
            blogPostId: contentRefresh.blogPostId,
            postTitle: blogPost.title,
            postSlug: blogPost.slug,
            status: contentRefresh.status,
            sources: contentRefresh.sources,
            score: contentRefresh.score,
            error: contentRefresh.error,
            createdAt: contentRefresh.createdAt,
            updatedAt: contentRefresh.updatedAt,
        })
        .from(contentRefresh)
        .innerJoin(blogPost, eq(contentRefresh.blogPostId, blogPost.id))
        .where(inArray(contentRefresh.status, [...ACTIVE_REFRESH_STATUSES]))
        .orderBy(desc(contentRefresh.score), contentRefresh.createdAt)

    return rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    }))
}

/** Count of active candidates, for the dashboard stat card and draft cap. */
export async function getRefreshQueueDepth(): Promise<number> {
    const [row] = await db
        .select({ value: sql<number>`count(*)::int` })
        .from(contentRefresh)
        .where(inArray(contentRefresh.status, [...ACTIVE_REFRESH_STATUSES]))
    return row?.value ?? 0
}

/**
 * Refresh work in flight or awaiting the human: `in_progress` +
 * `ready_for_review`. This — not the pending queue — is what the
 * `refresh_draft_cap` bounds: the queue is supposed to hold pending rows,
 * but every in-flight run inevitably becomes a draft awaiting review.
 */
export async function countActiveRefreshRuns(): Promise<number> {
    const [row] = await db
        .select({ value: sql<number>`count(*)::int` })
        .from(contentRefresh)
        .where(
            inArray(contentRefresh.status, ['in_progress', 'ready_for_review'])
        )
    return row?.value ?? 0
}

/** Compact queue summary for the SEO dashboard card. */
export type RefreshQueueSummary = {
    depth: number
    refreshMode: RefreshMode
    top: Array<
        Pick<RefreshQueueEntry, 'id' | 'postTitle' | 'score' | 'sources'>
    >
}

/** Queue depth + top candidates + mode, one payload for the stat card. */
export async function getRefreshQueueSummary(): Promise<RefreshQueueSummary> {
    const [queue, config] = await Promise.all([
        getRefreshQueue(),
        getBlogAiConfig(),
    ])
    return {
        depth: queue.length,
        refreshMode: config.refreshMode,
        top: queue.slice(0, 3).map((entry) => ({
            id: entry.id,
            postTitle: entry.postTitle,
            score: entry.score,
            sources: entry.sources,
        })),
    }
}

// ============================================
// Review screen (#148)
// ============================================

/** The reader-facing fields the diff screen compares side by side. */
export type RefreshComparablePost = {
    id: string
    title: string
    slug: string | null
    content: string | null
    metaTitle: string | null
    metaDescription: string | null
    excerpt: string | null
    quickAnswer: string | null
    faqs: BlogPost['faqs']
    readingTime: number | null
    updatedAt: Date | null
    pipelineState: BlogPost['pipelineState']
}

export type RefreshCandidateDetail = {
    id: string
    status: ContentRefresh['status']
    sources: RefreshSignal[]
    score: number
    brief: ContentRefresh['brief']
    changeSummary: string | null
    error: string | null
    revisionId: string | null
    appliedAt: Date | null
    createdAt: Date
    original: RefreshComparablePost
    /** Null until the run has created it (or after apply/dismiss). */
    workingCopy: RefreshComparablePost | null
}

const COMPARABLE_POST_FIELDS = {
    id: blogPost.id,
    title: blogPost.title,
    slug: blogPost.slug,
    content: blogPost.content,
    metaTitle: blogPost.metaTitle,
    metaDescription: blogPost.metaDescription,
    excerpt: blogPost.excerpt,
    quickAnswer: blogPost.quickAnswer,
    faqs: blogPost.faqs,
    readingTime: blogPost.readingTime,
    updatedAt: blogPost.updatedAt,
    pipelineState: blogPost.pipelineState,
} as const

/** Everything the diff review screen needs, or null when the id is unknown. */
export async function getRefreshCandidateDetail(
    id: string
): Promise<RefreshCandidateDetail | null> {
    const [candidate] = await db
        .select({
            id: contentRefresh.id,
            status: contentRefresh.status,
            sources: contentRefresh.sources,
            score: contentRefresh.score,
            brief: contentRefresh.brief,
            changeSummary: contentRefresh.changeSummary,
            error: contentRefresh.error,
            blogPostId: contentRefresh.blogPostId,
            workingPostId: contentRefresh.workingPostId,
            revisionId: contentRefresh.revisionId,
            appliedAt: contentRefresh.appliedAt,
            createdAt: contentRefresh.createdAt,
        })
        .from(contentRefresh)
        .where(eq(contentRefresh.id, id))
        .limit(1)

    if (!candidate) return null

    const [original] = await db
        .select(COMPARABLE_POST_FIELDS)
        .from(blogPost)
        .where(eq(blogPost.id, candidate.blogPostId))
        .limit(1)
    if (!original) return null

    let workingCopy: RefreshComparablePost | null = null
    if (candidate.workingPostId) {
        const [copy] = await db
            .select(COMPARABLE_POST_FIELDS)
            .from(blogPost)
            .where(eq(blogPost.id, candidate.workingPostId))
            .limit(1)
        workingCopy = copy ?? null
    }

    return {
        id: candidate.id,
        status: candidate.status,
        sources: candidate.sources,
        score: candidate.score,
        brief: candidate.brief,
        changeSummary: candidate.changeSummary,
        error: candidate.error,
        revisionId: candidate.revisionId,
        appliedAt: candidate.appliedAt,
        createdAt: candidate.createdAt,
        original,
        workingCopy,
    }
}

/**
 * Published posts an admin can queue manually: live originals (not working
 * copies) without an active candidate, alphabetical.
 */
export async function getPostsAvailableForRefresh(): Promise<
    Array<{ id: string; title: string }>
> {
    return db
        .select({ id: blogPost.id, title: blogPost.title })
        .from(blogPost)
        .where(
            and(
                eq(blogPost.status, 'published'),
                isNull(blogPost.refreshOfPostId),
                notExists(
                    db
                        .select({ one: sql`1` })
                        .from(contentRefresh)
                        .where(
                            and(
                                eq(contentRefresh.blogPostId, blogPost.id),
                                inArray(contentRefresh.status, [
                                    ...ACTIVE_REFRESH_STATUSES,
                                ])
                            )
                        )
                )
            )
        )
        .orderBy(blogPost.title)
}

// ============================================
// Weekly digest (Phase 5)
// ============================================

/** A queue entry as the weekly digest reports it. */
export type DigestQueueEntry = {
    postTitle: string
    status: ContentRefresh['status']
    sources: RefreshSignal[]
    score: number
}

/**
 * Candidates created since `since`, regardless of where they are now — the
 * digest reports queue movement, and a candidate that was detected and
 * already applied within the week is movement twice over.
 */
export async function getQueueEntriesSince(
    since: Date
): Promise<DigestQueueEntry[]> {
    return db
        .select({
            postTitle: blogPost.title,
            status: contentRefresh.status,
            sources: contentRefresh.sources,
            score: contentRefresh.score,
        })
        .from(contentRefresh)
        .innerJoin(blogPost, eq(contentRefresh.blogPostId, blogPost.id))
        .where(gte(contentRefresh.createdAt, since))
        .orderBy(desc(contentRefresh.score))
}

/** A measured 28-day outcome as the weekly digest reports it. */
export type DigestRefreshOutcome = {
    /** The candidate id — the digest links declined verdicts to its
     * detail page, where the rollback button lives. */
    candidateId: string
    postTitle: string
    outcome: RefreshOutcome
}

/** Outcomes measured since `since` (verdict + before/after numbers). */
export async function getOutcomesMeasuredSince(
    since: Date
): Promise<DigestRefreshOutcome[]> {
    const rows = await db
        .select({
            candidateId: contentRefresh.id,
            postTitle: blogPost.title,
            outcome: contentRefresh.outcome,
        })
        .from(contentRefresh)
        .innerJoin(blogPost, eq(contentRefresh.blogPostId, blogPost.id))
        .where(
            and(
                gte(contentRefresh.measuredAt, since),
                isNotNull(contentRefresh.outcome)
            )
        )
        .orderBy(desc(contentRefresh.measuredAt))

    return rows.filter(
        (row): row is DigestRefreshOutcome => row.outcome !== null
    )
}
