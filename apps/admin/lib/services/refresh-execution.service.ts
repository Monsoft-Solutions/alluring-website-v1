/**
 * Refresh Execution Service
 *
 * The in-place refresh flow (epic #144, #148): clone the live post into a
 * hidden working copy, run it through the existing pipeline phases in
 * refresh mode, and — after the admin's diff review — merge the allowlisted
 * fields back onto the original in one transaction.
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

import { and, eq } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import {
    blogPost,
    blogPostImages,
    blogPostRevision,
    contentRefresh,
} from '@workspace/db/schema/blog'
import type { RefreshBrief } from '@workspace/db/types'
import { summarizeRefreshChanges } from '@workspace/ai/functions'

import {
    buildMergeValues,
    buildRestoreValues,
    buildRevisionValues,
} from '@/lib/utils/refresh-merge.util'

import { getBlogAiConfig } from '@/lib/queries/blog-ai-config.query'
import { buildRefreshBrief } from '@/lib/services/refresh-brief.service'
import { notifyRefreshReadyForReview } from '@/lib/services/seo-digest-notification.service'
import {
    runExtractPhaseForPost,
    runGenerationPhaseForPost,
    runReviewPhaseForPost,
} from '@/lib/services/pipeline-phase.service'
import {
    CACHE_TAGS,
    revalidateWebAppCache,
} from '@/lib/utils/revalidate-web.util'

// ============================================
// Types
// ============================================

export type RefreshRunResult = {
    success: boolean
    error?: string
    workingPostId?: string
}

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
// Execution driver
// ============================================

/**
 * Run the full refresh for a pending candidate: claim it, build the brief,
 * clone, drive generate → review → extract in refresh mode, and leave the
 * working copy in `draft` with the candidate `ready_for_review`.
 *
 * The image phase is skipped on purpose — the clone carries the original's
 * `featuredImageId`, and the merge never touches images.
 *
 * Any phase failure marks the candidate `failed` (with the error) and keeps
 * the working copy for inspection; `failed` is terminal, so the post can be
 * re-queued later.
 */
export async function runRefreshForCandidate(
    candidateId: string
): Promise<RefreshRunResult> {
    // Claiming pending → in_progress is the lock: of two concurrent runs,
    // one update wins.
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

    if (!claimed) {
        return {
            success: false,
            error: 'Candidate not found or not pending',
        }
    }

    try {
        const [post] = await db
            .select({
                id: blogPost.id,
                title: blogPost.title,
                content: blogPost.content,
                status: blogPost.status,
            })
            .from(blogPost)
            .where(eq(blogPost.id, claimed.blogPostId))
            .limit(1)

        if (!post || post.status !== 'published' || !post.content) {
            throw new Error('The post is no longer a published post')
        }

        // 1. Brief, stored on the candidate so the row self-describes.
        const brief = await buildRefreshBrief(post.id, claimed.sources)
        await db
            .update(contentRefresh)
            .set({ brief })
            .where(eq(contentRefresh.id, candidateId))

        // 2. Working copy.
        const workingCopy = await duplicateForRefresh(post.id, brief)
        if (!workingCopy) {
            throw new Error('Could not create the refresh working copy')
        }
        await db
            .update(contentRefresh)
            .set({ workingPostId: workingCopy.id })
            .where(eq(contentRefresh.id, candidateId))

        // 3. The pipeline, phase by phase (chain:false — we own sequencing).
        const generation = await runGenerationPhaseForPost(workingCopy.id, {
            chain: false,
        })
        if (!generation.success) {
            throw new Error(generation.error ?? 'Generation phase failed')
        }

        const review = await runReviewPhaseForPost(workingCopy.id, {
            chain: false,
        })
        if (!review.success) {
            throw new Error(review.error ?? 'Review phase failed')
        }

        const extraction = await runExtractPhaseForPost(workingCopy.id, {
            chain: false,
        })
        if (!extraction.success) {
            throw new Error(extraction.error ?? 'Extraction phase failed')
        }

        // 4. Skip the image phase; park the copy in draft for the Kanban.
        await db
            .update(blogPost)
            .set({ status: 'draft' })
            .where(eq(blogPost.id, workingCopy.id))

        // 5. Change summary (best effort — the diff screen works without it).
        let changeSummary: string | null = null
        try {
            const [refreshed] = await db
                .select({ content: blogPost.content })
                .from(blogPost)
                .where(eq(blogPost.id, workingCopy.id))
                .limit(1)
            if (refreshed?.content) {
                const aiConfig = await getBlogAiConfig()
                const summary = await summarizeRefreshChanges({
                    title: post.title,
                    oldContent: post.content,
                    newContent: refreshed.content,
                    modelId: aiConfig.extractionModelId,
                })
                changeSummary = summary.changes
                    .map((change) => `- ${change}`)
                    .join('\n')
            }
        } catch (error) {
            console.warn('[Refresh] Change summary failed:', error)
        }

        await db
            .update(contentRefresh)
            .set({ status: 'ready_for_review', changeSummary })
            .where(eq(contentRefresh.id, candidateId))

        try {
            await notifyRefreshReadyForReview({
                candidateId,
                postTitle: post.title,
                changeSummary,
            })
        } catch (error) {
            console.warn('[Refresh] Notification failed:', error)
        }

        return { success: true, workingPostId: workingCopy.id }
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Refresh run failed'
        console.error(
            `[Refresh] Run failed for candidate ${candidateId}:`,
            error
        )
        await db
            .update(contentRefresh)
            .set({ status: 'failed', error: message })
            .where(eq(contentRefresh.id, candidateId))
        return { success: false, error: message }
    }
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
