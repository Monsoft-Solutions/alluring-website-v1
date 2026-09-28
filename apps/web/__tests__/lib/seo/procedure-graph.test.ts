import { describe, expect, it } from 'vitest'

import { brazilianButtLiftBblMiami } from '@/lib/data/procedures/brazilian-butt-lift-bbl-miami.data'
import { liposuctionMiami } from '@/lib/data/procedures/liposuction-miami.data'
import { buildProcedureGraph } from '@/lib/seo/procedure-graph.util'
import { procedureSchema, type Procedure } from '@/lib/types/procedure.type'

const SITE = 'https://www.alluringplasticsurgery.com'

function serviceOf(procedure: Procedure) {
    const pageUrl = `${SITE}/procedures/${procedure.slug}`
    const graph = buildProcedureGraph({
        procedure,
        pageUrl,
        siteUrl: SITE,
        breadcrumbs: [],
    })
    const service = graph.find((node) => node['@type'] === 'Service')
    if (!service) throw new Error('no Service node')
    return { service, pageUrl }
}

/** The single Offer as the graph published it before `pricing.options`. */
function legacyOffer(pageUrl: string, startingAt: number, upTo?: number) {
    return {
        '@type': 'Offer',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: pageUrl,
        priceSpecification: {
            '@type': 'PriceSpecification',
            priceCurrency: 'USD',
            minPrice: startingAt,
            ...(upTo && { maxPrice: upTo }),
        },
    }
}

const tummyTuck: Procedure = {
    title: 'Tummy Tuck Miami',
    slug: 'tummy-tuck-miami',
    description: 'A tummy tuck.',
    pricing: {
        startingAt: 3000,
        includes: [],
        factors: [],
        options: [
            {
                label: 'Mini tummy tuck',
                startingAt: 3000,
                note: 'Below the navel',
            },
            { label: 'Full tummy tuck', startingAt: 4500 },
            {
                label: 'Fleur-de-lis tummy tuck',
                startingAt: 10000,
                upTo: 12000,
            },
        ],
    },
}

describe('buildProcedureGraph offers', () => {
    it('keeps the single Offer, key for key, when there are no options', () => {
        for (const procedure of [brazilianButtLiftBblMiami, liposuctionMiami]) {
            const { service, pageUrl } = serviceOf(procedure)
            const pricing = procedure.pricing!
            expect(pricing.options).toBeUndefined()
            // Serialized, so a change in key order fails too.
            expect(JSON.stringify(service.offers)).toBe(
                JSON.stringify(
                    legacyOffer(pageUrl, pricing.startingAt, pricing.upTo)
                )
            )
        }
    })

    it('omits maxPrice when the single price has no range', () => {
        const { service, pageUrl } = serviceOf({
            ...tummyTuck,
            pricing: { ...tummyTuck.pricing!, options: undefined },
        })
        expect(service.offers).toEqual(legacyOffer(pageUrl, 3000))
    })

    it('publishes one named Offer per option, a range only where upTo is set', () => {
        const { service, pageUrl } = serviceOf(tummyTuck)
        expect(service.offers).toEqual([
            {
                '@type': 'Offer',
                name: 'Mini tummy tuck',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: pageUrl,
                priceSpecification: {
                    '@type': 'PriceSpecification',
                    priceCurrency: 'USD',
                    minPrice: 3000,
                },
            },
            {
                '@type': 'Offer',
                name: 'Full tummy tuck',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: pageUrl,
                priceSpecification: {
                    '@type': 'PriceSpecification',
                    priceCurrency: 'USD',
                    minPrice: 4500,
                },
            },
            {
                '@type': 'Offer',
                name: 'Fleur-de-lis tummy tuck',
                priceCurrency: 'USD',
                availability: 'https://schema.org/InStock',
                url: pageUrl,
                priceSpecification: {
                    '@type': 'PriceSpecification',
                    priceCurrency: 'USD',
                    minPrice: 10000,
                    maxPrice: 12000,
                },
            },
        ])
    })

    it('falls back to the single Offer when options is empty', () => {
        const { service, pageUrl } = serviceOf({
            ...tummyTuck,
            pricing: { ...tummyTuck.pricing!, options: [] },
        })
        expect(service.offers).toEqual(legacyOffer(pageUrl, 3000))
    })

    it('publishes no offers without pricing', () => {
        const { service } = serviceOf({ ...tummyTuck, pricing: undefined })
        expect(service).not.toHaveProperty('offers')
    })
})

describe('procedureSchema pricing.options', () => {
    it('keeps the options, so validation does not drop them', () => {
        const parsed = procedureSchema.parse(tummyTuck)
        expect(parsed.pricing?.options).toEqual(tummyTuck.pricing!.options)
    })

    it('rejects an option whose upTo is below its startingAt', () => {
        const result = procedureSchema.safeParse({
            ...tummyTuck,
            pricing: {
                ...tummyTuck.pricing!,
                options: [{ label: 'Mini', startingAt: 3000, upTo: 2000 }],
            },
        })
        expect(result.success).toBe(false)
    })
})
