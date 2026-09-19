/**
 * The BBL page's recurring type and control styles, from the approved #253
 * mockups. Shared here so every section sets body copy, links and buttons the
 * same way.
 *
 * @module
 */

/** The page's content width: 1,200 px with a 20 px gutter on phones. */
export const bblContainer = 'mx-auto w-full max-w-[75rem] px-5 md:px-8'

/** Vertical rhythm of a section inside a band. */
export const bblSectionPad = 'py-12 md:py-20'

/** Body copy: 17 px on phones, 18 px from `md`, stone-700. */
export const bblBody =
    'max-w-[41.25rem] text-[1.0625rem] leading-[1.6] text-stone-700 md:text-lg md:leading-[1.65]'

/** A section's H3. */
export const bblH3 =
    'font-serif text-xl leading-[1.3] font-medium text-stone-900 md:text-[1.375rem]'

/** A small label over a value. */
export const bblLabel = 'text-[0.9375rem] leading-[1.45] text-stone-500'

/** Inline link: stone text on a thin gold underline. */
export const bblLink =
    'text-stone-900 underline decoration-gold-500 decoration-1 underline-offset-4 transition-colors hover:text-stone-600 hover:decoration-stone-900'

const button =
    'inline-flex h-13 items-center justify-center gap-2.5 rounded-[4px] border px-6.5 text-base leading-none font-bold whitespace-nowrap no-underline transition-colors'

/** Stone-900 on gold-400; white on gold-500 fails AA at this size. */
export const bblButtonPrimary = `${button} border-gold-400 bg-gold-400 text-stone-900 hover:border-gold-300 hover:bg-gold-300`

export const bblButtonSecondary = `${button} border-stone-400 bg-white text-stone-900 hover:border-stone-900`
