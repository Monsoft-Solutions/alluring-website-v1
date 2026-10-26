// @vitest-environment node
/**
 * The code fallback against the practice's price sheet (issue #354).
 *
 * `PRICE_SHEET` is what the site publishes when the pricing tables are empty
 * or unreachable, and what migration 0060 seeded them with. It must match
 * `docs/pricing/practice-price-list.md` (the transcription of the printed
 * sheet of 2026-09-15) line by line, and each procedure's default starting
 * line must be the one the claims canon chose.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { PROCEDURE_PAGES } from '@workspace/shared'
import {
    CLAIM_PROCEDURES,
    DEFAULT_COMBO_DISCOUNTS,
    DEFAULT_STARTING_LINES,
    FALLBACK_PRICING,
    PRICE_SHEET,
    TYPICAL_RANGE_PROCEDURES,
    toClaimProcedureKey,
    type PriceSheetSection,
} from '@workspace/shared/claims/prices'
import {
    PRICE_UNITS,
    formatUsd,
    getPriceDisplay,
} from '@workspace/shared/claims/pricing'

import { PRICE_LINE_UNITS } from '../../../../../packages/db/src/schema/pricing/price-line.table'

const PRICE_LIST = fileURLToPath(
    new URL(
        '../../../../../docs/pricing/practice-price-list.md',
        import.meta.url
    )
)

const SECTIONS: PriceSheetSection[] = [
    'Face',
    'Breast',
    'Body',
    'Male',
    'Add-ons',
]

/** `| name | price | mark |` rows of each priced section of the document. */
function readSheet(): Map<string, string> {
    const doc = readFileSync(PRICE_LIST, 'utf8')
    const rows = new Map<string, string>()
    for (const section of SECTIONS) {
        const start = doc.indexOf(`\n## ${section}\n`)
        expect(start, `section ${section}`).toBeGreaterThan(-1)
        const end = doc.indexOf('\n## ', start + 1)
        const body = doc.slice(start, end === -1 ? undefined : end)
        for (const line of body.split('\n')) {
            const cells = line
                .split('|')
                .slice(1, -1)
                .map((cell) => cell.trim())
            const [name, price] = cells
            if (!name || !price || name === 'Procedure' || name === 'Add-on')
                continue
            if (/^-+:?$/.test(name)) continue
            rows.set(`${section} | ${name}`, price)
        }
    }
    return rows
}

/** How the document prints a line's price: "3,500", "500 per breast". */
function printed(lines: typeof PRICE_SHEET): string {
    const figure = (usd: number) => formatUsd(usd).slice(1)
    if (lines.length === 2) {
        // J-Plasma: one row, two prices.
        const first = lines.find((line) => line.unit === 'first-area')!
        const additional = lines.find(
            (line) => line.unit === 'additional-area'
        )!
        return `${figure(first.usd)} first area / ${figure(additional.usd)} each additional`
    }
    const [line] = lines
    return line!.unit === 'per-breast'
        ? `${figure(line!.usd)} per breast`
        : figure(line!.usd)
}

describe('PRICE_SHEET against docs/pricing/practice-price-list.md', () => {
    const sheet = readSheet()
    const byRow = new Map<string, (typeof PRICE_SHEET)[number][]>()
    for (const line of PRICE_SHEET) {
        const row = `${line.sheetSection} | ${line.sheetName}`
        byRow.set(row, [...(byRow.get(row) ?? []), line])
    }

    it('has every row of the document, and no other', () => {
        expect([...byRow.keys()].sort()).toEqual([...sheet.keys()].sort())
        expect(sheet.size).toBe(58)
        expect(PRICE_SHEET).toHaveLength(59)
    })

    it.each([...byRow.entries()])('prices %s as printed', (row, lines) => {
        expect(printed(lines)).toBe(sheet.get(row))
    })

    it('matches the combination discounts', () => {
        const doc = readFileSync(PRICE_LIST, 'utf8')
        expect(doc).toMatch(/\| 2 procedure combo \|\s+−500 \|/)
        expect(doc).toMatch(/\| 3 procedure combo \|\s+−1,000 \|/)
        expect(DEFAULT_COMBO_DISCOUNTS).toEqual({ two: 500, three: 1000 })
    })

    it('flags as add-ons the lines the sheet prices on top of another procedure', () => {
        for (const line of PRICE_SHEET) {
            if (
                line.sheetSection === 'Add-ons' ||
                /add on|added to another|combined w\//i.test(line.sheetName)
            ) {
                expect(line.addOn, line.sheetName).toBe(true)
            }
        }
    })
})

