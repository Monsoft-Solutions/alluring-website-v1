/**
 * Every string on /lp/request-consultation, in both languages.
 *
 * The page runs its own copy deck rather than the site's, because it is a paid
 * landing page: the argument, the ordering and the disclaimers were written
 * for ad traffic and are not shared with any indexed route.
 *
 * ---------------------------------------------------------------------
 * REGISTER
 * ---------------------------------------------------------------------
 * This page is written for the top decile of the market, and the register is
 * load-bearing rather than decorative. Three rules:
 *
 *   1. No price anxiety. There is no weekly payment, no APR and no
 *      "affordable" anywhere on this page. What stays is the *service* claim
 *      — an all-inclusive figure, in writing, before anything is decided —
 *      because that reads as competence where "from $27/week" reads as a
 *      discount, and a discount is not what this audience is shopping for.
 *   2. Declarative, not persuasive. Short sentences, no exclamation marks, no
 *      superlatives we would have to defend. Confidence is quieter than
 *      enthusiasm.
 *   3. "Private", not "free". The consultation still costs nothing and still
 *      carries no obligation, and both are still said plainly — but the word
 *      leading every heading is discretion, not price.
 *
 * Spanish exists for Spanish speakers inside the US, not for cross-border
 * patients — nothing here offers travel coordination.
 *
 * ---------------------------------------------------------------------
 * CLAIMS
 * ---------------------------------------------------------------------
 * Every factual claim here is already published on the site: double board
 * certification, the AAAASF-accredited facility, board-certified
 * anesthesiologists, the 4.7 Google rating, the procedure counts, the written
 * recovery plan, the confirmed dates, and that nobody here earns a commission.
 * Raising the register does not license a new one — reword freely, invent
 * nothing.
 *
 * Verbatim and not to be paraphrased: the consent wording, the reviews, and
 * the footer disclaimer.
 */

import type { LpProcedureValue } from './lp-variants'

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
        readonly trustGoogle: RichText
        readonly trustBoard: string
        readonly trustAaaasf: string
        readonly badgesLabel: string
        /** The "prefer the other language?" nudge under the trust row. */
        readonly nudge: { readonly question: string; readonly action: string }
    }
    readonly form: {
        readonly eyebrow: string
        readonly title: string
        readonly subtitle: string
        readonly consent: RichText
        readonly consentError: string
        readonly reassure: string
        readonly micro: readonly [string, string, string]
        readonly submitLabel: string
        readonly fieldFirstName: string
        readonly fieldLastName: string
        readonly fieldPhone: string
        readonly fieldEmail: string
        readonly fieldProcedure: string
        readonly procedurePlaceholder: string
        /** Every procedure the form offers, as the contact system stores it. */
        readonly procedureOptions: readonly {
            readonly value: LpProcedureValue
            readonly label: string
        }[]
        /** Button label while the request is in flight. */
        readonly submitting: string
        /** One message per field, shown in place of the schema's own. */
        readonly errors: {
            readonly firstName: string
            readonly lastName: string
            readonly phone: string
            readonly email: string
            /** The request failed: network, server, or a rejected payload. */
            readonly submit: string
        }
    }
    readonly surgeon: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly role: string
        readonly quote: string
        readonly lead: string
        readonly stats: readonly LpStat[]
        readonly credentials: readonly string[]
        readonly cta: string
        readonly portraitAlt: string
    }
    readonly results: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly subtitle: string
        readonly beforeAfterTag: string
        readonly captions: Readonly<Record<string, LpResultCaption>>
        readonly note: string
        readonly cta: string
        readonly link: string
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
        readonly source: string
        readonly items: readonly LpReview[]
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
        readonly cta: string
        readonly or: string
    }
    readonly footer: {
        readonly privacy: string
        readonly terms: string
        readonly cookies: string
        readonly disclaimer: string
    }
    readonly sticky: { readonly call: string; readonly cta: string }
}

/** Absolute, because the landing page links out to the main site. */
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

