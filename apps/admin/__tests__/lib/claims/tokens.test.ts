/**
 * Tests for the claim token grammar (issue #354).
 *
 * Tokens live in DB text that is compiled as MDX, so two things are pinned
 * hardest: a resolved token never opens MDX syntax (no braces or angle
 * brackets, DB labels escaped), and an unknown token never leaks raw
 * brackets to a reader.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'
import {
    CLAIM_TOKEN_NAMES,
    escapeMarkdownText,
    hasClaimTokens,
    listClaimTokens,
    parseClaimTokens,
    resolveClaimTokens,
    resolveClaimTokensDetailed,
    resolveClaimTokensIn,
    validateClaimTokens,
} from '@workspace/shared/claims/tokens'

const STATEMENT = 'Statement text as counsel confirms it.'
const silent = { onIssue: () => {} }

const discounted: PricingSnapshot = {
    ...FALLBACK_PRICING,
    procedures: {
        ...FALLBACK_PRICING.procedures,
        bbl: { ...FALLBACK_PRICING.procedures.bbl!, discountPercent: 20 },
    },
    discountStatement: STATEMENT,
}

const text = (source: string, pricing: PricingSnapshot = FALLBACK_PRICING) =>
    resolveClaimTokens(source, { mode: 'text', pricing, ...silent })
const markdown = (
    source: string,
    pricing: PricingSnapshot = FALLBACK_PRICING
) => resolveClaimTokens(source, { mode: 'markdown', pricing, ...silent })

afterEach(() => vi.restoreAllMocks())

describe('parseClaimTokens', () => {
    it('finds well-formed tokens with their arguments', () => {
        const { tokens, malformed } = parseClaimTokens(
            'From [[price:tummy-tuck]] ([[price:tummy-tuck:mini]]), [[price-caveat]]'
        )
        expect(tokens.map((t) => [t.name, t.args])).toEqual([
            ['price', ['tummy-tuck']],
            ['price', ['tummy-tuck', 'mini']],
            ['price-caveat', []],
        ])
        expect(tokens[0]?.index).toBe(5)
        expect(malformed).toEqual([])
    })

    it('leaves digit-led brackets alone', () => {
        expect(parseClaimTokens('See [[1]](#sources) and [[2]].')).toEqual({
            tokens: [],
            malformed: [],
        })
        expect(hasClaimTokens('See [[1]](#sources).')).toBe(false)
    })

    it('suggests the canonical form of a sloppy token', () => {
        const { malformed } = parseClaimTokens('[[Price : BBL]]')
        expect(malformed).toHaveLength(1)
        expect(malformed[0]?.suggestion).toBe('[[price:bbl]]')
    })

    it('reports unclosed tokens', () => {
        const { malformed } = parseClaimTokens('a [[price:bbl] b [[phone c')
        expect(malformed.map((m) => m.raw)).toEqual(['[[price:bbl]', '[[phone'])
    })
})

describe('validateClaimTokens', () => {
    it('accepts every token listClaimTokens offers', () => {
        const all = listClaimTokens()
            .map((entry) => entry.token)
            .join(' ')
        const result = validateClaimTokens(all)
        expect(result.errors).toEqual([])
        expect(result.valid).toBe(true)
    })

    it('lists every token name in the catalog', () => {
        const names = new Set(
            listClaimTokens().map(
                (entry) => /^\[\[([a-z-]+)/.exec(entry.token)?.[1]
            )
        )
        expect([...names].sort()).toEqual([...CLAIM_TOKEN_NAMES].sort())
    })

    it('accepts a web page slug as the procedure', () => {
        expect(
            validateClaimTokens(
                '[[price:tummy-tuck-miami:mini]] [[price:brazilian-butt-lift-bbl-miami]]'
            ).valid
        ).toBe(true)
    })

    it.each([
        ['[[nope]]', 'Unknown token "nope"'],
        ['[[price]]', 'takes a procedure'],
        ['[[price:bbl:a:b]]', 'takes a procedure'],
        ['[[price:rhinoplasty]]', 'Unknown procedure "rhinoplasty"'],
        ['[[price:lipo:nope]]', 'Unknown or inactive line "lipo:nope"'],
        ['[[price:mommy-makeover]]', 'publishes no starting price'],
        ['[[price-range:lipo]]', 'BBL only'],
        ['[[price-caveat:medium]]', 'price-caveat'],
        ['[[combo-discount:4]]', 'combo-discount'],
        ['[[surgeon]]', 'surgeon:name'],
        ['[[surgeon:bio]]', 'surgeon:name'],
        ['[[phone:mobile]]', 'takes no argument'],
        ['[[Price:BBL]]', 'Malformed token'],
        ['[[price:bbl]', 'Unclosed token'],
    ])('rejects %s', (source, reason) => {
        const result = validateClaimTokens(source)
        expect(result.valid).toBe(false)
        expect(result.errors[0]?.reason).toContain(reason)
    })

    it('validates against the snapshot it is given', () => {
        const pricing: PricingSnapshot = {
            ...FALLBACK_PRICING,
            lines: [
                ...FALLBACK_PRICING.lines,
                {
                    procedure: 'lipo',
                    key: 'knees',
                    label: 'knee liposuction',
                    usd: 500,
                    unit: 'each',
                    addOn: true,
                    sort: 999,
                    active: true,
                },
            ],
        }
        expect(validateClaimTokens('[[price:lipo:knees]]').valid).toBe(false)
        expect(
            validateClaimTokens('[[price:lipo:knees]]', { pricing }).valid
        ).toBe(true)
    })
})

describe('resolveClaimTokens in text mode', () => {
    it('resolves prices from the sheet', () => {
        expect(
            text(
                'A BBL at Alluring starts at [[price:bbl]], and [[price-range:bbl]].'
            )
        ).toBe(
            'A BBL at Alluring starts at $5,500, and most patients pay between $5,500 and $10,000.'
        )
        expect(
            text('From [[price:tummy-tuck]] for a [[price-label:tummy-tuck]].')
        ).toBe('From $3,000 for a mini tummy tuck (no muscle repair).')
        expect(text('[[price:breast-augmentation:capsulectomy]]')).toBe(
            '$500 per breast'
        )
        expect(
            text(
                'A [[price-label:facelift]] is [[price:facelift:face-neck-lift]].'
            )
        ).toBe('A face and neck lift is $15,000.')
    })

    it('has no facelift "starting at" price (D2): only the named line', () => {
        const { errors } = validateClaimTokens(
            'A facelift starts at [[price:facelift]].'
        )
        expect(errors).toHaveLength(1)
        expect(errors[0]?.reason).toContain('[[price:facelift:face-neck-lift]]')
        expect(
            validateClaimTokens('[[price:facelift:face-neck-lift]]').valid
        ).toBe(true)
    })

    it('gives "$4,400 (20% off $5,500)" while a discount is on', () => {
        expect(text('[[price:bbl]]', discounted)).toBe(
            '$4,400 (20% off $5,500)'
        )
        expect(text('[[price-range:bbl]]', discounted)).toBe(
            'most patients pay between $4,400 and $8,000 (20% off $5,500 and $10,000)'
        )
    })

    it('resolves the canon sentences', () => {
        expect(text('[[surgeon:name]]')).toBe('Victoria Karlinsky, MD, FACS')
        expect(text('[[surgeon:short]]')).toBe('Dr. Karlinsky')
        expect(text('[[surgeon:credentials]]')).toBe(
            'She is board certified in general surgery by the American Board of Surgery and is a Fellow of the American College of Surgeons.'
        )
        expect(text('[[surgeon:credentials-year]]')).toContain('since 2008')
        expect(text('[[financing-partners]]')).toBe(
            'Cherry, CareCredit, and United Credit'
        )
        expect(text('[[financing]]')).toBe(
            'Financing is available through Cherry, CareCredit, and United Credit for qualified applicants.'
        )
        expect(text('[[phone]]')).toBe('+1 (786) 305-8649')
        expect(text('[[combo-discount:2]] / [[combo-discount:3]]')).toBe(
            '$500 / $1,000'
        )
        expect(text('[[price-caveat]]')).toContain(
            'confirms it at consultation'
        )
        expect(text('[[price-caveat:long]]')).toContain(
            'Dr. Karlinsky confirms your price at consultation'
        )
    })

    it('renders the 456.062 statement only while a discount is on', () => {
        // Printing nothing, the token takes the space before it along.
        expect(text('Note. [[discount-statement]]')).toBe('Note.')
        expect(
            text('Note. [[discount-statement]]', {
                ...FALLBACK_PRICING,
                discountStatement: STATEMENT,
            })
        ).toBe('Note.')
        expect(text('Note. [[discount-statement]]', discounted)).toBe(
            `Note. ${STATEMENT}`
        )
    })

    it('returns text without tokens unchanged', () => {
        const source = 'No tokens here, and [[1]] is a citation.'
        expect(text(source)).toBe(source)
    })

    it('never reads Markdown inside brackets as a token', () => {
        const source = 'See [[Learn more](/x)] now.'
        expect(text(source)).toBe(source)
        expect(validateClaimTokens(source).valid).toBe(true)
    })

    it('consumes a long token through its brackets, leaking nothing', () => {
        const long = `[[price:${'a'.repeat(140)}]]`
        expect(text(`Before ${long} after`)).toBe('Before after')
    })

    it('reports an unclosed token only after a known name', () => {
        expect(validateClaimTokens('From [[price:bbl today').errors).toEqual([
            expect.objectContaining({ raw: '[[price:bbl' }),
        ])
        expect(validateClaimTokens('A [[note about it').valid).toBe(true)
    })

    it('resolves the add-on span, struck through while discounted', () => {
        expect(text('[[price-span:lipo:add-ons]]')).toBe('$500 to $1,500')
    })
})

describe('resolveClaimTokens in markdown mode', () => {
    it('strikes the list price through while a discount is on', () => {
        expect(markdown('From [[price:bbl]].', discounted)).toBe(
            'From ~~$5,500~~ $4,400.'
        )
        expect(markdown('[[price-range:bbl]]', discounted)).toBe(
            'most patients pay between ~~$5,500~~ $4,400 and ~~$10,000~~ $8,000'
        )
    })

    it('links the long financing sentence', () => {
        expect(markdown('[[financing:long]]')).toContain(
            'See [financing](/plastic-surgery-financing-miami).'
        )
        expect(text('[[financing:long]]')).not.toContain('](')
    })

    it('escapes text that comes from the database', () => {
        const pricing: PricingSnapshot = {
            ...discounted,
            lines: FALLBACK_PRICING.lines.map((line) =>
                line.procedure === 'bbl'
                    ? { ...line, label: 'Lipo <360> {BBL} | *new* [x]' }
                    : line
            ),
            discountStatement: 'Call {now} <b>today</b>',
        }
        expect(markdown('[[price-label:bbl]]', pricing)).toBe(
            'Lipo \\<360\\> \\{BBL\\} \\| \\*new\\* \\[x\\]'
        )
        expect(markdown('[[discount-statement]]', pricing)).toBe(
            'Call \\{now\\} \\<b\\>today\\</b\\>'
        )
        // Plain text is not Markdown: no escapes.
        expect(text('[[price-label:bbl]]', pricing)).toBe(
            'Lipo <360> {BBL} | *new* [x]'
        )
    })

    it('never emits a brace or an unescaped angle bracket', () => {
        const all = listClaimTokens(discounted)
            .map((entry) => entry.token)
            .join('\n')
        for (const pricing of [FALLBACK_PRICING, discounted]) {
            const output = markdown(all, pricing)
            expect(output).not.toMatch(/(?<!\\)[{}<>]/)
            expect(output).not.toContain('[[')
        }
    })
})

describe('tokens that cannot be resolved', () => {
    it('render as nothing and are reported', () => {
        const issues: string[] = []
        const output = resolveClaimTokens(
            'Before [[nope]] [[Price:BBL]] [[price:mommy-makeover]] [[price:bbl] after',
            {
                mode: 'markdown',
                onIssue: (issue) => issues.push(issue.raw),
            }
        )
        // Each token goes, with the space before it.
        expect(output).toBe('Before after')
        expect(output).not.toContain('[[')
        expect(issues).toEqual([
            '[[nope]]',
            '[[Price:BBL]]',
            '[[price:mommy-makeover]]',
            '[[price:bbl]',
        ])
    })

    it('are logged with console.warn by default', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(resolveClaimTokens('[[nope]]', { mode: 'text' })).toBe('')
        expect(warn).toHaveBeenCalledTimes(1)
        expect(warn.mock.calls[0]?.[0]).toContain('[[nope]]')
    })
})

describe('resolveClaimTokensDetailed', () => {
    it('reports whether a resolved price is discounted', () => {
        const plain = resolveClaimTokensDetailed(
            '[[price:bbl]] [[price:lipo]]',
            {
                mode: 'text',
                pricing: discounted,
            }
        )
        expect(plain).toMatchObject({
            resolved: 2,
            discounted: true,
            issues: [],
        })

        const lipo = resolveClaimTokensDetailed('[[price:lipo]]', {
            mode: 'text',
            pricing: discounted,
        })
        expect(lipo.discounted).toBe(false)
    })
})

describe('resolveClaimTokensIn', () => {
    it('resolves every string of an FAQ list and a JSON-LD object', () => {
        const faqs = [
            {
                question: 'How much is a BBL?',
                answer: 'From [[price:bbl]]. [[price-caveat:long]]',
            },
        ]
        const resolvedFaqs = resolveClaimTokensIn(faqs, {
            mode: 'text',
            ...silent,
        })
        expect(resolvedFaqs[0]?.answer).toMatch(/^From \$5,500\. These are/)
        expect(faqs[0]?.answer).toContain('[[price:bbl]]')

        const date = new Date('2026-10-25T00:00:00Z')
        const graph = resolveClaimTokensIn(
            {
                '@type': 'Offer',
                description: '[[price:lipo]] for [[price-label:lipo]]',
                price: 4000,
                nested: [{ name: '[[surgeon:name]]' }],
                date,
            },
            { mode: 'text', ...silent }
        )
        expect(graph).toEqual({
            '@type': 'Offer',
            description: '$4,000 for Lipo 360',
            price: 4000,
            nested: [{ name: 'Victoria Karlinsky, MD, FACS' }],
            date,
        })
    })
})

describe('escapeMarkdownText', () => {
    it('escapes Markdown and MDX syntax characters', () => {
        expect(escapeMarkdownText('a_b *c* `d` #e ~f~ \\g')).toBe(
            'a\\_b \\*c\\* \\`d\\` \\#e \\~f\\~ \\\\g'
        )
    })
})
