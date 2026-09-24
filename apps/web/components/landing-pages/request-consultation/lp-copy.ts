/**
 * Every string on /lp/request-consultation, in both languages.
 *
 * The page runs its own copy deck rather than the site's, because it is a paid
 * landing page: the argument, the ordering and the disclaimers were written
 * for ad traffic and are not shared with any indexed route.
 *
 * The consultation thread's own words (the questions, the reply after the
 * first tap) live in `lp-chat-copy.ts`, which is built on the server.
 *
 * ---------------------------------------------------------------------
 * REGISTER (v5, #290)
 * ---------------------------------------------------------------------
 * The page talks to the person who clicked the ad, and the data says who
 * that is: usually a woman on her phone, often out of state, often after
 * hours, and often comparing prices (price words are in 8.6% of paid
 * clicks). v4 was written as a top-of-market brand and said little to
 * someone asking "can I afford this, and who operates on me?". The line v5
 * makes everywhere is the site's tagline: personal care, honest price.
 *
 *   1. Say what she searched. The headline names the procedure and Miami
 *      (`lp-variants.ts`); the second line repeats the ad's promise.
 *   2. Answer the money question plainly: the settled starting prices, one
 *      all-inclusive figure in writing, and financing by partner name. Never
 *      a payment amount, an APR or a term — those trigger Truth in Lending
 *      disclosures (Reg Z) — and never "affordable" or "luxury": show the
 *      value, don't claim it.
 *   3. Talk to her. "You", short sentences, plain words, no exclamation
 *      marks, no superlatives we would have to defend, no acronyms she has
 *      to look up.
 *   4. "No obligation", not "free". "Free" stays off this page until counsel
 *      has settled the Fla. Stat. 456.062 statement it would need.
 *
 * The practice answers every lead by text, so nothing here promises a call.
 * A visitor who would rather talk can still tap the phone number.
 *
 * Spanish exists for Spanish speakers inside the US, not for cross-border
 * patients — nothing here offers travel coordination.
 *
 * ---------------------------------------------------------------------
 * CLAIMS
 * ---------------------------------------------------------------------
 * Every factual claim here is already published on the site: the Google
 * rating, the procedure counts, the starting prices (read from the facts
 * files by the server), the three financing partners and Cherry's soft
 * check, the written recovery plan, the confirmed dates, and that nobody
 * here earns a commission. Reword freely, invent nothing.
 *
 * No facility-accreditation claim (AAAASF or any other) and no
 * anesthesiologist claim: the practice has not confirmed either in writing,
 * and the procedure-page compliance guide lists both as owner claims.
 *
 * Dr. Karlinsky's credentials follow `karlinsky-credentials.constant.ts` and
 * Florida Rule 64B8-11.001: she is named as an MD, and only the boards that
 * need no Florida statement are named. She is not certified by the American
 * Board of Plastic Surgery, and this page never says "double board-certified".
 *
 * Verbatim and not to be paraphrased: the consent wording, the reviews, and
 * the footer disclaimer.
 */

