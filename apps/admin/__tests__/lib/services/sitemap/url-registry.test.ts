/**
 * Tests for URL classification in the sitemap URL registry.
 *
 * Covers the publish-date-aware blog paths: pre-2026 posts live at root
 * /{slug}, 2026+ posts at /blog/{slug}, and both must classify as 'blog'.
 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('@workspace/db/client', () => ({ db: {} }))
vi.mock('next/cache', () => ({
    unstable_cache: (fn: unknown) => fn,
}))

import {
    classifyPath,
    type UrlRegistry,
} from '@/lib/services/sitemap/url-registry.service'

const registry: UrlRegistry = {
    blogPosts: new Set([
        '/how-long-to-recover-from-bbl', // legacy pre-2026 root post
        '/blog/bbl-recovery-time-miami', // 2026+ prefixed post
    ]),
    blogListing: new Set(['/blog', '/blog/categories', '/blog/tags']),
    procedures: new Set([
        '/procedures',
        '/procedures/brazilian-butt-lift-bbl-miami',
    ]),
    pages: new Set(['/', '/about', '/dr-karlinsky']),
    gallery: new Set(['/gallery']),
    promotions: new Set(['/miami-plastic-surgery-specials']),
}

describe('classifyPath', () => {
    it('classifies legacy root-level posts as blog', () => {
        expect(classifyPath(registry, '/how-long-to-recover-from-bbl')).toBe(
            'blog'
        )
    })

    it('classifies 2026+ /blog/{slug} posts as blog (the #132 bug)', () => {
        expect(classifyPath(registry, '/blog/bbl-recovery-time-miami')).toBe(
            'blog'
        )
    })

    it('classifies unknown single-segment /blog/ paths as blog, not listing', () => {
        // e.g. a post published after the cached registry was built
        expect(classifyPath(registry, '/blog/brand-new-post')).toBe('blog')
    })

    it('classifies blog index and taxonomy paths as blog-listing', () => {
        expect(classifyPath(registry, '/blog')).toBe('blog-listing')
        expect(classifyPath(registry, '/blog/categories')).toBe('blog-listing')
        expect(classifyPath(registry, '/blog/categories/recovery')).toBe(
            'blog-listing'
        )
        expect(classifyPath(registry, '/blog/tags/bbl')).toBe('blog-listing')
        expect(classifyPath(registry, '/blog/authors/editorial-team')).toBe(
            'blog-listing'
        )
    })

    it('classifies procedures, pages, gallery and promotions by exact match', () => {
        expect(
            classifyPath(registry, '/procedures/brazilian-butt-lift-bbl-miami')
        ).toBe('procedure')
        expect(classifyPath(registry, '/about')).toBe('pages')
        expect(classifyPath(registry, '/dr-karlinsky')).toBe('pages')
        expect(classifyPath(registry, '/gallery')).toBe('gallery')
        expect(classifyPath(registry, '/miami-plastic-surgery-specials')).toBe(
            'promotion'
        )
    })

    it('classifies unknown nested paths by prefix', () => {
        expect(classifyPath(registry, '/procedures/new-procedure')).toBe(
            'procedure'
        )
        expect(classifyPath(registry, '/gallery/bbl-results')).toBe('gallery')
    })

    it('classifies unmatched paths as other', () => {
        expect(classifyPath(registry, '/some-random-page')).toBe('other')
        expect(classifyPath(registry, '/thank-you')).toBe('other')
    })
})
