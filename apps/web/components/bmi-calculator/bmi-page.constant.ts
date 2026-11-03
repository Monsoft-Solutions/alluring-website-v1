/**
 * Shared values for the BMI page's sections (#346): anchors, the page's
 * last real update and the type styles its sections share.
 *
 * @module
 */

/** ISO date of the page's last content change; `page-metadata.ts` agrees. */
export const BMI_PAGE_UPDATED_ON = '2026-10-17'

/**
 * The consultation thread's section id. It matches the home and contact
 * pages' thread, so a visitor who starts it on one page finds their answers
 * waiting on the next: the thread keeps them per id in `sessionStorage`.
 */
export const BMI_CHAT_ID = 'start-consultation'

export const BMI_ANCHORS = {
    calculator: 'calculator',
    ranges: 'ranges',
    weightChart: 'weight-chart',
    gettingThere: 'getting-there',
    florida: 'florida',
    faq: 'faq',
    sources: 'sources',
} as const

/** The page's content width: the home page's, 1,248 px with a 20 px gutter. */
export const bmiContainer = 'mx-auto w-full max-w-[78rem] px-5 md:px-8'

/** A band's H2 at display size, with one italic word (`<em>`). */
export const bmiHeading =
    'bmi-display font-serif text-[2.25rem] leading-[1.02] font-normal tracking-[-0.02em] text-balance md:text-[3.25rem]'

/** A small label over a heading. */
export const bmiEyebrow =
    'text-[0.75rem] font-semibold tracking-[0.2em] uppercase'

/** Body copy on a light band. */
export const bmiBody =
    'text-[1.0625rem] leading-[1.65] text-pretty text-stone-700 md:text-lg'

/** Inline link on a light band: ink on a bronze hairline. */
export const bmiLink =
    'text-stone-900 underline decoration-gold-600 decoration-1 underline-offset-4 transition-colors hover:decoration-stone-900'

/** Ink pill, the page's primary button on light bands. */
export const bmiButton =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-stone-900 px-6 text-[0.9375rem] font-semibold text-stone-50 transition-colors hover:bg-stone-700'

/** Champagne pill, the primary button on dark bands; ink text on gold. */
export const bmiButtonOnDark =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold-300 px-6 text-[0.9375rem] font-semibold text-stone-950 transition-colors hover:bg-gold-200'