describe('PRICE_SHEET keys', () => {
    it('gives every line a unique, token-safe id', () => {
        const ids = PRICE_SHEET.map((line) => `${line.procedure}:${line.key}`)
        expect(new Set(ids).size).toBe(ids.length)
        for (const line of PRICE_SHEET) {
            expect(line.procedure).toMatch(/^[a-z0-9][a-z0-9-]*$/)
            expect(line.key).toMatch(/^[a-z0-9][a-z0-9-]*$/)
            expect(line.usd).toBeGreaterThan(0)
            expect(Number.isInteger(line.usd)).toBe(true)
        }
    })

    it('uses the units the database allows', () => {
        expect([...PRICE_LINE_UNITS]).toEqual([...PRICE_UNITS])
        for (const line of PRICE_SHEET) {
            expect(PRICE_UNITS).toContain(line.unit)
        }
    })
})

describe('CLAIM_PROCEDURES', () => {
    it("maps each procedure page to the web app's slug", () => {
        const pageUrls = new Set(PROCEDURE_PAGES.map((page) => page.url))
        for (const procedure of CLAIM_PROCEDURES) {
            if (procedure.path?.startsWith('/procedures/')) {
                expect(pageUrls, procedure.key).toContain(procedure.path)
                expect(procedure.path).toBe(`/procedures/${procedure.pageSlug}`)
            }
        }
    })

    it('resolves a claim key or a page slug', () => {
        expect(toClaimProcedureKey('bbl')).toBe('bbl')
        expect(toClaimProcedureKey('brazilian-butt-lift-bbl-miami')).toBe('bbl')
        expect(toClaimProcedureKey('mens-plastic-surgery-miami')).toBe('mens')
        expect(toClaimProcedureKey('rhinoplasty')).toBeNull()
    })
})

describe('default starting lines (claims canon §5, Decisions of 2026-10-25)', () => {
    it.each([
        ['bbl', 'lipo360-bbl', '$5,500'],
        ['lipo', 'lipo360', '$4,000'],
        ['tummy-tuck', 'mini', '$3,000'],
        ['breast-augmentation', 'saline', '$3,500'],
        // D8: the modified lift, not the $5,000 full lift.
        ['breast-lift', 'modified', '$4,000'],
        ['breast-reduction', 'small-medium', '$6,000'],
        // D2: no facelift-alone price; only the face and neck lift.
        ['facelift', 'face-neck-lift', '$15,000'],
        ['blepharoplasty', 'upper', '$3,500'],
        ['mens', 'gynecomastia', '$4,500'],
    ])('%s starts at %s (%s)', (procedure, lineKey, price) => {
        const display = getPriceDisplay(FALLBACK_PRICING, procedure)
        expect(display?.lineKey).toBe(lineKey)
        expect(display?.final).toBe(price)
        expect(display?.addOn).toBe(false)
    })

    it('gives the mommy makeover no total (D3)', () => {
        expect(DEFAULT_STARTING_LINES['mommy-makeover']).toBeNull()
        expect(getPriceDisplay(FALLBACK_PRICING, 'mommy-makeover')).toBeNull()
    })

    it('points every default at a standard line of the sheet', () => {
        for (const [procedure, key] of Object.entries(DEFAULT_STARTING_LINES)) {
            if (key === null) continue
            const line = PRICE_SHEET.find(
                (candidate) =>
                    candidate.procedure === procedure && candidate.key === key
            )
            expect(line, `${procedure}:${key}`).toBeDefined()
            expect(line?.addOn).toBe(false)
        }
    })

    it('publishes the "most patients pay" range for BBL only, to $10,000', () => {
        expect(TYPICAL_RANGE_PROCEDURES).toEqual(['bbl'])
        for (const settings of Object.values(FALLBACK_PRICING.procedures)) {
            expect(settings.typicalMaxUsd).toBe(
                settings.procedure === 'bbl' ? 10000 : null
            )
        }
    })

    it('carries no discount and no statement', () => {
        expect(FALLBACK_PRICING.source).toBe('fallback')
        expect(FALLBACK_PRICING.defaultDiscountPercent).toBe(0)
        expect(FALLBACK_PRICING.discountStatement).toBeNull()
        for (const settings of Object.values(FALLBACK_PRICING.procedures)) {
            expect(settings.discountPercent).toBeNull()
        }
    })
})
