/**
 * MCP content edits (issue #343): exact, unique, all-or-nothing.
 */
import { describe, expect, it } from 'vitest'

import { applyContentEdits } from '@/lib/mcp/content-edit.util'

const body =
    '## How long is recovery?\n\nMost patients return to desk work in 2 weeks.\n\nWalk daily.'

describe('applyContentEdits', () => {
    it('applies edits in order, each against the result of the last', () => {
        const result = applyContentEdits(body, [
            { oldText: '2 weeks', newText: '10 to 14 days' },
            {
                oldText: '10 to 14 days.',
                newText: '10 to 14 days, sometimes sooner.',
            },
        ])
        expect(result).toEqual({
            ok: true,
            content:
                '## How long is recovery?\n\nMost patients return to desk work in 10 to 14 days, sometimes sooner.\n\nWalk daily.',
        })
    })

    it('deletes with an empty newText', () => {
        const result = applyContentEdits(body, [
            { oldText: '\n\nWalk daily.', newText: '' },
        ])
        expect(result.ok && result.content.endsWith('2 weeks.')).toBe(true)
    })

    it('refuses text that is not there, naming the edit', () => {
        const result = applyContentEdits(body, [
            { oldText: 'Walk daily.', newText: 'Walk every day.' },
            { oldText: '3 weeks', newText: '4 weeks' },
        ])
        expect(result.ok).toBe(false)
        expect(!result.ok && result.error).toMatch(/^Edit 2: oldText not found/)
    })

    it('refuses ambiguous text', () => {
        const result = applyContentEdits('a b a', [
            { oldText: 'a', newText: 'c' },
        ])
        expect(!result.ok && result.error).toMatch(/occurs 2 times/)
    })

    it('refuses empty and no-op edits', () => {
        expect(
            applyContentEdits(body, [{ oldText: '', newText: 'x' }]).ok
        ).toBe(false)
        expect(
            applyContentEdits(body, [{ oldText: 'Walk', newText: 'Walk' }]).ok
        ).toBe(false)
    })

    it('keeps $ patterns in the replacement literal', () => {
        const result = applyContentEdits('Price: X', [
            { oldText: 'X', newText: '$5,500 ($&)' },
        ])
        expect(result).toEqual({ ok: true, content: 'Price: $5,500 ($&)' })
    })
})
