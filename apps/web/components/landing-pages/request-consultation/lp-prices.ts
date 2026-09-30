/**
 * The tummy tuck prices on the tummy tuck view (#316).
 *
 * The tummy tuck ads quote "Mini tummy tuck from $3,000" and carry a price
 * asset with every type, and Google requires the page an ad opens to show the
 * prices the ad states. The figures come from the tummy tuck facts file, the
 * same source as the procedure page, so the ads page can never state a price
 * the facts no longer carry.
 *
 * Server-only: the facts file is large, so the page reads it here and hands
 * the client the formatted strings, like the form's copy (`lp-chat-copy.ts`).
 * Only the tummy tuck view gets prices: BBL, Lipo 360 and implant prices stay
 * out of the ads (30 Sep decision), and the FAQ keeps BBL and Lipo 360.
 */

import { tummyTuckFigure } from '@/lib/data/procedures/facts/tummy-tuck.facts'

import type { LpTummyTuckType } from './lp-copy'
import type { AdVariant } from './lp-variants'

/** Each row's fact, in the price sheet's order. */
const TUMMY_TUCK_FACTS = {
    mini: 'price-mini',
    'extended-mini': 'price-extended-mini',
    full: 'price-full',
    extended: 'price-extended',
    'fleur-de-lis': 'price-fleur-de-lis',
} as const satisfies Record<
    LpTummyTuckType,
    Parameters<typeof tummyTuckFigure>[0]
>

export interface LpPrices {
    /** Starting prices, formatted ("$3,000"). */
    readonly tummyTuck: Readonly<Record<LpTummyTuckType, string>>
}

/** Prices for the ad group's view, or null when the view shows none. */
export function buildLpPrices(adVariant: AdVariant): LpPrices | null {
    if (adVariant !== 'tummy-tuck') return null
    const entries = Object.entries(TUMMY_TUCK_FACTS).map(([type, id]) => [
        type,
        tummyTuckFigure(id),
    ])
    return {
        tummyTuck: Object.fromEntries(entries) as Record<
            LpTummyTuckType,
            string
        >,
    }
}
