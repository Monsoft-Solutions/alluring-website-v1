/**
 * Tests for the pricing math (issue #354): discount resolution, rounding,
 * formatting, the struck-through and plain-text forms, the BBL range and the
 * admin warnings.
 *
 * A discounted price is a discounted-fee advertisement (Fla. Stat. 456.062),
 * so the rounding rule and the "% off" text are pinned exactly.
 */
import { describe, expect, it } from 'vitest'

import {
    FALLBACK_PRICING,
    buildPricingSnapshot,
    buildPricingSnapshotFromRows,
    type PricingSnapshotInput,
} from '@workspace/shared/claims/prices'
import {
    applyDiscount,
    formatComboDiscountSentence,
    formatPriceMarkdown,
    formatPriceText,
    formatTypicalRangeMarkdown,
    formatTypicalRangeText,
    formatUsd,
    getDiscountStatement,
    getPriceDisplay,
    getPricingWarnings,
    getTypicalRange,
    hasActiveDiscount,
    normalizeDiscountPercent,
    resolveDiscountPercent,
    roundPrice,
    type PricingSnapshot,
} from '@workspace/shared/claims/pricing'

const STATEMENT = 'Statement text as counsel confirms it.'

/** The fallback sheet with some procedures discounted. */
function withDiscounts(
    discounts: Record<string, number | null>,
    {
        defaultPercent = 0,
        statement = null,
    }: { defaultPercent?: number; statement?: string | null } = {}
): PricingSnapshot {
    const procedures = { ...FALLBACK_PRICING.procedures }
    for (const [procedure, percent] of Object.entries(discounts)) {
        procedures[procedure] = {
            ...procedures[procedure]!,
            discountPercent: percent,
        }
    }
    return {
        ...FALLBACK_PRICING,
        procedures,
        defaultDiscountPercent: defaultPercent,
        discountStatement: statement,
    }
}

describe('roundPrice', () => {
    it('rounds down to whole dollars, never up', () => {
        expect(roundPrice(4400)).toBe(4400)
        expect(roundPrice(1162.5)).toBe(1162)
        expect(roundPrice(2975.99)).toBe(2975)
    })

    it('absorbs float noise before flooring', () => {
        expect(roundPrice(4184.999999999)).toBe(4185)
        expect(roundPrice(4185.0000001)).toBe(4185)
    })
})

describe('applyDiscount', () => {
    it('applies the percentage exactly on sheet prices', () => {
        expect(applyDiscount(5500, 20)).toBe(4400)
        expect(applyDiscount(10000, 20)).toBe(8000)
        expect(applyDiscount(3500, 15)).toBe(2975)
        expect(applyDiscount(500, 12)).toBe(440)
    })

    it('never gives less off than the advertised percentage (456.062)', () => {
        // The $50 rounding this replaced printed "$4,200 (7% off $4,500)",
        // a 6.67% reduction, and "$3,400 (3% off $3,500)", 2.86%.
        expect(applyDiscount(4500, 7)).toBe(4185)
        expect(applyDiscount(3500, 3)).toBe(3395)
        expect(applyDiscount(600, 7)).toBe(558)
        for (const list of [500, 600, 1250, 3500, 4500, 5500, 8800, 10800]) {
            for (let pct = 1; pct <= 90; pct += 1) {
                const final = applyDiscount(list, pct)
                expect(final).toBeLessThanOrEqual((list * (100 - pct)) / 100)
                expect((list * (100 - pct)) / 100 - final).toBeLessThan(1)
            }
        }
    })

    it('rounds a price that is not a whole hundred down', () => {
        // 1,250 × 0.93 = 1,162.50: down to 1,162, never up to 1,163.
        expect(applyDiscount(1250, 7)).toBe(1162)
    })

    it('returns the list price unrounded when there is no discount', () => {
        expect(applyDiscount(8800, 0)).toBe(8800)
        expect(applyDiscount(10800, 0)).toBe(10800)
    })

    it('clamps the percentage to 0–90', () => {
        expect(applyDiscount(4000, 95)).toBe(400)
        expect(applyDiscount(4000, -5)).toBe(4000)
        expect(applyDiscount(4000, Number.NaN)).toBe(4000)
    })
})

