/**
 * Tests for the shared blog URL rule (@workspace/shared).
 *
 * Pre-2026 posts live at root /{slug}; posts published on/after
 * 2026-01-01 live at /blog/{slug}. resolveBlogPathToSlug is the inverse.
 */
import { describe, expect, it } from 'vitest'

import {
    getBlogPostUrl,
    resolveBlogPathToSlug,
    usesBlogPrefix,
} from '@workspace/shared'

describe('getBlogPostUrl', () => {
    it('uses root URLs for pre-2026 posts', () => {
        expect(getBlogPostUrl('my-post', '2025-06-15')).toBe('/my-post')
        expect(getBlogPostUrl('my-post', new Date('2025-12-31'))).toBe(
            '/my-post'
        )
    })

    it('uses /blog/ URLs from 2026-01-01 on', () => {
        expect(getBlogPostUrl('my-post', '2026-01-01T00:00:00Z')).toBe(
            '/blog/my-post'
        )
        expect(getBlogPostUrl('my-post', new Date('2026-08-11'))).toBe(
            '/blog/my-post'
        )
    })

    it('falls back to root when publish date is missing', () => {
        expect(getBlogPostUrl('my-post', null)).toBe('/my-post')
    })
})

describe('usesBlogPrefix', () => {
    it('matches getBlogPostUrl behavior', () => {
        expect(usesBlogPrefix('2025-12-31')).toBe(false)
        expect(usesBlogPrefix('2026-01-01T00:00:00Z')).toBe(true)
        expect(usesBlogPrefix(null)).toBe(false)
    })
})

describe('resolveBlogPathToSlug', () => {
    it('resolves /blog/{slug} paths', () => {
        expect(resolveBlogPathToSlug('/blog/bbl-recovery-time-miami')).toBe(
            'bbl-recovery-time-miami'
        )
        expect(resolveBlogPathToSlug('/blog/bbl-recovery-time-miami/')).toBe(
            'bbl-recovery-time-miami'
        )
    })

    it('resolves root /{slug} paths (caller must verify against real slugs)', () => {
        expect(resolveBlogPathToSlug('/how-long-to-recover-from-bbl')).toBe(
            'how-long-to-recover-from-bbl'
        )
    })

    it('returns null for the blog index and taxonomy listings', () => {
        expect(resolveBlogPathToSlug('/blog')).toBeNull()
        expect(resolveBlogPathToSlug('/blog/')).toBeNull()
        expect(resolveBlogPathToSlug('/blog/categories')).toBeNull()
        expect(resolveBlogPathToSlug('/blog/categories/recovery')).toBeNull()
        expect(resolveBlogPathToSlug('/blog/tags/bbl')).toBeNull()
    })

    it('returns null for root and nested paths', () => {
        expect(resolveBlogPathToSlug('/')).toBeNull()
        expect(resolveBlogPathToSlug('/procedures/tummy-tuck-miami')).toBeNull()
        expect(resolveBlogPathToSlug('/blog/a/b')).toBeNull()
    })
})
