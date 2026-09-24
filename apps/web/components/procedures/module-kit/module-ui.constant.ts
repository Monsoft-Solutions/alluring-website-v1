/**
 * The recurring type and control styles every procedure page module shares,
 * from the approved #253 mockups. Shared so every section on every page sets
 * body copy, links and buttons the same way; a section adds classes with `cn`
 * when it needs something of its own.
 *
 * @module
 */

/** The page's content width: 1,200 px with a 20 px gutter on phones. */
export const moduleContainer = 'mx-auto w-full max-w-[75rem] px-5 md:px-8'

/** Vertical rhythm of a section inside a band. */
export const moduleSectionPad = 'py-12 md:py-20'

/** Body copy: 17 px on phones, 18 px from `md`, stone-700. */
export const moduleBody =
    'max-w-[41.25rem] text-[1.0625rem] leading-[1.6] text-stone-700 md:text-lg md:leading-[1.65]'

/** A section's H3. */
export const moduleH3 =
    'font-serif text-xl leading-[1.3] font-medium text-stone-900 md:text-[1.375rem]'

/** A small label over a value. */
export const moduleLabel = 'text-[0.9375rem] leading-[1.45] text-stone-500'

/** Inline link: stone text on a thin gold underline. */
export const moduleLink =
    'text-stone-900 underline decoration-gold-500 decoration-1 underline-offset-4 transition-colors hover:text-stone-600 hover:decoration-stone-900'

const button =
    'inline-flex h-13 items-center justify-center gap-2.5 rounded-full border px-7 text-base leading-none font-semibold whitespace-nowrap no-underline transition-colors'

/** Ink on champagne (gold-400), a pill: 8:1, and it reads on the page's
 * light bands and its one dark band alike. */
export const moduleButtonPrimary = `${button} border-gold-400 bg-gold-400 text-stone-900 hover:border-gold-300 hover:bg-gold-300`

export const moduleButtonSecondary = `${button} border-stone-300 bg-white text-stone-900 hover:border-stone-900`

/** A section's H3 on the page's one dark band. */
export const moduleH3Dark =
    'font-serif text-xl leading-[1.3] font-medium text-stone-50 md:text-[1.375rem]'

/** Body copy on the page's one dark band. */
export const moduleBodyDark =
    'text-[1.0625rem] leading-[1.6] text-stone-300 md:leading-[1.65]'

/** Required on every AI image of a person (#254). */
export const AI_MODEL_LABEL = 'Model shown. Not a patient.'

/** A rendered image: dimensions are the file's, so the layout never shifts. */
export type ModuleImage = {
    src: string
    width: number
    height: number
    /** Describes the picture. No keyword lists. */
    alt: string
}
