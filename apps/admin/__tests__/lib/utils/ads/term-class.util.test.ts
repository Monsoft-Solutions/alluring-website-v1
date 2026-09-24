/**
 * Tests for search term classes (epic #288). Examples are the terms the
 * 11–23 Sep 2026 report surfaced.
 */
import { describe, expect, it } from 'vitest'

import {
    createTermClassifier,
    DEFAULT_TERM_CLASSES,
    normalizePattern,
    toExactMatchNegatives,
} from '@/lib/utils/ads/term-class.util'

const classify = createTermClassifier(DEFAULT_TERM_CLASSES)

describe('createTermClassifier', () => {
    it('brand beats a procedure pattern in the same term', () => {
        expect(classify('alluring plastic surgery')).toBe('brand')
        expect(classify('dr karlinsky miami')).toBe('brand')
    })

    it('competitor beats a procedure pattern too', () => {
        expect(classify('svelta plastic surgery')).toBe('competitor')
        expect(classify('cg cosmetics phone number')).toBe('competitor')
    })

    it('classes someone else’s street address', () => {
        expect(classify('4950 sw 8th st miami fl 33134')).toBe('address')
        expect(classify('coral way miami fl 33155')).toBe('address')
        // A pattern still wins over the shape: this is a procedure search.
        expect(classify('plastic surgery 33155')).toBe('procedure')
    })

    it('treats "dr <name>" nobody claimed as a competitor', () => {
        expect(classify('dr smith miami')).toBe('competitor')
        expect(classify('doctor kaufman')).toBe('competitor')
        expect(classify('jeffrey craig uecker md pa hollywood')).toBe(
            'competitor'
        )
        expect(classify('julio gallo md')).toBe('competitor')
    })

    it('classes procedures and falls back to other', () => {
        expect(classify('affordable tummy tuck near me')).toBe('procedure')
        expect(classify('BBL Miami')).toBe('procedure')
        expect(classify('tratamiento para eliminar grasa abdominal')).toBe(
            'procedure'
        )
        expect(classify('miami life cosmetic center plantation')).toBe(
            'competitor'
        )
        expect(classify('atelier aesthetics miami')).toBe('other')
    })

    it('a longer pattern of the same class wins', () => {
        const custom = createTermClassifier([
            { pattern: 'tummy tuck', termClass: 'procedure' },
            { pattern: 'tummy tuck turkey', termClass: 'other' },
            { pattern: 'vanity', termClass: 'competitor' },
        ])
        expect(custom('vanity tummy tuck')).toBe('competitor')
        expect(custom('Tummy  Tuck')).toBe('procedure')
    })
})

describe('toExactMatchNegatives', () => {
    it('brackets, lowercases and de-duplicates', () => {
        expect(
            toExactMatchNegatives([
                'Dr Altman Miami',
                'dr altman miami',
                ' svelta ',
            ])
        ).toBe('[dr altman miami]\n[svelta]')
    })
})

describe('normalizePattern', () => {
    it('trims, lowercases and collapses spaces', () => {
        expect(normalizePattern('  CG   Cosmetic ')).toBe('cg cosmetic')
    })
})
