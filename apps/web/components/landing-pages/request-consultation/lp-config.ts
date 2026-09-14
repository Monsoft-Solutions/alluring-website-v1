/**
 * The integration points for /lp/request-consultation: the values an operator
 * edits when the destination or the language behaviour changes. Nothing else
 * on the page hard-codes them.
 *
 * There is no form id or submit endpoint here. The form posts through the
 * site's own contact pipeline (`useContactFormSubmission` → `/api/contact`),
 * like every other form on the site.
 *
 * Google Tag Manager is not configured here either: the site loads the
 * container from `NEXT_PUBLIC_GTM_ID`, and this page only pushes events to it.
 */

/** Where a successful submission lands. Carries `?p=`, `?hl=` and `?pv=`. */
export const LP_THANK_YOU_PATH = '/lp/request-consultation/thank-you'

/**
 * `true`: a visitor whose browser is set to Spanish gets the Spanish page on
 * first visit and can switch back. `false`: English unless the ad URL says
 * `?hl=es` or the visitor chose Spanish here before.
 */
export const AUTO_DETECT_LANGUAGE = true
