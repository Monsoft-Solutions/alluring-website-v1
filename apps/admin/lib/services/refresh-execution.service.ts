/**
 * Refresh Execution Service
 *
 * The in-place refresh flow (epic #144, #148/#Phase 5): clone the live post
 * into a hidden working copy, run it through the existing pipeline phases
 * in refresh mode, and — after the admin's diff review — merge the
 * allowlisted fields back onto the original in one transaction.
 *
 * Execution itself lives in the durable refresh workflow
 * (`@/app/workflows/refresh/refresh-content.workflow`); this service owns
 * the building blocks the workflow and the pre-flight compose: the claim,
 * the clone, the stale-run reaper, and the apply/rollback transactions.
 *
 * The working copy is a normal `blog_post` row with `refresh_of_post_id`
 * set: it rides the same Kanban, the same phase drivers, the same edit
 * dialog. The guards elsewhere (publish refusal, draft-cap exclusion,
 * dedupe exclusion) exist precisely so this row can never leak to the
 * public site; the merge below never copies `slug`, `publishedAt`,
 * `status`, or `featuredImageId`, so the live URL and publish state are
 * untouchable by construction.
 *
 * @module @/lib/services/refresh-execution.service
 */
import { revalidateTag } from 'next/cache'

import { and, eq, lt } from 'drizzle-orm'
import { getRun } from 'workflow/api'

import { db } from '@workspace/db/client'
import {
    blogPost,
    blogPostImages,
    blogPostRevision,
    contentRefresh,
} from '@workspace/db/schema/blog'
import type { RefreshBrief, RefreshSignal } from '@workspace/db/types'

import {
    buildMergeValues,
    buildRestoreValues,
    buildRevisionValues,
} from '@/lib/utils/refresh-merge.util'

import {
    CACHE_TAGS,
    revalidateWebAppCache,
} from '@/lib/utils/revalidate-web.util'

// ============================================
// Clone
// ============================================

/**
 * Clone a live post into a hidden refresh working copy: same content and
 * metadata, `status='generate'`, no slug, `refresh_of_post_id` set, and the
 * brief riding in `planningData.refresh` for the writer.
 */
export async function duplicateForRefresh(
    postId: string,
    brief: RefreshBrief
): Promise<{ id: string } | null> {
    const [original] = await db
        .select()
        .from(blogPost)
        .where(eq(blogPost.id, postId))
        .limit(1)

    if (!original || original.status !== 'published') return null
    if (original.refreshOfPostId) return null

    const [created] = await db
        .insert(blogPost)
        .values({
            title: original.title,
            content: original.content,
            primaryKeyword: original.primaryKeyword,
            secondaryKeywords: original.secondaryKeywords,
            metaTitle: original.metaTitle,
            metaDescription: original.metaDescription,
            metaKeywords: original.metaKeywords,
            excerpt: original.excerpt,
            faqs: original.faqs,
            quickAnswer: original.quickAnswer,
            aiSummary: original.aiSummary,
            readingTime: original.readingTime,
            authorId: original.authorId,
            featuredImageId: original.featuredImageId,
            priority: original.priority,
            status: 'generate',
            pipelineProcessingStatus: 'idle',
            refreshOfPostId: postId,
            planningData: {
                ...(original.planningData ?? {}),
                refresh: { originalPostId: postId, brief },
            },
        })
        .returning({ id: blogPost.id })

    return created ?? null
}

// ============================================
// Claim
// ============================================

export type ClaimedRefreshCandidate = {
    id: string
    blogPostId: string
    sources: RefreshSignal[]
}

/**
 * Claim a pending candidate for execution: `pending → in_progress` as one
 * conditional update, so of two concurrent starts exactly one wins. Called
 * by the pre-flight (`startRefreshRunJob`) before the durable workflow is
 * started — the workflow receives a candidate that is already claimed.
 *
 * @returns The claimed row, or null when the candidate is missing or not
 *   pending (already running, reviewed, or closed).
 */
export async function claimRefreshCandidate(
    candidateId: string
): Promise<ClaimedRefreshCandidate | null> {
    const [claimed] = await db
        .update(contentRefresh)
        .set({ status: 'in_progress', error: null })
        .where(
            and(
                eq(contentRefresh.id, candidateId),
                eq(contentRefresh.status, 'pending')
            )
        )
        .returning({
            id: contentRefresh.id,
            blogPostId: contentRefresh.blogPostId,
            sources: contentRefresh.sources,
        })

    return claimed ?? null
}

// ============================================
// Stale-run recovery
// ============================================

/**
 * How long an in_progress candidate may sit untouched before it is
 * presumed dead. A healthy run only takes minutes; the margin covers the
 * slowest observed reviews with room to spare.
 */
const STALE_REFRESH_RUN_HOURS = 2

/**
 * Fail in_progress candidates whose run evidently died (workflow gone,
 * server restarted). Without this the active-row unique index would block
 * the post's queue slot forever — in_progress can't be dismissed and never
 * re-detects. The working copy is kept for inspection; dismissing the
 * failed candidate later has nothing to clean because failed rows keep
 * their workingPostId reference.
 *
 * A candidate with a `workflowRunId` is cross-checked against the durable
 * workflow first: the candidate row's `updatedAt` only moves on step
 * boundaries, so a slow phase can legitimately exceed the age cutoff while
 * the workflow is alive and well. Only a dead (or unrecorded) workflow gets
 * reaped.
 *
 * Called from the daily detect-decay tick (and its manual button), the
 * same self-healing cadence the other job locks use.
 */
