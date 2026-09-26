/**
 * Which of the reviews deck's three quotes each ad group reads on the short
 * page (#292): the reviewer who had that procedure, or the aftercare quote.
 */

import type { LpLang } from './lp-copy'
import type { AdVariant } from './lp-variants'

/**
 * Which of the deck's three quotes each ad group gets. English: Erika
 * (aftercare), Alannah (flew in for a mommy makeover), Marycelis (tummy tuck
 * and lipo). Spanish: Marycelis, Lisandra, Raynellys.
 */
const QUOTE_FOR: Readonly<
    Record<
        LpLang,
        {
            readonly byAd: Partial<Record<AdVariant, number>>
            readonly otherwise: number
        }
    >
> = {
    en: {
        byAd: {
            'tummy-tuck': 2,
            liposuction: 2,
            'mommy-makeover': 1,
            'skin-removal': 1,
        },
        otherwise: 0,
    },
    es: {
        byAd: {
            'tummy-tuck': 0,
            liposuction: 0,
            'mommy-makeover': 1,
            'skin-removal': 1,
        },
        otherwise: 2,
    },
}

/** The quote an ad group's visitors read. */
export function lpQuoteIndex(lang: LpLang, adVariant: AdVariant): number {
    const pick = QUOTE_FOR[lang]
    return pick.byAd[adVariant] ?? pick.otherwise
}
