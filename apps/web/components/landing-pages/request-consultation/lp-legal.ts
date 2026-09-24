/**
 * Which links on the landing page are legal documents, and so open in the
 * page's legal dialog rather than on the main site.
 */

export type LpLegalDoc = 'privacy' | 'terms' | 'cookies'

/**
 * Where the page's own legal links point: real paths, so a page without
 * scripting (or a crawler) still reaches the document.
 */
export const LP_LEGAL_HREFS: Readonly<Record<LpLegalDoc, string>> = {
    privacy: '/privacy',
    terms: '/terms',
    cookies: '/cookies',
}

const LEGAL_PATHS: Readonly<Record<string, LpLegalDoc>> = {
    '/privacy': 'privacy',
    '/terms': 'terms',
    '/cookies': 'cookies',
}

/** The site's own hosts, whichever one the link was written against. */
const SITE_HOST = /(^|\.)alluringplasticsurgery\.com$/

/**
 * Marks the one legal link the dialog must not catch: the new-tab fallback it
 * shows when a document could not be downloaded.
 */
export const LP_LEGAL_NEW_TAB_ATTR = 'data-lp-legal-tab'

/** The legal document a link points at, or null for any other link. */
export function legalDocFor(href: string): LpLegalDoc | null {
    try {
        const url = new URL(href, window.location.href)
        const ours =
            url.host === window.location.host || SITE_HOST.test(url.hostname)
        if (!ours) return null
        return LEGAL_PATHS[url.pathname.replace(/\/+$/, '')] ?? null
    } catch {
        return null
    }
}
