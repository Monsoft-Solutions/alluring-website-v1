import { describe, expect, it } from 'vitest'

import { BLOG_V2_SLUGS, isBlogV2 } from '@/lib/blog/blog-v2.constant'

const SLUG = 'how-many-massages-after-bbl'

describe('isBlogV2', () => {
    it('keeps every post on the old template by default', () => {
        expect(isBlogV2(SLUG, {})).toBe(false)
        expect(isBlogV2(SLUG, { VERCEL_ENV: 'production' })).toBe(false)
    })

    it('ships with an empty allowlist until the release PR', () => {
        expect(BLOG_V2_SLUGS.size).toBe(0)
    })

    it('shows every post in v2 on a local or preview build with BLOG_V2_PREVIEW=all', () => {
        expect(isBlogV2(SLUG, { BLOG_V2_PREVIEW: 'all' })).toBe(true)
        expect(
            isBlogV2('breast-implant-size-guide', {
                BLOG_V2_PREVIEW: 'all',
                VERCEL_ENV: 'preview',
            })
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
