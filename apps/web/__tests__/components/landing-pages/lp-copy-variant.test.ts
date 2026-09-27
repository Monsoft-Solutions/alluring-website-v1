import { describe, expect, it } from 'vitest'

import {
    assignLpCopyVariant,
    DEFAULT_LP_COPY_SPLIT,
    drawLpCopyVariant,
    parseLpCopySplit,
    toLpCopyVariant,
} from '@/components/landing-pages/request-consultation/lp-form-variant'
import {
    LP_PAGE_VARIANT,
    LP_PAGE_VERSION,
    lpPageVariant,
    lpPageVersion,
} from '@/components/landing-pages/request-consultation/lp-tracking'

describe('parseLpCopySplit', () => {
    it.each([
        [undefined, { plain: 50, reassure: 50 }],
        ['', { plain: 50, reassure: 50 }],
        ['plain:50,reassure:50', { plain: 50, reassure: 50 }],
        ['plain:100', { plain: 100, reassure: 0 }],
        [' reassure : 100 ', { plain: 0, reassure: 100 }],
        ['plain:30,reassure:70', { plain: 30, reassure: 70 }],
    ])('%s', (raw, expected) => {
        expect(parseLpCopySplit(raw)).toEqual(expected)
    })

    it.each([
        'plain:abc',
        'thread:50',
        'reassure:-1',
        'plain:0,reassure:0',
        '50',
        'plain:50;reassure:50',
    ])('falls back to 50/50 on %s', (raw) => {
        expect(parseLpCopySplit(raw)).toEqual(DEFAULT_LP_COPY_SPLIT)
    })
})

describe('drawLpCopyVariant', () => {
    it('splits by weight', () => {
        const split = { plain: 50, reassure: 50 }
        expect(drawLpCopyVariant(split, 0)).toBe('plain')
        expect(drawLpCopyVariant(split, 0.49)).toBe('plain')
        expect(drawLpCopyVariant(split, 0.5)).toBe('reassure')
        expect(drawLpCopyVariant(split, 0.999)).toBe('reassure')
    })

    it('never draws a closed arm', () => {
        expect(drawLpCopyVariant({ plain: 100, reassure: 0 }, 0.999)).toBe(
            'plain'
        )
        expect(drawLpCopyVariant({ plain: 0, reassure: 100 }, 0)).toBe(
            'reassure'
        )
    })
})

describe('assignLpCopyVariant', () => {
    const split = DEFAULT_LP_COPY_SPLIT

    it('lets ?cv= override the cookie and the draw (QA)', () => {
        expect(
            assignLpCopyVariant({
                query: 'reassure',
                cookie: 'plain',
                split,
                random: 0,
            })
        ).toEqual({ variant: 'reassure', source: 'query' })
    })

    it('honours ?cv= even for a closed arm', () => {
        expect(
            assignLpCopyVariant({
                query: 'reassure',
                cookie: null,
                split: { plain: 100, reassure: 0 },
                random: 0.9,
            })
        ).toEqual({ variant: 'reassure', source: 'query' })
    })

    it('keeps a returning visitor in their arm', () => {
        expect(
            assignLpCopyVariant({
                query: null,
                cookie: 'reassure',
                split,
                random: 0,
            })
        ).toEqual({ variant: 'reassure', source: 'cookie' })
    })

    it('draws again when the cookie names a closed arm (rollback)', () => {
        expect(
            assignLpCopyVariant({
                query: null,
                cookie: 'reassure',
                split: { plain: 100, reassure: 0 },
                random: 0.9,
            })
        ).toEqual({ variant: 'plain', source: 'draw' })
    })

    it('ignores junk and the other test’s values', () => {
        expect(
            assignLpCopyVariant({
                query: 'card',
                cookie: 'thread',
                split,
                random: 0.7,
            })
        ).toEqual({ variant: 'reassure', source: 'draw' })
    })

    it('narrows values case-insensitively', () => {
        expect(toLpCopyVariant('REASSURE')).toBe('reassure')
        expect(toLpCopyVariant(' plain ')).toBe('plain')
        expect(toLpCopyVariant('card')).toBeNull()
    })
})

describe('the page variant carries the copy arm', () => {
    it('keeps the base constants at v6', () => {
        expect(LP_PAGE_VERSION).toBe('v6')
        expect(LP_PAGE_VARIANT).toBe('ads-consultation-v6')
    })

    it('reports plain as v6 and reassure as v6r', () => {
        expect(lpPageVersion('plain')).toBe('v6')
        expect(lpPageVariant('plain')).toBe('ads-consultation-v6')
        expect(lpPageVersion('reassure')).toBe('v6r')
        expect(lpPageVariant('reassure')).toBe('ads-consultation-v6r')
    })
})
