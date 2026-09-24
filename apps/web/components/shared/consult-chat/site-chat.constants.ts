/**
 * Where the consultation thread on site pages (/contact-us, specials) sends
 * a lead, and where it leaves it for that page to read (#274). Shared by the
 * thread's pages and the thank-you page, so kept apart from the copy.
 */

/** Its path contains "thank-you", which the tag container's conversion trigger matches. */
export const SITE_CHAT_THANK_YOU_PATH = '/thank-you/consultation'

/** `sessionStorage` key for the first name and the saved lead's update token. */
export const SITE_CHAT_LEAD_KEY = 'cc_lead'
