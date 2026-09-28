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
        [undefined, { thread: 0, card: 33, form: 67 }],
        ['', { thread: 0, card: 33, form: 67 }],
        ['form:67,card:33', { thread: 0, card: 33, form: 67 }],
        ['thread:70,card:30', { thread: 70, card: 30, form: 0 }],
        [' card : 100 ', { thread: 0, card: 100, form: 0 }],
        ['form:1,card:1,thread:1', { thread: 1, card: 1, form: 1 }],
    ])('%s', (raw, expected) => {
        expect(parseLpFormSplit(raw)).toEqual(expected)
    })

    it.each(['form:abc', 'chat:50', 'form:-1', 'form:0,card:0,thread:0', '50'])(
        'falls back to the default on %s',
        (raw) => {
            expect(parseLpFormSplit(raw)).toEqual(DEFAULT_LP_FORM_SPLIT)
        }
    )
})

describe('DEFAULT_LP_FORM_SPLIT', () => {
    it('sends two thirds to the one-screen form and closes the thread (#307)', () => {
        expect(DEFAULT_LP_FORM_SPLIT).toEqual({ thread: 0, card: 33, form: 67 })
    })
})

describe('drawLpFormVariant', () => {
    it('splits by weight across the open arms', () => {
        const split = DEFAULT_LP_FORM_SPLIT
        expect(drawLpFormVariant(split, 0)).toBe('card')
        expect(drawLpFormVariant(split, 0.329)).toBe('card')
        expect(drawLpFormVariant(split, 0.33)).toBe('form')
        expect(drawLpFormVariant(split, 0.999)).toBe('form')
    })

    it('handles three open arms', () => {
        const split = { thread: 1, card: 1, form: 1 }
        expect(drawLpFormVariant(split, 0.1)).toBe('thread')
        expect(drawLpFormVariant(split, 0.5)).toBe('card')
        expect(drawLpFormVariant(split, 0.9)).toBe('form')
    })

    it('never draws a closed arm', () => {
        for (const random of [0, 0.25, 0.5, 0.75, 0.999]) {
            expect(drawLpFormVariant(DEFAULT_LP_FORM_SPLIT, random)).not.toBe(
                'thread'
            )
        }
        expect(
            drawLpFormVariant({ thread: 0, card: 100, form: 0 }, 0.999)
        ).toBe('card')
    })

    it('matches the weights over an even spread of draws', () => {
        const counts = { thread: 0, card: 0, form: 0 }
        for (let index = 0; index < 1000; index++) {
            counts[drawLpFormVariant(DEFAULT_LP_FORM_SPLIT, index / 1000)]++
        }
        expect(counts).toEqual({ thread: 0, card: 330, form: 670 })
    })
})

describe('assignLpFormVariant', () => {
    const split = DEFAULT_LP_FORM_SPLIT

    it('lets ?fv= override the cookie and the draw (QA)', () => {
        expect(
            assignLpFormVariant({
                query: 'form',
                cookie: 'card',
                split,
                random: 0,
            })
        ).toEqual({ variant: 'form', source: 'query' })
    })

    it('still reaches the closed thread through ?fv= (QA)', () => {
        expect(
            assignLpFormVariant({
                query: 'thread',
                cookie: null,
                split,
                random: 0,
            })
        ).toEqual({ variant: 'thread', source: 'query' })
    })

    it('keeps a returning visitor in an open arm', () => {
        expect(
            assignLpFormVariant({
                query: null,
                cookie: 'card',
                split,
                random: 0.9,
            })
        ).toEqual({ variant: 'card', source: 'cookie' })
    })

    it('redraws a v6 thread visitor now the thread is closed', () => {
        expect(
            assignLpFormVariant({
                query: null,
                cookie: 'thread',
                split,
                random: 0.9,
            })
        ).toEqual({ variant: 'form', source: 'draw' })
    })

    it('ignores junk in the query and cookie', () => {
        expect(
            assignLpFormVariant({
                query: 'x',
                cookie: 'y',
                split,
                random: 0.7,
            })
        ).toEqual({ variant: 'form', source: 'draw' })
    })

    it('narrows values case-insensitively', () => {
        expect(toLpFormVariant('FORM')).toBe('form')
        expect(toLpFormVariant('CARD')).toBe('card')
        expect(toLpFormVariant(' thread ')).toBe('thread')
        expect(toLpFormVariant('chat')).toBeNull()
    })
})
