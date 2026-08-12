/**
 * Content Refresh Queries
 *
 * Read side of the refresh queue (epic #144, #147): the queue page, the SEO
 * dashboard stat card, and (Phase 5) the auto-mode picker all read from
 * here.
 *
 * @module @/lib/queries/content-refresh.query
 */
import { and, desc, eq, inArray, isNull, notExists, sql } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost, contentRefresh } from '@workspace/db/schema/blog'
import type { ContentRefresh } from '@workspace/db/schema/blog'
import type { RefreshSignal } from '@workspace/db/types'

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