import { FINANCING_PARTNERS } from '@/lib/data/site-config'
import {
    KARLINSKY_ABS_CERTIFIED_ON,
    KARLINSKY_FLORIDA_LICENSE,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

export type LpLang = 'en' | 'es'

export const LP_LANGUAGES: readonly LpLang[] = ['en', 'es'] as const

/**
 * A run of copy that carries inline emphasis or a link.
 *
 * The original page shipped these as HTML strings and wrote them in with
 * `innerHTML`; here they are data, so the same sentence can be rendered
 * through JSX and nothing on this page is ever handed to the DOM as markup.
 */
export type RichSegment =
    | string
    | { em: string }
    | { b: string }
    | { link: { label: string; href: string } }

export type RichText = readonly RichSegment[]

export interface LpReview {
    readonly quote: string
    readonly by: string
}

export interface LpStat {
    readonly value: string
    /** Renders the gold star after the number (the Google rating stat). */
    readonly star?: boolean
    readonly label: string
}

export interface LpFaqItem {
    readonly question: string
    /** `{prices}` is replaced with the deck's `faq.prices` sentence, or dropped. */
    readonly answer: string
    readonly tag: string
}

export interface LpFinancingStep {
    readonly title: string
    readonly body: string
}

export interface LpSheetRow {
    readonly term: string
    readonly value: RichText
}

/** Keyed by the procedure slug used for the before/after ordering. */
export interface LpResultCaption {
    readonly caption: string
    readonly alt: string
}

export interface LpDictionary {
    readonly meta: {
        /** `{title}` is the ad group's own (`VariantCopy.title`). */
        readonly title: string
        readonly description: string
    }
    readonly header: {
        readonly langLabel: string
        readonly callWord: string
        readonly cta: string
    }
    readonly hero: {
        readonly eyebrow: string
        /** After the bold rating. `{count}` is the Google review count. */
        readonly trustGoogle: string
        /** The promise every ad makes. */
        readonly trustSurgeon: string
        readonly trustFinancing: string
        /** The "prefer the other language?" nudge under the thread. */
        readonly nudge: { readonly question: string; readonly action: string }
        /** Under the thread, before the phone number. */
        readonly callAlt: string
        /** Melissa's page labels its certification badges with this. */
        readonly badgesLabel: string
    }
    /**
     * The SMS consent every thread on the site shows (read by the site's
     * consultation thread, the lead popup and Melissa's page too).
     */
    readonly consent: RichText
    readonly surgeon: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly role: string
        readonly lead: string
        readonly stats: readonly LpStat[]
        readonly credentials: readonly string[]
        readonly badgesLabel: string
        readonly cta: string
        readonly portraitAlt: string
    }
    readonly results: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly subtitle: string
        readonly beforeAfterTag: string
        readonly captions: Readonly<Record<string, LpResultCaption>>
        readonly railLabel: string
        readonly swipeHint: string
        readonly note: string
        readonly cta: string
    }
    /**
     * Price & financing (#290): the written-summary card v4 called "What you
     * leave with", plus how paying works. No amounts, rates or terms.
     */
    readonly financing: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly body: string
        readonly steps: readonly LpFinancingStep[]
        readonly partnersLabel: string
        /** Scrolls to the thread and tags the lead `financing_interest = yes`. */
        readonly cta: string
        readonly fine: string
        readonly sheetLabel: string
        readonly sheetTitle: string
        readonly sheetSubtitle: string
        readonly sheetName: string
        readonly sheetPlace: string
        readonly rows: readonly LpSheetRow[]
        readonly sheetFootLeft: string
        readonly sheetFootRight: string
    }
    readonly reviews: {
        readonly eyebrow: string
        readonly heading: RichText
        /** Static count, for pages without the live one (Melissa's). */
        readonly source: string
        /** `{count}` is the live Google review count. */
        readonly sourceLive: string
        readonly items: readonly LpReview[]
        readonly moreLabel: string
        /** Melissa's page links out to /reviews with this; the ads page does not. */
        readonly link: string
    }
    readonly flyIn: {
        readonly eyebrow: string
        readonly heading: string
        readonly subtitle: string
        readonly cta: string
        readonly bullets: readonly string[]
    }
    readonly faq: {
        readonly eyebrow: string
        readonly heading: RichText
        /**
         * The settled starting prices, for the cost answer: `{bbl}` and
         * `{lipo}`. Dropped whole when either price is missing.
         */
        readonly prices: string
        readonly items: readonly LpFaqItem[]
    }
    readonly closing: {
        readonly heading: RichText
        readonly body: string
        /** Above the procedure chips that answer the thread's first question. */
        readonly chipsLabel: string
        readonly or: string
    }
    readonly footer: {
        readonly privacy: string
        readonly terms: string
        readonly cookies: string
        readonly disclaimer: string
        /** The legal documents open in a dialog on the page, under these titles. */
        readonly titles: {
            readonly privacy: string
            readonly terms: string
            readonly cookies: string
        }
        readonly close: string
        readonly loading: string
        /** When the document could not be downloaded, before the new-tab link. */
        readonly loadError: string
        readonly openInTab: string
    }
    readonly sticky: { readonly cta: string }
}

