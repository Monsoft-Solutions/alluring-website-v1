/**
 * A procedure's resolved prices (`ProcedurePrices`, issue #354), built from a
 * pricing snapshot, and the lookups the page modules use on them: one line
 * by key, and the cheapest and dearest of a set of lines ("$500 to $1,500,
 * depending on the area").
 *
 * Pure, so a component or a test can use it without the database client;
 * `getProcedurePrices` in the pricing resolver calls `buildProcedurePrices`
 * with the live snapshot.
 *
 * @module lib/claims/procedure-prices
 */
import {
    getDiscountStatement,
    getPriceDisplay,
    getProcedureLines,
    getTypicalRange,
    toPriceDisplay,
    type PriceDisplay,
    type PricingSnapshot,
    type TypicalRange,
} from '@workspace/shared/claims/pricing'
import { toClaimProcedureKey } from '@workspace/shared/claims/prices'

/** Everything a procedure page prints about its prices. */
export interface ProcedurePrices {
    /** The "starting at" line, or `null`. */
    starting: PriceDisplay | null
    /** Every active line, in sheet order, add-ons included. */
    lines: PriceDisplay[]
    /** "Most patients pay between …" (BBL only), or `null`. */
    range: TypicalRange | null
    /** The 456.062 statement to show while a discount is on, else `null`. */
    discountStatement: string | null
}

/**
 * A procedure's prices from a snapshot.
 *
 * @param pricing - The pricing snapshot (`getPricing()`)
 * @param procedure - Claim key or web page slug
 */
export function buildProcedurePrices(
    pricing: PricingSnapshot,
    procedure: string
): ProcedurePrices {
    const key = toClaimProcedureKey(procedure) ?? procedure
    const lines = getProcedureLines(pricing, key).map((line) =>
        toPriceDisplay(pricing, line)
    )
    return {
        starting: getPriceDisplay(pricing, key),
        lines,
        range: getTypicalRange(pricing, key),
        discountStatement: lines.some((line) => line.discounted)
            ? getDiscountStatement(pricing)
            : null,
    }
}

/** One active line of the procedure, by key, or `null`. */
export function findLinePrice(
    prices: ProcedurePrices,
    lineKey: string
): PriceDisplay | null {
    return prices.lines.find((line) => line.lineKey === lineKey) ?? null
}

/**
 * The lowest and highest priced of the lines `keep` selects, by list price,
 * or `null` when none is active.
 */
export function linePriceExtremes(
    prices: ProcedurePrices,
    keep: (line: PriceDisplay) => boolean
): { min: PriceDisplay; max: PriceDisplay } | null {
    const lines = prices.lines
        .filter(keep)
        .sort((a, b) => a.listUsd - b.listUsd)
    const min = lines[0]
    const max = lines.at(-1)
    return min && max ? { min, max } : null
}

/**
 * Liposuction's single-area add-ons (chin to abdomen and flanks), the lines
 * "one area added to another procedure" quotes. J-Plasma is priced by area
 * on its own lines and is left out.
 */
export function isSingleAreaAddOn(line: PriceDisplay): boolean {
    return line.addOn && !line.lineKey.startsWith('j-plasma')
}
