/**
 * The four starting prices the page may quote, from the practice's printed
 * price sheet (`docs/pricing/practice-price-list.md`, 2026-09-15) — not from
 * the procedure data files, several of whose `priceFrom` values are stale.
 *
 * Every place that shows one also says the price is personal and that
 * financing is available, and never a weekly or monthly figure (Reg Z).
 *
 * Keyed by the form's procedure values, so the hint under the procedure list
 * can follow the visitor's choice.
 */

import type { ConsultChatLang } from '@/components/shared/consult-chat/consult-chat.types'

export type DrkPricedProcedure =
    | 'bbl'
    | 'liposuction'
    | 'breast-augmentation'
    | 'tummy-tuck'

export interface DrkPrice {
    readonly procedure: DrkPricedProcedure
    /** Formatted, with the currency sign: "$5,500". */
    readonly from: string
    /** The name the price list uses, per language. */
    readonly label: Readonly<Record<ConsultChatLang, string>>
}

/** In the order the price card lists them. */
export const DRK_PRICES: readonly DrkPrice[] = [
    {
        procedure: 'bbl',
        from: '$5,500',
        label: { en: 'BBL (Lipo 360 + BBL)', es: 'BBL (Lipo 360 + BBL)' },
    },
    {
        procedure: 'liposuction',
        from: '$4,000',
        label: { en: 'Lipo 360', es: 'Lipo 360' },
    },
    {
        procedure: 'breast-augmentation',
        from: '$3,500',
        label: { en: 'Breast augmentation', es: 'Aumento de senos' },
    },
    {
        procedure: 'tummy-tuck',
        from: '$3,000',
        label: { en: 'Tummy tuck', es: 'Abdominoplastia' },
    },
]

/** The starting price for a procedure value, or null when none is quoted. */
export function drkPriceFor(procedure: string): DrkPrice | null {
    return DRK_PRICES.find((price) => price.procedure === procedure) ?? null
}
