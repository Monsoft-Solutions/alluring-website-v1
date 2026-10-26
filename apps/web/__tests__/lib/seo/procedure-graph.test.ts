import { describe, expect, it } from 'vitest'

import {
    buildPricingSnapshot,
    DEFAULT_PROCEDURE_SETTINGS,
    FALLBACK_PRICING,
} from '@workspace/shared/claims/prices'
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'

import { buildProcedurePrices } from '@/lib/claims/procedure-prices.util'
import { brazilianButtLiftBblMiami } from '@/lib/data/procedures/brazilian-butt-lift-bbl-miami.data'
import { liposuctionMiami } from '@/lib/data/procedures/liposuction-miami.data'
import { tummyTuckMiami } from '@/lib/data/procedures/tummy-tuck-miami.data'
import { buildProcedureGraph } from '@/lib/seo/procedure-graph.util'
import { procedureSchema, type Procedure } from '@/lib/types/procedure.type'

const SITE = 'https://www.alluringplasticsurgery.com'

function serviceOf(
    procedure: Procedure,
    pricing: PricingSnapshot = FALLBACK_PRICING,
    claim = procedure.slug
) {
    const pageUrl = `${SITE}/procedures/${procedure.slug}`
    const graph = buildProcedureGraph({
        procedure,
        pageUrl,
        siteUrl: SITE,
        breadcrumbs: [],
        prices: buildProcedurePrices(pricing, claim),
    })
    const service = graph.find((node) => node['@type'] === 'Service')
    if (!service) throw new Error('no Service node')
    return { service, pageUrl }
}

/** The single Offer as the graph publishes it for a starting price. */
function singleOffer(pageUrl: string, minPrice: number, description?: string) {
    return {
        '@type': 'Offer',
        ...(description && { description }),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: pageUrl,
        priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'USD',
            minPrice,
        },
    }
}

/** The 2026-09-15 sheet with one procedure discounted. */
function discounted(procedure: string, percent: number): PricingSnapshot {
    return buildPricingSnapshot({
        source: 'db',
        lines: FALLBACK_PRICING.lines,
        procedures: DEFAULT_PROCEDURE_SETTINGS.map((row) =>
            row.procedure === procedure
                ? { ...row, discountPercent: percent }
                : row
        ),
        settings: null,
    })
}

const tummyTuck: Procedure = {
    title: 'Tummy Tuck Miami',
    slug: 'tummy-tuck-miami',
    description: 'A tummy tuck.',
    pricing: {
        includes: [],
        factors: [],
        options: [
            {
                label: 'Mini tummy tuck',
                line: 'mini',
                note: 'Below the navel',
            },
            { label: 'Full tummy tuck', line: 'full' },
            { label: 'Fleur-de-lis tummy tuck', line: 'fleur-de-lis' },
        ],
    },
}

describe('buildProcedureGraph offers', () => {
    it('prices BBL from the resolver, its "most patients" range a sentence, never a maxPrice', () => {
        const { service, pageUrl } = serviceOf(brazilianButtLiftBblMiami)
        // Serialized, so a change in key order fails too.
        expect(JSON.stringify(service.offers)).toBe(
            JSON.stringify(
                singleOffer(
                    pageUrl,
                    5500,
                    'Starts at $5,500; most patients pay between $5,500 and $10,000.'
                )
            )
        )
        expect(JSON.stringify(service.offers)).not.toContain('maxPrice')
    })

    it('publishes no description when the procedure has no range', () => {
        const { service, pageUrl } = serviceOf(liposuctionMiami)
        expect(service.offers).toEqual(singleOffer(pageUrl, 4000))
    })

    it('publishes one named Offer per option, priced from its sheet line', () => {
        const { service, pageUrl } = serviceOf(tummyTuck)
        const offer = (name: string, minPrice: number) => ({
            '@type': 'Offer',
            name,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: pageUrl,
            priceSpecification: {
                '@type': 'PriceSpecification',
                priceCurrency: 'USD',
                minPrice,
            },
        })
        expect(service.offers).toEqual([
            offer('Mini tummy tuck', 3000),
            offer('Full tummy tuck', 4500),
            offer('Fleur-de-lis tummy tuck', 10000),
        ])
    })

    it('offers the discounted price, with the plain-text form', () => {
        const { service, pageUrl } = serviceOf(
            brazilianButtLiftBblMiami,
            discounted('bbl', 20)
        )
        expect(service.offers).toEqual(
            singleOffer(
                pageUrl,
                4400,
                'Starts at $4,400 (20% off $5,500); most patients pay between $4,400 and $8,000 (20% off $5,500 and $10,000).'
            )
        )
    })

    it('leaves out an option whose line the resolver cannot price', () => {
        const { service } = serviceOf({
            ...tummyTuck,
            pricing: {
                ...tummyTuck.pricing!,
                options: [
                    { label: 'Mini tummy tuck', line: 'mini' },
                    { label: 'Gone', line: 'no-such-line' },
                ],
            },
        })
        expect(service.offers).toHaveLength(1)
    })

    it('falls back to the starting price when options is empty', () => {
        const { service, pageUrl } = serviceOf({
            ...tummyTuck,
            pricing: { ...tummyTuck.pricing!, options: [] },
        })
        expect(service.offers).toEqual(singleOffer(pageUrl, 3000))
    })

    it('publishes no offers without a price section', () => {
        const { service } = serviceOf({ ...tummyTuck, pricing: undefined })
        expect(service).not.toHaveProperty('offers')
    })

    it('publishes no offers when the procedure has no starting price', () => {
        const { service } = serviceOf(
            {
                ...tummyTuck,
                pricing: { ...tummyTuck.pricing!, options: undefined },
            },
            FALLBACK_PRICING,
            'mommy-makeover'
        )
        expect(service).not.toHaveProperty('offers')
    })
})

describe('procedure data carries no typed price', () => {
    it('names a price-sheet line for every tummy tuck option', () => {
        const lines = buildProcedurePrices(FALLBACK_PRICING, 'tummy-tuck').lines
        for (const option of tummyTuckMiami.pricing?.options ?? []) {
            expect(
                lines.some((line) => line.lineKey === option.line),
                option.line
            ).toBe(true)
        }
    })
})

describe('procedureSchema pricing.options', () => {
    it('keeps the options, so validation does not drop them', () => {
        const parsed = procedureSchema.parse(tummyTuck)
        expect(parsed.pricing?.options).toEqual(tummyTuck.pricing!.options)
    })

    it('rejects an option whose line is not a token-safe key', () => {
        const result = procedureSchema.safeParse({
            ...tummyTuck,
            pricing: {
                ...tummyTuck.pricing!,
                options: [{ label: 'Mini', line: 'Mini Tuck' }],
            },
        })
        expect(result.success).toBe(false)
    })
})
