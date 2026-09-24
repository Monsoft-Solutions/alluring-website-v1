/**
 * Reading ad-platform URL parameters that the ad account did not fill in.
 *
 * The Google Ads tracking template puts every UTM in the URL twice: first a
 * copy carrying placeholders Google never expands (`{ifvideo:video}`,
 * `{campaignname}`, `{adgroupname}` are not ValueTrack parameters), then a
 * clean copy (`utm_medium=cpc`). `URLSearchParams.get()` returns the first,
 * so every Google lead stored `utm_medium=cpc{ifvideo:video}{ifshopping:shopping}`
 * — and `sanitizeAdClickIds` then threw its gclid away as non-paid (#276).
 *
 * The URL helpers live in `@workspace/shared/attribution`, so the admin's Ads
 * console reads a stored landing URL exactly the way the site captured it.
 */

export {
    readAttributionParam,
    stripPlaceholders,
} from '@workspace/shared/attribution'

/** A first-party cookie's value, or undefined when it is not set. */
export function readCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined

    const prefix = `${name}=`
    const entry = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith(prefix))
    return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined
}
