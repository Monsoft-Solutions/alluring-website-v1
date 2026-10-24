/**
 * Every consent wording a stored lead can name, so a lead keeps saying what
 * it agreed to after the form's words change (#350).
 *
 * A lead's `consent_version` is a key of `CONSENT_WORDINGS`. Leads with
 * `consent_method = 'checkbox'` and no version agreed to `CHECKBOX_WORDING`,
 * the site-wide box the threads, the lead popup and the landing pages showed
 * before #350. (The long consultation form and the quiz drew their own box
 * with similar words, sending no method; their text is in git history at
 * `consultation-form.component.tsx` and `lead-capture-step.component.tsx`
 * before #350.)
 *
 * Server-side and tests only: none of this needs to reach a browser.
 */

import {
    consentNoticeText,
    type ConsentLang,
    LEAD_CONSENT_VERSION,
    type LeadConsentMethod,
} from './lead-consent'

export interface ConsentWording {
    readonly method: LeadConsentMethod
    /** First day leads were sent with it. */
    readonly since: string
    /** What the visitor saw, in each language, without the legal links. */
    readonly text: Readonly<Record<ConsentLang, string>>
}

/** The ads landing page's tap line, v6 (#292) until the box came back (#307). */
export const LP_TAP_CONSENT_VERSION = 'lp-tap-2026-09-26'

export const CONSENT_WORDINGS: Readonly<Record<string, ConsentWording>> = {
    [LEAD_CONSENT_VERSION]: {
        method: 'tap',
        since: '2026-10-24',
        text: { en: consentNoticeText('en'), es: consentNoticeText('es') },
    },
    [LP_TAP_CONSENT_VERSION]: {
        method: 'tap',
        since: '2026-09-26',
        text: {
            en: 'By tapping “Request my consultation”, you agree to receive texts and calls from Alluring Plastic Surgery at this number, including automated ones. Consent is not a condition of purchase. Msg frequency varies; msg & data rates may apply. Reply STOP to opt out, HELP for help.',
            es: 'Al tocar “Pedir mi consulta”, aceptas recibir mensajes de texto y llamadas de Alluring Plastic Surgery en este número, incluso automatizados. El consentimiento no es condición de compra. La frecuencia de los mensajes varía; pueden aplicar tarifas de mensajes y datos. Responde STOP para cancelar y HELP para ayuda.',
        },
    },
}

/** The site-wide checkbox: `consent_method = 'checkbox'`, no version. */
export const CHECKBOX_WORDING: Readonly<Record<ConsentLang, string>> = {
    en: 'I have read and understood the Privacy Policy and Terms. By submitting my mobile number and email, I expressly consent to receive informational and promotional messages from Alluring Plastic Surgery through SMS, email, and phone calls, including messages sent using an automatic telephone dialing system. Consent is not a condition of purchase. Msg & data rates may apply. Msg frequency varies. Reply STOP to opt out, HELP for help.*',
    es: 'He leído y entiendo la Política de Privacidad y los Términos. Al enviar mi número de celular y correo, doy mi consentimiento expreso para recibir mensajes informativos y promocionales de Alluring Plastic Surgery por SMS, correo electrónico y llamadas, incluidos mensajes enviados con un sistema de marcación automática. El consentimiento no es condición de compra. Pueden aplicar tarifas de mensajes y datos. La frecuencia varía. Responda STOP para cancelar, HELP para ayuda.*',
}

/**
 * How a lead consented, in the words staff read in the lead note and the
 * CRM: "by submitting the form, notice site-submit-2026-10-24 of 2026-10-24".
 * Null when the lead did not consent.
 */
export function describeConsent(lead: {
    readonly consentGiven?: boolean | null
    readonly consentMethod?: string | null
    readonly consentVersion?: string | null
}): string | null {
    if (!lead.consentGiven) return null
    const version = lead.consentVersion
    if (lead.consentMethod === 'tap') {
        const known = version && CONSENT_WORDINGS[version]
        return known
            ? `by submitting the form, notice ${version} of ${known.since}`
            : `by submitting the form${version ? `, notice ${version}` : ''}`
    }
    if (lead.consentMethod === 'checkbox') return 'ticked the consent box'
    return 'yes (form did not say how)'
}
