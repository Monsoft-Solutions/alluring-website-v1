/**
 * Tests for Quick Answer serialization.
 *
 * The column is hand-editable in the admin, so parsing has to survive whatever
 * a person types into a textarea — a missing question, extra blank lines,
 * trailing whitespace — without ever handing the renderer a half-formed value.
 */
import { describe, expect, it } from 'vitest'

import {
    parseQuickAnswer,
    serializeQuickAnswer,
} from '@workspace/shared/content'

describe('serializeQuickAnswer', () => {
    it('joins question and answer with a blank line', () => {
        const stored = serializeQuickAnswer({
            question: 'How long do drains stay in?',
            answer: 'Most come out in 7 to 14 days.',
        })

        expect(stored).toBe(
            'How long do drains stay in?\n\nMost come out in 7 to 14 days.'
        )
    })

    it('omits the separator when there is no question', () => {
        expect(
            serializeQuickAnswer({
                question: null,
                answer: 'Seven to 14 days.',
            })
        ).toBe('Seven to 14 days.')
    })

    it('trims both halves', () => {
        expect(
            serializeQuickAnswer({
                question: '  How long?  ',
                answer: '  Two weeks.  ',
            })
        ).toBe('How long?\n\nTwo weeks.')
    })
})

describe('parseQuickAnswer', () => {
    it('splits a stored value back into its halves', () => {
        const parts = parseQuickAnswer('How long?\n\nMost come out in 7 days.')

        expect(parts).toEqual({
            question: 'How long?',
            answer: 'Most come out in 7 days.',
        })
    })

    it('treats a single block as answer-only', () => {
        expect(parseQuickAnswer('Most come out in 7 days.')).toEqual({
            question: null,
            answer: 'Most come out in 7 days.',
        })
    })

    it('keeps paragraph breaks inside a multi-paragraph answer', () => {
        const parts = parseQuickAnswer(
            'How long?\n\nSeven days.\n\nSometimes 14.'
        )

        expect(parts?.answer).toBe('Seven days.\n\nSometimes 14.')
    })

    it('tolerates extra blank lines and whitespace', () => {
        const parts = parseQuickAnswer('  How long?  \n   \n  Seven days.  ')

        expect(parts).toEqual({ question: 'How long?', answer: 'Seven days.' })
    })

    it('returns null for anything empty', () => {
        expect(parseQuickAnswer(null)).toBeNull()
        expect(parseQuickAnswer(undefined)).toBeNull()
        expect(parseQuickAnswer('')).toBeNull()
        expect(parseQuickAnswer('   \n\n   ')).toBeNull()
    })

    it('round-trips', () => {
        const original = {
            question: 'How much does a BBL cost in Miami?',
            answer: 'A BBL runs $4,500 to $8,500 in Miami.',
        }

        expect(parseQuickAnswer(serializeQuickAnswer(original))).toEqual(
            original
        )
    })
})
