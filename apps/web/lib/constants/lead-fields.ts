/**
 * Lead fields shared by the API and the pages that collect them (#274): the
 * option values the thank-you page's optional questions store, and the
 * placeholder address for leads without an email. Labels are copy and live
 * with each page; these values are what the database and N8N receive.
 *
 * Kept free of zod so client components can import it without pulling the
 * form schema into their bundle.
 */

export const LEAD_CONSULT_TYPES = ['video', 'in-person'] as const
export type LeadConsultType = (typeof LEAD_CONSULT_TYPES)[number]

export const LEAD_FINANCING_INTEREST = ['yes', 'no', 'not-sure'] as const
export type LeadFinancingInterest = (typeof LEAD_FINANCING_INTEREST)[number]

/** Same values as `preferred_contact_time` on every other form. */
export const LEAD_TEXT_TIMES = ['morning', 'afternoon', 'evening'] as const
export type LeadTextTime = (typeof LEAD_TEXT_TIMES)[number]

export const LEAD_HEARD_FROM = [
    'instagram',
    'tiktok',
    'google',
    'friend',
    'other',
] as const
export type LeadHeardFrom = (typeof LEAD_HEARD_FROM)[number]

/** The languages the thread is written in. */
export const LEAD_LANGUAGES = ['en', 'es'] as const
export type LeadLanguage = (typeof LEAD_LANGUAGES)[number]

/**
 * Placeholder addresses for leads who gave no email: the database column is
 * required. `.invalid` is reserved (RFC 2606) and can never receive mail.
 * Older rows used `no-email.com`, a real domain with working mail servers, so
 * both count as "no email" wherever an address might be used.
 */
export const PLACEHOLDER_EMAIL_DOMAIN = 'no-email.invalid'
const PLACEHOLDER_EMAIL_DOMAINS = [PLACEHOLDER_EMAIL_DOMAIN, 'no-email.com']

export function isPlaceholderEmail(email: string | null | undefined): boolean {
    if (!email) return true
    const domain = email.split('@').pop()?.toLowerCase() ?? ''
    return PLACEHOLDER_EMAIL_DOMAINS.includes(domain)
}

/** `ana-1790200472403@no-email.invalid` — unique per lead. */
export function placeholderEmail(firstName: string | undefined): string {
    const local =
        (firstName ?? '')
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || 'lead'
    return `${local}-${Date.now()}@${PLACEHOLDER_EMAIL_DOMAIN}`
}
