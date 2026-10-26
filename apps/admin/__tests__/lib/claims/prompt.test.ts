/**
 * The canon as prompt text (issue #354). The chat agent may quote the live
 * starting prices; the blog writer and reviewers never see one and write
 * claim tokens instead.
 */
import { describe, expect, it } from 'vitest'

import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'
import { buildClaimsPromptBlock } from '@workspace/shared/claims/prompt'

const STATEMENT = 'Statement text as counsel confirms it.'

const discounted: PricingSnapshot = {
    ...FALLBACK_PRICING,
    procedures: {
        ...FALLBACK_PRICING.procedures,
        bbl: { ...FALLBACK_PRICING.procedures.bbl!, discountPercent: 20 },
    },
    discountStatement: STATEMENT,
}

/** Dollar figures in a text, except the three ASPS national averages. */
function practiceFigures(text: string): string[] {
    return (text.match(/\$\s?\d{1,3}(?:,\d{3})*/g) ?? []).filter(
        (figure) => !['$7,264', '$4,711', '$8,174'].includes(figure)
    )
}

describe("buildClaimsPromptBlock('chat')", () => {
    const prompt = buildClaimsPromptBlock('chat')

    it('quotes the current starting prices with the caveat', () => {
        expect(prompt).toContain(
            'BBL: from $5,500 for Lipo 360 + BBL, and most patients pay between $5,500 and $10,000'
        )
        expect(prompt).toContain(
            'tummy tuck: from $3,000 for mini tummy tuck (no muscle repair)'
        )
        expect(prompt).toContain(
            'facelift: no facelift-alone price. A face and neck lift is $15,000.'
        )
        expect(prompt).toContain('mommy makeover: no total.')
        expect(prompt).toContain(
            'Dr. Karlinsky confirms your price at consultation'
        )
        expect(prompt).toContain('$500 comes off the total for two procedures')
    })

    it('quotes a discount in plain text, with the statement', () => {
        const withDiscount = buildClaimsPromptBlock('chat', discounted)
        expect(withDiscount).toContain('BBL: from $4,400 (20% off $5,500)')
        expect(withDiscount).toContain(STATEMENT)
        expect(prompt).not.toContain(STATEMENT)
    })

    it('gives the real contact details and Sofía’s title', () => {
        expect(prompt).toContain('+1 (786) 305-8649')
        expect(prompt).toContain('info@alluringplasticsurgery.com')
        expect(prompt).toContain('You are Sofía, our concierge.')
        expect(prompt).toContain('/contact-us')
    })

    it('quotes no payment figure or deposit', () => {
        expect(prompt).not.toMatch(/\$\d[\d,]*\s*(?:\/|a |per )(?:week|month)/i)
        expect(prompt).not.toMatch(/\$\d[\d,]*\s+deposit/i)
    })
})

describe("buildClaimsPromptBlock('blog-writer')", () => {
    const prompt = buildClaimsPromptBlock('blog-writer')

    it('tells the writer to use tokens, never a typed price', () => {
        expect(prompt).toContain('Never type an Alluring price. Use tokens.')
        expect(prompt).toContain('[[price:bbl]]')
        expect(prompt).toContain('[[price:tummy-tuck:mini]]')
        expect(prompt).toContain('[[price-range:bbl]]')
        expect(prompt).toContain('[[price-caveat:long]]')
        expect(prompt).toContain('[[surgeon:credentials]]')
    })

    it('contains no Alluring dollar figure, only the ASPS averages', () => {
        expect(practiceFigures(prompt)).toEqual([])
        expect(prompt).toContain('$7,264')
    })

    it('lists tokens for lines the admin adds', () => {
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
        expect(buildClaimsPromptBlock('blog-writer', pricing)).toContain(
            '[[price:lipo:knees]]: knee liposuction (add-on)'
        )
    })
})

describe("buildClaimsPromptBlock('blog-reviewer')", () => {
    it('treats tokens as correct and typed prices as defects', () => {
        const prompt = buildClaimsPromptBlock('blog-reviewer')
        expect(prompt).toContain('never expand, reword or remove one')
        expect(prompt).toContain(
            'A typed dollar figure for an Alluring price is a defect'
        )
        expect(practiceFigures(prompt)).toEqual([])
    })
})

describe("buildClaimsPromptBlock('image')", () => {
    it('keeps prices out of images', () => {
        const prompt = buildClaimsPromptBlock('image', discounted)
        expect(prompt).toContain('Never put a price')
        expect(practiceFigures(prompt)).toEqual([])
        expect(prompt).not.toContain('[[')
    })
})
