/**
 * How a price reaches a page (issue #354): `PriceTag` and the range
 * components strike the list price through while a discount is on,
 * `DiscountStatement` renders only with a statement, and the `llms*.txt`
 * price section is plain text built from the canon.
 */
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import {
    buildPricingSnapshot,
    DEFAULT_PROCEDURE_SETTINGS,
    FALLBACK_PRICING,
} from '@workspace/shared/claims/prices'
import { findClaimHits } from '@workspace/shared/claims/patterns'

import { DiscountStatement } from '@/components/shared/discount-statement.component'
import {
    PriceRangeFigures,
    PriceRangeText,
    PriceTag,
} from '@/components/shared/price-tag.component'
import {
    buildProcedurePrices,
    findLinePrice,
    isSingleAreaAddOn,
    linePriceExtremes,
} from '@/lib/claims/procedure-prices.util'

vi.mock('server-only', () => ({}))
vi.mock('@/env', () => ({
    env: { NEXT_PUBLIC_SITE_URL: 'https://www.alluringplasticsurgery.com' },
}))

const { pricesSection, surgeonSection, practiceLines, newestDate } =
    await import('@/lib/llms/llms-sections.server')

const STATEMENT = 'Statement text as counsel confirms it.'

function snapshot({
    bbl = null,
    breastAugmentation = null,
    statement = STATEMENT,
}: {
    bbl?: number | null
    breastAugmentation?: number | null
    statement?: string | null
} = {}) {
    return buildPricingSnapshot({
        source: 'db',
        lines: FALLBACK_PRICING.lines,
        procedures: DEFAULT_PROCEDURE_SETTINGS.map((row) =>
            row.procedure === 'bbl'
                ? { ...row, discountPercent: bbl }
                : row.procedure === 'breast-augmentation'
                  ? { ...row, discountPercent: breastAugmentation }
                  : row
        ),
        settings: {
            defaultDiscountPercent: 0,
            discountStatement: statement,
            comboDiscountTwoUsd: 500,
            comboDiscountThreeUsd: 1000,
            updatedAt: '2026-10-20T12:00:00.000Z',
        },
    })
}

const render = (element: Parameters<typeof renderToStaticMarkup>[0]) =>
    renderToStaticMarkup(element)

describe('PriceTag', () => {
    it('prints the list price alone when there is no discount', () => {
        const prices = buildProcedurePrices(FALLBACK_PRICING, 'bbl')
        expect(
            render(createElement(PriceTag, { price: prices.starting }))
        ).toBe('<span class="whitespace-nowrap">$5,500</span>')
    })

    it('strikes the list price through, then the discounted price', () => {
        const prices = buildProcedurePrices(snapshot({ bbl: 20 }), 'bbl')
        const html = render(
            createElement(PriceTag, { price: prices.starting })
        ).replace(/ class="[^"]*"/g, '')
        expect(html).toBe(
            '<span><del><span>was </span>$5,500</del> <ins><span>now </span>$4,400</ins></span>'
        )
    })

    it('appends the unit, and renders nothing without a price', () => {
        const prices = buildProcedurePrices(
            FALLBACK_PRICING,
            'breast-augmentation'
        )
        expect(
            render(
                createElement(PriceTag, {
                    price: findLinePrice(prices, 'capsulectomy'),
                })
            )
        ).toContain('$500 per breast')
        expect(render(createElement(PriceTag, { price: null }))).toBe('')
        // D3: a mommy makeover publishes no starting price.
        expect(
            buildProcedurePrices(FALLBACK_PRICING, 'mommy-makeover').starting
        ).toBeNull()
    })
})

