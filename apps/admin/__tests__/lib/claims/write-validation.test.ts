/**
 * Claim tokens where blog text is written (issue #354): the generated-MDX
 * validator keeps valid tokens and neutralises the rest, and the field check
 * the MCP and the blog editor share rejects a token that would render as
 * nothing, in every reader-facing field.
 */
import { describe, expect, it } from 'vitest'

import { validateGeneratedMdx } from '@workspace/ai/functions/validate-generated-mdx.function'
import {
    buildPricingSnapshot,
    FALLBACK_PRICING,
} from '@workspace/shared/claims/prices'

import { findClaimTokenErrors } from '@/lib/utils/claim-token-fields.util'

/** The sheet plus one line added in the admin, unknown to the fallback. */
const WITH_ADMIN_LINE = buildPricingSnapshot({
    source: 'db',
    lines: [
        ...FALLBACK_PRICING.lines,
        {
            procedure: 'facelift',
            key: 'neck-lift',
            label: 'neck lift',
            usd: 9000,
            unit: 'each',
            addOn: false,
            sort: 999,
            active: true,
        },
    ],
    procedures: Object.values(FALLBACK_PRICING.procedures),
    settings: null,
})

describe('validateGeneratedMdx and claim tokens', () => {
    it('keeps valid tokens untouched, inside prose, lists and tables', () => {
        const content = [
            '## How much is a BBL in Miami?',
            '',
            'A BBL at Alluring starts at [[price:bbl]], and [[price-range:bbl]]. [[price-caveat:long]]',
            '',
            '| Type | Starting price |',
            '| --- | --- |',
            '| Mini tummy tuck | [[price:tummy-tuck:mini]] |',
            '| Full tummy tuck | [[price:tummy-tuck-miami:full]] |',
            '',
            '- [[financing]]',
            '- [[surgeon:name]]: [[surgeon:credentials]]',
        ].join('\n')

        const result = validateGeneratedMdx(content)

        expect(result.clean).toBe(true)
        expect(result.content).toBe(content)
    })

    it('rewrites a token with only case or spacing wrong to its canonical form', () => {
        const result = validateGeneratedMdx('From [[Price: BBL]].')

        expect(result.content).toBe('From [[price:bbl]].')
        expect(result.actions).toEqual([
            {
                kind: 'invalid-claim-token',
                detail: 'Rewrote claim token [[Price: BBL]] as [[price:bbl]].',
            },
        ])
    })

    it('reports an unknown, unresolvable or unclosed token, and never deletes it', () => {
        const content =
            'A [[price:mommy-makeover]] total, a [[discount:20]] deal, and [[price:bbl'
        const result = validateGeneratedMdx(content)

        expect(result.content).toBe(content)
        expect(result.clean).toBe(false)
        expect(result.actions.map((action) => action.kind)).toEqual([
            'invalid-claim-token',
            'invalid-claim-token',
            'invalid-claim-token',
        ])
        expect(result.actions[0]?.detail).toContain(
            'publishes no starting price'
        )
        expect(result.actions[1]?.detail).toContain('Unknown token "discount"')
        expect(result.actions[2]?.detail).toContain('Unclosed token')
    })

    it('leaves Markdown that only looks bracketed alone', () => {
        const content = 'See [[Learn more](/x)] now, or [[1]].'
        expect(validateGeneratedMdx(content)).toMatchObject({
            clean: true,
            content,
        })
    })

    it('writes a typed Alluring price that fits one line as its token', () => {
        const result = validateGeneratedMdx(
            'A BBL at Alluring starts at $5,500, and most patients pay between $5,500 and $10,000. A mini tummy tuck is $3,000.'
        )

        expect(result.content).toBe(
            'A BBL at Alluring starts at [[price:bbl:lipo360-bbl]], and [[price-range:bbl]]. A mini tummy tuck is [[price:tummy-tuck:mini]].'
        )
        expect(result.actions.map((action) => action.kind)).toEqual([
            'typed-price',
            'typed-price',
            'typed-price',
        ])
    })

    it('reports a typed price that fits no single line, leaving it as written', () => {
        const content =
            'Liposuction of one area added to another procedure is $500, depending on the area.'
        const result = validateGeneratedMdx(content)

        expect(result.content).toBe(content)
        expect(result.actions).toHaveLength(1)
        expect(result.actions[0]?.kind).toBe('typed-price')
        expect(result.actions[0]?.detail).toContain('matches no single line')
    })

    it('leaves the ASPS national averages alone', () => {
        const content =
            "ASPS puts the national average surgeon's fee for a tummy tuck at $8,174, a figure that does not include anesthesia or operating room facilities."
        expect(validateGeneratedMdx(content).clean).toBe(true)
    })

    it('checks lines against the live pricing when given it', () => {
        const content = 'A neck lift is [[price:facelift:neck-lift]].'

        expect(validateGeneratedMdx(content).clean).toBe(false)
        expect(
            validateGeneratedMdx(content, { pricing: WITH_ADMIN_LINE }).clean
        ).toBe(true)
    })

    it('is idempotent once the tokens are fixed', () => {
        const first = validateGeneratedMdx(
            'From [[Price:BBL]] and $3,000 for a mini tummy tuck.'
        )
        const second = validateGeneratedMdx(first.content)

        expect(second.clean).toBe(true)
        expect(second.content).toBe(first.content)
    })

    it('leaves bracketed numbers, which are not tokens, alone', () => {
        const content = 'As one study found [[1]], most patients [2] recover.'
        expect(validateGeneratedMdx(content)).toMatchObject({
            clean: true,
            content,
        })
    })
})

