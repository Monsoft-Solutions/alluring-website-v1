import { describe, expect, it } from 'vitest'

import {
    LP_COPY,
    LP_LANGUAGES,
} from '@/components/landing-pages/request-consultation/lp-copy'
import { buildLpPrices } from '@/components/landing-pages/request-consultation/lp-prices'
import { AD_VARIANTS } from '@/components/landing-pages/request-consultation/lp-variants'
import { tummyTuckFigure } from '@/lib/data/procedures/facts/tummy-tuck.facts'
import { buildPricingSnapshot } from '@workspace/shared/claims/prices'
import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'

/**
 * The tummy tuck view's prices (#316). The ads quote "Mini tummy tuck from
 * $3,000" and a price asset with every type, and Google needs the page to show
 * the same prices, so they come from the pricing resolver (#354), the same
 * source as the procedure page, and the fallback sheet agrees with the facts.
 */
describe('tummy tuck prices on the ads page (#316)', () => {
    it('reads all five from the pricing, in the price sheet’s order', () => {
        const prices = buildLpPrices('tummy-tuck')
        expect(prices).not.toBeNull()
        const finals = Object.fromEntries(
            Object.entries(prices?.tummyTuck ?? {}).map(([type, price]) => [
                type,
                price?.final,
            ])
        )
        expect(finals).toEqual({
            mini: tummyTuckFigure('price-mini'),
            'extended-mini': tummyTuckFigure('price-extended-mini'),
            full: tummyTuckFigure('price-full'),
            extended: tummyTuckFigure('price-extended'),
            'fleur-de-lis': tummyTuckFigure('price-fleur-de-lis'),
        })
        expect(prices?.statement).toBeNull()
    })

    it('matches what the tummy tuck ads say', () => {
        const prices = buildLpPrices('tummy-tuck')?.tummyTuck
        expect(prices?.mini?.final).toBe('$3,000')
        expect(prices?.full?.final).toBe('$4,500')
    })

    it('follows an admin discount, with the 456.062 statement', () => {
        const discounted = buildPricingSnapshot({
            source: 'db',
            lines: FALLBACK_PRICING.lines,
            procedures: Object.values(FALLBACK_PRICING.procedures).map(
                (settings) =>
                    settings.procedure === 'tummy-tuck'
                        ? { ...settings, discountPercent: 20 }
                        : settings
            ),
            settings: {
                defaultDiscountPercent: 0,
                discountStatement: 'The 456.062 statement.',
                comboDiscountTwoUsd: 500,
                comboDiscountThreeUsd: 1000,
                updatedAt: null,
            },
        })
        const prices = buildLpPrices('tummy-tuck', discounted)
        expect(prices?.tummyTuck.mini).toMatchObject({
            list: '$3,000',
            final: '$2,400',
            discounted: true,
        })
        expect(prices?.statement).toBe('The 456.062 statement.')
    })

    it('shows prices on the tummy tuck view only', () => {
        for (const variant of AD_VARIANTS.filter((v) => v !== 'tummy-tuck')) {
            expect(buildLpPrices(variant)).toBeNull()
        }
    })

    it.each(LP_LANGUAGES)(
        'lists every type once, in the same order, in %s',
        (lang) => {
            const rows = LP_COPY[lang].prices.rows
            expect(rows.map((row) => row.type)).toEqual([
                'mini',
                'extended-mini',
                'full',
                'extended',
                'fleur-de-lis',
            ])
            for (const row of rows) {
                expect(row.label.length).toBeGreaterThan(0)
                expect(row.note.length).toBeGreaterThan(0)
            }
            expect(LP_COPY[lang].prices.from).toContain('{price}')
        }
    )

    it.each(LP_LANGUAGES)(
        'claims muscle repair for no type the price sheet doesn’t, in %s',
        (lang) => {
            const rows = LP_COPY[lang].prices.rows
            const says = (type: string) =>
                rows.find((row) => row.type === type)?.note ?? ''
            // The sheet says "no muscle repair" for the minis only; it says
            // nothing about the full, extended or fleur-de-lis.
            for (const type of ['full', 'extended', 'fleur-de-lis']) {
                expect(says(type)).not.toMatch(/muscle|muscul/i)
            }
            expect(says('mini')).toMatch(
                /no muscle|sin reparaci[oó]n muscular/i
            )
        }
    )

    it.each(LP_LANGUAGES)(
        'names the mini and full prices in the cost answer, in %s',
        (lang) => {
            const line = LP_COPY[lang].faq.pricesTummyTuck
            expect(line).toContain('{mini}')
            expect(line).toContain('{full}')
        }
    )
})