export async function reapStaleRefreshRuns(
    now: Date = new Date()
): Promise<number> {
    const cutoff = new Date(
        now.getTime() - STALE_REFRESH_RUN_HOURS * 60 * 60 * 1000
    )
    const stale = await db
        .select({
            id: contentRefresh.id,
            workflowRunId: contentRefresh.workflowRunId,
        })
        .from(contentRefresh)
        .where(
            and(
                eq(contentRefresh.status, 'in_progress'),
                lt(contentRefresh.updatedAt, cutoff)
            )
        )

    const reaped: string[] = []
    for (const candidate of stale) {
        if (candidate.workflowRunId) {
            try {
                const workflowRun = getRun(candidate.workflowRunId)
                const status = await workflowRun.status
                if (status === 'pending' || status === 'running') continue
            } catch (error) {
                console.warn(
                    `[Refresh] Could not read workflow ${candidate.workflowRunId} for stale check:`,
                    error
                )
            }
        }

        await db
            .update(contentRefresh)
            .set({
                status: 'failed',
                error: `Run went stale (no progress for over ${STALE_REFRESH_RUN_HOURS}h) — the workflow died or was never recorded`,
            })
            .where(
                and(
                    eq(contentRefresh.id, candidate.id),
                    eq(contentRefresh.status, 'in_progress')
                )
            )
        reaped.push(candidate.id)
    }

    if (reaped.length > 0) {
        console.warn(
            `[Refresh] Reaped ${reaped.length} stale in_progress run(s): ${reaped.join(', ')}`
        )
    }
    return reaped.length
}

// ============================================
// Apply
// ============================================

/**
 * Merge an approved refresh onto the live post — one transaction:
 * snapshot the original to `blog_post_revision`, copy the allowlisted
 * fields, move any inline-image junction rows, delete the working copy,
 * close the candidate as `applied`.
 *
 * The live post keeps its `slug`, `publishedAt`, `status`, and
 * `featuredImageId`; `updatedAt` bumps via `$onUpdate`, which is what the
 * web app renders as "Last updated".
 */
export async function applyRefresh(
    candidateId: string
): Promise<{ success: boolean; error?: string }> {
    const [candidate] = await db
        .select({
            id: contentRefresh.id,
            status: contentRefresh.status,
            blogPostId: contentRefresh.blogPostId,
            workingPostId: contentRefresh.workingPostId,
        })
        .from(contentRefresh)
        .where(eq(contentRefresh.id, candidateId))
        .limit(1)

    if (!candidate) return { success: false, error: 'Candidate not found' }
    if (candidate.status !== 'ready_for_review') {
        return { success: false, error: 'Candidate is not ready for review' }
    }
    if (!candidate.workingPostId) {
        return { success: false, error: 'Candidate has no working copy' }
    }

    const [original] = await db
        .select()
        .from(blogPost)
        .where(eq(blogPost.id, candidate.blogPostId))
        .limit(1)
    const [workingCopy] = await db
        .select()
        .from(blogPost)
        .where(eq(blogPost.id, candidate.workingPostId))
        .limit(1)

    if (!original || !workingCopy) {
        return { success: false, error: 'Original or working copy is missing' }
    }

    await db.transaction(async (tx) => {
        // 1. Undo log: the original's reader-facing fields, pre-merge.
        const [revision] = await tx
            .insert(blogPostRevision)
            .values(buildRevisionValues(original, 'refresh-apply'))
            .returning({ id: blogPostRevision.id })

        // 2. The merge — exactly REFRESH_MERGE_FIELDS, nothing else.
        await tx
            .update(blogPost)
            .set(buildMergeValues(workingCopy))
            .where(eq(blogPost.id, original.id))

        // 3. Inline images generated on the working copy follow the content.
        await tx
            .update(blogPostImages)
            .set({ blogPostId: original.id })
            .where(eq(blogPostImages.blogPostId, workingCopy.id))

        // 4. Close the candidate before the delete nulls workingPostId.
        await tx
            .update(contentRefresh)
            .set({
                status: 'applied',
                appliedAt: new Date(),
                revisionId: revision?.id ?? null,
            })
            .where(eq(contentRefresh.id, candidateId))

        // 5. The working copy has served its purpose.
        await tx.delete(blogPost).where(eq(blogPost.id, workingCopy.id))
    })

    await revalidateAfterInPlaceUpdate(original.slug)
    return { success: true }
}

// ============================================
// Rollback
// ============================================

/**
 * Restore a `blog_post_revision` onto its post. The current state is
 * snapshotted first (reason `rollback`), so a rollback is itself undoable.
 */
export async function rollbackRevision(
    revisionId: string
): Promise<{ success: boolean; error?: string }> {
    const [revision] = await db
        .select()
        .from(blogPostRevision)
        .where(eq(blogPostRevision.id, revisionId))
        .limit(1)

    if (!revision) return { success: false, error: 'Revision not found' }

    const [post] = await db
        .select()
        .from(blogPost)
        .where(eq(blogPost.id, revision.blogPostId))
        .limit(1)

    if (!post) return { success: false, error: 'Post not found' }

    await db.transaction(async (tx) => {
        await tx
            .insert(blogPostRevision)
            .values(buildRevisionValues(post, 'rollback'))

        await tx
            .update(blogPost)
            .set(buildRestoreValues(revision))
            .where(eq(blogPost.id, post.id))
    })

    await revalidateAfterInPlaceUpdate(post.slug)
    return { success: true }
}

// ============================================
// Shared revalidation
// ============================================

/**
 * After an in-place content change: refresh the post page + blog lists on
 * the web app, and expire the sitemap (its lastmod changed).
 */
async function revalidateAfterInPlaceUpdate(slug: string | null) {
    if (slug) {
        await revalidateWebAppCache([
            CACHE_TAGS.BLOG_POSTS,
            CACHE_TAGS.blogPostBySlug(slug),
        ])
    }
    revalidateTag(CACHE_TAGS.SITEMAP_URLS as string, { expire: 0 })
}