const en: LpDictionary = {
    meta: {
        title: 'Private Plastic Surgery Consultation in Miami | Alluring Plastic Surgery',
        description:
            'A private consultation with a double board-certified surgeon in Miami. Real before-and-after results, an AAAASF-accredited facility, and your all-inclusive figure in writing before you decide anything. Hablamos Español.',
    },
    header: {
        langLabel: 'Language / Idioma',
        callWord: 'Call ',
        cta: 'Request consultation',
    },
    hero: {
        eyebrow: 'Private consultation · Miami, FL',
        trustGoogle: [{ b: '4.7' }, ' on Google · 80+ reviews'],
        trustBoard: 'Double board-certified',
        trustAaaasf: 'AAAASF-accredited facility',
        badgesLabel: 'Board certifications',
        nudge: {
            question: '¿Prefieres español?',
            action: 'Ver esta página en español',
        },
    },
    form: {
        eyebrow: 'Private · Discreet · No obligation',
        title: 'Request a consultation',
        subtitle:
            'Less than a minute. A patient coordinator calls you within 24 hours.',
        consent: [
            'I have read and understood the ',
            { link: { label: 'Privacy Policy', href: LP_LINKS.privacy } },
            ' and ',
            { link: { label: 'Terms', href: LP_LINKS.terms } },
            '. By submitting my mobile number and email, I expressly consent to receive informational and promotional messages from Alluring Plastic Surgery through SMS, email, and phone calls, including messages sent using an automatic telephone dialing system. Consent is not a condition of purchase. Msg & data rates may apply. Msg frequency varies. Reply STOP to opt out, HELP for help.*',
        ],
        consentError: 'Please tick the consent box below the form to continue.',
        reassure:
            'Private & secure. A patient coordinator calls you, never a sales team.',
        micro: ['Private', 'No obligation', 'English & Spanish'],
        submitLabel: 'Request my consultation',
        fieldFirstName: 'First name',
        fieldLastName: 'Last name',
        fieldPhone: 'Phone',
        fieldEmail: 'Email',
        fieldProcedure: 'Procedure of Interest',
        procedurePlaceholder: 'Select a procedure',
        procedureOptions: [
            { value: 'bbl', label: 'Brazilian Butt Lift (BBL)' },
            { value: 'mommy-makeover', label: 'Mommy Makeover' },
            { value: 'breast-augmentation', label: 'Breast Augmentation' },
            { value: 'breast-lift', label: 'Breast Lift' },
            { value: 'breast-reduction', label: 'Breast Reduction' },
            { value: 'tummy-tuck', label: 'Tummy Tuck' },
            { value: 'liposuction', label: 'Liposuction / Lipo 360' },
            { value: 'facelift', label: 'Facelift' },
            {
                value: 'blepharoplasty',
                label: 'Eyelid Surgery (Blepharoplasty)',
            },
            { value: 'multiple', label: 'Multiple Procedures' },
            { value: 'other', label: 'Other / Not Sure Yet' },
        ],
        submitting: 'Sending…',
        errors: {
            firstName: 'Enter your first name.',
            lastName: 'Enter your last name.',
            phone: 'Enter a valid US phone number, with area code.',
            email: 'Enter a valid email address, or leave it blank.',
            submit: 'Your request did not go through. Please try again, or call us.',
        },
    },
    surgeon: {
        eyebrow: 'Your surgeon',
        heading: ['Dr. Victoria ', { em: 'Karlinsky' }],
        role: 'Medical Director · Double board-certified cosmetic surgeon',
        quote: '“Cosmetic surgery is never just about a single feature. It’s about how you feel when you walk into a room, and knowing we prioritized your safety at every step.”',
        lead: 'Your consultation is with the surgeon who operates. Not a patient advisor, not a closer.',
        stats: [
            { value: '5,000+', label: 'Procedures' },
            { value: '1,500+', label: 'BBLs performed' },
            { value: '15+', label: 'Years in practice' },
            { value: '4.7', star: true, label: 'Google rating, 80+ reviews' },
        ],
        credentials: [
            'Board certified by the American Board of Cosmetic Surgery and the American Board of Surgery',
            'Fellow, American College of Surgeons (FACS)',
            'Fellowship Director, American Board of Cosmetic Surgery',
            'Operates in an AAAASF-accredited facility with board-certified anesthesiologists',
        ],
        cta: 'Request a consultation with Dr. Karlinsky',
        portraitAlt: 'Dr. Victoria Karlinsky',
    },
    results: {
        eyebrow: 'Dr. Karlinsky’s patients',
        heading: ['See the ', { em: 'work' }],
        subtitle:
            'Before and after photographs of actual patients of Dr. Karlinsky at Alluring Plastic Surgery.',
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
        note: 'Individual results vary.',
        cta: 'Request a consultation',
        link: 'See more results in the gallery',
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
                answer: 'Surgery happens in an AAAASF-accredited facility with board-certified anesthesiologists, not an office suite. Every patient has pre-op lab work before we clear them. Your surgeon is double board-certified.',
                tag: 'Accredited facility · Pre-op labs',
            },
            {
                question: '“How long is recovery?”',
                answer: 'Most patients are back at a desk in one to two weeks and at the gym in four to six. You get a written week-by-week recovery plan before you book, so you can plan work, childcare and travel around it.',
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
        body: 'Private, confidential, no obligation. We call within 24 hours.',
        cta: 'Request a consultation',
        or: 'or call',
    },
    footer: {
        privacy: 'Privacy',
        terms: 'Terms',
        cookies: 'Cookies',
        disclaimer:
            '*Before-and-after photographs show actual patients of Dr. Karlinsky; individual results vary. All surgical procedures carry risk. This page is for general information and is not medical advice.',
    },
    sticky: { call: 'Call', cta: 'Request consultation' },
}

