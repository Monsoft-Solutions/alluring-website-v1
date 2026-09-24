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
 * REGISTER
 * ---------------------------------------------------------------------
 * This page is written for the top of the market, and the register is
 * load-bearing rather than decorative. Three rules:
 *
 *   1. No price anxiety. There is no weekly payment, no APR and no
 *      "affordable" anywhere on this page. The one figure it gives is the
 *      settled starting price, and only in the thread's reply after the
 *      visitor names the procedure — an answer to her question, not a
 *      banner. The *service* claim stays: an all-inclusive figure, in
 *      writing, before anything is decided.
 *   2. Declarative, not persuasive. Short sentences, no exclamation marks, no
 *      superlatives we would have to defend. Confidence is quieter than
 *      enthusiasm.
 *   3. "Private", not "free". The consultation still carries no obligation,
 *      and that is said plainly. "Free" stays off this page until counsel has
 *      settled the Fla. Stat. 456.062 statement it would need.
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
 * Every factual claim here is already published on the site: the
 * AAAASF-accredited facility, board-certified anesthesiologists, the Google
 * rating, the procedure counts, the written recovery plan, the confirmed
 * dates, and that nobody here earns a commission. Raising the register does
 * not license a new one — reword freely, invent nothing.
 *
 * Dr. Karlinsky's credentials follow `karlinsky-credentials.constant.ts` and
 * Florida Rule 64B8-11.001: she is named as an MD, and only the boards that
 * need no Florida statement are named. She is not certified by the American
 * Board of Plastic Surgery, and this page never says "double board-certified".
 *
 * Verbatim and not to be paraphrased: the consent wording, the reviews, and
 * the footer disclaimer.
 */

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
    readonly answer: string
    readonly tag: string
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
    readonly meta: { readonly title: string; readonly description: string }
    readonly header: {
        readonly langLabel: string
        readonly callWord: string
        readonly cta: string
    }
    readonly hero: {
        readonly eyebrow: string
        /** After the bold rating. `{count}` is the Google review count. */
        readonly trustGoogle: string
        readonly trustBoard: string
        readonly trustAaaasf: string
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
        readonly quote: string
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
    readonly writing: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly body: string
        readonly cta: string
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

const en: LpDictionary = {
    meta: {
        title: 'Private Plastic Surgery Consultation in Miami | Alluring Plastic Surgery',
        description: `A private consultation with ${KARLINSKY_NAME}, in Miami. Real before-and-after results, an AAAASF-accredited facility, and your all-inclusive figure in writing before you decide anything. Hablamos Español.`,
    },
    header: {
        langLabel: 'Language / Idioma',
        callWord: 'Call ',
        cta: 'Request consultation',
    },
    hero: {
        eyebrow: 'Private consultation · Miami, FL',
        trustGoogle: 'on Google · {count} reviews',
        trustBoard: 'Board certified, American Board of Surgery',
        trustAaaasf: 'AAAASF-accredited facility',
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
        quote: '“Cosmetic surgery is never just about a single feature. It’s about how you feel when you walk into a room, and knowing we prioritized your safety at every step.”',
        lead: 'Your consultation is with the surgeon who operates. Not a patient advisor, not a closer.',
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
            'Operates in an AAAASF-accredited facility with board-certified anesthesiologists',
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
    writing: {
        eyebrow: 'What you leave with',
        heading: ['Answers, not a pitch. ', { em: 'In writing.' }],
        body: 'Most consultations end in a sales pitch. Yours ends with a straight answer on candidacy and your all-inclusive figure, put in writing so you can take it home, weigh it and decide in your own time. Nobody here earns a commission.',
        cta: 'Request a consultation',
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
                term: 'Facility',
                value: [
                    'AAAASF-accredited, with board-certified anesthesiologists.',
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
            {
                term: 'Your surgeon',
                value: [
                    'Dr. Victoria Karlinsky. Time with her, not a commission-paid closer.',
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
        eyebrow: 'Flying in?',
        heading: 'Over 40% of our patients travel to Miami for surgery',
        subtitle:
            'Meet your surgeon by video first. Book flights only once your dates are confirmed in writing.',
        cta: 'Request a virtual consultation',
        bullets: [
            'Virtual consultation from anywhere in the U.S.',
            'Surgery, pre-op and follow-up dates in writing before you book travel',
            'Pre-op, surgery and every follow-up in one accredited Miami facility',
            'Bilingual team, English and Spanish',
        ],
    },
    faq: {
        eyebrow: 'The real questions',
        heading: ['What’s actually ', { em: 'stopping you?' }],
        items: [
            {
                question: '“Is it safe?”',
                answer: `Surgery happens in an AAAASF-accredited facility with board-certified anesthesiologists, not an office suite. Every patient has pre-op lab work before we clear them. Your surgeon, ${KARLINSKY_NAME}, is board certified in general surgery by the American Board of Surgery.`,
                tag: 'Accredited facility · Pre-op labs',
            },
            {
                question: '“How long is recovery?”',
                answer: 'Most patients are back at a desk in one to two weeks; exercise comes back in stages after that, depending on the procedure. You get a written week-by-week recovery plan before you book, so you can plan work, childcare and travel around it.',
                tag: 'Written recovery plan up front',
            },
            {
                question: '“What if I’m not ready?”',
                answer: 'Then don’t book. The consultation carries no obligation, and you can leave with a price, a plan and no appointment. Nobody here earns a commission for closing you.',
                tag: 'No obligation · No commission',
            },
        ],
    },
    closing: {
        heading: ['Ready for a real ', { em: 'answer?' }],
        body: 'Private, confidential, no obligation. A patient coordinator texts you within 24 hours.',
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
    sticky: { cta: 'Request consultation' },
}

const es: LpDictionary = {
    meta: {
        title: 'Consulta privada de cirugía plástica en Miami | Alluring Plastic Surgery',
        description: `Una consulta privada con la Dra. ${KARLINSKY_NAME}, en Miami. Resultados reales de antes y después, una clínica acreditada AAAASF y tu cifra todo incluido por escrito antes de decidir nada.`,
    },
    header: {
        langLabel: 'Idioma / Language',
        callWord: 'Llama ',
        cta: 'Pedir consulta',
    },
    hero: {
        eyebrow: 'Consulta privada · Miami, FL',
        trustGoogle: 'en Google · {count} reseñas',
        trustBoard: 'Certificada por el American Board of Surgery',
        trustAaaasf: 'Clínica acreditada AAAASF',
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
        quote: '“La cirugía cosmética nunca se trata de un solo rasgo. Se trata de cómo te sientes al entrar a un lugar, sabiendo que tu seguridad fue la prioridad en cada paso.”',
        lead: 'Tu consulta es con la cirujana que opera. No con una asesora, no con un vendedor.',
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
            'Opera en una clínica acreditada AAAASF con anestesiólogos certificados',
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
    writing: {
        eyebrow: 'Con qué sales de la consulta',
        heading: [
            'Respuestas, no un discurso de venta. ',
            { em: 'Por escrito.' },
        ],
        body: 'La mayoría de las consultas terminan en una venta. La tuya termina con una respuesta clara sobre si eres candidata y tu cifra todo incluido, por escrito, para que te la lleves a casa, la valores y decidas con calma. Aquí nadie gana comisión.',
        cta: 'Pedir una consulta',
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
                term: 'Clínica',
                value: [
                    'Acreditada por la AAAASF, con anestesiólogos certificados.',
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
            {
                term: 'Tu cirujana',
                value: [
                    'Dra. Victoria Karlinsky. Tiempo con ella, no con un vendedor a comisión.',
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
        eyebrow: '¿Vienes de fuera?',
        heading:
            'Más del 40% de nuestras pacientes viajan a Miami para operarse',
        subtitle:
            'Conoce a tu cirujana por video primero. Compra tus vuelos solo cuando tus fechas estén confirmadas por escrito.',
        cta: 'Pedir una consulta virtual',
        bullets: [
            'Consulta virtual desde cualquier lugar',
            'Fechas de cirugía, preoperatorio y controles por escrito antes de reservar tu viaje',
            'Preoperatorio, cirugía y todos los controles en una sola clínica acreditada en Miami',
            'Todo el equipo habla español',
        ],
    },
    faq: {
        eyebrow: 'Las preguntas de verdad',
        heading: ['¿Qué te está ', { em: 'frenando?' }],
        items: [
            {
                question: '“¿Es seguro?”',
                answer: `La cirugía se realiza en una clínica acreditada por la AAAASF con anestesiólogos certificados, no en un consultorio. Toda paciente pasa por exámenes de laboratorio antes de ser aprobada. Tu cirujana, la Dra. ${KARLINSKY_NAME}, está certificada en cirugía general por el American Board of Surgery.`,
                tag: 'Clínica acreditada · Laboratorios previos',
            },
            {
                question: '“¿Cuánto dura la recuperación?”',
                answer: 'La mayoría vuelve al trabajo de oficina en una o dos semanas; el ejercicio vuelve por etapas después, según el procedimiento. Recibes un plan de recuperación semana a semana por escrito antes de reservar.',
                tag: 'Plan de recuperación por escrito',
            },
            {
                question: '“¿Y si aún no estoy lista?”',
                answer: 'Entonces no reserves. La consulta no tiene ningún compromiso y puedes irte con un precio, un plan y sin cita programada. Aquí nadie gana comisión por convencerte.',
                tag: 'Sin compromiso · Sin comisiones',
            },
        ],
    },
    closing: {
        heading: ['¿Lista para una respuesta ', { em: 'de verdad?' }],
        body: 'Privada, confidencial y sin compromiso. Una coordinadora te escribe por texto en 24 horas.',
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
    sticky: { cta: 'Pedir consulta' },
}

export const LP_COPY: Readonly<Record<LpLang, LpDictionary>> = { en, es }

/** Narrows an arbitrary string (a query param, a stored choice) to a language. */
export function toLpLang(value: string | null | undefined): LpLang | null {
    const candidate = (value ?? '').toLowerCase().slice(0, 2)
    return candidate === 'en' || candidate === 'es' ? candidate : null
}
