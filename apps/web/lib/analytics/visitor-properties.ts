/**
 * Visitor-level (user-scoped) analytics properties (issue #279).
 *
 * - `site_language`: `es` when the page or Google Translate shows Spanish.
 * - `procedure_interest`: the last procedure the visitor read about.
 *
 * First-touch source needs nothing here: GA4's built-in "First user source /
 * medium / campaign" dimensions already hold it.
 *
 * Analysis only — never build Ads remarketing audiences from
 * `procedure_interest`: personalized advertising on health topics is
 * restricted.
 *
 * @module lib/analytics/visitor-properties
 */

import type { ProcedureKey } from './page-context'

const PROCEDURE_INTEREST_KEY = 'alluring_procedure_interest'

export type VisitorProperties = {
    readonly site_language: 'en' | 'es'
    readonly procedure_interest?: ProcedureKey
}

function readStorage(key: string): string | null {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

function writeStorage(key: string, value: string): void {
    try {
        localStorage.setItem(key, value)
    } catch {
        // Storage disabled or full — the interest then lasts one page.
    }
}

/** `es` when the page is Spanish or Google Translate is showing Spanish. */
export function getSiteLanguage(): 'en' | 'es' {
    if (document.documentElement.lang.toLowerCase().startsWith('es')) {
        return 'es'
    }
    return /(^|;\s*)googtrans=\/[a-z-]+\/es\b/i.test(document.cookie)
        ? 'es'
        : 'en'
}

/**
 * The GA4 user properties for this page. A procedure page updates
 * `procedure_interest`; any other page keeps the last one.
 */
export function getVisitorProperties(
    procedure: ProcedureKey
): VisitorProperties {
    if (procedure !== 'none') {
        writeStorage(PROCEDURE_INTEREST_KEY, procedure)
        return {
            site_language: getSiteLanguage(),
            procedure_interest: procedure,
        }
    }

    const stored = readStorage(PROCEDURE_INTEREST_KEY) as ProcedureKey | null
    return {
        site_language: getSiteLanguage(),
        ...(stored ? { procedure_interest: stored } : {}),
    }
}