describe('findClaimTokenErrors', () => {
    it('passes a post whose tokens all resolve', () => {
        expect(
            findClaimTokenErrors(
                {
                    title: 'BBL from [[price:bbl]]',
                    content: 'From [[price:bbl]]. [[price-caveat]]',
                    metaTitle: 'BBL cost',
                    metaDescription: 'From [[price:bbl]].',
                    excerpt: null,
                    quickAnswer: 'How much?\n\nFrom [[price:bbl]].',
                    faqs: [{ question: 'Cost?', answer: '[[price:lipo]].' }],
                },
                FALLBACK_PRICING
            )
        ).toEqual([])
    })

    it('names the field, the token, the reason and the fix', () => {
        expect(
            findClaimTokenErrors(
                {
                    metaDescription: 'From [[price:bbl:nope]].',
                    faqs: [
                        { question: 'Fine?', answer: 'Yes.' },
                        { question: 'Who?', answer: '[[Surgeon:Name]]' },
                    ],
                },
                FALLBACK_PRICING
            )
        ).toEqual([
            'metaDescription: [[price:bbl:nope]] — Unknown or inactive line "bbl:nope".',
            'faqs[1].answer: [[Surgeon:Name]] — Malformed token: write [[name]] or [[name:arg]] in lowercase, with no spaces. Did you mean [[surgeon:name]]?',
        ])
    })

    it('rejects a range for a procedure that publishes none', () => {
        const [error] = findClaimTokenErrors(
            { excerpt: 'Most pay [[price-range:tummy-tuck]].' },
            FALLBACK_PRICING
        )
        expect(error).toContain('BBL only')
    })
})

describe('normalizeClaimText (extracted fields)', () => {
    it('writes a typed price as its token and drops sentence tokens from a title', async () => {
        const { normalizeClaimText } = await import(
            '@workspace/ai/functions/normalize-claim-text.function'
        )
        const meta = normalizeClaimText(
            'Mini tummy tuck from $3,000 in Miami [[price-caveat]]',
            'metaTitle'
        )
        expect(meta.text).toBe(
            'Mini tummy tuck from [[price:tummy-tuck:mini]] in Miami'
        )
        expect(meta.notes).toHaveLength(2)
    })

    it('rewrites a sloppy token and reports one it cannot resolve', async () => {
        const { normalizeClaimText } = await import(
            '@workspace/ai/functions/normalize-claim-text.function'
        )
        const result = normalizeClaimText(
            'BBL from [[Price: BBL]] and [[price:nope]].',
            'faq'
        )
        expect(result.text).toBe('BBL from [[price:bbl]] and [[price:nope]].')
        expect(
            result.notes.some((note: string) => note.includes('[[price:nope]]'))
        ).toBe(true)
    })

    it('reports a meta description that only fits while no discount is on', async () => {
        const { normalizeClaimText } = await import(
            '@workspace/ai/functions/normalize-claim-text.function'
        )
        const text = `${'x'.repeat(150)} [[price:bbl]] [[price:lipo:lipo360]]`
        const result = normalizeClaimText(text, 'metaDescription')
        expect(
            result.notes.some((note: string) =>
                note.includes('once a discount shows')
            )
        ).toBe(true)
    })
})
