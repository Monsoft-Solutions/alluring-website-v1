/**
 * Alluring's prices as plain text (issue #354), for every surface that can't
 * strike a figure through: `<title>`, meta descriptions, JSON-LD, `llms*.txt`,
 * alt text, `aria-label`s. A discounted price reads "$4,400 (20% off
 * $5,500)". A visible price on a page is `<PriceTag>` instead, and DB text
 * uses claim tokens (`resolveClaims`).
 *
 * Every function returns `null` when there is nothing to publish: a
 * procedure with no starting price (mommy makeover), an unknown or inactive
 * line, a procedure without a "most patients" range. Callers leave the
 * figure out; they never fall back to a typed one.
 *
 * @module lib/claims/price-text
 */
import 'server-only'

import {
    formatPriceText,
    formatTypicalRangeText,
    getTypicalRange,
} from '@workspace/shared/claims/pricing'
import { toClaimProcedureKey } from '@workspace/shared/claims/prices'

import {
    getLinePrice,
    getPricing,
    getStartingPrice,
} from '@/lib/queries/pricing.query'

/**
 * "$5,500", or "$4,400 (20% off $5,500)".
 *
 * @param procedure - Claim key (`bbl`) or web page slug
 */
export async function getStartingPriceText(
    procedure: string
): Promise<string | null> {
    const price = await getStartingPrice(procedure)
    return price ? formatPriceText(price) : null
}

/**
 * One price-sheet line: "$4,500", "$500 per breast", or its discounted form.
 *
 * @param procedure - Claim key or web page slug
 * @param line - The line's key, e.g. `full`
 */
export async function getLinePriceText(
    procedure: string,
    line: string
): Promise<string | null> {
    const price = await getLinePrice(procedure, line)
    return price ? formatPriceText(price) : null
}

/**
 * BBL's "most patients pay between $5,500 and $10,000" fragment, or `null`
 * for every procedure that publishes no range.
 *
 * @param procedure - Claim key or web page slug
 */
export async function getPriceRangeText(
    procedure: string
): Promise<string | null> {
    const key = toClaimProcedureKey(procedure) ?? procedure
    const range = getTypicalRange(await getPricing(), key)
    return range ? formatTypicalRangeText(range) : null
}

export { formatPriceText, formatTypicalRangeText }
