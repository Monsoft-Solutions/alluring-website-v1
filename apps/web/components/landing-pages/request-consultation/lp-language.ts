/**
 * Which language the landing page and its thank-you page open in.
 *
 * Resolution order, highest first:
 *   1. `?hl=` (or `?lang=`) on the URL — what the ad or the redirect said.
 *   2. The browser's Accept-Language, when auto-detection is on.
 *   3. English.
 *
 * A language the visitor chose here on an earlier visit sits between 1 and 2,
 * but it lives in `localStorage`, so it is applied in the browser rather than
 * here. `pinned` says whether step 1 decided it — an explicit `?hl=` outranks
 * a stored choice, and the client uses that flag to know not to override.
 */

import { AUTO_DETECT_LANGUAGE } from './lp-config'
import { toLpLang, type LpLang } from './lp-copy'

export interface ResolvedLpLanguage {
    readonly lang: LpLang
    readonly pinned: boolean
}

export function resolveLpLanguage(
    requested: string | null | undefined,
    acceptLanguage: string | null | undefined
): ResolvedLpLanguage {
    const fromUrl = toLpLang(requested)
    if (fromUrl) return { lang: fromUrl, pinned: true }

    if (!AUTO_DETECT_LANGUAGE) return { lang: 'en', pinned: false }

    // The first tag is the visitor's own preference; the q-weighted rest is
    // their fallback chain, which is not what "is this person a Spanish
    // speaker" asks.
    const primary = toLpLang((acceptLanguage ?? '').split(',')[0]?.trim())
    return { lang: primary === 'es' ? 'es' : 'en', pinned: false }
}
