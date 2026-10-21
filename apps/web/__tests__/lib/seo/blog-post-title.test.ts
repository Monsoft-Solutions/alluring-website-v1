import { describe, expect, it } from 'vitest'

import { getBlogPostSeoTitle } from '@/lib/seo/blog-post-title.util'

describe('getBlogPostSeoTitle', () => {
    const title = 'What Is a Double BBL?'

    it('uses the meta title when one is set', () => {
        expect(
            getBlogPostSeoTitle({
                title,
                metaTitle:
                    'What Is a Double BBL? Second Brazilian Butt Lift Explained',
            })
        ).toBe('What Is a Double BBL? Second Brazilian Butt Lift Explained')
    })

    it('trims the meta title', () => {
        expect(getBlogPostSeoTitle({ title, metaTitle: '  Meta  ' })).toBe(
            'Meta'
        )
    })

    it.each([null, undefined, '', '   '])(
        'falls back to the title when the meta title is %j',
        (metaTitle) => {
            expect(getBlogPostSeoTitle({ title, metaTitle })).toBe(title)
        }
    )
})
