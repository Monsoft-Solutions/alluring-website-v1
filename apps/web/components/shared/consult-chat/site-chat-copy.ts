/**
 * The consultation thread's words on site pages (/contact-us, specials and
 * the home page).
 *
 * Voice: "we", from the practice's patient coordinators. Several people
 * answer these leads, so no one person's name or face is on the thread
 * (Melissa's own page keeps hers). Claims stay inside what the site already
 * publishes: free consultation, a reply within 24 hours, English and Spanish,
 * video consultations from anywhere in the U.S. The practice always answers
 * by text, so nothing here promises a call.
 *
 * Server-only data: pages import it and pass both languages to the client
 * wrapper, which follows the visitor's language switch.
 *
 * Each page lists procedures in order of what its visitors actually pick
 * (#274). Only settled starting prices appear in the reply to the first tap;
 * they are read from the procedure facts files, so they change with them.
 *
 * The consent wording is read from the ads landing page's deck, so the legal
 * text lives in exactly one place.
 */

import { LP_COPY } from '@/components/landing-pages/request-consultation/lp-copy'
import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'
import { lipoFigure } from '@/lib/data/procedures/facts/lipo.facts'

import type {
    ConsultChatCopy,
    ConsultChatLang,
    ConsultChatOption,
    ConsultChatStaffLabels,
} from './consult-chat.types'

export type SiteChatPage = 'contact' | 'specials' | 'home'

/** A procedure the thread offers, as the contact system stores it. */
export type ChatProcedureValue = ProcedureValue

type ProcedureValue =
    | 'bbl'
    | 'liposuction'
    | 'tummy-tuck'
    | 'mommy-makeover'
    | 'breast-augmentation'
    | 'breast-lift'
    | 'breast-reduction'
    | 'facelift'
    | 'blepharoplasty'
    | 'multiple'
    | 'other'

const PROCEDURE_LABELS: Record<
    ConsultChatLang,
    Record<ProcedureValue, string>
> = {
    en: {
        bbl: 'BBL',
        liposuction: 'Lipo 360',
        'tummy-tuck': 'Tummy tuck',
        'mommy-makeover': 'Mommy makeover',
        'breast-augmentation': 'Breast augmentation',
        'breast-lift': 'Breast lift',
        'breast-reduction': 'Breast reduction',
        facelift: 'Facelift',
        blepharoplasty: 'Eyelids',
        multiple: 'A combination',
        other: 'Not sure yet',
    },
    es: {
        bbl: 'BBL',
        liposuction: 'Lipo 360',
        'tummy-tuck': 'Abdominoplastia',
        'mommy-makeover': 'Mommy makeover',
        'breast-augmentation': 'Aumento de senos',
        'breast-lift': 'Levantamiento de senos',
        'breast-reduction': 'Reducción de senos',
        facelift: 'Lifting facial',
        blepharoplasty: 'Párpados',
        multiple: 'Una combinación',
        other: 'Aún no lo sé',
    },
}

/**
 * Chip order per page, by demand. Specials (180 days, 966 leads): Lipo 360
 * 15.7%, a combination 14.5% (and what the offers usually cover), tummy tuck
 * and mommy makeover 12.7% each, BBL 8%, then the breast procedures. Facelift
 * and eyelids are under 1% there, so they fold into "Something else".
 * Contact keeps every procedure, in the wider site's order. Home follows
 * what its hero form's leads picked (180 days to 2026-09-23, 895 leads):
 * Lipo 360 19%, BBL 13%, a combination 12%, mommy makeover 12%, breast
 * augmentation 9%, tummy tuck 7%, then the rest under 4% each.
 */
export const CHAT_PROCEDURE_ORDER: Readonly<
    Record<SiteChatPage, readonly ProcedureValue[]>
> = {
    specials: [
        'liposuction',
        'multiple',
        'tummy-tuck',
        'mommy-makeover',
        'bbl',
        'breast-augmentation',
        'breast-lift',
        'breast-reduction',
        'other',
    ],
    contact: [
        'liposuction',
        'bbl',
        'multiple',
        'mommy-makeover',
        'breast-augmentation',
        'tummy-tuck',
        'breast-lift',
        'breast-reduction',
        'facelift',
        'blepharoplasty',
        'other',
    ],
    home: [
        'liposuction',
        'bbl',
        'multiple',
        'mommy-makeover',
        'breast-augmentation',
        'tummy-tuck',
        'breast-lift',
        'breast-reduction',
        'facelift',
        'blepharoplasty',
        'other',
    ],
}

/** On specials "other" also covers facelift and eyelids. */
const OTHER_LABEL: Record<SiteChatPage, Record<ConsultChatLang, string>> = {
    specials: { en: 'Something else', es: 'Otro' },
    contact: { en: 'Not sure yet', es: 'Aún no lo sé' },
    home: { en: 'Not sure yet', es: 'Aún no lo sé' },
}

