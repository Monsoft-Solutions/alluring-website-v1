/**
 * Refresh merge utilities (epic #144, #148): the apply allowlist, the
 * go-live refusal, and the snapshot/restore round-trip that makes every
 * apply undoable.
 */
import { describe, expect, it } from 'vitest'

import type { BlogPost, BlogPostRevision } from '@workspace/db/schema/blog'

import {
    buildMergeValues,
    buildRestoreValues,
    buildRevisionValues,
    isGoLiveStatusForWorkingCopy,
    REFRESH_FORBIDDEN_FIELDS,
    REFRESH_MERGE_FIELDS,
    type RefreshMergeField,
} from '@/lib/utils/refresh-merge.util'

const workingCopy: Pick<BlogPost, RefreshMergeField> & { id: string } = {
    id: 'working-copy-id',
    title: 'Refreshed Title',
    content: '# Refreshed body',
    metaTitle: 'Refreshed Meta',
    metaDescription: 'Refreshed description',
    metaKeywords: 'a, b',
    excerpt: 'Refreshed excerpt',
    faqs: [{ question: 'Q1?', answer: 'A1.' }],
    quickAnswer: 'Refreshed quick answer',
    aiSummary: 'Refreshed summary',
    readingTime: 8,
    secondaryKeywords: ['kw1', 'kw2'],
}

describe('REFRESH_MERGE_FIELDS', () => {
    it('never includes a forbidden field', () => {
        for (const forbidden of REFRESH_FORBIDDEN_FIELDS) {
            expect(REFRESH_MERGE_FIELDS).not.toContain(forbidden)
        }
    })

    it('is exactly the reader-facing field set', () => {
        expect([...REFRESH_MERGE_FIELDS].sort()).toEqual(
            [
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
            ].sort()
        )
    })
})

describe('buildMergeValues', () => {
    it('produces exactly the allowlisted keys — nothing else can change', () => {
        const merge = buildMergeValues(workingCopy)
        expect(Object.keys(merge).sort()).toEqual(
            [...REFRESH_MERGE_FIELDS].sort()
        )
    })

    it('never carries slug, status, publishedAt, or featuredImageId, even when present on the source row', () => {
        const fullRow = {
            ...workingCopy,
            slug: 'must-not-copy',
            status: 'published',
            publishedAt: new Date(),
            featuredImageId: 'img-1',
            refreshOfPostId: 'orig-1',
        }
        const merge = buildMergeValues(fullRow) as Record<string, unknown>
        expect(merge.slug).toBeUndefined()
        expect(merge.status).toBeUndefined()
        expect(merge.publishedAt).toBeUndefined()
        expect(merge.featuredImageId).toBeUndefined()
        expect(merge.refreshOfPostId).toBeUndefined()
    })
})

describe('revision snapshot ↔ restore round-trip', () => {
    it('captures every field the merge can change', () => {
        const revision = buildRevisionValues(workingCopy, 'refresh-apply')
        for (const field of REFRESH_MERGE_FIELDS) {
            expect(revision).toHaveProperty(field)
        }
        expect(revision.blogPostId).toBe('working-copy-id')
        expect(revision.reason).toBe('refresh-apply')
    })

    it('restores exactly what was snapshotted', () => {
        const snapshot = buildRevisionValues(workingCopy, 'rollback')
        const restored = buildRestoreValues(
            snapshot as Pick<BlogPostRevision, RefreshMergeField>
        )
        for (const field of REFRESH_MERGE_FIELDS) {
            expect(restored[field]).toEqual(workingCopy[field])
        }
    })

    it('null content snapshots as empty string (revision column is NOT NULL)', () => {
        const revision = buildRevisionValues(
            { ...workingCopy, content: null },
            'refresh-apply'
        )
        expect(revision.content).toBe('')
    })
})

describe('isGoLiveStatusForWorkingCopy', () => {
    it.each(['published', 'scheduled', 'ready_to_publish'])(
        'refuses %s',
        (status) => {
            expect(isGoLiveStatusForWorkingCopy(status)).toBe(true)
        }
    )

    it.each([
        'draft',
        'generate',
        'ai_review',
        'generate_metadata',
        'generate_image',
        'ideation',
    ])('allows %s', (status) => {
        expect(isGoLiveStatusForWorkingCopy(status)).toBe(false)
    })
})
