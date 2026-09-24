/**
 * Reading ad-platform parameters off a URL the ad account did not fill in.
 *
 * The Google Ads tracking template puts every UTM in the URL twice: first a
 * copy carrying placeholders Google never expands (`{ifvideo:video}`,
 * `{campaignname}`, `{adgroupname}` are not ValueTrack parameters), then a
 * clean copy (`utm_medium=cpc`). `URLSearchParams.get()` returns the first,
 * so every Google lead stored `utm_medium=cpc{ifvideo:video}{ifshopping:shopping}`
 * — and the sanitizer then threw its gclid away as non-paid (#276).
 *
 * Shared by the website (capture), the admin (the Ads console's click
 * resolver) and the backfill scripts, so all three read a landing URL the
 * same way.
 */

/**
 * A token left by an unexpanded tracking template: Google's `{campaignname}`
 * or Meta's `{{adset.name}}`.
 */
const PLACEHOLDER_TOKEN = /\{+[^{}]*\}+/g

/**
 * A value with its unexpanded `{…}` tokens removed, or undefined when
 * nothing real is left (`{campaignname}` → undefined, `cpc{ifvideo:video}` → `cpc`).
 */
export function stripPlaceholders(
    value: string | null | undefined
): string | undefined {
    if (!value) return undefined
    const cleaned = value.replace(PLACEHOLDER_TOKEN, '').trim()
    return cleaned || undefined
}

/**
 * The first usable value of a repeated URL parameter: a copy with no
 * placeholder wins, otherwise the first copy with its placeholders stripped.
 */
export function readAttributionParam(
    params: URLSearchParams,
    name: string
): string | undefined {
    const values = params.getAll(name).map((value) => value.trim())
    const clean = values.find((value) => value && !/[{}]/.test(value))
    if (clean) return clean

    for (const value of values) {
        const stripped = stripPlaceholders(value)
        if (stripped) return stripped
    }
    return undefined
}

/**
 * ValueTrack and campaign parameters kept from the landing URL beside the
 * columns the lead already has — the keyword, match type, network and device
 * the click came from. Keys are the URL parameter names.
 */
export const LANDING_PARAM_KEYS = [
    'keyword',
    'matchtype',
    'network',
    'device',
    'placement',
    'gad_source',
    'utm_id',
    'utm_adgroup',
] as const

export type LandingParamKey = (typeof LANDING_PARAM_KEYS)[number]

/** Placeholder-free landing parameters; absent keys were not on the URL. */
export type LandingParams = Partial<Record<LandingParamKey, string>>

/** Google Ads identifiers a landing URL can carry. */
export type LandingClickIds = {
    gclid?: string
    gbraid?: string
    wbraid?: string
    /** `gad_campaignid`, auto-appended with auto-tagging. */
    gadCampaignId?: string
}

export type ParsedLandingUrl = {
    clickIds: LandingClickIds
    params: LandingParams
}

/** Parse a stored landing URL; null when it is empty or not a URL. */
function toSearchParams(landingUrl: string | null | undefined) {
    if (!landingUrl) return null
    try {
        // Relative paths (`/lp/request-consultation?gclid=…`) parse against a
        // dummy origin; only the query string matters here.
        return new URL(landingUrl, 'https://placeholder.invalid').searchParams
    } catch {
        return null
    }
}

/**
 * Read the Google click ids and ValueTrack parameters from a landing URL,
 * dropping anything the ad account left unexpanded. Never throws.
 */
export function parseLandingUrl(
    landingUrl: string | null | undefined
): ParsedLandingUrl {
    const params = toSearchParams(landingUrl)
    if (!params) return { clickIds: {}, params: {} }

    const read = (name: string) => readAttributionParam(params, name)

    const clickIds: LandingClickIds = {}
    const gclid = read('gclid')
    const gbraid = read('gbraid')
    const wbraid = read('wbraid')
    const gadCampaignId = read('gad_campaignid')
    if (gclid) clickIds.gclid = gclid
    if (gbraid) clickIds.gbraid = gbraid
    if (wbraid) clickIds.wbraid = wbraid
    // Only a numeric id is a campaign id; anything else is template debris.
    if (gadCampaignId && /^\d+$/.test(gadCampaignId)) {
        clickIds.gadCampaignId = gadCampaignId
    }

    const landingParams: LandingParams = {}
    for (const key of LANDING_PARAM_KEYS) {
        const value = read(key)
        if (value) landingParams[key] = value
    }

    return { clickIds, params: landingParams }
}

/** Landing params, or undefined when the URL carried none (keeps NULL in the DB). */
export function extractLandingParams(
    landingUrl: string | null | undefined
): LandingParams | undefined {
    const { params } = parseLandingUrl(landingUrl)
    return Object.keys(params).length > 0 ? params : undefined
}