/**
 * Absolute links to the main site. The ads page itself no longer links out
 * (its legal links open in a dialog); Melissa's page still uses these.
 */
const SITE = 'https://www.alluringplasticsurgery.com'

export const LP_LINKS = {
    home: `${SITE}/`,
    privacy: `${SITE}/privacy`,
    terms: `${SITE}/terms`,
    cookies: `${SITE}/cookies`,
    gallery: `${SITE}/gallery#gallery-groups`,
    surgeon: `${SITE}/dr-karlinsky`,
    reviews: `${SITE}/reviews`,
} as const

const ABS_YEAR = KARLINSKY_ABS_CERTIFIED_ON.slice(0, 4)

/** "Cherry, CareCredit or United Credit", from the site's partner list. */
function partners(conjunction: string): string {
    const names = [...FINANCING_PARTNERS]
    const last = names.pop()
    return names.length
        ? `${names.join(', ')} ${conjunction} ${last}`
        : (last ?? '')
}

const en: LpDictionary = {
    meta: {
        title: '{title} · Financing Available | Alluring Plastic Surgery',
        description: `A consultation with ${KARLINSKY_NAME}, in Miami or by video. Real before-and-after results, one all-inclusive price in writing, and financing through ${partners('and')}. Hablamos Español.`,
    },
    header: {
        langLabel: 'Language / Idioma',
        callWord: 'Call ',
        cta: 'Start my consultation',
    },
    hero: {
        eyebrow: 'In person or by video · Miami',
        trustGoogle: 'on Google · {count} reviews',
        trustSurgeon: 'Your surgeon does your surgery',
        trustFinancing: 'Financing available',
        nudge: {
            question: '¿Prefieres español?',
            action: 'Ver esta página en español',
        },
        callAlt: 'Prefer to talk? Call',
        badgesLabel: 'Board certifications',
    },
    consent: [
        'I have read and understood the ',
        { link: { label: 'Privacy Policy', href: LP_LINKS.privacy } },
        ' and ',
        { link: { label: 'Terms', href: LP_LINKS.terms } },
        '. By submitting my mobile number and email, I expressly consent to receive informational and promotional messages from Alluring Plastic Surgery through SMS, email, and phone calls, including messages sent using an automatic telephone dialing system. Consent is not a condition of purchase. Msg & data rates may apply. Msg frequency varies. Reply STOP to opt out, HELP for help.*',
    ],
    surgeon: {
        eyebrow: 'Your surgeon',
        heading: ['Dr. Victoria ', { em: 'Karlinsky' }],
        role: `${KARLINSKY_NAME} · Medical Director`,
        lead: 'The surgeon you meet is the surgeon who operates. She plans your surgery, performs it, and sees you at follow-up.',
        stats: [
            { value: '5,000+', label: 'Procedures' },
            { value: '1,500+', label: 'BBLs performed' },
            { value: '15+', label: 'Years in practice' },
            { value: '4.7', star: true, label: 'Google rating, 80+ reviews' },
        ],
        credentials: [
            `Board certified in general surgery by the American Board of Surgery since ${ABS_YEAR}`,
            'Fellow of the American College of Surgeons (FACS)',
            `Florida medical license ${KARLINSKY_FLORIDA_LICENSE}, clear and active`,
        ],
        badgesLabel: 'Board certification and fellowship',
        cta: 'Request a consultation with Dr. Karlinsky',
        portraitAlt: 'Dr. Victoria Karlinsky',
    },
    results: {
        eyebrow: 'Real patients',
        heading: ['See the ', { em: 'work' }],
        subtitle:
            'Before-and-after photographs of actual Alluring patients, starting with the procedure you asked about.',
        beforeAfterTag: 'Before · After',
        captions: {
            bbl: {
                caption: 'Brazilian Butt Lift',
                alt: 'Before and after Brazilian Butt Lift, back view',
            },
            'mommy-makeover': {
                caption: 'Mommy Makeover',
                alt: 'Before and after mommy makeover, front view',
            },
            'breast-augmentation': {
                caption: 'Breast Augmentation',
                alt: 'Before and after breast augmentation',
            },
            'tummy-tuck': {
                caption: 'Tummy Tuck',
                alt: 'Before and after tummy tuck, front view',
            },
            liposuction: {
                caption: 'Lipo 360',
                alt: 'Before and after Lipo 360, front view',
            },
        },
        railLabel: 'Before-and-after photographs',
        swipeHint: 'Swipe for more results',
        note: 'Individual results vary.',
        cta: 'Request a consultation',
    },
    financing: {
        eyebrow: 'Price & financing',
        heading: ['Your price in writing. ', { em: 'Your payments, planned.' }],
        body: 'Surgery is a real investment, and you shouldn’t have to guess what it costs. You get one all-inclusive figure in writing before you decide anything. Then you choose how to pay: in full, in monthly payments through a financing partner, or both.',
        steps: [
            {
                title: 'Get your figure',
                body: 'Your all-inclusive price comes in writing after your consultation, so the amount you finance is the real one.',
            },
            {
                title: 'Check your options',
                body: `Apply with ${partners('or')}. Checking with Cherry won’t affect your credit score.`,
            },
            {
                title: 'Choose your date',
                body: 'Book once the monthly payment works for you. Your coordinator will walk you through the plans.',
            },
        ],
        partnersLabel: 'Financing partners',
        cta: 'Ask about financing',
        fine: 'Financing is offered by third-party lenders and is subject to credit approval. Terms vary by lender and plan.',
        sheetLabel: 'Consultation summary',
        sheetTitle: 'Consultation summary',
        sheetSubtitle: 'What every patient leaves with',
        sheetName: 'Patient',
        sheetPlace: 'Miami, FL',
        rows: [
            {
                term: 'Candidate?',
                value: [
                    'A straight answer: ',
                    { em: 'yes' },
                    ', or ',
                    { em: 'not yet' },
                    ', and why.',
                ],
            },
            {
                term: 'Price',
                value: [
                    'All-inclusive, ',
                    { em: 'in writing.' },
                    ' No surprise fees.',
                ],
            },
            {
                term: 'Payment',
                value: [
                    'In full, financed, or a mix. ',
                    { em: 'Your choice.' },
                ],
            },
            {
                term: 'Recovery',
                value: ['A written week-by-week plan before you book.'],
            },
            {
                term: 'Dates',
                value: [
                    'Surgery, pre-op and follow-ups confirmed before you book travel.',
                ],
            },
        ],
        sheetFootLeft: 'Private · No obligation · No commission',
        sheetFootRight: 'Alluring Plastic Surgery',
    },
    reviews: {
        eyebrow: 'Google reviews',
        heading: ['What patients ', { em: 'actually' }, ' say'],
        source: '80+ reviews on Google',
        sourceLive: '{count} reviews on Google',
        items: [
            {
                quote: 'The entire team was amazing, took care of me from start to finish. Doctor was truly helpful. The post op massages were epic. 10/10 can’t wait to tell and bring my girls out here for their procedures.',
                by: 'Erika Frausto · May 2026',
            },
            {
                quote: 'I traveled from North Carolina to Miami for my mommy makeover with Dr. Karlinsky at Alluring Plastic Surgery, and I truly couldn’t be happier with my experience. From start to finish, everyone was amazing.',
                by: 'Alannah Dispennette · Jan 2026',
            },
            {
                quote: 'I felt calm and safe with the entire Alluring team. It’s been less than 24 hours since my surgery — tummy tuck, liposuction on my flanks and abdomen — and I feel perfect.',
                by: 'Marycelis Trinidad Matos · Dec 2025',
            },
        ],
        moreLabel: 'More from Google',
        link: 'Read more patient reviews',
    },
    flyIn: {
        eyebrow: 'From out of state',
        heading: 'Flying in? Plan it from home.',
        subtitle:
            'Over 40% of our patients travel to Miami for surgery. Meet your surgeon by video first, and book flights only once your dates are confirmed in writing.',
        cta: 'Request a video consultation',
        bullets: [
            'Video consultation from anywhere in the U.S.',
            'Surgery, pre-op and follow-up dates in writing before you book travel',
            'How many nights to stay in Miami before you’re cleared to fly home, in writing',
            'Bilingual team, English and Spanish',
        ],
    },
    faq: {
        eyebrow: 'Straight answers',
        heading: ['The questions ', { em: 'everyone asks' }],
        prices: 'BBL starts at {bbl} and Lipo 360 at {lipo}.',
        items: [
            {
                question: 'How much will it cost?',
                answer: 'It depends on your body and your goals, so your figure comes after your consultation: one all-inclusive price, in writing, with no surprise fees. {prices} Financing is available if you’d rather pay monthly.',
                tag: 'All-inclusive · In writing',
            },
            {
                question: 'Can I finance it?',
                answer: `Yes. We work with ${partners('and')}. You can check your options before you choose a date, and checking with Cherry won’t affect your credit score. Financing is subject to the lender’s approval.`,
                tag: FINANCING_PARTNERS.join(' · '),
            },
            {
                question: 'Is it safe?',
                answer: `Every patient has pre-op lab work before we clear them for surgery. Your surgeon, ${KARLINSKY_NAME}, is board certified in general surgery by the American Board of Surgery. She performs your surgery herself and sees you at follow-up.`,
                tag: 'Pre-op labs · Your surgeon operates',
            },
            {
                question: 'How much time off will I need?',
                answer: 'Most patients are back at a desk in one to two weeks, and exercise comes back in stages after that, depending on the procedure. You get a written week-by-week recovery plan before you book, so you can plan work and childcare around it.',
                tag: 'Written recovery plan up front',
            },
            {
                question: 'I don’t live in Miami. How does it work?',
                answer: 'Start with a video consultation from home. Your surgery, pre-op and follow-up dates come in writing before you book flights, along with how many nights to stay in Miami before you’re cleared to fly home.',
                tag: 'Video consultation · Dates in writing',
            },
            {
                question: 'What if I’m not ready?',
                answer: 'Then don’t book. The consultation carries no obligation, and you can leave with a price, a plan and no appointment. Nobody here earns a commission for closing you.',
                tag: 'No obligation · No commission',
            },
        ],
    },
    closing: {
        heading: ['Your plan and your price, ', { em: 'in writing.' }],
        body: 'Private, no obligation. A patient coordinator texts you within 24 hours.',
        chipsLabel: 'Start with what you’re considering',
        or: 'or call',
    },
    footer: {
        privacy: 'Privacy',
        terms: 'Terms',
        cookies: 'Cookies',
        disclaimer:
            '*Before-and-after photographs show actual patients of Dr. Karlinsky; individual results vary. All surgical procedures carry risk. This page is for general information and is not medical advice.',
        titles: {
            privacy: 'Privacy Policy',
            terms: 'Terms of Service',
            cookies: 'Cookie Policy',
        },
        close: 'Close',
        loading: 'Loading…',
        loadError: 'This document didn’t load here.',
        openInTab: 'Open it in a new tab',
    },
    sticky: { cta: 'Start my consultation' },
}

