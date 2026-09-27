import { describe, expect, it } from 'vitest'

import { BLOG_V2_SLUGS, isBlogV2 } from '@/lib/blog/blog-v2.constant'

/** A published post outside the release list. */
const SLUG = 'how-long-to-recover-from-bbl'

describe('isBlogV2', () => {
    it('keeps posts outside the list on the old template by default', () => {
        expect(isBlogV2(SLUG, {})).toBe(false)
        expect(isBlogV2(SLUG, { VERCEL_ENV: 'production' })).toBe(false)
    })

    it('releases the top 15 posts (epic #293, phase 3)', () => {
        expect(BLOG_V2_SLUGS.size).toBe(15)
        expect(BLOG_V2_SLUGS.has(SLUG)).toBe(false)
    })

    it('renders a listed post in v2 in every environment, production included', () => {
        for (const environment of [
            {},
            { VERCEL_ENV: 'production' },
            { BLOG_V2_PREVIEW: 'all', VERCEL_ENV: 'production' },
        ]) {
            expect(isBlogV2('why-do-bbl-stink', environment)).toBe(true)
        }
    })

    it('shows every post in v2 on a local or preview build with BLOG_V2_PREVIEW=all', () => {
        expect(isBlogV2(SLUG, { BLOG_V2_PREVIEW: 'all' })).toBe(true)
        expect(
            isBlogV2(SLUG, { BLOG_V2_PREVIEW: 'all', VERCEL_ENV: 'preview' })
        ).toBe(true)
    })

    it('ignores the preview flag on a production build', () => {
        expect(
            isBlogV2(SLUG, { BLOG_V2_PREVIEW: 'all', VERCEL_ENV: 'production' })
        ).toBe(false)
    })

    it('ignores any preview value other than "all"', () => {
        expect(isBlogV2(SLUG, { BLOG_V2_PREVIEW: 'true' })).toBe(false)
    })
})
