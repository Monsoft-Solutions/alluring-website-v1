/**
 * The lead popup's words, in English and Spanish.
 *
 * Same voice and the same claims as the consultation thread
 * (`site-chat-copy.ts`): "we", the practice's patient coordinators; a free
 * consultation, in Miami or by video; a reply by text; the price and dates
 * in writing. Nothing promises a call or a response time, and nothing counts
 * down (claims canon §1, §9, #354). The promotion's own title and details
 * come from the admin, as written there.
 *
 * Consent is the site-wide notice above the button (`ConsentNotice`, #350):
 * sending is the consent, with no checkbox.
 */

import type { ConsultChatLang } from '@/components/shared/consult-chat/consult-chat.types'

export type LeadPopupCopy = {
    readonly close: string
    readonly noThanks: string
    readonly coordinator: string
    readonly status: string
    /** The text-consultation popup (no promotion live). */
    readonly consult: {
        /** Heading before and inside its italic word. */
        readonly title: readonly [string, string]
        readonly body: string
        readonly points: readonly string[]
        readonly yes: string
        readonly ask: string
        readonly submit: string
    }
    /** The promotion popup. */
    readonly promo: {
        readonly more: string
        readonly less: string
        readonly yes: string
        readonly ask: string
        readonly submit: string
    }
    readonly fieldName: string
    readonly fieldPhone: string
    readonly submitting: string
    readonly reassure: string
    readonly errors: {
        readonly name: string
        readonly phone: string
        readonly submit: string
    }
}

export const LEAD_POPUP_COPY: Record<ConsultChatLang, LeadPopupCopy> = {
    en: {
        close: 'Close',
        noThanks: 'No thanks',
        coordinator: 'Alluring patient care',
        status: 'Replies by text',
        consult: {
            title: ['Your questions, ', 'answered by text.'],
            body: 'Leave your mobile number and a patient coordinator texts you to answer anything, from price to recovery, and set up your free consultation.',
            points: [
                'Free consultation, in Miami or by video',
                'Your price and dates in writing',
                'English or Spanish, your choice',
            ],
            yes: 'Yes, text me',
            ask: 'Where should we text you?',
            submit: 'Request my free consultation',
        },
        promo: {
            more: 'Offer details',
            less: 'Show less',
            yes: 'Claim my offer',
            ask: 'Where should we text you about it?',
            submit: 'Claim my offer',
        },
        fieldName: 'Your name',
        fieldPhone: 'Mobile number',
        submitting: 'Sending…',
        reassure: 'Private. Used only to contact you about your consultation.',
        errors: {
            name: 'Enter your name.',
            phone: 'Enter a valid US mobile number, with area code.',
            submit: 'That didn’t go through. Please try again in a moment.',
        },
    },
    es: {
        close: 'Cerrar',
        noThanks: 'No, gracias',
        coordinator: 'Atención al paciente Alluring',
        status: 'Responde por texto',
        consult: {
            title: ['Tus preguntas, ', 'respondidas por texto.'],
            body: 'Déjanos tu celular y una coordinadora te escribe por texto para responder lo que quieras, del precio a la recuperación, y agendar tu consulta gratis.',
            points: [
                'Consulta gratis, en Miami o por video',
                'Tu precio y tus fechas por escrito',
                'Te atendemos en español',
            ],
            yes: 'Sí, escríbanme',
            ask: '¿A qué número te escribimos?',
            submit: 'Pedir mi consulta gratis',
        },
        promo: {
            more: 'Ver detalles',
            less: 'Ver menos',
            yes: 'Quiero la oferta',
            ask: '¿A qué número te escribimos sobre la oferta?',
            submit: 'Quiero la oferta',
        },
        fieldName: 'Tu nombre',
        fieldPhone: 'Número de celular',
        submitting: 'Enviando…',
        reassure: 'Privado. Solo lo usamos para contactarte sobre tu consulta.',
        errors: {
            name: 'Escribe tu nombre.',
            phone: 'Escribe un celular válido de EE. UU., con código de área.',
            submit: 'No se pudo enviar. Inténtalo de nuevo en un momento.',
        },
    },
}
