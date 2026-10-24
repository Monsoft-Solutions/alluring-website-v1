/**
 * Where a visit came from, as one `{ source, medium }` pair.
 *
 * Shared by the website (the first-touch record it stores with each lead,
 * #350) and the admin (the lead source it shows and counts), so a referrer
 * reads the same way wherever it is read.
 *
 * AI assistants get their own medium, `ai`, and one name each however they
 * arrive: ChatGPT links carry `utm_source=chatgpt.com`, Perplexity and
 * Copilot usually send only a referrer, and `gemini.google.com` must not be
 * mistaken for Google search.
 */

export interface TrafficSource {
    readonly source: string
    readonly medium: string
}

/** The medium every AI assistant's visits are filed under. */
export const AI_MEDIUM = 'ai'

/** AI assistants by host (and by the bare names their UTMs use). */
const AI_SOURCES: Readonly<Record<string, string>> = {
    'chatgpt.com': 'chatgpt',
    'chat.openai.com': 'chatgpt',
    chatgpt: 'chatgpt',
    'perplexity.ai': 'perplexity',
    perplexity: 'perplexity',
    'copilot.microsoft.com': 'copilot',
    'copilot.com': 'copilot',
    copilot: 'copilot',
    'gemini.google.com': 'gemini',
    'bard.google.com': 'gemini',
    gemini: 'gemini',
    'claude.ai': 'claude',
    claude: 'claude',
}

/** Search engines and social networks by host. */
const KNOWN_REFERRERS: Readonly<Record<string, TrafficSource>> = {
    // Search engines → organic
    'google.com': { source: 'google', medium: 'organic' },
    'bing.com': { source: 'bing', medium: 'organic' },
    'duckduckgo.com': { source: 'duckduckgo', medium: 'organic' },
    'yahoo.com': { source: 'yahoo', medium: 'organic' },

    // Social
    'facebook.com': { source: 'facebook', medium: 'social' },
    'm.facebook.com': { source: 'facebook', medium: 'social' },
    'l.facebook.com': { source: 'facebook', medium: 'social' },
    'lm.facebook.com': { source: 'facebook', medium: 'social' },
    'fb.com': { source: 'facebook', medium: 'social' },
    'instagram.com': { source: 'instagram', medium: 'social' },
    'l.instagram.com': { source: 'instagram', medium: 'social' },
    'tiktok.com': { source: 'tiktok', medium: 'social' },
    'linkedin.com': { source: 'linkedin', medium: 'social' },
    'twitter.com': { source: 'twitter', medium: 'social' },
    'x.com': { source: 'twitter', medium: 'social' },
    't.co': { source: 'twitter', medium: 'social' },
    'pinterest.com': { source: 'pinterest', medium: 'social' },
    'youtube.com': { source: 'youtube', medium: 'social' },
    'm.youtube.com': { source: 'youtube', medium: 'social' },
    'youtu.be': { source: 'youtube', medium: 'social' },
}

/** Lower case, without a leading `www.`. */
export function normalizeHost(host: string): string {
    return host
        .trim()
        .toLowerCase()
        .replace(/^www\./, '')
}

/**
 * The normalized host of a referrer URL, or null when there is none or it
 * isn't an http(s) URL (`android-app://…`, garbage).
 */
export function referrerHost(
    referrer: string | null | undefined
): string | null {
    if (!referrer) return null
    try {
        const url = new URL(referrer)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
        return normalizeHost(url.hostname) || null
    } catch {
        return null
    }
}

/**
 * The assistant's canonical name for a host or a UTM source naming an AI
 * assistant (`chatgpt.com`, `https://www.perplexity.ai/`, `Copilot`), or
 * null for anything else.
 */
export function normalizeAiSource(
    value: string | null | undefined
): string | null {
    if (!value) return null
    const bare = normalizeHost(value.replace(/^[a-z][a-z0-9+.-]*:\/\//i, ''))
        .split(/[/?#]/)[0]
        ?.replace(/:\d+$/, '')
    return (bare && AI_SOURCES[bare]) ?? null
}

/**
 * A known host's source and medium: an AI assistant, a search engine (any
 * `google.*`) or a social network. Null for any other host.
 */
export function knownReferrerSource(host: string): TrafficSource | null {
    const normalized = normalizeHost(host)
    const ai = AI_SOURCES[normalized]
    if (ai) return { source: ai, medium: AI_MEDIUM }
    if (/^google\.[a-z.]+$/.test(normalized))
        return KNOWN_REFERRERS['google.com']!
    return KNOWN_REFERRERS[normalized] ?? null
}

/**
 * A UTM source and medium as stored: lower case, with an AI assistant's
 * source given its canonical name and, when no medium came with it, `ai`.
 */
export function normalizeUtmSource(
    utmSource: string | null | undefined,
    utmMedium?: string | null
): TrafficSource | null {
    const source = utmSource?.trim().toLowerCase()
    if (!source) return null
    const medium = utmMedium?.trim().toLowerCase()
    const ai = normalizeAiSource(source)
    if (ai) return { source: ai, medium: medium || AI_MEDIUM }
    return { source, medium: medium || '(not set)' }
}

/** What a visit's landing URL and referrer can say about where it came from. */
export interface TouchInput {
    readonly utmSource?: string | null
    readonly utmMedium?: string | null
    readonly gclid?: string | null
    readonly gbraid?: string | null
    readonly wbraid?: string | null
    readonly fbclid?: string | null
    readonly ttclid?: string | null
    readonly referrer?: string | null
}

/**
 * One visit's source and medium: its UTMs, else its ad click id, else its
 * referrer, else direct. Never throws.
 */
export function classifyTouch(input: TouchInput): TrafficSource {
    const utm = normalizeUtmSource(input.utmSource, input.utmMedium)
    if (utm) return utm
    if (input.gclid || input.gbraid || input.wbraid) {
        return { source: 'google', medium: 'cpc' }
    }
    if (input.fbclid) return { source: 'facebook', medium: 'paid' }
    if (input.ttclid) return { source: 'tiktok', medium: 'paid' }
    const host = referrerHost(input.referrer)
    if (host) {
        return knownReferrerSource(host) ?? { source: host, medium: 'referral' }
    }
    return { source: 'direct', medium: '(none)' }
}

/**
 * The first visit this browser made to the site, stored with every lead it
 * sends (`contact_submission.first_touch`, #350) and never overwritten.
 */
export interface FirstTouch {
    readonly source: string
    readonly medium: string
    readonly campaign?: string
    /** The external page that sent the visit; absent for direct visits. */
    readonly referrer?: string
    readonly landingPage: string
    /** ISO time of the visit. */
    readonly at: string
}
