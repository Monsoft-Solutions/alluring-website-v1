/**
 * Every string on /lp/dr-karlinsky and its thank-you page, in both languages.
 *
 * Read on the server; client islands get only the slice they draw.
 *
 * ---------------------------------------------------------------------
 * VOICE
 * ---------------------------------------------------------------------
 * The visitor tapped the link in Dr. Karlinsky's own Instagram bio. She
 * follows her, knows her face and her voice. So the page is written as her:
 * first person, warm, short sentences. Spanish is the Latin-American Spanish
 * spoken in Miami, with "tú".
 *
 * ---------------------------------------------------------------------
 * RULES (non-negotiable; see the issue and `lp-copy.ts`)
 * ---------------------------------------------------------------------
 * - Credentials only from `karlinsky-credentials.constant.ts`: general
 *   surgery (American Board of Surgery), FACS, her Florida license. Never
 *   "board-certified plastic surgeon", never a count of boards, and no board
 *   that would need the Florida statement beside it.
 * - No "free", "complimentary" or "no-cost" while Fla. Stat. 456.062 is with
 *   counsel. "Consultation", "in person in Miami or virtual".
 * - Prices from `drk-prices.ts` only, always with "your price is personal"
 *   and "financing available" — never a weekly or monthly figure.
 * - US only, and no travel coordination: "not in Miami" is answered
 *   clinically (virtual consultation, dates in writing, nights to stay).
 * - No "luxury", no "affordable", no facility claims, no promised reply
 *   times.
 *
 * The consent wording is the site's, verbatim (`LP_COPY.consent`).
 */

