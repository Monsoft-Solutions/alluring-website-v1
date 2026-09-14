/**
 * The integration point for /lp/request-consultation — the block an operator
 * edits when Loquent, the form or the destination changes. Nothing else on the
 * page hard-codes any of it.
 *
 * The Loquent *site tag* is deliberately absent: the root layout already loads
 * it on every route (`app/layout.tsx`), and that one tag is what mounts this
 * form. Adding a second copy here would double-mount the embed.
 *
 * Google Tag Manager is absent for the same reason — the site loads the
 * container from `NEXT_PUBLIC_GTM_ID`, and this page only pushes events to it.
 */

/** Loquent → Website → Forms → "Evaluation - Landing Page". */
export const LOQUENT_FORM_ID = 'frm_9f7e24a1ae5047c2bd1c3c9de69ca9ad'

/**
 * The request the embed makes on submit. The page watches for this exact path
 * to gate the submission on consent and to redirect afterwards, so it has to
 * track the form id.
 */
export const LOQUENT_SUBMIT_PATH = `/api/tag/form/${LOQUENT_FORM_ID}/submit`

/** Where a successful submission lands. Carries `?p=`, `?hl=` and `?pv=`. */
export const LP_THANK_YOU_PATH = '/lp/request-consultation/thank-you'

/**
 * `true`: the embed's own field labels ("First name", "Phone"…) follow the
 * page language. The submit button always does. Loquent's validation messages
 * stay English either way.
 */
export const RELABEL_FIELDS = true

/**
 * `true`: a visitor whose browser is set to Spanish gets the Spanish page on
 * first visit and can switch back. `false`: English unless the ad URL says
 * `?hl=es` or the visitor chose Spanish here before.
 */
export const AUTO_DETECT_LANGUAGE = true

/**
 * What the "Preferred Language" select in Loquent expects. These are option
 * values in the form, not display copy.
 */
export const LOQUENT_LANGUAGE_VALUE = {
    en: 'English',
    es: 'Spanish',
} as const
