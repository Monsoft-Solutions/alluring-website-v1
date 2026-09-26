import { describe, expect, it } from 'vitest'

import {
    assignLpFormVariant,
    DEFAULT_LP_FORM_SPLIT,
    drawLpFormVariant,
    parseLpFormSplit,
    toLpFormVariant,
} from '@/components/landing-pages/request-consultation/lp-form-variant'

describe('parseLpFormSplit', () => {
    it.each([
        [undefined, { thread: 50, card: 50 }],
        ['', { thread: 50, card: 50 }],
        ['thread:70,card:30', { thread: 70, card: 30 }],
        [' card : 100 ', { thread: 0, card: 100 }],
        ['thread:100', { thread: 100, card: 0 }],
    ])('%s', (raw, expected) => {
        expect(parseLpFormSplit(raw)).toEqual(expected)
    })

    it.each(['thread:abc', 'chat:50', 'thread:-1', 'thread:0,card:0', '50'])(
        'falls back to 50/50 on %s',
        (raw) => {
            expect(parseLpFormSplit(raw)).toEqual(DEFAULT_LP_FORM_SPLIT)
        }
    )
})

describe('drawLpFormVariant', () => {
    it('splits by weight', () => {
        const split = { thread: 50, card: 50 }
        expect(drawLpFormVariant(split, 0)).toBe('thread')
        expect(drawLpFormVariant(split, 0.49)).toBe('thread')
        expect(drawLpFormVariant(split, 0.5)).toBe('card')
        expect(drawLpFormVariant(split, 0.999)).toBe('card')
    })

    it('never draws a closed arm', () => {
        expect(drawLpFormVariant({ thread: 100, card: 0 }, 0.999)).toBe(
            'thread'
        )
        expect(drawLpFormVariant({ thread: 0, card: 100 }, 0)).toBe('card')
    })
})

describe('assignLpFormVariant', () => {
    const split = DEFAULT_LP_FORM_SPLIT

    it('lets ?fv= override the cookie and the draw (QA)', () => {
        expect(
            assignLpFormVariant({
                query: 'card',
                cookie: 'thread',
                split,
                random: 0,
            })
        ).toEqual({ variant: 'card', source: 'query' })
    })

    it('keeps a returning visitor in their arm', () => {
        expect(
            assignLpFormVariant({
                query: null,
                cookie: 'card',
                split,
                random: 0,
            })
        ).toEqual({ variant: 'card', source: 'cookie' })
    })

    it('draws again when the cookie names a closed arm (rollback)', () => {
        expect(
            assignLpFormVariant({
                query: null,
                cookie: 'card',
                split: { thread: 100, card: 0 },
                random: 0.9,
            })
        ).toEqual({ variant: 'thread', source: 'draw' })
    })

    it('ignores junk in the query and cookie', () => {
        expect(
            assignLpFormVariant({
                query: 'x',
                cookie: 'y',
                split,
                random: 0.7,
            })
        ).toEqual({ variant: 'card', source: 'draw' })
    })

    it('narrows values case-insensitively', () => {
        expect(toLpFormVariant('CARD')).toBe('card')
        expect(toLpFormVariant(' thread ')).toBe('thread')
        expect(toLpFormVariant('chat')).toBeNull()
    })
})
