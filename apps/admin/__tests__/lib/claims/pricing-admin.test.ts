/**
 * The admin Pricing page (issue #354): the form model, the rules a save
 * must pass, the live preview and warnings, and the server action that
 * writes only what changed and revalidates the web app's `pricing` tag.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    FALLBACK_PRICING,
    PRICE_SHEET,
    DEFAULT_PROCEDURE_SETTINGS,
    DEFAULT_COMBO_DISCOUNTS,
    type PricingRows,
} from '@workspace/shared/claims/prices'
import {
    getPriceDisplay,
    getPricingWarnings,
} from '@workspace/shared/claims/pricing'

import {
    toPricingFormValues,
    toPricingSnapshot,
    validatePricingForm,
    type PricingFormValues,
} from '@/lib/utils/pricing-form.util'

/** The pricing tables as migration 0060 seeds them. */
function seededRows(): PricingRows {
    return {
        lines: PRICE_SHEET.map((line) => ({
            procedureSlug: line.procedure,
            lineKey: line.key,
            label: line.label,
            usd: line.usd,
            unit: line.unit,
            isAddOn: line.addOn,
            sortOrder: line.sort,
            isActive: line.active,
        })),
        procedures: DEFAULT_PROCEDURE_SETTINGS.map((row) => ({
            procedureSlug: row.procedure,
            startingLineKey: row.startingLineKey,
            discountPercent: row.discountPercent,
            discountLabel: row.discountLabel,
            typicalMaxUsd: row.typicalMaxUsd,
        })),
        settings: {
            defaultDiscountPercent: 0,
            discountStatement: null,
            comboDiscountTwoUsd: DEFAULT_COMBO_DISCOUNTS.two,
            comboDiscountThreeUsd: DEFAULT_COMBO_DISCOUNTS.three,
        },
    }
}

function edit(
    values: PricingFormValues,
    procedure: string,
    patch: Partial<PricingFormValues['procedures'][number]>
): PricingFormValues {
    return {
        ...values,
        procedures: values.procedures.map((row) =>
            row.procedure === procedure ? { ...row, ...patch } : row
        ),
    }
}

function editLine(
    values: PricingFormValues,
    procedure: string,
    key: string,
    patch: Partial<PricingFormValues['procedures'][number]['lines'][number]>
): PricingFormValues {
    return edit(values, procedure, {
        lines: values.procedures
            .find((row) => row.procedure === procedure)!
            .lines.map((line) =>
                line.key === key ? { ...line, ...patch } : line
            ),
    })
}

const paths = (values: PricingFormValues) =>
    validatePricingForm(values).map((error) => error.path)

describe('toPricingFormValues', () => {
    it('lists every procedure in page order, with every line', () => {
        const values = toPricingFormValues(seededRows())
        expect(values.procedures[0]?.procedure).toBe('bbl')
        expect(
            values.procedures.reduce((sum, row) => sum + row.lines.length, 0)
        ).toBe(PRICE_SHEET.length)
        expect(
            values.procedures.find((row) => row.procedure === 'mommy-makeover')
        ).toMatchObject({ startingLineKey: null, lines: [] })
    })

    it('round-trips to the snapshot the site would publish', () => {
        expect(toPricingSnapshot(toPricingFormValues(seededRows()))).toEqual({
            ...FALLBACK_PRICING,
            source: 'db',
        })
    })

    it('shows the fallback sheet when the tables are empty', () => {
        const values = toPricingFormValues({
            lines: [],
            procedures: [],
            settings: null,
        })
        expect(
            values.procedures.find((row) => row.procedure === 'bbl')?.lines
        ).toHaveLength(1)
    })
})

