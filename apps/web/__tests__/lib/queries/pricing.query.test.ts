/**
 * The pricing resolver (issue #354): it reads the pricing tables, falls back
 * to the 2026-09-15 sheet when they are empty or the query fails, and is what
 * the claim-token helper resolves against.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'

const state = vi.hoisted(() => ({
    rows: new Map<unknown, unknown[]>(),
    fail: false,
    tables: {
        priceLine: { table: 'price_line' },
        procedurePricing: { table: 'procedure_pricing' },
        pricingSettings: { table: 'pricing_settings', id: 'id' },
    },
}))

vi.mock('server-only', () => ({}))
vi.mock('next/cache', () => ({
    unstable_cache: (fn: () => unknown) => fn,
}))
vi.mock('@workspace/db/schema/pricing', () => state.tables)
vi.mock('@workspace/db/client', () => {
    const read = (table: unknown) =>
        state.fail
            ? Promise.reject(new Error('connection refused'))
            : Promise.resolve(state.rows.get(table) ?? [])
    // Lazy, like a Drizzle query: nothing runs until it is awaited.
    return {
        db: {
            select: () => ({
                from: (table: unknown) => ({
                    then: (
                        resolve: (rows: unknown[]) => unknown,
                        reject: (error: unknown) => unknown
                    ) => read(table).then(resolve, reject),
                    where: () => ({ limit: () => read(table) }),
                }),
            }),
        },
    }
})

const {
    getDiscountStatementText,
    getLinePrice,
    getPricing,
    getProcedurePrices,
    getStartingPrice,
} = await import('@/lib/queries/pricing.query')
const {
    resolveClaims,
    resolveClaimsIn,
    resolvePostClaims,
    resolvePostListClaims,
    resolveProcedureClaims,
} = await import('@/lib/claims/resolve-claims.server')

const STATEMENT = 'Statement text as counsel confirms it.'

function seed({
    bblDiscount = null,
    statement = null,
}: { bblDiscount?: number | null; statement?: string | null } = {}) {
    state.rows.set(
        state.tables.priceLine,
        FALLBACK_PRICING.lines.map((line) => ({
            procedureSlug: line.procedure,
            lineKey: line.key,
            label: line.label,
            usd: line.usd,
            unit: line.unit,
            isAddOn: line.addOn,
            sortOrder: line.sort,
            isActive: line.active,
            updatedAt: new Date('2026-10-25T12:00:00Z'),
        }))
    )
    state.rows.set(state.tables.procedurePricing, [
        {
            procedureSlug: 'bbl',
            startingLineKey: 'lipo360-bbl',
            discountPercent: bblDiscount,
            discountLabel: null,
            typicalMaxUsd: 10000,
            updatedAt: new Date('2026-10-25T12:30:00Z'),
        },
    ])
    state.rows.set(state.tables.pricingSettings, [
        {
            defaultDiscountPercent: 0,
            discountStatement: statement,
            comboDiscountTwoUsd: 500,
            comboDiscountThreeUsd: 1000,
            updatedAt: new Date('2026-10-25T11:00:00Z'),
        },
    ])
}

beforeEach(() => {
    state.rows.clear()
    state.fail = false
})

afterEach(() => vi.restoreAllMocks())

describe('getPricing', () => {
    it('reads the pricing tables', async () => {
        seed({ bblDiscount: 20, statement: STATEMENT })
        const pricing = await getPricing()
        expect(pricing.source).toBe('db')
        expect(pricing.lines).toHaveLength(FALLBACK_PRICING.lines.length)
        expect(pricing.procedures.bbl?.discountPercent).toBe(20)
        expect(pricing.discountStatement).toBe(STATEMENT)
        expect(pricing.updatedAt).toBe('2026-10-25T12:30:00.000Z')
    })

    it('falls back to the sheet when the tables are empty', async () => {
        expect(await getPricing()).toBe(FALLBACK_PRICING)
    })

    it('falls back to the sheet when the query fails, and says so', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        state.fail = true
        expect(await getPricing()).toBe(FALLBACK_PRICING)
        expect(error).toHaveBeenCalledTimes(1)
        expect(String(error.mock.calls[0]?.[0])).toContain('[pricing]')
    })
})

describe('price helpers', () => {
    it('resolve a claim key or a page slug', async () => {
        seed({ bblDiscount: 20 })
        const byKey = await getStartingPrice('bbl')
        const bySlug = await getStartingPrice('brazilian-butt-lift-bbl-miami')
        expect(byKey).toEqual(bySlug)
        expect(byKey).toMatchObject({
            list: '$5,500',
            final: '$4,400',
            percent: 20,
            discounted: true,
        })
        expect((await getLinePrice('tummy-tuck-miami', 'full'))?.final).toBe(
            '$4,500'
        )
        expect(await getStartingPrice('mommy-makeover')).toBeNull()
    })

    it('give a procedure page its lines, range and statement', async () => {
        seed({ bblDiscount: 20, statement: STATEMENT })
        const bbl = await getProcedurePrices('bbl')
        expect(bbl.starting?.final).toBe('$4,400')
        expect(bbl.lines.map((line) => line.lineKey)).toEqual(['lipo360-bbl'])
        expect(bbl.range?.max.final).toBe('$8,000')
        expect(bbl.discountStatement).toBe(STATEMENT)

        const lipo = await getProcedurePrices('liposuction-miami')
        expect(lipo.starting?.final).toBe('$4,000')
        expect(lipo.lines.length).toBeGreaterThan(10)
        expect(lipo.range).toBeNull()
        expect(lipo.discountStatement).toBeNull()

        expect(await getDiscountStatementText()).toBe(STATEMENT)
    })
})

describe('resolveClaims', () => {
    it('resolves tokens against the live pricing', async () => {
        seed({ bblDiscount: 20 })
        expect(
            await resolveClaims('From [[price:bbl]].', 'markdown', 'post-a')
        ).toBe('From ~~$5,500~~ $4,400.')
        expect(await resolveClaims('From [[price:bbl]].', 'text')).toBe(
            'From $4,400 (20% off $5,500).'
        )
    })

    it('renders an unknown token as nothing and logs where it was', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(await resolveClaims('a [[nope]] b', 'text', 'post-b')).toBe(
            'a b'
        )
        expect(String(error.mock.calls[0]?.[0])).toContain('in post-b')
    })

    it('resolves every string of an FAQ list', async () => {
        const faqs = await resolveClaimsIn(
            [{ question: 'Price?', answer: 'From [[price:lipo]].' }],
            'text'
        )
        expect(faqs).toEqual([{ question: 'Price?', answer: 'From $4,000.' }])
    })
})

describe('resolvePostClaims and resolvePostListClaims', () => {
    it('resolve a post against the live pricing, with the statement', async () => {
        seed({ bblDiscount: 20, statement: STATEMENT })
        const post = await resolvePostClaims({
            slug: 'bbl-cost',
            title: 'BBL cost',
            content: 'From [[price:bbl]].',
            metaDescription: 'From [[price:bbl]].',
            excerpt: null,
        })
        expect(post.content).toBe('From ~~$5,500~~ $4,400.')
        expect(post.metaDescription).toBe('From $4,400 (20% off $5,500).')
        expect(post.discountStatement).toBe(STATEMENT)
    })

    it('skip the pricing read when no card has a token', async () => {
        const cards = [{ slug: 'a', title: 'Plain', excerpt: null }]
        expect(await resolvePostListClaims(cards)).toBe(cards)
    })

    it('log a card token that resolves to nothing with its post', async () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        const [card] = await resolvePostListClaims([
            { slug: 'card-a', title: 'From [[price:nope]]', excerpt: null },
        ])
        expect(card?.title).toBe('From')
        expect(String(error.mock.calls[0]?.[0])).toContain('post card-a title')
    })
})

describe('resolveProcedureClaims', () => {
    it('resolves the body as Markdown and every other string as text', async () => {
        seed({ bblDiscount: 20 })
        const procedure = await resolveProcedureClaims({
            slug: 'brazilian-butt-lift-bbl-miami',
            content: 'A BBL starts at [[price:bbl]].',
            metaDescription: 'BBL from [[price:bbl]].',
            faqs: [{ question: 'Cost?', answer: '[[price-range:bbl]].' }],
            quickStats: { duration: '3 to 5 hours' },
        })
        expect(procedure.content).toBe('A BBL starts at ~~$5,500~~ $4,400.')
        expect(procedure.metaDescription).toBe(
            'BBL from $4,400 (20% off $5,500).'
        )
        expect(procedure.faqs[0]?.answer).toBe(
            'most patients pay between $4,400 and $8,000 (20% off $5,500 and $10,000).'
        )
        expect(procedure.quickStats).toEqual({ duration: '3 to 5 hours' })
    })

    it('leaves a procedure without a body without one', async () => {
        const procedure = await resolveProcedureClaims({ slug: 'x' })
        expect(procedure).toEqual({ slug: 'x' })
    })
})
