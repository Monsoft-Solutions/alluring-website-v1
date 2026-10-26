/**
 * The tummy tuck prices on the tummy tuck view (#316).
 *
 * The tummy tuck ads quote "Mini tummy tuck from $3,000" and carry a price
 * asset with every type, and Google requires the page an ad opens to show the
 * prices the ad states. The figures come from the pricing resolver (#354),
 * the same source as the procedure page, so an admin price edit or discount
 * reaches this page with every other surface; while a discount is on, each
 * price is struck through and the Fla. Stat. 456.062 statement goes with it.
 *
 * Pure: the page passes the live snapshot (`getPricing()`) and hands the
 * client the resolved `PriceDisplay`s. Only the tummy tuck view gets prices:
 * BBL, Lipo 360 and implant prices stay out of the ads (30 Sep decision),
 * and the FAQ keeps BBL and Lipo 360.
 */

import {
    getDiscountStatement,
    getPriceDisplay,
    type PriceDisplay,
    type PricingSnapshot,
} from '@workspace/shared/claims/pricing'
import { FALLBACK_PRICING } from '@workspace/shared/claims/prices'

import type { LpTummyTuckType } from './lp-copy'
import type { AdVariant } from './lp-variants'

/** Each row's price-sheet line, in the sheet's order. */
const TUMMY_TUCK_LINES = {
    mini: 'mini',
    'extended-mini': 'extended-mini',
    full: 'full',
    extended: 'extended',
    'fleur-de-lis': 'fleur-de-lis',
} as const satisfies Record<LpTummyTuckType, string>

export interface LpPrices {
    /** Each type's price; `null` when its line is inactive. */
    readonly tummyTuck: Readonly<Record<LpTummyTuckType, PriceDisplay | null>>
    /** The 456.062 statement while any of them is discounted. */
    readonly statement: string | null
}

/** Prices for the ad group's view, or null when the view shows none. */
export function buildLpPrices(
    adVariant: AdVariant,
    pricing: PricingSnapshot = FALLBACK_PRICING
): LpPrices | null {
    if (adVariant !== 'tummy-tuck') return null
    const tummyTuck = Object.fromEntries(
        Object.entries(TUMMY_TUCK_LINES).map(([type, line]) => [
            type,
            getPriceDisplay(pricing, 'tummy-tuck', line),
        ])
    ) as Record<LpTummyTuckType, PriceDisplay | null>
    const discounted = Object.values(tummyTuck).some(
        (price) => price?.discounted
    )
    return {
        tummyTuck,
        statement: discounted ? getDiscountStatement(pricing) : null,
    }
}
