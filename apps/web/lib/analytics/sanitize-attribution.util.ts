/**
 * Drop ad-platform click IDs that don't belong to the lead's actual source.
 *
 * Instagram's in-app browser auto-appends `fbclid` to every outbound link,
 * including organic ones (doctor bio links, influencer pages, etc.). Carrying
 * that `fbclid` through to our DB and CRM lets Meta credit itself for
 * conversions that came from a non-Meta source.
 *
 * Rule: when `utm_source` is explicitly set, keep only the click ID for the
 * matching platform. When `utm_source` is missing, leave click IDs alone so
 * direct paid-ad clicks (UTMs stripped, click ID present) still attribute.
 */

const META_SOURCES = new Set(['facebook', 'fb', 'instagram', 'ig', 'meta'])
const GOOGLE_SOURCES = new Set(['google', 'google_ads', 'gads', 'adwords'])
const TIKTOK_SOURCES = new Set(['tiktok', 'tiktok_ads'])

export type AdClickIdAttribution = {
    utmSource?: string | null | undefined
    fbclid?: string | null | undefined
    gclid?: string | null | undefined
    ttclid?: string | null | undefined
}

export function sanitizeAdClickIds<T extends AdClickIdAttribution>(
    input: T
): T {
    const utmSource = input.utmSource?.trim().toLowerCase()
    if (!utmSource) return input

    return {
        ...input,
        fbclid: META_SOURCES.has(utmSource) ? input.fbclid : undefined,
        gclid: GOOGLE_SOURCES.has(utmSource) ? input.gclid : undefined,
        ttclid: TIKTOK_SOURCES.has(utmSource) ? input.ttclid : undefined,
    }
}
