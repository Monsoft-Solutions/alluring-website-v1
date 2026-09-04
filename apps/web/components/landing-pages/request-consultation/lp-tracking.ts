/**
 * dataLayer events and ad attribution for /lp/request-consultation.
 *
 * The page pushes to the container the site already loads
 * (`NEXT_PUBLIC_GTM_ID`) — it does not mount a container of its own. Every
 * event carries `pageVariant`, `adVariant` and `lang` so Google Ads conversions
 * can be attributed per ad group and per language.
 *
 * `pageVariant` stays "ads-consultation-v3": the reporting and the conversion
 * triggers were built against that value while the page was hosted standalone,
 * and moving it onto the site should not orphan its history.
 */

import type { LpLang } from './lp-copy'

export const LP_PAGE_VERSION = 'v3'
export const LP_PAGE_VARIANT = `ads-consultation-${LP_PAGE_VERSION}`

/** Query keys Google and our own campaigns put on the ad URL. */
export const ATTRIBUTION_KEYS = [
    'gclid',
    'wbraid',
    'gbraid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
] as const

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number]
export type Attribution = Record<AttributionKey, string>

const ATTRIBUTION_STORAGE_KEY = 'aps_attribution'

/** Where the visitor's language choice is remembered across visits. */
export const LANG_STORAGE_KEY = 'aps_lang'

type DataLayerRecord = Record<string, unknown>

/** `Window.dataLayer` is already declared in `lib/analytics/analytics.types`. */
export function pushDataLayer(payload: DataLayerRecord): void {
    if (typeof window === 'undefined') return
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push(payload)
}

export interface LpEventContext {
    readonly lang: LpLang
    readonly adVariant: string
}

export function trackLpEvent(
    event: string,
    context: LpEventContext,
    extra?: DataLayerRecord
): void {
    pushDataLayer({
        event,
        pageVariant: LP_PAGE_VARIANT,
        adVariant: context.adVariant,
        lang: context.lang,
        ...extra,
    })
}

/**
 * Reads the campaign identifiers off the URL and remembers them for the
 * session, so a visitor who reloads or switches language still carries the
 * click that brought them here into the conversion.
 */
export function readAttribution(): Attribution {
    const empty = Object.fromEntries(
        ATTRIBUTION_KEYS.map((key) => [key, ''])
    ) as Attribution
    if (typeof window === 'undefined') return empty

    const params = new URLSearchParams(window.location.search)
    let stored: Partial<Attribution> = {}
    try {
        stored = JSON.parse(
            window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY) || '{}'
        ) as Partial<Attribution>
    } catch {
        // Private mode, or someone else's JSON in our key. Start clean.
        stored = {}
    }

    const data = Object.fromEntries(
        ATTRIBUTION_KEYS.map((key) => [
            key,
            params.get(key) || stored[key] || '',
        ])
    ) as Attribution

    try {
        window.sessionStorage.setItem(
            ATTRIBUTION_STORAGE_KEY,
            JSON.stringify(data)
        )
    } catch {
        // Storage unavailable; the values still reach this page's events.
    }
    return data
}

/**
 * Builds the post-submission URL, carrying the campaign, the ad variant, the
 * language and the page version through to the conversion event.
 */
export function buildThankYouUrl(
    base: string,
    context: LpEventContext
): string {
    const query = new URLSearchParams()
    const attribution = readAttribution()
    for (const key of ATTRIBUTION_KEYS) {
        if (attribution[key]) query.set(key, attribution[key])
    }
    query.set('p', context.adVariant)
    query.set('hl', context.lang)
    query.set('pv', LP_PAGE_VERSION)
    return `${base}${base.includes('?') ? '&' : '?'}${query.toString()}`
}
