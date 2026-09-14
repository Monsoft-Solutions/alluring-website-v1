/**
 * Copy for the ad funnel's confirmation page.
 *
 * Kept apart from the landing page's deck because it is a different promise:
 * the landing page argues, this one only sets expectations for the callback.
 *
 * Same register as the landing page — see the REGISTER note in `lp-copy.ts`.
 * Nothing here is exclaimed, and the consultation is private rather than free.
 */

import type { LpLang } from './lp-copy'

export interface LpThankYouStep {
    readonly step: string
    readonly heading: string
    readonly body: string
}

export interface LpThankYouDictionary {
    readonly meta: { readonly title: string }
    readonly topbar: { readonly lead: string; readonly emphasis: string }
    readonly callWord: string
    readonly eyebrow: string
    readonly heading: string
    readonly lede: string
    readonly steps: readonly LpThankYouStep[]
    readonly waitEyebrow: string
    readonly galleryCta: string
    readonly surgeonCta: string
    readonly callNow: string
    readonly privacy: string
    readonly terms: string
    readonly cookies: string
}

const en: LpThankYouDictionary = {
    meta: { title: 'Thank You | Alluring Plastic Surgery' },
    topbar: {
        lead: 'Miami, FL · Double Board-Certified Surgeons · ',
        emphasis: 'Hablamos Español',
    },
    callWord: 'Call ',
    eyebrow: 'Request received',
    heading: 'Thank you. We’ll be in touch shortly.',
    lede: 'A patient coordinator will reach out within 24 hours to understand what you are considering and arrange your consultation. No pressure, and no sales pitch.',
    steps: [
        {
            step: 'What happens next',
            heading: 'We call or text you',
            body: 'A coordinator contacts you at the number you gave us, within 24 hours, in English or Spanish.',
        },
        {
            step: 'At your consultation',
            heading: 'You meet a surgeon',
            body: 'You discuss what you want with a double board-certified surgeon, not a salesperson.',
        },
        {
            step: 'Before you decide',
            heading: 'You get a written plan',
            body: 'Your anatomy, your recovery timeline and your all-inclusive figure, laid out together and in writing.',
        },
    ],
    waitEyebrow: 'While you wait',
    galleryCta: 'See the work',
    surgeonCta: 'Meet your surgeon',
    callNow: 'Prefer to speak now? Call',
    privacy: 'Privacy',
    terms: 'Terms',
    cookies: 'Cookies',
}

const es: LpThankYouDictionary = {
    meta: { title: 'Gracias | Alluring Plastic Surgery' },
    topbar: {
        lead: 'Miami, FL · Cirujanos con doble certificación · ',
        emphasis: 'Hablamos Español',
    },
    callWord: 'Llama ',
    eyebrow: 'Solicitud recibida',
    heading: 'Gracias. Te contactamos en breve.',
    lede: 'Una coordinadora de pacientes te contactará en menos de 24 horas para conocer qué estás considerando y agendar tu consulta. Sin presión y sin discurso de venta.',
    steps: [
        {
            step: 'Qué sigue',
            heading: 'Te llamamos o escribimos',
            body: 'Una coordinadora te contacta al número que nos diste, en menos de 24 horas, en español.',
        },
        {
            step: 'En tu consulta',
            heading: 'Conoces a tu cirujana',
            body: 'Hablas de lo que quieres con una cirujana con doble certificación, no con un vendedor.',
        },
        {
            step: 'Antes de decidir',
            heading: 'Recibes un plan por escrito',
            body: 'Tu anatomía, tu tiempo de recuperación y tu cifra todo incluido, en un solo documento y por escrito.',
        },
    ],
    waitEyebrow: 'Mientras esperas',
    galleryCta: 'Ver el trabajo',
    surgeonCta: 'Conoce a tu cirujana',
    callNow: '¿Prefieres hablar ahora? Llama al',
    privacy: 'Privacidad',
    terms: 'Términos',
    cookies: 'Cookies',
}

export const LP_THANK_YOU_COPY: Readonly<Record<LpLang, LpThankYouDictionary>> =
    { en, es }