const es: LpDictionary = {
    meta: {
        title: '{title} · Con financiamiento | Alluring Plastic Surgery',
        description: `Una consulta con la Dra. ${KARLINSKY_NAME}, en Miami o por video. Resultados reales de antes y después, un solo precio todo incluido por escrito y financiamiento con ${partners('y')}.`,
    },
    header: {
        langLabel: 'Idioma / Language',
        callWord: 'Llama ',
        cta: 'Empezar mi consulta',
    },
    hero: {
        eyebrow: 'En persona o por video · Miami',
        trustGoogle: 'en Google · {count} reseñas',
        trustSurgeon: 'Tu cirujana hace tu cirugía',
        trustFinancing: 'Financiamiento disponible',
        nudge: {
            question: 'Prefer English?',
            action: 'View this page in English',
        },
        callAlt: '¿Prefieres hablar? Llama al',
        badgesLabel: 'Certificaciones',
    },
    consent: [
        'He leído y entiendo la ',
        {
            link: {
                label: 'Política de Privacidad',
                href: LP_LINKS.privacy,
            },
        },
        ' y los ',
        { link: { label: 'Términos', href: LP_LINKS.terms } },
        '. Al enviar mi número de celular y correo, doy mi consentimiento expreso para recibir mensajes informativos y promocionales de Alluring Plastic Surgery por SMS, correo electrónico y llamadas, incluidos mensajes enviados con un sistema de marcación automática. El consentimiento no es condición de compra. Pueden aplicar tarifas de mensajes y datos. La frecuencia varía. Responda STOP para cancelar, HELP para ayuda.*',
    ],
    surgeon: {
        eyebrow: 'Tu cirujana',
        heading: ['Dra. Victoria ', { em: 'Karlinsky' }],
        role: `${KARLINSKY_NAME} · Directora médica`,
        lead: 'La cirujana que conoces es la cirujana que opera. Ella planifica tu cirugía, la realiza y te ve en tus controles.',
        stats: [
            { value: '5,000+', label: 'Procedimientos' },
            { value: '1,500+', label: 'BBL realizados' },
            { value: '15+', label: 'Años de experiencia' },
            {
                value: '4.7',
                star: true,
                label: 'En Google, más de 80 reseñas',
            },
        ],
        credentials: [
            `Certificada en cirugía general por el American Board of Surgery desde ${ABS_YEAR}`,
            'Fellow del American College of Surgeons (FACS)',
            `Licencia médica de Florida ${KARLINSKY_FLORIDA_LICENSE}, vigente y sin sanciones`,
        ],
        badgesLabel: 'Certificación y fellowship',
        cta: 'Pedir una consulta con la Dra. Karlinsky',
        portraitAlt: 'Dra. Victoria Karlinsky',
    },
    results: {
        eyebrow: 'Pacientes reales',
        heading: ['Mira el ', { em: 'trabajo' }],
        subtitle:
            'Fotografías de antes y después de pacientes reales de Alluring, empezando por el procedimiento que buscas.',
        beforeAfterTag: 'Antes · Después',
        captions: {
            bbl: {
                caption: 'Brazilian Butt Lift (BBL)',
                alt: 'Antes y después de un Brazilian Butt Lift, vista posterior',
            },
            'mommy-makeover': {
                caption: 'Mommy Makeover',
                alt: 'Antes y después de un mommy makeover, vista frontal',
            },
            'breast-augmentation': {
                caption: 'Aumento de senos',
                alt: 'Antes y después de un aumento de senos',
            },
            'tummy-tuck': {
                caption: 'Abdominoplastia',
                alt: 'Antes y después de una abdominoplastia, vista frontal',
            },
            liposuction: {
                caption: 'Lipo 360',
                alt: 'Antes y después de una Lipo 360, vista frontal',
            },
        },
        railLabel: 'Fotografías de antes y después',
        swipeHint: 'Desliza para ver más resultados',
        note: 'Los resultados varían según la persona.',
        cta: 'Pedir una consulta',
    },
    financing: {
        eyebrow: 'Precio y financiamiento',
        heading: [
            'Tu precio, por escrito. ',
            { em: 'Tus pagos, planificados.' },
        ],
        body: 'Una cirugía es una inversión real, y no deberías tener que adivinar cuánto cuesta. Recibes una sola cifra todo incluido por escrito antes de decidir nada. Después eliges cómo pagar: completo, en pagos mensuales con una financiera, o una combinación.',
        steps: [
            {
                title: 'Recibe tu cifra',
                body: 'Tu precio todo incluido te llega por escrito después de tu consulta, así que el monto que financias es el real.',
            },
            {
                title: 'Revisa tus opciones',
                body: `Solicita con ${partners('o')}. Consultar con Cherry no afecta tu puntaje de crédito.`,
            },
            {
                title: 'Elige tu fecha',
                body: 'Reserva cuando el pago mensual te funcione. Tu coordinadora te explica los planes.',
            },
        ],
        partnersLabel: 'Financieras',
        cta: 'Preguntar por financiamiento',
        fine: 'El financiamiento lo ofrecen prestamistas externos y está sujeto a aprobación de crédito. Las condiciones varían según el prestamista y el plan.',
        sheetLabel: 'Resumen de tu consulta',
        sheetTitle: 'Resumen de tu consulta',
        sheetSubtitle: 'Con qué sale cada paciente',
        sheetName: 'Paciente',
        sheetPlace: 'Miami, FL',
        rows: [
            {
                term: '¿Candidata?',
                value: [
                    'Una respuesta clara: ',
                    { em: 'sí' },
                    ', o ',
                    { em: 'todavía no' },
                    ', y por qué.',
                ],
            },
            {
                term: 'Precio',
                value: [
                    'Todo incluido, ',
                    { em: 'por escrito.' },
                    ' Sin cargos sorpresa.',
                ],
            },
            {
                term: 'Pago',
                value: [
                    'Completo, financiado o una combinación. ',
                    { em: 'Tú decides.' },
                ],
            },
            {
                term: 'Recuperación',
                value: [
                    'Un plan semana a semana por escrito antes de reservar.',
                ],
            },
            {
                term: 'Fechas',
                value: [
                    'Cirugía, preoperatorio y controles confirmados antes de reservar tu viaje.',
                ],
            },
        ],
        sheetFootLeft: 'Privada · Sin compromiso · Sin comisiones',
        sheetFootRight: 'Alluring Plastic Surgery',
    },
    reviews: {
        eyebrow: 'Reseñas de Google',
        heading: ['Lo que dicen ', { em: 'nuestras pacientes' }],
        source: 'Más de 80 reseñas en Google',
        sourceLive: '{count} reseñas en Google',
        items: [
            {
                quote: 'Me sentí tranquila y segura con todo el equipo de Alluring. Han pasado menos de 24 horas desde mi cirugía, abdominoplastia y liposucción de flancos y abdomen, y me siento perfecta.',
                by: 'Marycelis Trinidad Matos · Dic 2025',
            },
            {
                quote: 'Estoy más que satisfecha con todo mi proceso. Es un equipo maravilloso; dejas de ser cliente y te conviertes en familia. Sin duda, es el mejor lugar para lograr tu transformación.',
                by: 'Lisandra Aguilera · Oct 2025',
            },
            {
                quote: 'Lo mejor de lo mejor, excelente servicio, gran trabajo, personas extraordinarias. Me encantó TODO desde el día 1, mis resultados son increíbles, gracias por todo.',
                by: 'Raynellys Rodriguez Weffer · 2025',
            },
        ],
        moreLabel: 'Más reseñas en Google',
        link: 'Leer más reseñas de pacientes',
    },
    flyIn: {
        eyebrow: 'Desde otro estado',
        heading: '¿Vienes de fuera? Planifícalo desde casa.',
        subtitle:
            'Más del 40% de nuestras pacientes viajan a Miami para operarse. Conoce a tu cirujana por video primero y compra tus vuelos solo cuando tus fechas estén confirmadas por escrito.',
        cta: 'Pedir una consulta por video',
        bullets: [
            'Consulta por video desde cualquier lugar de EE. UU.',
            'Fechas de cirugía, preoperatorio y controles por escrito antes de reservar tu viaje',
            'Cuántas noches quedarte en Miami antes de que te autoricen a volar a casa, por escrito',
            'Todo el equipo habla español',
        ],
    },
    faq: {
        eyebrow: 'Respuestas claras',
        heading: ['Las preguntas que ', { em: 'todas hacen' }],
        prices: 'El BBL empieza en {bbl} y la Lipo 360 en {lipo}.',
        items: [
            {
                question: '¿Cuánto me va a costar?',
                answer: 'Depende de tu cuerpo y de tus metas, así que tu cifra llega después de tu consulta: un solo precio todo incluido, por escrito y sin cargos sorpresa. {prices} Hay financiamiento disponible si prefieres pagar mes a mes.',
                tag: 'Todo incluido · Por escrito',
            },
            {
                question: '¿Puedo financiarlo?',
                answer: `Sí. Trabajamos con ${partners('y')}. Puedes revisar tus opciones antes de elegir la fecha, y consultar con Cherry no afecta tu puntaje de crédito. El financiamiento está sujeto a la aprobación del prestamista.`,
                tag: FINANCING_PARTNERS.join(' · '),
            },
            {
                question: '¿Es seguro?',
                answer: `Toda paciente pasa por exámenes de laboratorio antes de que la aprobemos para la cirugía. Tu cirujana, la Dra. ${KARLINSKY_NAME}, está certificada en cirugía general por el American Board of Surgery. Ella realiza tu cirugía y te ve en tus controles.`,
                tag: 'Laboratorios previos · Tu cirujana opera',
            },
            {
                question: '¿Cuánto tiempo tendré que tomarme libre?',
                answer: 'La mayoría vuelve al trabajo de oficina en una o dos semanas, y el ejercicio vuelve por etapas después, según el procedimiento. Recibes un plan de recuperación semana a semana por escrito antes de reservar, para organizar el trabajo y el cuidado de tus hijos.',
                tag: 'Plan de recuperación por escrito',
            },
            {
                question: 'No vivo en Miami. ¿Cómo funciona?',
                answer: 'Empieza con una consulta por video desde casa. Tus fechas de cirugía, preoperatorio y controles te llegan por escrito antes de comprar vuelos, junto con cuántas noches quedarte en Miami antes de que te autoricen a volar a casa.',
                tag: 'Consulta por video · Fechas por escrito',
            },
            {
                question: '¿Y si aún no estoy lista?',
                answer: 'Entonces no reserves. La consulta no tiene ningún compromiso y puedes irte con un precio, un plan y sin cita programada. Aquí nadie gana comisión por convencerte.',
                tag: 'Sin compromiso · Sin comisiones',
            },
        ],
    },
    closing: {
        heading: ['Tu plan y tu precio, ', { em: 'por escrito.' }],
        body: 'Privada y sin compromiso. Una coordinadora te escribe por texto en 24 horas.',
        chipsLabel: 'Empieza por lo que estás considerando',
        or: 'o llama al',
    },
    footer: {
        privacy: 'Privacidad',
        terms: 'Términos',
        cookies: 'Cookies',
        disclaimer:
            '*Las fotografías de antes y después muestran pacientes reales de la Dra. Karlinsky; los resultados varían según la persona. Toda cirugía conlleva riesgos. Esta página es informativa y no constituye consejo médico.',
        titles: {
            privacy: 'Política de privacidad (en inglés)',
            terms: 'Términos del servicio (en inglés)',
            cookies: 'Política de cookies (en inglés)',
        },
        close: 'Cerrar',
        loading: 'Cargando…',
        loadError: 'Este documento no cargó aquí.',
        openInTab: 'Ábrelo en una pestaña nueva',
    },
    sticky: { cta: 'Empezar mi consulta' },
}

export const LP_COPY: Readonly<Record<LpLang, LpDictionary>> = { en, es }

/** Narrows an arbitrary string (a query param, a stored choice) to a language. */
export function toLpLang(value: string | null | undefined): LpLang | null {
    const candidate = (value ?? '').toLowerCase().slice(0, 2)
    return candidate === 'en' || candidate === 'es' ? candidate : null
}
