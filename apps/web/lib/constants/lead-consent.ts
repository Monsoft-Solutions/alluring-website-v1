/**
 * Consent to be called and texted, given by sending a form (#350).
 *
 * The owner's decision: no website form has a consent checkbox. A notice
 * sits directly above every submit button and says that sending the form
 * lets the practice call and text the number entered — the same terms as
 * the Meta instant forms, live since 2026-09-24
 * (`alluring-db/web-lead-tracking/submit-consent-forms.json`).
 *
 * Every lead form renders `ConsentNotice` and sends `SUBMIT_CONSENT`, so
 * each lead records that it consented, how (`tap`: the notice above the
 * button) and to which wording (`LEAD_CONSENT_VERSION`). Earlier wordings
 * stay readable in `lead-consent-archive.ts`.
 *
 * Kept free of zod so client components can import it.
 */

import { siteConfig } from '@/lib/data/site-config'

/**
 * How a lead consented to texts: `checkbox` (a box it ticked, before #350)
 * or `tap` (a notice above the button; sending is the consent).
 */
export const LEAD_CONSENT_METHODS = ['checkbox', 'tap'] as const
export type LeadConsentMethod = (typeof LEAD_CONSENT_METHODS)[number]

/**
 * Names the wording below. Change it, and archive the old wording in
 * `lead-consent-archive.ts`, whenever the notice's words change in either
 * language.
 */
export const LEAD_CONSENT_VERSION = 'site-submit-2026-10-24'

/** What every lead form sends with the lead. */
export const SUBMIT_CONSENT = {
    consentGiven: true,
    consentMethod: 'tap',
    consentVersion: LEAD_CONSENT_VERSION,
} as const satisfies {
    consentGiven: true
    consentMethod: LeadConsentMethod
    consentVersion: string
}

export type ConsentLang = 'en' | 'es'

/** The notice, split around the phone number so it can be drawn as a link. */
export interface ConsentNoticeParts {
    readonly beforePhone: string
    /** The practice's number, as people read it: "(786) 305-8649". */
    readonly phone: string
    readonly afterPhone: string
    readonly privacy: string
    readonly terms: string
}

/** "(786) 305-8649", from the site's `+1 (786) 305-8649`. */
const PHONE = (
    siteConfig.contact.phoneDisplay ?? siteConfig.contact.phone
).replace(/^\+1[\s-]*/, '')
const BUSINESS = siteConfig.business.name

const NOTICE: Readonly<Record<ConsentLang, ConsentNoticeParts>> = {
    en: {
        beforePhone: `By submitting this form, you agree that ${BUSINESS} may call and text you about your consultation request at the phone number you entered, including automated texts. Consent isn’t a condition of purchase; you can call us at `,
        phone: PHONE,
        afterPhone:
            ' instead. Msg & data rates may apply. Msg frequency varies. Reply STOP to opt out, HELP for help.',
        privacy: 'Privacy Policy',
        terms: 'Terms',
    },
    es: {
        beforePhone: `Al enviar este formulario, aceptas que ${BUSINESS} te llame y te envíe mensajes de texto sobre tu solicitud de consulta al número de teléfono que nos diste, incluidos mensajes automatizados. El consentimiento no es una condición de compra; también puedes llamarnos al `,
        phone: PHONE,
        afterPhone:
            '. Pueden aplicarse tarifas por mensajes y datos. La frecuencia de los mensajes varía. Responde STOP para cancelar o HELP para recibir ayuda.',
        privacy: 'Política de privacidad',
        terms: 'Términos',
    },
}

export function consentNoticeParts(lang: ConsentLang): ConsentNoticeParts {
    return NOTICE[lang]
}

/** The notice as one plain sentence, as the CRM and the archive keep it. */
export function consentNoticeText(lang: ConsentLang): string {
    const { beforePhone, phone, afterPhone } = NOTICE[lang]
    return `${beforePhone}${phone}${afterPhone}`
}
