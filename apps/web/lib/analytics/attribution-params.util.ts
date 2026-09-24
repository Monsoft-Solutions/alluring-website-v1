/**
 * Reading ad-platform URL parameters that the ad account did not fill in.
 *
 * The Google Ads tracking template puts every UTM in the URL twice: first a
 * copy carrying placeholders Google never expands (`{ifvideo:video}`,
 * `{campaignname}`, `{adgroupname}` are not ValueTrack parameters), then a
 * clean copy (`utm_medium=cpc`). `URLSearchParams.get()` returns the first,
 * so every Google lead stored `utm_medium=cpc{ifvideo:video}{ifshopping:shopping}`
 * — and `sanitizeAdClickIds` then threw its gclid away as non-paid (#276).
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

/** A first-party cookie's value, or undefined when it is not set. */
export function readCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined

    const prefix = `${name}=`
    const entry = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith(prefix))
    return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined
}
