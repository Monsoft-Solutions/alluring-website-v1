/**
 * Copy for the ad funnel's confirmation page.
 *
 * Most of the page is the site's own consultation thank-you
 * (`ConsultationThankYou`): the greeting by first name, the after-hours
 * notice, and the five optional questions that save to the lead. This deck
 * holds the page's frame and the two lines it says in its own voice —
 * "private" where the site says "free", per the REGISTER note in `lp-copy.ts`.
 */

import type { ConsultationThankYouCopyOverride } from '@/components/sections/thank-you/consultation-thank-you.component'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

import type { LpLang } from './lp-copy'

export interface LpThankYouDictionary {
    readonly meta: { readonly title: string }
    readonly topbar: { readonly lead: string; readonly emphasis: string }
    readonly callWord: string
    readonly thankYou: ConsultationThankYouCopyOverride
}

const en: LpThankYouDictionary = {
    meta: { title: 'Thank You | Alluring Plastic Surgery' },
    topbar: {
        lead: `Miami, FL · ${KARLINSKY_NAME} · `,
        emphasis: 'Hablamos Español',
    },
    callWord: 'Call ',
    thankYou: {
        body: 'A patient coordinator will text you within 24 hours to set up your private consultation. Keep an eye on your messages.',
        next: [
            'We text you to answer your first questions and find a time.',
            'Your consultation, in person in Miami or by video from anywhere in the U.S.',
            'Your all-inclusive figure and your dates, in writing, with no obligation.',
        ],
    },
}

const es: LpThankYouDictionary = {
    meta: { title: 'Gracias | Alluring Plastic Surgery' },
    topbar: {
        lead: `Miami, FL · Dra. ${KARLINSKY_NAME} · `,
        emphasis: 'Hablamos Español',
    },
    callWord: 'Llama ',
    thankYou: {
        body: 'Una coordinadora te escribe por texto en menos de 24 horas para agendar tu consulta privada. Pendiente a tus mensajes.',
        next: [
            'Te escribimos para responder tus primeras preguntas y buscar una fecha.',
            'Tu consulta, en persona en Miami o por video desde cualquier lugar de EE. UU.',
            'Tu cifra todo incluido y tus fechas, por escrito y sin compromiso.',
        ],
    },
}

export const LP_THANK_YOU_COPY: Readonly<Record<LpLang, LpThankYouDictionary>> =
    { en, es }