import type {
    ConsultChatCopy,
    ConsultChatLang,
    ConsultChatStaffLabels,
} from '@/components/shared/consult-chat/consult-chat.types'
import type { ConsultationThankYouCopyOverride } from '@/components/sections/thank-you/consultation-thank-you.component'
import { buildLpChat } from '@/components/landing-pages/request-consultation/lp-chat-copy'
import {
    LP_COPY,
    type LpDictionary,
    type RichText,
} from '@/components/landing-pages/request-consultation/lp-copy'
import { FINANCING_PARTNERS } from '@/lib/data/site-config'
import {
    KARLINSKY_ABS_CERTIFIED_ON,
    KARLINSKY_FLORIDA_LICENSE,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

import { DRK_PRICES } from './drk-prices'

export type DrkLang = ConsultChatLang

const ABS_YEAR = KARLINSKY_ABS_CERTIFIED_ON.slice(0, 4)

/** "Cherry, CareCredit and United Credit". */
function partners(conjunction: string): string {
    const names = [...FINANCING_PARTNERS]
    const last = names.pop()
    return names.length
        ? `${names.join(', ')} ${conjunction} ${last}`
        : (last ?? '')
}

/** "BBL (Lipo 360 + BBL) from $5,500, Lipo 360 from $4,000…" */
function priceSentence(lang: DrkLang, word: string, and: string): string {
    const items = DRK_PRICES.map(
        (price) => `${price.label[lang]} ${word} ${price.from}`
    )
    const last = items.pop()
    return `${items.join(', ')} ${and} ${last}`
}

export interface DrkFaqItem {
    readonly question: string
    readonly answer: string
}

export interface DrkStep {
    readonly title: string
    readonly body: string
}

export interface DrkPlayerCopy {
    /** Accessible name of the player dialog and the video. */
    readonly title: string
    readonly close: string
    readonly cta: string
    readonly replay: string
    readonly endTitle: string
    readonly captionsEn: string
    readonly captionsEs: string
    readonly unavailable: string
}

export interface DrkDictionary {
    readonly meta: {
        readonly title: string
        readonly description: string
    }
    readonly top: {
        readonly practice: string
        readonly call: string
        readonly callAria: string
        readonly langAria: string
    }
    readonly story: {
        readonly handle: string
        readonly label: string
        /** Shown in place of `label` while there is no video. */
        readonly fallback: string
        /** `{duration}` is "0:48". */
        readonly playAria: string
    }
    readonly hero: {
        readonly heading: RichText
        readonly sub: string
        readonly callPrompt: string
    }
    /** The hint under the procedure list. `{procedure}`, `{price}`. */
    readonly priceHint: {
        readonly priced: string
        readonly unpriced: string
    }
    readonly message: {
        readonly heading: RichText
        /** `{duration}` is "0:48". */
        readonly body: string
        readonly play: string
        readonly captions: string
    }
    readonly steps: {
        readonly heading: RichText
        readonly items: readonly [DrkStep, DrkStep, DrkStep]
    }
    readonly prices: {
        readonly heading: RichText
        readonly from: string
        readonly personal: string
        readonly financing: string
    }
    readonly results: {
        readonly heading: RichText
        readonly body: string
        readonly disclaimer: string
        readonly railLabel: string
        readonly before: string
        readonly after: string
        readonly open: string
        readonly close: string
        readonly previous: string
        readonly next: string
        /** `{n}` of `{total}`. */
        readonly counter: string
    }
    readonly reviews: {
        readonly heading: RichText
        /** `{rating}`, `{count}`. */
        readonly source: string
        readonly sourceNoCount: string
        readonly stars: string
    }
    readonly about: {
        readonly heading: RichText
        readonly paragraphs: readonly string[]
        readonly name: string
        readonly credentialsLabel: string
        readonly credentials: readonly string[]
        readonly portraitAlt: string
    }
    readonly faq: {
        readonly heading: RichText
        readonly items: readonly DrkFaqItem[]
    }
    readonly closing: {
        readonly heading: RichText
        readonly cta: string
        readonly callPrompt: string
    }
    readonly sticky: {
        readonly cta: string
    }
    readonly player: DrkPlayerCopy
    readonly footer: LpDictionary['footer'] & {
        readonly rights: string
    }
    readonly thankYou: {
        readonly metaTitle: string
        readonly signoff: string
        readonly override: ConsultationThankYouCopyOverride
    }
}

const en: DrkDictionary = {
    meta: {
        title: 'A message from Dr. Karlinsky | Alluring Plastic Surgery',
        description: `Request your consultation with ${KARLINSKY_NAME}, in person in Miami or virtual. Her coordinator texts you to set it up.`,
    },
    top: {
        practice: 'Alluring Plastic Surgery',
        call: 'Call',
        callAria: 'Call the practice',
        langAria: 'Ver esta página en español',
    },
    story: {
        handle: '@drkarlinsky',
        label: 'A message for you',
        fallback: KARLINSKY_NAME,
        playAria: 'Play my message to you, {duration}',
    },
    hero: {
        heading: ['You know my work. Let’s talk about ', { em: 'yours' }, '.'],
        sub: 'Send this, my coordinator texts you, and we meet in Miami or virtually.',
        callPrompt: 'Prefer to call?',
    },
    priceHint: {
        priced: '{procedure} from {price} · financing available',
        unpriced: 'Your price is personal · financing available',
    },
    message: {
        heading: ['A message ', { em: 'from me' }],
        body: 'In {duration} I tell you how a consultation with me works, and what happens after you send your request.',
        play: 'Play the message',
        captions: 'Captions in English and Spanish',
    },
    steps: {
        heading: ['How it ', { em: 'starts' }],
        items: [
            {
                title: 'Sarah texts you',
                body: 'Sarah is my coordinator. She gets to know your goals and answers your first questions.',
            },
            {
                title: 'Your consultation with me',
                body: 'In person in Miami, or virtual from wherever you are in the US.',
            },
            {
                title: 'Your plan, price and dates in writing',
                body: 'Your surgery, pre-op and follow-up dates, and your price, before you decide anything.',
            },
        ],
    },
    prices: {
        heading: ['Starting ', { em: 'prices' }],
        from: 'from',
        personal:
            'Your price is personal — Dr. Karlinsky confirms it at your consultation.',
        financing: 'Financing available.',
    },
    results: {
        heading: ['My patients’ ', { em: 'results' }],
        body: 'Before and after, photographed in my practice. Tap one to see it larger.',
        disclaimer:
            'Actual patients of Dr. Karlinsky. Individual results vary.',
        railLabel: 'Before-and-after photographs',
        before: 'Before',
        after: 'After',
        open: 'See larger: {caption}',
        close: 'Close',
        previous: 'Previous photo',
        next: 'Next photo',
        counter: '{n} of {total}',
    },
    reviews: {
        heading: ['In my patients’ ', { em: 'words' }],
        source: '{rating} on Google · {count} reviews',
        sourceNoCount: 'Google reviews',
        stars: '5 out of 5 stars',
    },
    about: {
        heading: ['About ', { em: 'me' }],
        paragraphs: [
            'I’m Victoria Karlinsky. The surgeon you meet at your consultation is the surgeon who operates.',
            'I’d rather tell you honestly what will look right on your body than sell you something that won’t.',
        ],
        name: KARLINSKY_NAME,
        credentialsLabel: 'Credentials',
        credentials: [
            `Board certified in general surgery by the American Board of Surgery since ${ABS_YEAR}`,
            'Fellow of the American College of Surgeons (FACS)',
            `Florida medical license ${KARLINSKY_FLORIDA_LICENSE}, clear and active`,
        ],
        portraitAlt: 'Dr. Victoria Karlinsky',
    },
    faq: {
        heading: ['Before you ', { em: 'ask' }],
        items: [
            {
                question: 'How much will my surgery cost?',
                answer: `Your price is personal — Dr. Karlinsky confirms it at your consultation. As a guide: ${priceSentence('en', 'from', 'and')}.`,
            },
            {
                question: 'Can I pay over time?',
                answer: `Yes. Financing is available through ${partners('and')}, subject to their approval. Sarah walks you through it.`,
            },
            {
                question: 'I don’t live in Miami. How does it work?',
                answer: 'Your consultation can be virtual. Your surgery, pre-op and follow-up dates are confirmed in writing, and I tell you how many nights to stay in Miami before you’re cleared to fly home.',
            },
            {
                question: 'Is the consultation in person or virtual?',
                answer: 'Either one. Come see me in Miami, or we meet by video from anywhere in the US.',
            },
            {
                question: 'What happens after I send my request?',
                answer: 'Sarah from my team texts you to get to know your goals and find a time for your consultation with me. There’s no obligation.',
            },
        ],
    },
    closing: {
        heading: ['When you’re ready, ', { em: 'I’m here' }, '.'],
        cta: 'Request my consultation',
        callPrompt: 'Or call',
    },
    sticky: {
        cta: 'Request my consultation',
    },
    player: {
        title: 'A message from Dr. Karlinsky',
        close: 'Close',
        cta: 'Request my consultation',
        replay: 'Watch again',
        endTitle: 'Ready when you are.',
        captionsEn: 'English',
        captionsEs: 'Español',
        unavailable: 'The video didn’t load. You can still send your request.',
    },
    footer: {
        ...LP_COPY.en.footer,
        rights: 'All rights reserved.',
    },
    thankYou: {
        metaTitle: 'Thank you | Dr. Karlinsky',
        signoff: 'See you soon,',
        override: {
            eyebrow: 'Request received',
            headingNamed: 'Thank you, {name}.',
            heading: 'Thank you.',
            body: 'Sarah from my team will text you to set up your consultation with me.',
            nextTitle: 'What happens next',
            next: [
                'Sarah texts you to get to know your goals and find a time.',
                'Your consultation with me, in person in Miami or virtual from anywhere in the US.',
                'Your plan, price and dates, in writing. No obligation.',
            ],
        },
    },
}

const es: DrkDictionary = {
    meta: {
        title: 'Un mensaje de la Dra. Karlinsky | Alluring Plastic Surgery',
        description: `Pide tu consulta con la Dra. ${KARLINSKY_NAME}, en persona en Miami o virtual. Su coordinadora te escribe por texto para agendarla.`,
    },
    top: {
        practice: 'Alluring Plastic Surgery',
        call: 'Llamar',
        callAria: 'Llamar a la clínica',
        langAria: 'View this page in English',
    },
    story: {
        handle: '@drkarlinsky',
        label: 'Un mensaje para ti',
        fallback: KARLINSKY_NAME,
        playAria: 'Ver mi mensaje para ti, {duration}',
    },
    hero: {
        heading: ['Ya conoces mi trabajo. Hablemos del ', { em: 'tuyo' }, '.'],
        sub: 'Envíame esto, mi coordinadora te escribe y nos vemos en Miami o de forma virtual.',
        callPrompt: '¿Prefieres llamar?',
    },
    priceHint: {
        priced: '{procedure} desde {price} · financiamiento disponible',
        unpriced: 'Tu precio es personal · financiamiento disponible',
    },
    message: {
        heading: ['Un mensaje ', { em: 'mío' }],
        body: 'En {duration} te cuento cómo es una consulta conmigo y qué pasa después de enviar tu solicitud.',
        play: 'Ver el mensaje',
        captions: 'Subtítulos en inglés y español',
    },
    steps: {
        heading: ['Cómo ', { em: 'empezamos' }],
        items: [
            {
                title: 'Sarah te escribe',
                body: 'Sarah es mi coordinadora. Conoce tus metas y responde tus primeras preguntas.',
            },
            {
                title: 'Tu consulta conmigo',
                body: 'En persona en Miami, o virtual desde donde estés en EE. UU.',
            },
            {
                title: 'Tu plan, precio y fechas por escrito',
                body: 'Tus fechas de cirugía, preoperatorio y seguimiento, y tu precio, antes de decidir nada.',
            },
        ],
    },
    prices: {
        heading: ['Precios ', { em: 'desde' }],
        from: 'desde',
        personal:
            'Tu precio es personal: la Dra. Karlinsky lo confirma en tu consulta.',
        financing: 'Financiamiento disponible.',
    },
    results: {
        heading: ['Resultados de ', { em: 'mis pacientes' }],
        body: 'Antes y después, fotografiados en mi consulta. Toca una foto para verla más grande.',
        disclaimer:
            'Pacientes reales de la Dra. Karlinsky. Los resultados varían según la persona.',
        railLabel: 'Fotos de antes y después',
        before: 'Antes',
        after: 'Después',
        open: 'Ver más grande: {caption}',
        close: 'Cerrar',
        previous: 'Foto anterior',
        next: 'Foto siguiente',
        counter: '{n} de {total}',
    },
    reviews: {
        heading: ['En palabras de ', { em: 'mis pacientes' }],
        source: '{rating} en Google · {count} reseñas',
        sourceNoCount: 'Reseñas de Google',
        stars: '5 de 5 estrellas',
    },
    about: {
        heading: ['Sobre ', { em: 'mí' }],
        paragraphs: [
            'Soy Victoria Karlinsky. La cirujana que conoces en tu consulta es la que te opera.',
            'Prefiero decirte con honestidad qué se verá bien en tu cuerpo antes que venderte algo que no.',
        ],
        name: KARLINSKY_NAME,
        credentialsLabel: 'Credenciales',
        credentials: [
            `Certificada en cirugía general por el American Board of Surgery desde ${ABS_YEAR}`,
            'Miembro (Fellow) del American College of Surgeons (FACS)',
            `Licencia médica de Florida ${KARLINSKY_FLORIDA_LICENSE}, vigente y sin restricciones`,
        ],
        portraitAlt: 'Dra. Victoria Karlinsky',
    },
    faq: {
        heading: ['Antes de que ', { em: 'preguntes' }],
        items: [
            {
                question: '¿Cuánto me va a costar la cirugía?',
                answer: `Tu precio es personal: la Dra. Karlinsky lo confirma en tu consulta. Como referencia: ${priceSentence('es', 'desde', 'y')}.`,
            },
            {
                question: '¿Puedo pagar a plazos?',
                answer: `Sí. Hay financiamiento con ${partners('y')}, sujeto a su aprobación. Sarah te explica cómo funciona.`,
            },
            {
                question: 'No vivo en Miami. ¿Cómo funciona?',
                answer: 'Tu consulta puede ser virtual. Tus fechas de cirugía, preoperatorio y seguimiento se confirman por escrito, y yo te digo cuántas noches quedarte en Miami antes de que puedas volar a casa.',
            },
            {
                question: '¿La consulta es en persona o virtual?',
                answer: 'Como prefieras. Ven a verme a Miami, o nos vemos por video desde cualquier lugar de EE. UU.',
            },
            {
                question: '¿Qué pasa después de enviar mi solicitud?',
                answer: 'Sarah, de mi equipo, te escribe por texto para conocer tus metas y buscar una fecha para tu consulta conmigo. Sin compromiso.',
            },
        ],
    },
    closing: {
        heading: ['Cuando estés lista, ', { em: 'aquí estoy' }, '.'],
        cta: 'Solicitar mi consulta',
        callPrompt: 'O llama al',
    },
    sticky: {
        cta: 'Solicitar mi consulta',
    },
    player: {
        title: 'Un mensaje de la Dra. Karlinsky',
        close: 'Cerrar',
        cta: 'Solicitar mi consulta',
        replay: 'Ver otra vez',
        endTitle: 'Cuando estés lista.',
        captionsEn: 'English',
        captionsEs: 'Español',
        unavailable: 'El video no cargó. Igual puedes enviar tu solicitud.',
    },
    footer: {
        ...LP_COPY.es.footer,
        rights: 'Todos los derechos reservados.',
    },
    thankYou: {
        metaTitle: 'Gracias | Dra. Karlinsky',
        signoff: 'Nos vemos pronto,',
        override: {
            eyebrow: 'Solicitud recibida',
            headingNamed: 'Gracias, {name}.',
            heading: 'Gracias.',
            body: 'Sarah, de mi equipo, te escribirá por texto para agendar tu consulta conmigo.',
            nextTitle: 'Lo que sigue',
            next: [
                'Sarah te escribe para conocer tus metas y buscar una fecha.',
                'Tu consulta conmigo, en persona en Miami o virtual desde cualquier lugar de EE. UU.',
                'Tu plan, precio y fechas, por escrito. Sin compromiso.',
            ],
        },
    },
}

export const DRK_COPY: Readonly<Record<DrkLang, DrkDictionary>> = { en, es }

/**
 * The form's words: the ads landing page's one-screen form (the same
 * procedure list, labels, errors and consent), in her voice.
 */
export interface DrkForm {
    readonly copy: ConsultChatCopy
    readonly staff: ConsultChatStaffLabels
}

export function buildDrkForm(lang: DrkLang): DrkForm {
    const lp = buildLpChat('default')
    // Consent is the checkbox here; the tap wording and the ads page's
    // test line don't apply.
    const base: ConsultChatCopy = {
        ...lp.copy[lang],
        consentTap: undefined,
        contactNote: undefined,
    }
    const mine: Partial<ConsultChatCopy> =
        lang === 'es'
            ? {
                  title: 'Solicita tu consulta con la Dra. Karlinsky',
                  fieldProcedure: '¿Qué estás considerando?',
                  procedurePlaceholder: 'Elige un procedimiento',
                  fieldName: 'Nombre',
                  fieldPhone: 'Celular',
                  submit: 'Solicitar mi consulta',
                  reassure:
                      'Sarah, de mi equipo, te escribirá. Sin compromiso.',
                  formHeader: undefined,
              }
            : {
                  title: 'Request your consultation with Dr. Karlinsky',
                  fieldProcedure: 'What are you considering?',
                  procedurePlaceholder: 'Choose a procedure',
                  fieldName: 'First name',
                  fieldPhone: 'Mobile number',
                  submit: 'Request my consultation',
                  reassure: 'Sarah from my team will text you. No obligation.',
                  formHeader: undefined,
              }
    return {
        copy: { ...base, ...mine },
        staff: lp.staff,
    }
}
