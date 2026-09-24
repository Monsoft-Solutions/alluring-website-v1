/**
 * The sections under the hero, and the `?s=` views the ads' sitelinks open
 * (#290).
 *
 * A sitelink used to send a visitor to a main-site page (/gallery, /reviews,
 * the financing page…) — a page with the site menu and its popups, built for
 * someone else. Now each sitelink opens this page with its section moved
 * directly under the hero, and the page scrolls to it:
 *
 *   /lp/request-consultation?s=financing       the price & financing section
 *   /lp/request-consultation?s=reviews&p=bbl   works with every `?p=` too
 *
 * Google can disapprove a sitelink that opens the same content as the ad, so
 * each view has to be a different page, not an anchor on the same one. The
 * visitor still has the thread above and the sticky bar, and nothing links
 * off the page.
 */

/** Page order, top to bottom, with no `?s=`. Each is also the section's id. */
export const LP_SECTIONS = [
    'results',
    'financing',
    'surgeon',
    'reviews',
    'fly-in',
    'faq',
] as const

export type LpSection = (typeof LP_SECTIONS)[number]

/** Spellings someone might type into a sitelink. */
const SECTION_ALIASES: Readonly<Record<string, LpSection>> = {
    gallery: 'results',
    'before-after': 'results',
    photos: 'results',
    finance: 'financing',
    payments: 'financing',
    price: 'financing',
    pricing: 'financing',
    cost: 'financing',
    doctor: 'surgeon',
    'dr-karlinsky': 'surgeon',
    testimonials: 'reviews',
    flyin: 'fly-in',
    travel: 'fly-in',
    'out-of-state': 'fly-in',
    questions: 'faq',
}

/** Resolves `?s=` to a section, or null for the page's own order. */
export function resolveLpSection(
    raw: string | null | undefined
): LpSection | null {
    const key = (raw ?? '').toLowerCase().trim()
    if (!key) return null
    const aliased = SECTION_ALIASES[key] ?? key
    return LP_SECTIONS.includes(aliased as LpSection)
        ? (aliased as LpSection)
        : null
}

/** The page order with the requested section moved to the top. */
export function orderLpSections(focus: LpSection | null): readonly LpSection[] {
    return focus
        ? [focus, ...LP_SECTIONS.filter((section) => section !== focus)]
        : LP_SECTIONS
}