describe('validatePricingForm', () => {
    const base = toPricingFormValues(seededRows())

    it('accepts the seeded sheet', () => {
        expect(validatePricingForm(base)).toEqual([])
    })

    it('takes discounts from 0 to 90 in whole numbers, or empty to inherit', () => {
        expect(paths(edit(base, 'bbl', { discountPercent: 20 }))).toEqual([])
        expect(paths(edit(base, 'bbl', { discountPercent: 0 }))).toEqual([])
        expect(paths(edit(base, 'bbl', { discountPercent: null }))).toEqual([])
        for (const bad of [91, -5, 12.5, Number.NaN]) {
            expect(paths(edit(base, 'bbl', { discountPercent: bad }))).toEqual([
                'procedures.bbl.discountPercent',
            ])
        }
        expect(paths({ ...base, defaultDiscountPercent: 95 })).toEqual([
            'defaultDiscountPercent',
        ])
    })

    it('takes list prices as positive whole dollars only', () => {
        for (const bad of [0, -100, 4999.5, Number.NaN]) {
            expect(
                paths(editLine(base, 'tummy-tuck', 'mini', { usd: bad }))
            ).toEqual(['procedures.tummy-tuck.lines.mini.usd'])
        }
        expect(
            paths(editLine(base, 'tummy-tuck', 'mini', { usd: 3200 }))
        ).toEqual([])
        expect(paths({ ...base, comboDiscountTwoUsd: -1 })).toEqual([
            'comboDiscountTwoUsd',
        ])
    })

    it('keeps line names printable as text', () => {
        expect(
            paths(editLine(base, 'bbl', 'lipo360-bbl', { label: ' ' }))
        ).toEqual(['procedures.bbl.lines.lipo360-bbl.label'])
        expect(
            paths(
                editLine(base, 'bbl', 'lipo360-bbl', {
                    label: 'BBL [[price:bbl]]',
                })
            )
        ).toEqual(['procedures.bbl.lines.lipo360-bbl.label'])
    })

    it('needs an active standard line as the starting line', () => {
        expect(paths(edit(base, 'lipo', { startingLineKey: 'chin' }))).toEqual([
            'procedures.lipo.startingLineKey',
        ])
        expect(
            paths(edit(base, 'lipo', { startingLineKey: 'no-such-line' }))
        ).toEqual(['procedures.lipo.startingLineKey'])
        expect(
            paths(editLine(base, 'lipo', 'lipo360', { active: false }))
        ).toEqual(['procedures.lipo.startingLineKey'])
        expect(paths(edit(base, 'lipo', { startingLineKey: null }))).toEqual([])
    })

    it('publishes a "most patients" range for BBL only, above its start', () => {
        expect(
            paths(edit(base, 'tummy-tuck', { typicalMaxUsd: 9000 }))
        ).toEqual(['procedures.tummy-tuck.typicalMaxUsd'])
        expect(paths(edit(base, 'bbl', { typicalMaxUsd: 5000 }))).toEqual([
            'procedures.bbl.typicalMaxUsd',
        ])
        expect(paths(edit(base, 'bbl', { typicalMaxUsd: 12000 }))).toEqual([])
    })
})

describe('the live preview and warnings', () => {
    const base = toPricingFormValues(seededRows())

    it('previews a discount as the website prints it', () => {
        const snapshot = toPricingSnapshot(
            edit(base, 'bbl', { discountPercent: 20 })
        )
        expect(getPriceDisplay(snapshot, 'bbl')).toMatchObject({
            list: '$5,500',
            final: '$4,400',
            discounted: true,
        })
    })

    it('applies the site-wide default, unless a procedure sets 0', () => {
        const snapshot = toPricingSnapshot(
            edit({ ...base, defaultDiscountPercent: 10 }, 'lipo', {
                discountPercent: 0,
            })
        )
        expect(getPriceDisplay(snapshot, 'bbl')?.final).toBe('$4,950')
        expect(getPriceDisplay(snapshot, 'lipo')?.discounted).toBe(false)
    })

    it('warns while a discount is on without the 456.062 statement', () => {
        const discounted = edit(base, 'bbl', { discountPercent: 20 })
        expect(
            getPricingWarnings(toPricingSnapshot(discounted)).map(
                (warning) => warning.code
            )
        ).toEqual(['discount-without-statement'])
        expect(
            getPricingWarnings(
                toPricingSnapshot({
                    ...discounted,
                    discountStatement: 'The statement.',
                })
            )
        ).toEqual([])
    })
})

// ── The server action ───────────────────────────────────────────────────

