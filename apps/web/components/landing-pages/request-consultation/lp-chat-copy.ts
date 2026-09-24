/**
 * The consultation thread's words on /lp/request-consultation.
 *
 * The thread itself is the site's (`ConsultChat`, the one on the home,
 * contact and specials pages): three steps, the first two a single tap. This
 * deck only gives it the landing page's voice — "private", never "free" (see
 * the REGISTER note in `lp-copy.ts`) — and puts the ad group's procedure
 * first among the chips, preselected.
 *
 * The reply to the first tap gives the settled starting price where there is
 * one (BBL, Lipo 360), read from the procedure facts files like the rest of
 * the site. That is the only price on the page, and it arrives as the answer
 * to a question the visitor has just asked.
 *
 * Built on the server: the facts files stay out of the client bundle, and the
 * page hands both languages to the thread so a language switch needs no
 * request.
 */

import type {
    ConsultChatCopy,
    ConsultChatLang,
    ConsultChatStaffLabels,
} from '@/components/shared/consult-chat/consult-chat.types'
import {
    CHAT_PROCEDURE_ORDER,
    CHAT_STARTING_PRICES,
    CHAT_TIMELINES,
    type ChatProcedureValue,
    chatProcedureOptions,
} from '@/components/shared/consult-chat/site-chat-copy'

import { LP_COPY } from './lp-copy'
import { type AdVariant, VARIANT_PROCEDURE } from './lp-variants'

export interface LpChat {
    readonly copy: Readonly<Record<ConsultChatLang, ConsultChatCopy>>
    readonly staff: ConsultChatStaffLabels
}

/**
 * The home page's order (what its leads picked, by volume), with the ad
 * group's procedure moved to the front: someone who clicked a tummy tuck ad
 * should find it first.
 */
function procedureOrder(adVariant: AdVariant): readonly ChatProcedureValue[] {
    const base = CHAT_PROCEDURE_ORDER.home
    const lead = VARIANT_PROCEDURE[adVariant]
    return lead ? [lead, ...base.filter((value) => value !== lead)] : base
}

function copyFor(
    adVariant: AdVariant
): Readonly<Record<ConsultChatLang, ConsultChatCopy>> {
    const order = procedureOrder(adVariant)
    return {
        en: {
            title: 'Alluring patient care',
            status: 'Replies by text within 24 hours',
            greeting: 'Hello. Let’s set up your private consultation.',
            qProcedure: 'What are you considering?',
            procedures: chatProcedureOptions(order, 'en'),
            procedureReply: {
                priced: '{procedure} starts at {price}. Your exact figure, all-inclusive, and your dates come in writing after your consultation. It can be by video if you’re not in Miami.',
                standard:
                    'Good to know. Your all-inclusive figure and your dates come in writing after your consultation. It can be by video if you’re not in Miami.',
                prices: CHAT_STARTING_PRICES,
                byProcedure: {
                    other: 'No problem, that’s what the consultation is for. It can be by video if you’re not in Miami, and your figure comes in writing.',
                },
            },
            qTimeline: 'When are you hoping to have it done?',
            timelines: CHAT_TIMELINES.en,
            qContact:
                'Last step. Your name and mobile number, and a patient coordinator will text you to set up your consultation.',
            fieldName: 'Your name',
            fieldPhone: 'Mobile number',
            consent: LP_COPY.en.consent,
            submit: 'Request my consultation',
            submitting: 'Sending…',
            change: 'Change',
            typing: 'Alluring is typing',
            stepLabel: 'Step {n} of 3',
            reassure:
                'Private. Only our patient coordinators see it, never a sales team.',
            errors: {
                name: 'Enter your name.',
                phone: 'Enter a valid US mobile number, with area code.',
                consent: 'Please tick the box so we’re allowed to text you.',
                submit: 'That didn’t go through. Please try again, or call us.',
            },
        },
        es: {
            title: 'Atención al paciente Alluring',
            status: 'Responde por texto en 24 horas',
            greeting: 'Hola. Vamos a agendar tu consulta privada.',
            qProcedure: '¿Qué estás considerando?',
            procedures: chatProcedureOptions(order, 'es'),
            procedureReply: {
                priced: '{procedure} empieza en {price}. Tu cifra exacta, todo incluido, y tus fechas te llegan por escrito después de tu consulta. Puede ser por video si no estás en Miami.',
                standard:
                    'Perfecto. Tu cifra todo incluido y tus fechas te llegan por escrito después de tu consulta. Puede ser por video si no estás en Miami.',
                prices: CHAT_STARTING_PRICES,
                byProcedure: {
                    other: 'No hay problema, para eso es la consulta. Puede ser por video si no estás en Miami, y tu cifra te llega por escrito.',
                },
            },
            qTimeline: '¿Para cuándo te gustaría hacerlo?',
            timelines: CHAT_TIMELINES.es,
            qContact:
                'Último paso. Tu nombre y tu celular, y una coordinadora te escribe por texto para agendar tu consulta.',
            fieldName: 'Tu nombre',
            fieldPhone: 'Número de celular',
            consent: LP_COPY.es.consent,
            submit: 'Pedir mi consulta',
            submitting: 'Enviando…',
            change: 'Cambiar',
            typing: 'Alluring está escribiendo',
            stepLabel: 'Paso {n} de 3',
            reassure:
                'Privado. Solo lo ven nuestras coordinadoras, nunca un vendedor.',
            errors: {
                name: 'Escribe tu nombre.',
                phone: 'Escribe un celular válido de EE. UU., con código de área.',
                consent: 'Marca la casilla para que podamos escribirte.',
                submit: 'No se pudo enviar. Inténtalo de nuevo o llámanos.',
            },
        },
    }
}

/** The thread's copy for an ad group, and the English labels staff read. */
export function buildLpChat(adVariant: AdVariant): LpChat {
    const copy = copyFor(adVariant)
    return {
        copy,
        staff: { procedures: copy.en.procedures, timelines: CHAT_TIMELINES.en },
    }
}
