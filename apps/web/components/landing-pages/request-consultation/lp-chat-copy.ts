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
 * the first tap (six lines, with a price, that half of them left on) and the
 * greeting. Consent is the site-wide notice above the button
 * (`ConsentNotice`, #350): sending is the consent, with no checkbox. v6's own
 * tap line (`lp-tap-2026-09-26`) is archived in `lead-consent-archive.ts`.
 * The FAQ keeps the settled starting prices.
 *
 * Chips: the ad group's procedure first (preselected, still one tap), then
 * the six that make up 88% of the page's leads over six months, then
 * "Something else". An ad group whose procedure is outside the six (a breast
 * lift) gets eight.
 *
 * The last step's wording is under its own test (#302), crossed with the
 * form test: the `reassure` arm adds a line above the fields that says what
 * happens next (`contactNote`); `plain` is the step as launched.
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
    buildChatStartingPrices,
    CHAT_TIMELINES,
    type ChatProcedureValue,
    chatProcedureOptions,
} from '@/components/shared/consult-chat/site-chat-copy'
import type { PricingSnapshot } from '@workspace/shared/claims/pricing'

import type { LpCopyVariant } from './lp-form-variant'
import { type AdVariant, VARIANT_PROCEDURE } from './lp-variants'

export interface LpChat {
    readonly copy: Readonly<Record<ConsultChatLang, ConsultChatCopy>>
    readonly staff: ConsultChatStaffLabels
    /**
     * Settled starting prices by procedure value, for the FAQ, in plain
     * text from the pricing resolver ("$5,500", or "$4,400 (20% off
     * $5,500)").
     */
    readonly prices: Readonly<Partial<Record<ChatProcedureValue, string>>>
    /** The 456.062 statement while one of those prices is discounted. */
    readonly priceStatement: string | null
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

/** The `reassure` arm's line above the last step's fields (#302). */
const CONTACT_NOTE: Readonly<Record<ConsultChatLang, string>> = {
    en: 'A patient coordinator will text you to set up your consultation. Private, and no obligation.',
    es: 'Una coordinadora te escribe por texto para agendar tu consulta. Privado y sin compromiso.',
}

function copyFor(
    adVariant: AdVariant,
    copyVariant: LpCopyVariant
): Readonly<Record<ConsultChatLang, ConsultChatCopy>> {
    const order = lpProcedureOrder(adVariant)
    const note = (lang: ConsultChatLang) =>
        copyVariant === 'reassure' ? { contactNote: CONTACT_NOTE[lang] } : {}
    const en = { submit: 'Request my consultation' }
    const es = { submit: 'Pedir mi consulta' }
    return {
        en: {
            title: 'Request your consultation',
            status: 'Replies by text',
            greeting: '',
            qProcedure: 'What are you considering?',
            procedures: chatProcedureOptions(order, 'en', 'Something else'),
            qTimeline: 'When would you like it done?',
            timelines: CHAT_TIMELINES.en,
            qContact: 'Where should we text you?',
            ...note('en'),
            fieldProcedure: 'Procedure',
            procedurePlaceholder: 'Choose one',
            fieldName: 'First name',
            fieldPhone: 'Mobile number',
            submit: en.submit,
            submitting: 'Sending…',
            change: 'Change',
            typing: 'Alluring is typing',
            stepLabel: 'Step {n} of 3',
            reassure: 'Private. A patient coordinator texts you.',
            formHeader: {
                time: '30 seconds',
                lastStep: 'Last step',
                steps: ['Procedure', 'Timing', 'Your number'],
            },
            errors: {
                procedure: 'Choose the procedure you’re considering.',
                name: 'Enter your first name.',
                phone: 'Enter a US mobile number, with area code.',
                submit: 'That didn’t go through. Please try again, or call us.',
            },
        },
        es: {
            title: 'Pide tu consulta',
            status: 'Responde por texto',
            greeting: '',
            qProcedure: '¿Qué estás considerando?',
            procedures: chatProcedureOptions(order, 'es', 'Otro'),
            qTimeline: '¿Para cuándo te gustaría hacerlo?',
            timelines: CHAT_TIMELINES.es,
            qContact: '¿A qué número te escribimos?',
            ...note('es'),
            fieldProcedure: 'Procedimiento',
            procedurePlaceholder: 'Elige uno',
            fieldName: 'Nombre',
            fieldPhone: 'Número de celular',
            submit: es.submit,
            submitting: 'Enviando…',
            change: 'Cambiar',
            typing: 'Alluring está escribiendo',
            stepLabel: 'Paso {n} de 3',
            reassure:
                'Privado. Una coordinadora te escribe por texto para agendar tu consulta.',
            formHeader: {
                time: '30 segundos',
                lastStep: 'Último paso',
                steps: ['Procedimiento', 'Fecha', 'Tu número'],
            },
            errors: {
                procedure: 'Elige el procedimiento que estás considerando.',
                name: 'Escribe tu nombre.',
                phone: 'Escribe un celular de EE. UU., con código de área.',
                submit: 'No se pudo enviar. Inténtalo de nuevo o llámanos.',
            },
        },
    }
}

/**
 * The form's copy for an ad group and a last-step wording arm, the English
 * labels staff read, and prices.
 */
export function buildLpChat(
    adVariant: AdVariant,
    copyVariant: LpCopyVariant = 'plain',
    pricing?: PricingSnapshot
): LpChat {
    const copy = copyFor(adVariant, copyVariant)
    const starting = buildChatStartingPrices(pricing)
    return {
        copy,
        staff: { procedures: copy.en.procedures, timelines: CHAT_TIMELINES.en },
        prices: starting.prices,
        priceStatement: starting.statement,
    }
}