const action = vi.hoisted(() => ({
    rows: null as PricingRows | null,
    /** Live posts the token check reads, as the query selects them. */
    posts: [] as Record<string, unknown>[],
    writes: [] as { op: string; table: unknown; values: unknown }[],
    revalidated: [] as string[][],
    authorized: true,
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
// Column stand-ins: the action only hands them to the (mocked) query builder.
vi.mock('@workspace/db/schema/pricing', () => ({
    priceLine: { table: 'price_line' },
    procedurePricing: { table: 'procedure_pricing' },
    pricingSettings: { table: 'pricing_settings' },
}))
vi.mock('@/lib/utils/auth.util', () => {
    class UnauthorizedError extends Error {}
    return {
        UnauthorizedError,
        requireAuth: () =>
            action.authorized
                ? Promise.resolve()
                : Promise.reject(new UnauthorizedError()),
    }
})
vi.mock('@/lib/utils/revalidate-web.util', () => ({
    revalidateWebAppCache: (tags: string[]) => {
        action.revalidated.push(tags)
        return Promise.resolve()
    },
}))
vi.mock('@/lib/queries/pricing.query', () => ({
    getPricingRows: () => Promise.resolve({ ...action.rows!, notes: {} }),
}))
vi.mock('@workspace/db/client', () => {
    const tx = {
        update: (table: unknown) => ({
            set: (values: unknown) => ({
                where: () => {
                    action.writes.push({ op: 'update', table, values })
                    return Promise.resolve()
                },
            }),
        }),
        insert: (table: unknown) => ({
            values: (values: unknown) => ({
                onConflictDoUpdate: () => {
                    action.writes.push({ op: 'upsert', table, values })
                    return Promise.resolve()
                },
            }),
        }),
    }
    return {
        db: {
            transaction: async (run: (t: typeof tx) => Promise<void>) =>
                run(tx),
            // The token check's two reads: live posts (`.where`) and the
            // chat config (`.limit`).
            select: () => ({
                from: () => ({
                    where: () => Promise.resolve(action.posts),
                    limit: () => Promise.resolve([]),
                }),
            }),
        },
    }
})

const { savePricing } = await import('@/lib/actions/pricing.action')

describe('savePricing', () => {
    beforeEach(() => {
        action.rows = seededRows()
        action.posts = []
        action.writes = []
        action.revalidated = []
        action.authorized = true
    })

    it('rejects a value outside the rules, writing nothing', async () => {
        const values = edit(toPricingFormValues(seededRows()), 'bbl', {
            discountPercent: 95,
        })
        const result = await savePricing(values)
        expect(result).toMatchObject({
            success: false,
            errors: [{ path: 'procedures.bbl.discountPercent' }],
        })
        expect(action.writes).toEqual([])
        expect(action.revalidated).toEqual([])
    })

    it('rejects malformed input and a line the database does not have', async () => {
        expect(await savePricing({ procedures: 'nope' })).toMatchObject({
            success: false,
            error: 'The form sent malformed data.',
        })

        const values = toPricingFormValues(seededRows())
        values.procedures[0]!.lines.push({
            key: 'new-line',
            label: 'New',
            usd: 100,
            unit: 'each',
            addOn: false,
            sort: 999,
            active: true,
        })
        const result = await savePricing(values)
        expect(result.success).toBe(false)
        expect(!result.success && result.error).toContain('bbl:new-line')
        expect(action.writes).toEqual([])
    })

    it('refuses a change that would empty a token a live post uses', async () => {
        action.posts = [
            {
                slug: 'mini-tummy-tuck-cost',
                title: 'Mini tummy tuck cost',
                content: 'A mini tummy tuck is [[price:tummy-tuck:mini]].',
                metaTitle: null,
                metaDescription: null,
                excerpt: null,
                quickAnswer: null,
                faqs: null,
            },
        ]
        const values = toPricingFormValues(seededRows())
        const tummyTuck = values.procedures.find(
            (procedure) => procedure.procedure === 'tummy-tuck'
        )!
        tummyTuck.lines = tummyTuck.lines.map((line) =>
            line.key === 'mini' ? { ...line, active: false } : line
        )
        tummyTuck.startingLineKey = 'full'

        const result = await savePricing(values)
        expect(result.success).toBe(false)
        expect(!result.success && result.error).toContain(
            'post mini-tummy-tuck-cost: [[price:tummy-tuck:mini]]'
        )
        expect(action.writes).toEqual([])
    })

    it('refuses to edit before migration 0060 has seeded the tables', async () => {
        action.rows = { lines: [], procedures: [], settings: null }
        const result = await savePricing(toPricingFormValues(seededRows()))
        expect(!result.success && result.error).toContain('migration 0060')
    })

    it('writes only what changed and revalidates the pricing tag', async () => {
        const values = editLine(
            edit(toPricingFormValues(seededRows()), 'bbl', {
                discountPercent: 20,
            }),
            'tummy-tuck',
            'mini',
            { usd: 3200 }
        )
        const result = await savePricing(values)

        expect(result.success).toBe(true)
        expect(action.writes.map((write) => write.op)).toEqual([
            'upsert',
            'update',
        ])
        expect(action.writes[0]?.values).toMatchObject({
            procedureSlug: 'bbl',
            discountPercent: 20,
        })
        expect(action.writes[1]?.values).toMatchObject({ usd: 3200 })
        expect(action.revalidated).toEqual([['pricing']])
    })

    it('saves a discount without the statement, and reports the warning', async () => {
        action.rows = {
            ...seededRows(),
            procedures: seededRows().procedures.map((row) =>
                row.procedureSlug === 'bbl'
                    ? { ...row, discountPercent: 20 }
                    : row
            ),
        }
        const result = await savePricing(toPricingFormValues(action.rows))
        expect(result).toMatchObject({
            success: true,
            changed: 0,
            warnings: [{ code: 'discount-without-statement' }],
        })
        // Nothing changed, so the site is not revalidated.
        expect(action.revalidated).toEqual([])
    })

    it('refuses without a session', async () => {
        action.authorized = false
        expect(await savePricing(toPricingFormValues(seededRows()))).toEqual({
            success: false,
            error: 'Unauthorized',
        })
    })
})
