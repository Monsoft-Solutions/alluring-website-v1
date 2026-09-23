/**
 * Routes that ship their own chrome.
 *
 * On these the site header, footer and every global floating widget — the
 * announcement bar, the exit-intent popup, the promotion modal, the mobile
 * call button — are suppressed. They are link-in-bio and paid landing pages:
 * one page, one ask, and site navigation or a timed promotion is a way out of
 * it (or, worse, a modal covering the form the ad paid for).
 *
 * The cookie banner is deliberately NOT gated here. These pages still run the
 * site's analytics, so they still need the consent it collects. Neither is the
 * announcement bar, which has its own narrower list below.
 *
 * Matched as path prefixes, so `/lp` covers `/lp/request-consultation` and its
 * thank-you page.
 */
export const STANDALONE_ROUTES = ['/links', '/landing', '/lp'] as const

/**
 * Where the promotion announcement bar is suppressed as well — narrower than
 * the list above.
 *
 * `/landing/*` deliberately keeps the bar and redirects its CTA to the hero
 * form (see `announcement-bar-client.component`). `/lp/*` cannot: it runs its
 * own champagne palette and its own offer, its form anchor is `#consultation`
 * rather than `#hero-form`, and a second promotion above the fold competes
 * with the one the ad was bought for.
 *
 * `/landing/melissa-juvier` is dropped for the same reason: its one ask is the
 * chat form (`#message-melissa`), and the bar's CTA has no form to land on.
 */
export const NO_PROMO_BAR_ROUTES = ['/lp', '/landing/melissa-juvier'] as const

export function isStandaloneRoute(pathname: string): boolean {
    return matchesRoutePrefix(pathname, STANDALONE_ROUTES)
}

export function matchesRoutePrefix(
    pathname: string,
    routes: readonly string[]
): boolean {
    return routes.some((route) => pathname.startsWith(route))
}
