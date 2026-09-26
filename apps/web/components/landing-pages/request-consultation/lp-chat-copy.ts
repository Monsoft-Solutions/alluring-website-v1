/**
 * The consultation form's words on /lp/request-consultation, for both test
 * arms (#292): the quiet thread and the tap card read the same deck.
 *
 * The form is the site's (`useConsultFlow`, the one on the home, contact and
 * specials pages): three steps, the first two a single tap. This deck gives
 * it the landing page's voice — "no obligation", never "free" (see the
 * REGISTER note in `lp-copy.ts`) — and a form header in place of the
 * coordinator's name.
 *
 * v6 takes out what stopped paid visitors (26 Sep readout): the reply after
 * the first tap (six lines, with a price, that half of them left on), the
 * greeting, the checkbox and its 69-word consent. Consent is given by tapping
 * the button, and the line above it names the button (`consentTap`), so the
 * line is built from `submit` and can never name a button that isn't there.
 * The FAQ keeps the settled starting prices.
 *
 * Chips: the ad group's procedure first (preselected, still one tap), then
 * the six that make up 88% of the page's leads over six months, then
 * "Something else". An ad group whose procedure is outside the six (a breast
 * lift) gets eight.
 *
 * Built on the server: the facts files stay out of the client bundle, and the
 * page hands both languages to the form so a language switch needs no
 * request.
 */

import type {
    ConsultChatCopy,
    ConsultChatLang,
    ConsultChatStaffLabels,
} from '@/components/shared/consult-chat/consult-chat.types'
import {
    CHAT_STARTING_PRICES,
    CHAT_TIMELINES,
    type ChatProcedureValue,
    chatProcedureOptions,
} from '@/components/shared/consult-chat/site-chat-copy'

import { LP_COPY, LP_LINKS, type RichText } from './lp-copy'
import { type AdVariant, VARIANT_PROCEDURE } from './lp-variants'

/**
 * Names the tap-consent wording each lead agreed to (`consent_version`).
 * Change it whenever `consentTap` changes, in either language.
 */
export const LP_CONSENT_VERSION = 'lp-tap-2026-09-26'

export interface LpChat {
    readonly copy: Readonly<Record<ConsultChatLang, ConsultChatCopy>>
    readonly staff: ConsultChatStaffLabels
    /** Settled starting prices by procedure value ("$5,500"), for the FAQ. */
    readonly prices: Readonly<Partial<Record<ChatProcedureValue, string>>>
}

/** Lipo 360, a combination, mommy makeover, BBL, breast augmentation, tummy tuck. */
const LP_PROCEDURE_ORDER: readonly ChatProcedureValue[] = [
    'liposuction',
    'multiple',
    'mommy-makeover',
    'bbl',
    'breast-augmentation',
    'tummy-tuck',
    'other',
]

/** The six, with the ad group's procedure moved (or added) to the front. */
export function lpProcedureOrder(
    adVariant: AdVariant
): readonly ChatProcedureValue[] {
    const lead = VARIANT_PROCEDURE[adVariant]
    return lead
        ? [lead, ...LP_PROCEDURE_ORDER.filter((value) => value !== lead)]
        : LP_PROCEDURE_ORDER
}

/** The consent line above the button. Verbatim for counsel; see `LP_CONSENT_VERSION`. */
function consentTap(lang: ConsultChatLang, submit: string): RichText {
    const { privacy, terms } = LP_COPY[lang].footer
    const links: RichText = [
        { link: { label: privacy, href: LP_LINKS.privacy } },
        ' · ',
        { link: { label: terms, href: LP_LINKS.terms } },
    ]
    return lang === 'es'
        ? [
              `Al tocar “${submit}”, aceptas recibir mensajes de texto y llamadas de Alluring Plastic Surgery en este número, incluso automatizados. El consentimiento no es condición de compra. La frecuencia de los mensajes varía; pueden aplicar tarifas de mensajes y datos. Responde STOP para cancelar y HELP para ayuda. `,
              ...links,
          ]
        : [
              `By tapping “${submit}”, you agree to receive texts and calls from Alluring Plastic Surgery at this number, including automated ones. Consent is not a condition of purchase. Msg frequency varies; msg & data rates may apply. Reply STOP to opt out, HELP for help. `,
              ...links,
          ]
}

function copyFor(
    adVariant: AdVariant
): Readonly<Record<ConsultChatLang, ConsultChatCopy>> {
    const order = lpProcedureOrder(adVariant)
    const en = { submit: 'Request my consultation' }
    const es = { submit: 'Pedir mi consulta' }
    return {
        en: {
            title: 'Request your consultation',
            status: 'Replies by text within 24 hours',
            greeting: '',
            qProcedure: 'What are you considering?',
            procedures: chatProcedureOptions(order, 'en', 'Something else'),
            qTimeline: 'When would you like it done?',
            timelines: CHAT_TIMELINES.en,
            qContact: 'Where should we text you?',
            fieldName: 'First name',
            fieldPhone: 'Mobile number',
            consent: LP_COPY.en.consent,
            consentTap: consentTap('en', en.submit),
            submit: en.submit,
            submitting: 'Sending…',
            change: 'Change',
            typing: 'Alluring is typing',
            stepLabel: 'Step {n} of 3',
            reassure:
                'Private. A patient coordinator texts you within 24 hours.',
            formHeader: {
                time: '30 seconds',
                lastStep: 'Last step',
                steps: ['Procedure', 'Timing', 'Your number'],
            },
            errors: {
                name: 'Enter your first name.',
                phone: 'Enter a US mobile number, with area code.',
                consent: 'Please tick the box so we’re allowed to text you.',
                submit: 'That didn’t go through. Please try again, or call us.',
            },
        },
        es: {
            title: 'Pide tu consulta',
            status: 'Responde por texto en 24 horas',
            greeting: '',
            qProcedure: '¿Qué estás considerando?',
            procedures: chatProcedureOptions(order, 'es', 'Otro'),
            qTimeline: '¿Para cuándo te gustaría hacerlo?',
            timelines: CHAT_TIMELINES.es,
            qContact: '¿A qué número te escribimos?',
            fieldName: 'Nombre',
            fieldPhone: 'Número de celular',
            consent: LP_COPY.es.consent,
            consentTap: consentTap('es', es.submit),
            submit: es.submit,
            submitting: 'Enviando…',
            change: 'Cambiar',
            typing: 'Alluring está escribiendo',
            stepLabel: 'Paso {n} de 3',
            reassure:
                'Privado. Una coordinadora te escribe por texto en menos de 24 horas.',
            formHeader: {
                time: '30 segundos',
                lastStep: 'Último paso',
                steps: ['Procedimiento', 'Fecha', 'Tu número'],
            },
            errors: {
                name: 'Escribe tu nombre.',
                phone: 'Escribe un celular de EE. UU., con código de área.',
                consent: 'Marca la casilla para que podamos escribirte.',
                submit: 'No se pudo enviar. Inténtalo de nuevo o llámanos.',
            },
        },
    }
}

/** The form's copy for an ad group, the English labels staff read, and prices. */
export function buildLpChat(adVariant: AdVariant): LpChat {
    const copy = copyFor(adVariant)
    return {
        copy,
        staff: { procedures: copy.en.procedures, timelines: CHAT_TIMELINES.en },
        prices: CHAT_STARTING_PRICES,
    }
}
