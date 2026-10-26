/**
 * Every block that prints a discounted price carries the Fla. Stat. 456.062
 * statement in the same block (#354): the hero chips, the fact rail and the
 * at-a-glance tables of the module procedure pages, and the paid landing
 * hero, which also never says "starting at" for a named-line-only procedure
 * (the face and neck lift, D2).
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
    buildPricingSnapshot,
    FALLBACK_PRICING,
} from '@workspace/shared/claims/prices'
import { getPriceDisplay } from '@workspace/shared/claims/pricing'

import { buildProcedurePrices } from '@/lib/claims/procedure-prices.util'

const { ModuleFactRail } = await import(
    '@/components/procedures/module-kit/module-layout.component'
)
const { PriceTag } = await import('@/components/shared/price-tag.component')
const { BblAtAGlance } = await import(
    '@/components/procedures/pages/bbl/bbl-at-a-glance.component'
)
const { LipoAtAGlance } = await import(
    '@/components/procedures/pages/lipo/lipo-at-a-glance.component'
)
const { TummyTuckAtAGlance } = await import(
    '@/components/procedures/pages/tummy-tuck/tummy-tuck-at-a-glance.component'
)
const { ProcedureLandingPrice } = await import(
    '@/components/procedure-landing/procedure-landing-hero.component'
)
const { ProcedurePricing } = await import(
    '@/components/procedures/procedure-pricing.component'
)

const STATEMENT = 'The 456.062 statement counsel confirms.'

/** The sheet with every procedure at 20% off and the statement set. */
const DISCOUNTED = buildPricingSnapshot({
    source: 'db',
    lines: FALLBACK_PRICING.lines,
    procedures: Object.values(FALLBACK_PRICING.procedures).map((row) => ({
        ...row,
        discountPercent: 20,
    })),
    settings: {
        defaultDiscountPercent: 0,
        discountStatement: STATEMENT,
        comboDiscountTwoUsd: 500,
        comboDiscountThreeUsd: 1000,
        updatedAt: null,
    },
})

describe('discounted prices carry the 456.062 statement (#354)', () => {
    it('in the fact rail', () => {
        const prices = buildProcedurePrices(DISCOUNTED, 'bbl')
        const html = renderToStaticMarkup(
            createElement(ModuleFactRail, {
                label: 'BBL key facts',
                startingAt: createElement(PriceTag, { price: prices.starting }),
                priceNote: 'Set for each patient',
                discountStatement: prices.discountStatement,
                surgeonName: 'Victoria Karlinsky, MD, FACS',
            })
        )
        expect(html).toContain('<del')
        expect(html).toContain(STATEMENT)
    })

    it.each([
        ['bbl', BblAtAGlance],
        ['lipo', LipoAtAGlance],
        ['tummy-tuck', TummyTuckAtAGlance],
    ] as const)('in the %s at-a-glance table', (procedure, Component) => {
        const html = renderToStaticMarkup(
            createElement(Component, {
                prices: buildProcedurePrices(DISCOUNTED, procedure),
            })
        )
        expect(html).toContain('<del')
        expect(html).toContain(STATEMENT)
    })

    it('in no block while nothing is discounted', () => {
        const html = renderToStaticMarkup(
            createElement(BblAtAGlance, {
                prices: buildProcedurePrices(FALLBACK_PRICING, 'bbl'),
            })
        )
        expect(html).not.toContain('<del')
        expect(html).not.toContain('data-claims="discount-statement"')
    })
})

describe('the paid landing hero price (#354)', () => {
    const render = (procedure: string, pricing = FALLBACK_PRICING) =>
        renderToStaticMarkup(
            createElement(ProcedureLandingPrice, {
                price: getPriceDisplay(pricing, procedure)!,
                discountStatement: pricing === DISCOUNTED ? STATEMENT : null,
            })
        )

    it('quotes the facelift only as the face and neck lift line (D2)', () => {
        const html = render('facelift')
        expect(html).not.toMatch(/starting at/i)
        expect(html).toContain('face and neck lift')
        expect(html).toContain('$15,000')
    })

    it('names the variant under a starting price, with the caveat', () => {
        const html = render('breast-lift')
        expect(html).toContain('Starting at')
        expect(html).toContain('modified breast lift')
        expect(html).toMatch(/confirms it at consultation/)
    })

    it('carries the statement while discounted', () => {
        const html = render('tummy-tuck', DISCOUNTED)
        expect(html).toContain('<del')
        expect(html).toContain(STATEMENT)
    })
})

describe('the template procedure price section (#354)', () => {
    const render = (
        procedure: string,
        title: string,
        pricing = FALLBACK_PRICING
    ) =>
        renderToStaticMarkup(
            createElement(ProcedurePricing, {
                procedureTitle: title,
                pricing: { includes: [], factors: [] },
                prices: buildProcedurePrices(pricing, procedure),
            })
        )

    it('names the starting line, with the caveat and the financing sentence', () => {
        const html = render('breast-lift', 'Breast Lift Miami')
        expect(html).toContain('Starting at')
        expect(html).toContain('modified breast lift')
        expect(html).toMatch(/confirms your price at consultation/)
        expect(html).toContain(
            'Financing is available through Cherry, CareCredit, and United Credit for qualified applicants.'
        )
        expect(html).not.toMatch(/\/\s*week|weekly/i)
    })

    it('quotes the facelift only as the face and neck lift line (D2)', () => {
        const html = render('facelift', 'Facelift Miami')
        expect(html).not.toMatch(/starting at|starts at/i)
        expect(html).toContain('face and neck lift')
        expect(html).toContain('$15,000')
    })

    it('carries the statement while discounted', () => {
        const html = render('tummy-tuck', 'Tummy Tuck Miami', DISCOUNTED)
        expect(html).toContain('<del')
        expect(html).toContain(STATEMENT)
    })
})