describe('PriceRangeText and PriceRangeFigures', () => {
    it('say "most patients pay between", never "up to"', () => {
        const { range } = buildProcedurePrices(FALLBACK_PRICING, 'bbl')
        const text = render(
            createElement(PriceRangeText, { range, capitalized: true })
        ).replace(/<[^>]+>/g, '')
        expect(text).toBe('Most patients pay between $5,500 and $10,000')
        expect(
            render(createElement(PriceRangeFigures, { range })).replace(
                /<[^>]+>/g,
                ''
            )
        ).toBe('$5,500–$10,000')
    })

    it('strike both ends through while BBL is discounted', () => {
        const { range } = buildProcedurePrices(snapshot({ bbl: 20 }), 'bbl')
        const html = render(createElement(PriceRangeText, { range }))
        expect(html.match(/<del/g)).toHaveLength(2)
        expect(html.replace(/<[^>]+>/g, '')).toBe(
            'most patients pay between was $5,500 now $4,400 and was $10,000 now $8,000'
        )
    })

    it('publish no range for any other procedure', () => {
        expect(
            buildProcedurePrices(FALLBACK_PRICING, 'tummy-tuck').range
        ).toBeNull()
    })
})

describe('buildProcedurePrices', () => {
    it("carries the statement only while one of the procedure's lines is discounted", () => {
        const pricing = snapshot({ breastAugmentation: 10 })
        expect(
            buildProcedurePrices(pricing, 'breast-augmentation-miami')
                .discountStatement
        ).toBe(STATEMENT)
        expect(
            buildProcedurePrices(pricing, 'bbl').discountStatement
        ).toBeNull()
    })

    it("finds liposuction's single-area add-on range, J-Plasma aside", () => {
        const extremes = linePriceExtremes(
            buildProcedurePrices(FALLBACK_PRICING, 'lipo'),
            isSingleAreaAddOn
        )
        expect([extremes?.min.final, extremes?.max.final]).toEqual([
            '$500',
            '$1,500',
        ])
    })
})

describe('DiscountStatement', () => {
    it('renders the statement, and nothing without one', () => {
        expect(
            render(createElement(DiscountStatement, { statement: STATEMENT }))
        ).toContain(STATEMENT)
        expect(
            render(createElement(DiscountStatement, { statement: null }))
        ).toBe('')
    })
})

describe('llms sections', () => {
    it('lists starting prices in plain text, with the caveat and no statement', () => {
        const text = pricesSection(FALLBACK_PRICING)
        expect(text).toContain(
            '[BBL](https://www.alluringplasticsurgery.com/procedures/brazilian-butt-lift-bbl-miami): from $5,500 for Lipo 360 + BBL; most patients pay between $5,500 and $10,000.'
        )
        expect(text).toContain(
            'a face and neck lift is $15,000; other facial procedures are priced at consultation.'
        )
        expect(text).toContain('mommy makeover')
        expect(text).toContain('priced from the procedures in your plan')
        expect(text).not.toContain('no total')
        expect(text).not.toContain('facelift-alone')
        expect(text).toContain('confirms your price at consultation')
        expect(text).not.toContain(STATEMENT)
    })

    it('gives a discounted price as "$4,400 (20% off $5,500)" and the statement', () => {
        const text = pricesSection(snapshot({ bbl: 20 }))
        expect(text).toContain(
            'from $4,400 (20% off $5,500) for Lipo 360 + BBL'
        )
        expect(text).toContain(STATEMENT)
    })

    it('says nothing the canon forbids', () => {
        const text = [
            practiceLines(),
            surgeonSection(),
            pricesSection(FALLBACK_PRICING),
        ].join('\n\n')
        const failing = findClaimHits(text).filter(
            (hit) => hit.severity === 'fail'
        )
        expect(failing.map((hit) => `${hit.id}: ${hit.match}`)).toEqual([])
        expect(text).not.toMatch(/ABPS|AAA?A?SF|double board|5,000\+|15\+/i)
        expect(text).not.toMatch(/luxury|affordab/i)
    })

    it('dates the file by its newest real edit, pricing included', () => {
        expect(newestDate(['2026-09-22T00:00:00.000Z', null], snapshot())).toBe(
            '2026-10-20'
        )
        expect(newestDate([], FALLBACK_PRICING)).toBeNull()
    })
})