describe('normalizeDiscountPercent', () => {
    it('returns a whole number between 0 and 90', () => {
        expect(normalizeDiscountPercent(20)).toBe(20)
        expect(normalizeDiscountPercent('20')).toBe(20)
        expect(normalizeDiscountPercent(12.6)).toBe(13)
        expect(normalizeDiscountPercent(100)).toBe(90)
        expect(normalizeDiscountPercent(-3)).toBe(0)
        expect(normalizeDiscountPercent(null)).toBe(0)
        expect(normalizeDiscountPercent('abc')).toBe(0)
    })
})

describe('formatUsd', () => {
    it('formats whole dollars with US grouping', () => {
        expect(formatUsd(500)).toBe('$500')
        expect(formatUsd(5500)).toBe('$5,500')
        expect(formatUsd(15000)).toBe('$15,000')
        expect(formatUsd(1000000)).toBe('$1,000,000')
        expect(formatUsd(0)).toBe('$0')
    })
})

describe('resolveDiscountPercent', () => {
    it("uses the procedure's own discount when set", () => {
        const pricing = withDiscounts({ bbl: 20 }, { defaultPercent: 10 })
        expect(resolveDiscountPercent(pricing, 'bbl')).toBe(20)
    })

    it('inherits the site-wide default when the procedure has none', () => {
        const pricing = withDiscounts({ bbl: null }, { defaultPercent: 10 })
        expect(resolveDiscountPercent(pricing, 'bbl')).toBe(10)
        expect(resolveDiscountPercent(pricing, 'lipo')).toBe(10)
    })

    it('lets an explicit 0 switch the default off for one procedure', () => {
        const pricing = withDiscounts({ bbl: 0 }, { defaultPercent: 10 })
        expect(resolveDiscountPercent(pricing, 'bbl')).toBe(0)
    })

    it('uses the default for a procedure with no settings row', () => {
        const pricing = withDiscounts({}, { defaultPercent: 15 })
        expect(resolveDiscountPercent(pricing, 'not-a-procedure')).toBe(15)
    })

    it('is 0 everywhere on the fallback sheet', () => {
        expect(resolveDiscountPercent(FALLBACK_PRICING, 'bbl')).toBe(0)
        expect(hasActiveDiscount(FALLBACK_PRICING)).toBe(false)
    })
})

describe('getPriceDisplay', () => {
    it("returns the procedure's starting line without a key", () => {
        const display = getPriceDisplay(FALLBACK_PRICING, 'tummy-tuck')
        expect(display).toMatchObject({
            lineKey: 'mini',
            listUsd: 3000,
            finalUsd: 3000,
            final: '$3,000',
            discounted: false,
            percent: 0,
        })
    })

    it('returns a named line', () => {
        expect(
            getPriceDisplay(FALLBACK_PRICING, 'tummy-tuck', 'full')?.final
        ).toBe('$4,500')
    })

    it('builds the struck-through parts when discounted', () => {
        const display = getPriceDisplay(withDiscounts({ bbl: 20 }), 'bbl')
        expect(display).toMatchObject({
            list: '$5,500',
            final: '$4,400',
            percent: 20,
            discounted: true,
        })
    })

    it('applies even a small discount exactly, rounding down', () => {
        // 1% off $500 is $495: no $50 rounding takes it back to the list.
        const display = getPriceDisplay(
            withDiscounts({ lipo: 1 }),
            'lipo',
            'chin'
        )
        expect(display?.discounted).toBe(true)
        expect(display?.percent).toBe(1)
        expect(display?.final).toBe('$495')
    })

    it('prints the exact reduction in plain text (7% off $4,500)', () => {
        const display = getPriceDisplay(
            withDiscounts({ 'tummy-tuck': 7 }),
            'tummy-tuck',
            'full'
        )
        expect(display && formatPriceText(display)).toBe(
            '$4,185 (7% off $4,500)'
        )
    })

    it('carries the unit suffix', () => {
        expect(
            getPriceDisplay(
                FALLBACK_PRICING,
                'breast-augmentation',
                'capsulectomy'
            )?.suffix
        ).toBe('per breast')
    })

    it('publishes nothing for a procedure without a starting line', () => {
        expect(getPriceDisplay(FALLBACK_PRICING, 'mommy-makeover')).toBeNull()
    })

    it('does not fall back to another line when the starting line is inactive', () => {
        const pricing: PricingSnapshot = {
            ...FALLBACK_PRICING,
            lines: FALLBACK_PRICING.lines.map((line) =>
                line.procedure === 'tummy-tuck' && line.key === 'mini'
                    ? { ...line, active: false }
                    : line
            ),
        }
        expect(getPriceDisplay(pricing, 'tummy-tuck')).toBeNull()
        expect(getPriceDisplay(pricing, 'tummy-tuck', 'mini')).toBeNull()
        expect(getPriceDisplay(pricing, 'tummy-tuck', 'full')?.final).toBe(
            '$4,500'
        )
    })
})

