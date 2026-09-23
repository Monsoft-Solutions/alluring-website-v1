/**
 * The consultation thread's words on site pages (/contact-us, specials).
 *
 * Voice: "we", from the practice's patient coordinators. Several people
 * answer these leads, so no one person's name or face is on the thread
 * (Melissa's own page keeps hers). Claims stay inside what the site already
 * publishes: free consultation, a reply within 24 hours, English and Spanish.
 *
 * Server-only data: pages import it and pass both languages to the client
 * wrapper, which follows the visitor's language switch.
 *
 * The consent wording is read from the ads landing page's deck, so the legal
 * text lives in exactly one place.
 */

import { LP_COPY } from '@/components/landing-pages/request-consultation/lp-copy'

import type {
    ConsultChatCopy,
    ConsultChatLang,
    ConsultChatOption,
    ConsultChatStaffLabels,
} from './consult-chat.types'

const PROCEDURES_EN: readonly ConsultChatOption[] = [
    { value: 'bbl', label: 'BBL' },
    { value: 'liposuction', label: 'Lipo 360' },
    { value: 'tummy-tuck', label: 'Tummy tuck' },
    { value: 'mommy-makeover', label: 'Mommy makeover' },
    { value: 'breast-augmentation', label: 'Breast augmentation' },
    { value: 'breast-lift', label: 'Breast lift' },
    { value: 'breast-reduction', label: 'Breast reduction' },
    { value: 'facelift', label: 'Facelift' },
    { value: 'blepharoplasty', label: 'Eyelids' },
    { value: 'multiple', label: 'More than one' },
    { value: 'other', label: 'Not sure yet' },
]

const TIMELINES_EN: readonly ConsultChatOption[] = [
    { value: 'asap', label: 'As soon as possible' },
    { value: '1-3-months', label: 'In 1–3 months' },
    { value: '3-6-months', label: 'In 3–6 months' },
    { value: 'researching', label: 'Just researching' },
]

export const SITE_CHAT_STAFF: ConsultChatStaffLabels = {
    procedures: PROCEDURES_EN,
    timelines: TIMELINES_EN,
}

export const SITE_CHAT_COPY: Record<ConsultChatLang, ConsultChatCopy> = {
    en: {
        title: 'Alluring patient care',
        status: 'Replies within 24 hours',
        greeting: 'Hi! Let’s get your free consultation set up.',
        qProcedure: 'What are you thinking about doing?',
        procedures: PROCEDURES_EN,
        qTimeline: 'Great choice. When are you hoping to have it done?',
        timelines: TIMELINES_EN,
        qName: 'Perfect. What’s your name?',
        fieldFirstName: 'First name',
        fieldLastName: 'Last name',
        next: 'Next',
        qContact:
            'Nice to meet you, {name}. What’s the best number to reach you?',
        fieldPhone: 'Mobile number',
        methodLegend: 'Reach me by',
        methods: [
            { value: 'text', label: 'Text' },
            { value: 'call', label: 'Call' },
        ],
        consent: LP_COPY.en.form.consent,
        submit: 'Request my free consultation',
        submitting: 'Sending…',
        change: 'Change',
        typing: 'Alluring is typing',
        stepLabel: 'Step {n} of 4',
        reassure:
            'Private. Only our patient coordinators see it, never a sales team.',
        errors: {
            firstName: 'Enter your first name.',
            lastName: 'Enter your last name.',
            phone: 'Enter a valid US mobile number, with area code.',
            consent: 'Please tick the box so we’re allowed to contact you.',
            submit: 'That didn’t go through. Please try again in a moment.',
        },
    },
    es: {
        title: 'Atención al paciente Alluring',
        status: 'Respondemos en 24 horas',
        greeting: '¡Hola! Vamos a agendar tu consulta gratis.',
        qProcedure: '¿Qué te gustaría hacerte?',
        procedures: [
            { value: 'bbl', label: 'BBL' },
            { value: 'liposuction', label: 'Lipo 360' },
            { value: 'tummy-tuck', label: 'Abdominoplastia' },
            { value: 'mommy-makeover', label: 'Mommy makeover' },
            { value: 'breast-augmentation', label: 'Aumento de senos' },
            { value: 'breast-lift', label: 'Levantamiento de senos' },
            { value: 'breast-reduction', label: 'Reducción de senos' },
            { value: 'facelift', label: 'Lifting facial' },
            { value: 'blepharoplasty', label: 'Párpados' },
            { value: 'multiple', label: 'Más de uno' },
            { value: 'other', label: 'Aún no lo sé' },
        ],
        qTimeline: 'Excelente. ¿Para cuándo te gustaría hacerlo?',
        timelines: [
            { value: 'asap', label: 'Lo antes posible' },
            { value: '1-3-months', label: 'En 1–3 meses' },
            { value: '3-6-months', label: 'En 3–6 meses' },
            { value: 'researching', label: 'Solo estoy averiguando' },
        ],
        qName: 'Perfecto. ¿Cómo te llamas?',
        fieldFirstName: 'Nombre',
        fieldLastName: 'Apellido',
        next: 'Siguiente',
        qContact: 'Mucho gusto, {name}. ¿A qué número te podemos contactar?',
        fieldPhone: 'Número de celular',
        methodLegend: 'Prefiero',
        methods: [
            { value: 'text', label: 'Mensaje' },
            { value: 'call', label: 'Llamada' },
        ],
        consent: LP_COPY.es.form.consent,
        submit: 'Pedir mi consulta gratis',
        submitting: 'Enviando…',
        change: 'Cambiar',
        typing: 'Alluring está escribiendo',
        stepLabel: 'Paso {n} de 4',
        reassure:
            'Privado. Solo lo ven nuestras coordinadoras, nunca un vendedor.',
        errors: {
            firstName: 'Escribe tu nombre.',
            lastName: 'Escribe tu apellido.',
            phone: 'Escribe un celular válido de EE. UU., con código de área.',
            consent: 'Marca la casilla para que podamos contactarte.',
            submit: 'No se pudo enviar. Inténtalo de nuevo en un momento.',
        },
    },
}
