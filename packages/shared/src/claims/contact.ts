/**
 * The practice's static contact details (claims canon §9). `siteConfig.contact`
 * in `apps/web` carries the same values; `siteUrl` stays in the web app
 * because it needs env. This module gives `packages/ai` (the chat prompt) and
 * the admin the real phone, email and hours.
 *
 * @module @workspace/shared/claims/contact
 */

export const CONTACT = {
    /** E.164-ish form used to build `tel:` links. */
    phone: '+1-786-305-8649',
    /** How the number is printed. It does not receive texts. */
    phoneDisplay: '+1 (786) 305-8649',
    email: 'info@alluringplasticsurgery.com',
    address: '8435 SW 24th St',
    city: 'Miami',
    state: 'FL',
    postalCode: '33155',
    country: 'United States',
    timezone: 'America/New_York',
    hours: [
        { days: 'Monday–Friday', open: '9:00 AM', close: '5:00 PM' },
        { days: 'Saturday', open: '9:00 AM', close: '3:00 PM' },
        { days: 'Sunday', open: null, close: null },
    ],
    /** Closed on Sundays and public holidays. */
    hoursNote: 'Closed on Sundays and public holidays.',
} as const

/** "8435 SW 24th St, Miami, FL 33155". */
export const CONTACT_ADDRESS_LINE = `${CONTACT.address}, ${CONTACT.city}, ${CONTACT.state} ${CONTACT.postalCode}`

/** `tel:+17863058649`. */
export const PHONE_HREF = `tel:${CONTACT.phone.replace(/[^\d+]/g, '')}`

/** The hours in one line, for prompts and plain text. */
export const HOURS_LINE =
    'Monday–Friday 9:00 AM–5:00 PM; Saturday 9:00 AM–3:00 PM; closed Sundays and public holidays.'

/**
 * Where body links send a reader who wants to get in touch (D11). The
 * `#contactus` anchor does not exist; links to it are dead.
 */
export const CONTACT_PAGE_PATH = '/contact-us'

/** The canonical site origin. Paths are built on it, never `alluringmiami.com`. */
export const CANONICAL_ORIGIN = 'https://www.alluringplasticsurgery.com'

/** Rules for contact details in copy. */
export const CONTACT_RULES = [
    'Read phone, email, address and hours from the site config; never type them in a new place.',
    'No phone number in a blog post body: the post template supplies contact.',
    `Contact links go to ${CONTACT_PAGE_PATH}, never #contactus.`,
    'Never promise a response time ("we\'ll call you in 5 minutes"). The practice answers leads by text.',
    'The main line does not receive texts.',
] as const
