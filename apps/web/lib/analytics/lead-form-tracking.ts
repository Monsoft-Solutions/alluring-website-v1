/**
 * Lead-form funnel tracking
 *
 * One vocabulary for every form that posts to `/api/contact`, so each page's
 * funnel reads the same way in GA4: seen → started → attempted → succeeded,
 * with errors in between. Issue #272.
 *
 * The names are deliberately not GA4's own `form_start` / `form_submit`:
 * enhanced measurement (form interactions) emits those automatically, and
 * the site's old `form_start` fired at submit time under the same name.
 *
 * Params carry the form and, for errors, which fields failed — never a value.
 * The procedure, timeline and contact details stay in our database; a lead
 * is joined to its GA4 behaviour through `ga_client_id` instead.
 *
 * @module lib/analytics/lead-form-tracking
 */
import {
    setClarityTag,
    trackClarityEvent,
    trackEvent,
} from './analytics.client'

export const LEAD_FORM_EVENTS = {
    VIEW: 'lead_form_view',
    START: 'lead_form_start',
    /** One answer in a multi-step form (chat thread, quiz). */
    STEP: 'lead_step',
    SUBMIT_ATTEMPT: 'lead_submit_attempt',
    SUBMIT_ERROR: 'lead_submit_error',
    SUBMIT_SUCCESS: 'lead_submit_success',
} as const

export type LeadFormEvent =
    (typeof LEAD_FORM_EVENTS)[keyof typeof LEAD_FORM_EVENTS]

/**
 * Which version of a form and page the visitor saw, and where an answer was
 * given — for forms under an A/B test (the ads landing page, #292).
 */
export type LeadFormContextParams = {
    /** The form arm: `thread`, `card`. */
    readonly form_variant?: string
    /** The page version: `ads-consultation-v6`. */
    readonly page_variant?: string
}

export type LeadFormEventParams = LeadFormContextParams & {
    /** Which step or fields failed validation, comma-separated names only. */
    readonly field?: string
    /** `validation`, `api_error`, `http_error`, `network_error`, … */
    readonly error_type?: string
    /** Contact method picked in a chat-style form (`text` / `call`). */
    readonly method?: string
    /** Name of the step just answered (`procedure`, `timeline`, …) — never the answer. */
    readonly step?: string
    readonly step_index?: number
    /**
     * Where a step was answered: in the form itself, or through a link that
     * answers it (the sticky bar, the closing chips, a sitelink's strip).
     */
    readonly entry_point?: string
}

/** Clarity tag set at each milestone, so recordings filter by funnel stage. */
const CLARITY_STAGE_TAG = 'lead_stage'

/**
 * Sends one funnel event to GA4 and marks the milestone in Clarity.
 */
export function trackLeadFormEvent(
    event: LeadFormEvent,
    formName: string,
    params: LeadFormEventParams = {}
): void {
    trackEvent(event, { form_name: formName, ...params })

    if (event !== LEAD_FORM_EVENTS.VIEW) {
        trackClarityEvent(event)
        setClarityTag(CLARITY_STAGE_TAG, event)
        setClarityTag('lead_form', formName)
    }
}

/**
 * The GA4 client id from the `_ga` cookie (`GA1.1.<random>.<timestamp>` →
 * `<random>.<timestamp>`), or undefined before the tag has set it or when
 * analytics cookies are blocked.
 */
export function readGaClientId(): string | undefined {
    if (typeof document === 'undefined') return undefined

    const cookie = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith('_ga='))
    if (!cookie) return undefined

    const parts = cookie.slice('_ga='.length).split('.')
    if (parts.length < 4) return undefined

    const clientId = parts.slice(-2).join('.')
    return /^\d+\.\d+$/.test(clientId) ? clientId : undefined
}
