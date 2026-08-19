/**
 * Refresh Merge Utilities
 *
 * The pure heart of the apply/rollback step (epic #144, #148): which fields
 * a refresh may copy onto a live post, and the revision snapshot/restore
 * mapping that makes every apply undoable. Kept DB-free so tests can pin
 * the invariants — the forbidden fields are forbidden by construction, and
 * everything the merge can change, a rollback can restore.
 *
 * @module @/lib/utils/refresh-merge.util
 */
import type {
    BlogPost,
    BlogPostRevision,
    InsertBlogPostRevision,
} from '@workspace/db/schema/blog'

// ============================================
// The allowlist
// ============================================

/**
 * The exact fields the apply step copies from the working copy onto the
 * original — and the ONLY fields.
 */
export const REFRESH_MERGE_FIELDS = [
    'title',
    'content',
    'metaTitle',
    'metaDescription',
    'metaKeywords',
    'excerpt',
    'faqs',
    'quickAnswer',
    'aiSummary',
    'readingTime',
    'secondaryKeywords',
] as const satisfies readonly (keyof BlogPost)[]

export type RefreshMergeField = (typeof REFRESH_MERGE_FIELDS)[number]

/**
 * Fields the merge must NEVER touch: the live URL, publish state, and
 * imagery stay exactly as they are (the epic's core invariant).
 */
export const REFRESH_FORBIDDEN_FIELDS = [
    'id',
    'slug',
    'status',
    'publishedAt',
    'featuredImageId',
    'refreshOfPostId',
    'createdAt',
    'pipelineState',
    'planningData',
    'authorId',
] as const satisfies readonly (keyof BlogPost)[]

/** Statuses a refresh working copy may never be moved into. */
const GO_LIVE_STATUSES = new Set(['published', 'scheduled', 'ready_to_publish'])

/**
 * Whether moving a refresh working copy to `targetStatus` must be refused.
 * Working copies reach the live site only by being merged onto their
 * original from the review screen.
 */
export function isGoLiveStatusForWorkingCopy(targetStatus: string): boolean {
    return GO_LIVE_STATUSES.has(targetStatus)
}

// ============================================
// Merge / snapshot / restore mappings
// ============================================

type ComparableFields = Pick<BlogPost, RefreshMergeField>

/** The update payload for the live post — exactly the allowlisted fields. */
export function buildMergeValues(workingCopy: ComparableFields) {
    return Object.fromEntries(
        REFRESH_MERGE_FIELDS.map((field) => [field, workingCopy[field]])
    ) as ComparableFields
}

/**
 * Snapshot a post's mergeable fields into revision-row values. Everything
 * `buildMergeValues` can change is captured here — the round-trip test
 * holds the two functions to that.
 */
export function buildRevisionValues(
    post: ComparableFields & { id: string },
    reason: 'refresh-apply' | 'rollback'
): InsertBlogPostRevision {
    return {
        blogPostId: post.id,
        reason,
        title: post.title,
        content: post.content ?? '',
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        metaKeywords: post.metaKeywords,
        excerpt: post.excerpt,
        faqs: post.faqs,
        quickAnswer: post.quickAnswer,
        aiSummary: post.aiSummary,
        readingTime: post.readingTime,
        secondaryKeywords: post.secondaryKeywords,
    }
}

/** The update payload that restores a revision onto its post. */
export function buildRestoreValues(
    revision: Pick<BlogPostRevision, RefreshMergeField>
): ComparableFields {
    return buildMergeValues(revision)
}