/** Settled starting prices only; the rest wait on #232. */
export const CHAT_STARTING_PRICES: Readonly<
    Partial<Record<ProcedureValue, string>>
> = {
    bbl: bblFigure('price-starting-at'),
    liposuction: lipoFigure('price-starting-at'),
}

/**
 * The chips for `order`, in the thread's own labels. The ads landing page
 * builds its thread from this too, with its ad group's procedure first.
 */
export function chatProcedureOptions(
    order: readonly ProcedureValue[],
    lang: ConsultChatLang,
    otherLabel = PROCEDURE_LABELS[lang].other
): readonly ConsultChatOption[] {
    return order.map((value) => ({
        value,
        label: value === 'other' ? otherLabel : PROCEDURE_LABELS[lang][value],
    }))
}

function procedures(
    page: SiteChatPage,
    lang: ConsultChatLang
): readonly ConsultChatOption[] {
    return chatProcedureOptions(
        CHAT_PROCEDURE_ORDER[page],
        lang,
        OTHER_LABEL[page][lang]
    )
}

export const CHAT_TIMELINES: Readonly<
    Record<ConsultChatLang, readonly ConsultChatOption[]>
> = {
    en: [
        { value: 'asap', label: 'As soon as possible' },
        { value: '1-3-months', label: 'In 1–3 months' },
        { value: '3-6-months', label: 'In 3–6 months' },
        { value: 'researching', label: 'Just researching' },
    ],
    es: [
        { value: 'asap', label: 'Lo antes posible' },
        { value: '1-3-months', label: 'En 1–3 meses' },
        { value: '3-6-months', label: 'En 3–6 meses' },
        { value: 'researching', label: 'Solo estoy averiguando' },
    ],
}

function copyFor(page: SiteChatPage): Record<ConsultChatLang, ConsultChatCopy> {
    return {
        en: {
            title: 'Alluring patient care',
            status: 'Replies by text within 24 hours',
            greeting: 'Hi! Let’s get your free consultation set up.',
            qProcedure: 'What are you thinking about doing?',
            procedures: procedures(page, 'en'),
            procedureReply: {
                priced: '{procedure} starts at {price}. Your exact price and dates come in writing after your free consultation, and it can be by video if you’re not in Miami.',
                standard:
                    'Good to know. Your exact price and dates come in writing after your free consultation, and it can be by video if you’re not in Miami.',
                prices: CHAT_STARTING_PRICES,
                byProcedure: {
                    other: 'No problem, that’s what the free consultation is for. It can be by video if you’re not in Miami, and your price comes in writing.',
                },
            },
            qTimeline: 'When are you hoping to have it done?',
            timelines: CHAT_TIMELINES.en,
            qContact:
                'Last step. What’s your name and mobile number? We’ll text you to set up your free consultation.',
            fieldName: 'Your name',
            fieldPhone: 'Mobile number',
            consent: LP_COPY.en.consent,
            submit: 'Request my free consultation',
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
                submit: 'That didn’t go through. Please try again in a moment.',
            },
        },
        es: {
            title: 'Atención al paciente Alluring',
            status: 'Responde por texto en 24 horas',
            greeting: '¡Hola! Vamos a agendar tu consulta gratis.',
            qProcedure: '¿Qué te gustaría hacerte?',
            procedures: procedures(page, 'es'),
            procedureReply: {
                priced: '{procedure} empieza en {price}. Tu precio exacto y tus fechas te llegan por escrito después de tu consulta gratis, y puede ser por video si no estás en Miami.',
                standard:
                    'Perfecto. Tu precio exacto y tus fechas te llegan por escrito después de tu consulta gratis, y puede ser por video si no estás en Miami.',
                prices: CHAT_STARTING_PRICES,
                byProcedure: {
                    other: 'No hay problema, para eso es la consulta gratis. Puede ser por video si no estás en Miami, y tu precio te llega por escrito.',
                },
            },
            qTimeline: '¿Para cuándo te gustaría hacerlo?',
            timelines: CHAT_TIMELINES.es,
            qContact:
                'Último paso. ¿Cómo te llamas y cuál es tu celular? Te escribimos por texto para agendar tu consulta gratis.',
            fieldName: 'Tu nombre',
            fieldPhone: 'Número de celular',
            consent: LP_COPY.es.consent,
            submit: 'Pedir mi consulta gratis',
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
                submit: 'No se pudo enviar. Inténtalo de nuevo en un momento.',
            },
        },
    }
}

export interface SiteChat {
    readonly copy: Readonly<Record<ConsultChatLang, ConsultChatCopy>>
    readonly staff: ConsultChatStaffLabels
}

function siteChat(page: SiteChatPage): SiteChat {
    const copy = copyFor(page)
    return {
        copy,
        staff: { procedures: copy.en.procedures, timelines: CHAT_TIMELINES.en },
    }
}

export const CONTACT_CHAT = siteChat('contact')
export const SPECIALS_CHAT = siteChat('specials')
export const HOME_CHAT = siteChat('home')
