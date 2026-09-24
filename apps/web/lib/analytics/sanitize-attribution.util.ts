/**
 * Drop ad-platform click IDs that don't belong to the lead's actual source.
 *
 * Instagram's in-app browser auto-appends `fbclid` to every outbound link —
 * organic bio links (doctors, influencers, our own /ig and /fb redirects)
 * included. Carrying that `fbclid` through to our DB and CRM lets Meta credit
 * itself for conversions that came from a non-paid source.
 *
 * Rule: keep a platform's click ID only when both
 *   1. `utm_source` belongs to that platform's family, AND
 *   2. `utm_medium` indicates paid traffic (cpc / paid / paid-social / …).
 *
 * If `utm_source` is missing entirely, click IDs are left alone so direct
 * paid-ad clicks where UTMs were stripped still attribute correctly.
 *
 * Google's click IDs (`gclid`, `gbraid`, `wbraid`) are exempt: no browser or
 * app appends them to organic links, so their presence alone proves an ad
 * click. Gating them on `utm_medium` threw away every Google Ads gclid while
 * the tracking template sent `cpc{ifvideo:video}{ifshopping:shopping}` (#276).
 */

const META_SOURCES = new Set(['facebook', 'fb', 'instagram', 'ig', 'meta'])
const TIKTOK_SOURCES = new Set(['tiktok', 'tiktok_ads'])

const PAID_MEDIUMS = new Set([
    'cpc',
    'ppc',
    'paid',
    'paid-social',
    'paid_social',
    'paidsocial',
    'ads',
    'sponsored',
    'display',
])

export type AdClickIdAttribution = {
    utmSource?: string | null | undefined
    utmMedium?: string | null | undefined
    fbclid?: string | null | undefined
    ttclid?: string | null | undefined
}

export function sanitizeAdClickIds<T extends AdClickIdAttribution>(
    input: T
): T {
    const utmSource = input.utmSource?.trim().toLowerCase()
    if (!utmSource) return input

    const utmMedium = input.utmMedium?.trim().toLowerCase()
    const isPaid = !!utmMedium && PAID_MEDIUMS.has(utmMedium)

    return {
        ...input,
        fbclid:
            isPaid && META_SOURCES.has(utmSource) ? input.fbclid : undefined,
        ttclid:
            isPaid && TIKTOK_SOURCES.has(utmSource) ? input.ttclid : undefined,
    }
}
