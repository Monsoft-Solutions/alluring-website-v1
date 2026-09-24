/**
 * Conversion-CTA click tracking (issue #279).
 *
 * One delegated listener (`CtaClickTracker`) sends `cta_click` for every
 * conversion CTA on the site, so no component tracks its own:
 * - any element with `data-cta="<name>"`;
 * - any link to a consultation or contact page, the booking subdomain, or a
 *   `tel:` / `sms:` number.
 *
 * `cta_location` says where the button sat: in the nav, footer, a popup or a
 * fixed bar, or else by its place on the page — `hero` (first screen),
 * `bottom` (last quarter) or `middle`.
 *
 * @module lib/analytics/cta-click
 */

export type CtaLocation =
    | 'nav'
    | 'footer'
    | 'popup'
    | 'sticky'
    | 'hero'
    | 'middle'
    | 'bottom'

export type CtaClickParams = {
    readonly cta_name: string
    readonly cta_text: string
    readonly cta_location: CtaLocation
    readonly cta_destination: string
    readonly section: string
}

const MAX_TEXT_LENGTH = 60

/** Path of a consultation or contact page: /contact-us, /bridal-consultation… */
const CONVERSION_PATH =
    /^\/(contact-us|free-consultation|consulta-gratis|[a-z-]+-consultation|lp\/request-consultation)(\/|$)/

const BOOKING_HOST = 'book.alluringplasticsurgery.com'

/** Where a link leads, or null when it is not a conversion destination. */
export function getConversionDestination(href: string): string | null {
    if (href.startsWith('tel:')) return 'phone'
    if (href.startsWith('sms:')) return 'sms'

    let url: URL
    try {
        url = new URL(href, 'https://www.alluringplasticsurgery.com')
    } catch {
        return null
    }

    if (url.hostname === BOOKING_HOST) return 'booking'
    if (!/(^|\.)alluringplasticsurgery\.com$/.test(url.hostname)) return null
    return CONVERSION_PATH.test(url.pathname) ? url.pathname : null
}

/** The CTA a click landed on, if any. */
export function findCta(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) return null

    const explicit = target.closest<HTMLElement>('[data-cta]')
    if (explicit) return explicit

    const link = target.closest<HTMLAnchorElement>('a[href]')
    if (link && getConversionDestination(link.getAttribute('href') ?? '')) {
        return link
    }
    return null
}

function hasFixedAncestor(element: Element): boolean {
    for (let node: Element | null = element; node; node = node.parentElement) {
        const { position } = getComputedStyle(node)
        if (position === 'fixed' || position === 'sticky') return true
    }
    return false
}

export function getCtaLocation(element: HTMLElement): CtaLocation {
    // Nav first: the mobile menu is a dialog, but its links are navigation.
    if (element.closest('header, nav')) return 'nav'
    if (element.closest('[role="dialog"], dialog')) return 'popup'
    if (element.closest('footer')) return 'footer'
    if (hasFixedAncestor(element)) return 'sticky'

    const top = element.getBoundingClientRect().top + window.scrollY
    if (top < window.innerHeight) return 'hero'
    const pageHeight = document.documentElement.scrollHeight
    return top > pageHeight * 0.75 ? 'bottom' : 'middle'
}

export function getCtaParams(element: HTMLElement): CtaClickParams {
    const href = element.getAttribute('href') ?? ''
    const destination = getConversionDestination(href)
    const text = (element.getAttribute('aria-label') ?? element.textContent)
        ?.replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_TEXT_LENGTH)

    return {
        cta_name: element.dataset.cta ?? destination ?? 'cta',
        cta_text: text || '(no text)',
        cta_location: getCtaLocation(element),
        cta_destination: destination ?? (href ? 'other' : 'on_page'),
        section: element.closest('section[id]')?.id ?? 'none',
    }
}