describe('formatPriceText and formatPriceMarkdown', () => {
    const discounted = withDiscounts({ bbl: 20, 'breast-augmentation': 20 })

    it('gives the list price alone without a discount', () => {
        const display = getPriceDisplay(FALLBACK_PRICING, 'bbl')!
        expect(formatPriceText(display)).toBe('$5,500')
        expect(formatPriceMarkdown(display)).toBe('$5,500')
    })

    it('gives "$4,400 (20% off $5,500)" in plain text', () => {
        expect(formatPriceText(getPriceDisplay(discounted, 'bbl')!)).toBe(
            '$4,400 (20% off $5,500)'
        )
    })

    it('strikes the list price through in Markdown', () => {
        expect(formatPriceMarkdown(getPriceDisplay(discounted, 'bbl')!)).toBe(
            '~~$5,500~~ $4,400'
        )
    })

    it('keeps the unit after the figure', () => {
        const display = getPriceDisplay(
            discounted,
            'breast-augmentation',
            'capsulectomy'
        )!
        expect(formatPriceText(display)).toBe('$400 per breast (20% off $500)')
        expect(formatPriceMarkdown(display)).toBe('~~$500~~ $400 per breast')
    })
})

describe('getTypicalRange', () => {
    it('gives the BBL range from the starting price to $10,000', () => {
        const range = getTypicalRange(FALLBACK_PRICING, 'bbl')!
        expect(formatTypicalRangeText(range)).toBe(
            'most patients pay between $5,500 and $10,000'
        )
        expect(formatTypicalRangeMarkdown(range)).toBe(
            'most patients pay between $5,500 and $10,000'
        )
    })

    it('discounts both ends alike', () => {
        const range = getTypicalRange(withDiscounts({ bbl: 20 }), 'bbl')!
        expect(formatTypicalRangeText(range)).toBe(
            'most patients pay between $4,400 and $8,000 (20% off $5,500 and $10,000)'
        )
        expect(formatTypicalRangeMarkdown(range)).toBe(
            'most patients pay between ~~$5,500~~ $4,400 and ~~$10,000~~ $8,000'
        )
    })

    it('publishes no range for any other procedure', () => {
        expect(getTypicalRange(FALLBACK_PRICING, 'lipo')).toBeNull()

        const input: PricingSnapshotInput = {
            source: 'db',
            lines: FALLBACK_PRICING.lines,
            procedures: [
                {
                    procedure: 'lipo',
                    startingLineKey: 'lipo360',
                    discountPercent: null,
                    discountLabel: null,
                    typicalMaxUsd: 9000,
                },
            ],
            settings: null,
        }
        expect(getTypicalRange(buildPricingSnapshot(input), 'lipo')).toBeNull()
    })
})

describe('formatComboDiscountSentence', () => {
    it('states the fixed amounts, never a percentage', () => {
        expect(formatComboDiscountSentence(FALLBACK_PRICING)).toBe(
            'When procedures are combined in one surgery, $500 comes off the total for two procedures and $1,000 for three.'
        )
    })
})

describe('the 456.062 statement', () => {
    it('is shown only while a discount is on', () => {
        expect(
            getDiscountStatement({
                ...FALLBACK_PRICING,
                discountStatement: STATEMENT,
            })
        ).toBeNull()
        expect(
            getDiscountStatement(
                withDiscounts({ bbl: 20 }, { statement: STATEMENT })
            )
        ).toBe(STATEMENT)
    })

    it('is warned about when a discount is on without it', () => {
        expect(
            getPricingWarnings(withDiscounts({ bbl: 20 })).map((w) => w.code)
        ).toEqual(['discount-without-statement'])
        expect(
            getPricingWarnings(withDiscounts({}, { defaultPercent: 10 })).map(
                (w) => w.code
            )
        ).toEqual(['discount-without-statement'])
        expect(
            getPricingWarnings(
                withDiscounts({ bbl: 20 }, { statement: STATEMENT })
            )
        ).toEqual([])
    })
})

