import type {
    LeadAttribution,
    LeadAttributionInput,
} from '@/lib/types/analytics/lead-trends.type'

/**
 * Maps a hostname to a canonical { source, medium } attribution.
 * Order does not matter; hosts are matched exactly after normalization.
 */
const KNOWN_REFERRERS: Record<string, { source: string; medium: string }> = {
    // Search engines → organic
    'google.com': { source: 'google', medium: 'organic' },
    'bing.com': { source: 'bing', medium: 'organic' },
    'duckduckgo.com': { source: 'duckduckgo', medium: 'organic' },
    'yahoo.com': { source: 'yahoo', medium: 'organic' },

    // Social
    'facebook.com': { source: 'facebook', medium: 'social' },
    'm.facebook.com': { source: 'facebook', medium: 'social' },
    'fb.com': { source: 'facebook', medium: 'social' },
    'instagram.com': { source: 'instagram', medium: 'social' },
    'tiktok.com': { source: 'tiktok', medium: 'social' },
    'linkedin.com': { source: 'linkedin', medium: 'social' },
    'twitter.com': { source: 'twitter', medium: 'social' },
    'x.com': { source: 'twitter', medium: 'social' },
    't.co': { source: 'twitter', medium: 'social' },
    'pinterest.com': { source: 'pinterest', medium: 'social' },
    'youtube.com': { source: 'youtube', medium: 'social' },
    'youtu.be': { source: 'youtube', medium: 'social' },
}

function normalizeHost(host: string): string {
    return host.toLowerCase().replace(/^www\./, '')
}

/**
 * Parse the hostname from a raw referrer string. Returns null for
 * unparseable input (empty, malformed, non-http protocols).
 */
function parseReferrerHost(referrer: string | null): string | null {
    if (!referrer) return null
    try {
        const url = new URL(referrer)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return null
        }
        return normalizeHost(url.hostname)
    } catch {
        return null
    }
}

/**
 * Match a hostname against KNOWN_REFERRERS. Falls through ccTLD variants of
 * google (google.co.uk, google.es, …) by mapping any google.* host to google.com.
 */
function lookupKnownReferrer(
    host: string
): { source: string; medium: string } | null {
    if (host === 'google.com' || /^google\.[a-z.]+$/.test(host)) {
        return KNOWN_REFERRERS['google.com']!
    }
    return KNOWN_REFERRERS[host] ?? null
}

/**
 * Classify a lead into a canonical { source, medium, classification } tuple.
 * Never throws; always returns a valid value.
 */
export function classifyLeadAttribution(
    input: LeadAttributionInput
): LeadAttribution {
    const utmSource = input.utmSource?.trim().toLowerCase()
    const utmMedium = input.utmMedium?.trim().toLowerCase()
    if (utmSource && utmMedium) {
        return { source: utmSource, medium: utmMedium, classification: 'utm' }
    }

    if (input.gclid) {
        return { source: 'google', medium: 'cpc', classification: 'click-id' }
    }
    if (input.fbclid) {
        return {
            source: 'facebook',
            medium: 'paid',
            classification: 'click-id',
        }
    }
    if (input.ttclid) {
        return { source: 'tiktok', medium: 'paid', classification: 'click-id' }
    }

    const host = parseReferrerHost(input.referrer)
    if (host) {
        const known = lookupKnownReferrer(host)
        if (known) {
            return { ...known, classification: 'referrer' }
        }
        return {
            source: `referral/${host}`,
            medium: 'referral',
            classification: 'referrer',
        }
    }

    const source = input.source?.trim().toLowerCase()
    if (source) {
        return { source, medium: '(none)', classification: 'source-field' }
    }

    return { source: 'direct', medium: 'direct', classification: 'direct' }
}
