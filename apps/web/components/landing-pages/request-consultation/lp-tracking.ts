/**
 * dataLayer events and ad attribution for /lp/request-consultation.
 *
 * The page pushes to the container the site already loads
 * (`NEXT_PUBLIC_GTM_ID`) — it does not mount a container of its own. Every
 * event carries `pageVariant`, `adVariant` and `lang` so Google Ads conversions
 * can be attributed per ad group and per language.
 *
 * `pageVariant` is "ads-consultation-v6" since the short page and the form
 * test (#292): the quiet thread against the tap card, which every event also
 * carries as `formVariant`. v5 was the copy, per-ad-group headlines and the
 * price & financing section (#290), v4 moved the page to the consultation
 * thread (#283) and v3 was the five-field form. The Google Ads conversion
 * fires on the thank-you page view, not on this value, so the bump only
 * splits the reporting into before and after.
 *
 * The `lp_*` dataLayer events feed GTM and never reach GA4. The one GA4
 * needs for the test — visits per arm — is sent to GA4 directly
 * (`trackLpViewInGa4`).
 */

import { trackEvent } from '@/lib/analytics/analytics.client'
import { readAttributionParam } from '@/lib/analytics/attribution-params.util'

import type { LpLang } from './lp-copy'
import type { LpFormVariant } from './lp-form-variant'

export const LP_PAGE_VERSION = 'v6'
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
    /** The hero form's test arm. */
    readonly formVariant?: LpFormVariant
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
        ...(context.formVariant && { formVariant: context.formVariant }),
        lang: context.lang,
        ...extra,
    })
}

/**
 * `lp_view` in GA4: the denominator of the form test, visits per arm. Sent
 * once per page view, with the ad group and the sitelink section the visitor
 * landed on. Nothing about the visitor.
 */
export function trackLpViewInGa4(
    context: Required<LpEventContext>,
    section: string | null
): void {
    trackEvent('lp_view', {
        form_variant: context.formVariant,
        page_variant: LP_PAGE_VARIANT,
        ad_variant: context.adVariant,
        section: section ?? 'none',
        lang: context.lang,
    })
}

/**
 * Reads the campaign identifiers off the URL and remembers them for the
 * session, so a visitor who reloads or switches language still carries the
 * click that brought them here into the conversion.
 *
 * Values go through `readAttributionParam`, like the rest of the site: the
 * tracking template repeats each UTM with unexpanded `{…}` tokens first, and
 * `params.get()` would keep that copy.
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
            readAttributionParam(params, key) || stored[key] || '',
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
