/**
 * Weekly Payment Options
 *
 * Single source of truth for the "from $X/week" figures used across the
 * site (specials page, contact page, and the Atelier homepage direction).
 *
 * These were previously inlined in `weekly-payments.component.tsx` and
 * partially restated elsewhere, which meant a price change had to be made
 * in more than one place to be correct. Import from here instead of adding
 * another copy.
 *
 * IMPORTANT: these are illustrative financed payments for qualified
 * applicants, not quotes. Anything rendering them must say so — see
 * `WEEKLY_PAYMENT_DISCLAIMER`.
 */

export type WeeklyPaymentOption = {
    readonly procedure: string
    readonly weeklyPayment: number
    readonly highlight?: string
}

export const WEEKLY_PAYMENT_OPTIONS: readonly WeeklyPaymentOption[] = [
    {
        procedure: 'Breast Augmentation',
        weeklyPayment: 27,
        highlight: 'Most Popular',
    },
    { procedure: 'Liposuction 360', weeklyPayment: 27 },
    { procedure: 'Brazilian Butt Lift (BBL)', weeklyPayment: 34 },
    { procedure: 'Extended Tummy Tuck', weeklyPayment: 34 },
    { procedure: 'Breast Lift with Silicone', weeklyPayment: 41 },
    { procedure: 'Breast Reduction', weeklyPayment: 41 },
    { procedure: 'Face & Neck Lift', weeklyPayment: 69 },
] as const

/** The lowest advertised weekly figure, derived rather than hardcoded. */
export const LOWEST_WEEKLY_PAYMENT = WEEKLY_PAYMENT_OPTIONS.reduce(
    (lowest, option) => Math.min(lowest, option.weeklyPayment),
    Number.POSITIVE_INFINITY
)

/**
 * Required disclaimer wherever a weekly figure appears. Cosmetic surgery
 * financing is credit-dependent, so an unqualified "from $27/week" is a
 * claim we cannot stand behind for every visitor.
 */
export const WEEKLY_PAYMENT_DISCLAIMER =
    'Weekly figures are illustrative examples for qualified applicants and depend on approved credit, term length and deposit. They are not a quote. Your surgeon gives you an exact all-inclusive price in consultation.'
