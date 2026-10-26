/**
 * Titles that name a price (#354): a discount, which text mode prints as
 * "$4,400 (20% off $5,500)", never pushes a title past what Google renders.
 */
import { describe, expect, it } from 'vitest'

import { getBlogPostSeoTitle } from '@/lib/seo/blog-post-title.util'
import { fitResolvedTitle } from '@/lib/seo/fit-title.util'
import { TITLE_LIMIT } from '@/lib/seo/generate-title.util'

const DISCOUNTED_TUMMY =
    'Tummy Tuck Miami 2026 | Mini From $2,400 (20% off $3,000), Full From $3,600 (20% off $4,500)'

describe('fitResolvedTitle', () => {
    it('leaves a title that fits alone', () => {
        const title = 'BBL Miami | Brazilian Butt Lift Starting at $5,500'
        expect(fitResolvedTitle(title, 'fallback')).toBe(title)
    })

    it('drops the discount suffixes from a title they push over', () => {
        const fitted = fitResolvedTitle(DISCOUNTED_TUMMY, 'fallback')
        expect(fitted).toBe(
            'Tummy Tuck Miami 2026 | Mini From $2,400, Full From $3,600'
        )
        expect(fitted.length).toBeLessThanOrEqual(TITLE_LIMIT)
    })

    it('falls back when even the compact title does not fit', () => {
        const long = `${'Very long procedure name '.repeat(3)}From $4,400 (20% off $5,500)`
        expect(fitResolvedTitle(long, 'Generated title')).toBe(
            'Generated title'
        )
    })

    it("leaves an author's long title alone when no discount made it long", () => {
        const long = 'x'.repeat(TITLE_LIMIT + 5)
        expect(fitResolvedTitle(long, 'fallback')).toBe(long)
    })
})

describe('getBlogPostSeoTitle with a discount', () => {
    it('compacts a discounted meta title', () => {
        expect(
            getBlogPostSeoTitle({
                title: 'How much is a tummy tuck?',
                metaTitle: DISCOUNTED_TUMMY,
            })
        ).toBe('Tummy Tuck Miami 2026 | Mini From $2,400, Full From $3,600')
    })
})
