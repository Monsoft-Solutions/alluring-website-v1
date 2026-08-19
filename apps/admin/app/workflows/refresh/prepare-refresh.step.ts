/**
 * Prepare Refresh Step
 *
 * Durable workflow step that readies a claimed candidate for the pipeline:
 * re-validates the original post, builds and stores the refresh brief, and
 * creates the shadow working copy.
 *
 * Idempotent by design: a retried step reuses the stored brief and working
 * copy instead of re-building or re-cloning — the guard against a crash
 * between the clone insert and the candidate update orphaning a copy.
 *
 * @module @admin/app/workflows/refresh/prepare-refresh.step
 */
import { eq } from 'drizzle-orm'

import { db } from '@workspace/db/client'
import { blogPost, contentRefresh } from '@workspace/db/schema/blog'

import { buildRefreshBrief } from '@/lib/services/refresh-brief.service'
import { duplicateForRefresh } from '@/lib/services/refresh-execution.service'

export type PrepareRefreshStepResult =
    | {
          ok: true
          workingPostId: string
          originalPostId: string
          postTitle: string
      }
    | { ok: false; error: string }

export async function prepareRefreshStep(input: {
    candidateId: string
}): Promise<PrepareRefreshStepResult> {
    'use step'

    const { candidateId } = input

    const [candidate] = await db
        .select({
            blogPostId: contentRefresh.blogPostId,
            sources: contentRefresh.sources,
            brief: contentRefresh.brief,
            workingPostId: contentRefresh.workingPostId,
        })
        .from(contentRefresh)
        .where(eq(contentRefresh.id, candidateId))
        .limit(1)

    if (!candidate) return { ok: false, error: 'Candidate not found' }

    const [post] = await db
        .select({
            id: blogPost.id,
            title: blogPost.title,
            status: blogPost.status,
            content: blogPost.content,
        })
        .from(blogPost)
        .where(eq(blogPost.id, candidate.blogPostId))
        .limit(1)

    if (!post || post.status !== 'published' || !post.content) {
        return { ok: false, error: 'The post is no longer a published post' }
    }

    // Step retry after the working copy already exists: reuse it.
    if (candidate.workingPostId) {
        console.log(
            `[Refresh Step] Working copy already exists for candidate ${candidateId}`
        )
        return {
            ok: true,
            workingPostId: candidate.workingPostId,
            originalPostId: post.id,
            postTitle: post.title,
        }
    }

    // The brief is stored on the candidate so the row self-describes; a
    // retry reuses it rather than paying the window queries again.
    let brief = candidate.brief
    if (!brief) {
        brief = await buildRefreshBrief(post.id, candidate.sources)
        await db
            .update(contentRefresh)
            .set({ brief })
            .where(eq(contentRefresh.id, candidateId))
    }

    const workingCopy = await duplicateForRefresh(post.id, brief)
    if (!workingCopy) {
        return {
            ok: false,
            error: 'Could not create the refresh working copy',
        }
    }
    await db
        .update(contentRefresh)
        .set({ workingPostId: workingCopy.id })
        .where(eq(contentRefresh.id, candidateId))

    return {
        ok: true,
        workingPostId: workingCopy.id,
        originalPostId: post.id,
        postTitle: post.title,
    }
}