describe('getPricingWarnings', () => {
    it('has nothing to say about the fallback sheet', () => {
        expect(getPricingWarnings(FALLBACK_PRICING)).toEqual([])
    })

    it('flags the two male breast reduction lines when an edit splits them', () => {
        const pricing: PricingSnapshot = {
            ...FALLBACK_PRICING,
            lines: FALLBACK_PRICING.lines.map((line) =>
                line.procedure === 'mens' && line.key === 'breast-reduction'
                    ? { ...line, usd: 6500 }
                    : line
            ),
        }
        expect(getPricingWarnings(pricing)).toEqual([
            expect.objectContaining({ code: 'mirrored-lines-differ' }),
        ])
    })

    it('flags a starting line that is missing or an add-on', () => {
        const pricing: PricingSnapshot = {
            ...FALLBACK_PRICING,
            procedures: {
                ...FALLBACK_PRICING.procedures,
                'tummy-tuck': {
                    ...FALLBACK_PRICING.procedures['tummy-tuck']!,
                    startingLineKey: 'gone',
                },
                lipo: {
                    ...FALLBACK_PRICING.procedures.lipo!,
                    startingLineKey: 'chin',
                },
            },
        }
        expect(
            getPricingWarnings(pricing).map((w) => [w.code, w.procedure])
        ).toEqual([
            ['starting-line-add-on', 'lipo'],
            ['starting-line-missing', 'tummy-tuck'],
        ])
    })
})

describe('buildPricingSnapshotFromRows', () => {
    const line = {
        procedureSlug: 'bbl',
        lineKey: 'lipo360-bbl',
        label: 'Lipo 360 + BBL',
        usd: 6000,
        unit: 'each',
        isAddOn: false,
        sortOrder: 10,
        isActive: true,
        updatedAt: new Date('2026-10-20T10:00:00Z'),
    }

    it('falls back to the sheet when there are no price lines', () => {
        expect(
            buildPricingSnapshotFromRows({
                lines: [],
                procedures: [],
                settings: null,
            })
        ).toBe(FALLBACK_PRICING)
    })

    it('maps rows and fills a missing settings row with its defaults', () => {
        const pricing = buildPricingSnapshotFromRows({
            lines: [line, { ...line, lineKey: 'odd', unit: 'per-arm' }],
            procedures: [],
            settings: {
                defaultDiscountPercent: 0,
                discountStatement: '  ',
                comboDiscountTwoUsd: 600,
                comboDiscountThreeUsd: 1200,
                updatedAt: new Date('2026-10-21T10:00:00Z'),
            },
        })

        expect(pricing.source).toBe('db')
        expect(getPriceDisplay(pricing, 'bbl')?.final).toBe('$6,000')
        expect(pricing.lines.find((l) => l.key === 'odd')?.unit).toBe('each')
        expect(pricing.procedures.bbl?.typicalMaxUsd).toBe(10000)
        expect(pricing.discountStatement).toBeNull()
        expect(pricing.comboDiscounts).toEqual({ two: 600, three: 1200 })
        expect(pricing.updatedAt).toBe('2026-10-21T10:00:00.000Z')
    })

    it('keeps a procedure row that publishes no starting price', () => {
        const pricing = buildPricingSnapshotFromRows({
            lines: [line],
            procedures: [
                {
                    procedureSlug: 'bbl',
                    startingLineKey: null,
                    discountPercent: 120,
                    discountLabel: ' ',
                    typicalMaxUsd: 10000,
                },
            ],
            settings: null,
        })
        expect(getPriceDisplay(pricing, 'bbl')).toBeNull()
        expect(pricing.procedures.bbl?.discountPercent).toBe(90)
        expect(pricing.procedures.bbl?.discountLabel).toBeNull()
        expect(pricing.comboDiscounts).toEqual({ two: 500, three: 1000 })
    })
})