const es: LpDictionary = {
    meta: {
        title: 'Consulta privada de cirugía plástica en Miami | Alluring Plastic Surgery',
        description:
            'Una consulta privada con una cirujana con doble certificación en Miami. Resultados reales de antes y después, una clínica acreditada AAAASF y tu cifra todo incluido por escrito antes de decidir nada.',
    },
    header: {
        langLabel: 'Idioma / Language',
        callWord: 'Llama ',
        cta: 'Pedir consulta',
    },
    hero: {
        eyebrow: 'Consulta privada · Miami, FL',
        trustGoogle: [{ b: '4.7' }, ' en Google · Más de 80 reseñas'],
        trustBoard: 'Doble certificación',
        trustAaaasf: 'Clínica acreditada AAAASF',
        badgesLabel: 'Certificaciones',
        nudge: {
            question: 'Prefer English?',
            action: 'View this page in English',
        },
    },
    form: {
        eyebrow: 'Privada · Discreta · Sin compromiso',
        title: 'Pide tu consulta',
        subtitle:
            'Menos de un minuto. Una coordinadora de pacientes te llama en 24 horas.',
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
        consentError:
            'Marca la casilla de consentimiento debajo del formulario para continuar.',
        reassure:
            'Privado y seguro. Te llama una coordinadora de pacientes, nunca un vendedor.',
        micro: ['Privada', 'Sin compromiso', 'En español'],
        submitLabel: 'Pedir mi consulta',
        fieldFirstName: 'Nombre',
        fieldLastName: 'Apellido',
        fieldPhone: 'Teléfono',
        fieldEmail: 'Correo electrónico',
        fieldProcedure: 'Procedimiento de interés',
        procedurePlaceholder: 'Elige un procedimiento',
        procedureOptions: [
            { value: 'bbl', label: 'Levantamiento de glúteos (BBL)' },
            { value: 'mommy-makeover', label: 'Mommy Makeover' },
            { value: 'breast-augmentation', label: 'Aumento de senos' },
            { value: 'breast-lift', label: 'Levantamiento de senos' },
            { value: 'breast-reduction', label: 'Reducción de senos' },
            { value: 'tummy-tuck', label: 'Abdominoplastia' },
            { value: 'liposuction', label: 'Liposucción / Lipo 360' },
            { value: 'facelift', label: 'Lifting facial' },
            {
                value: 'blepharoplasty',
                label: 'Cirugía de párpados (blefaroplastia)',
            },
            { value: 'multiple', label: 'Varios procedimientos' },
            { value: 'other', label: 'Otro / aún no lo sé' },
        ],
        submitting: 'Enviando…',
        errors: {
            firstName: 'Escribe tu nombre.',
            lastName: 'Escribe tu apellido.',
            phone: 'Escribe un teléfono válido de EE. UU., con código de área.',
            email: 'Escribe un correo válido, o déjalo en blanco.',
            submit: 'Tu solicitud no se envió. Inténtalo de nuevo o llámanos.',
        },
    },
    surgeon: {
        eyebrow: 'Tu cirujana',
        heading: ['Dra. Victoria ', { em: 'Karlinsky' }],
        role: 'Directora médica · Cirujana cosmética con doble certificación',
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
            'Certificada por el American Board of Cosmetic Surgery y el American Board of Surgery',
            'Fellow del American College of Surgeons (FACS)',
            'Directora de Fellowship, American Board of Cosmetic Surgery',
            'Opera en una clínica acreditada AAAASF con anestesiólogos certificados',
        ],
        cta: 'Pedir una consulta con la Dra. Karlinsky',
        portraitAlt: 'Dra. Victoria Karlinsky',
    },
    results: {
        eyebrow: 'Pacientes de la Dra. Karlinsky',
        heading: ['Mira el ', { em: 'trabajo' }],
        subtitle:
            'Fotografías de antes y después de pacientes reales de la Dra. Karlinsky en Alluring Plastic Surgery.',
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
        note: 'Los resultados varían según la persona.',
        cta: 'Pedir una consulta',
        link: 'Ver más resultados en la galería',
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
                answer: 'La cirugía se realiza en una clínica acreditada por la AAAASF con anestesiólogos certificados, no en un consultorio. Toda paciente pasa por exámenes de laboratorio antes de ser aprobada. Tu cirujana tiene doble certificación.',
                tag: 'Clínica acreditada · Laboratorios previos',
            },
            {
                question: '“¿Cuánto dura la recuperación?”',
                answer: 'La mayoría vuelve al trabajo de oficina en una o dos semanas y al gimnasio en cuatro a seis. Recibes un plan de recuperación semana a semana por escrito antes de reservar.',
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
        body: 'Privada, confidencial y sin compromiso. Te llamamos en 24 horas.',
        cta: 'Pedir una consulta',
        or: 'o llama al',
    },
    footer: {
        privacy: 'Privacidad',
        terms: 'Términos',
        cookies: 'Cookies',
        disclaimer:
            '*Las fotografías de antes y después muestran pacientes reales de la Dra. Karlinsky; los resultados varían según la persona. Toda cirugía conlleva riesgos. Esta página es informativa y no constituye consejo médico.',
    },
    sticky: { call: 'Llamar', cta: 'Pedir consulta' },
}

export const LP_COPY: Readonly<Record<LpLang, LpDictionary>> = { en, es }

/** Narrows an arbitrary string (a query param, a stored choice) to a language. */
export function toLpLang(value: string | null | undefined): LpLang | null {
    const candidate = (value ?? '').toLowerCase().slice(0, 2)
    return candidate === 'en' || candidate === 'es' ? candidate : null
}
