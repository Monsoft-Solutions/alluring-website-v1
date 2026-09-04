/**
 * Every string on /lp/request-consultation, in both languages.
 *
 * The page runs its own copy deck rather than the site's, because it is a paid
 * landing page: the argument, the ordering and the disclaimers were written
 * for ad traffic and are not shared with any indexed route.
 *
 * Spanish exists for Spanish speakers inside the US, not for cross-border
 * patients — nothing here offers travel coordination.
 *
 * Copy marked "verbatim" is unchanged from the approved v3 deck, which in turn
 * takes it from the live site: consent wording, reviews, FAQ answers, fly-in
 * bullets, the surgeon quote and the disclaimer. Do not paraphrase those.
 */

export type LpLang = 'en' | 'es'

export const LP_LANGUAGES: readonly LpLang[] = ['en', 'es'] as const

/**
 * A run of copy that carries inline emphasis or a link.
 *
 * The original page shipped these as HTML strings and wrote them in with
 * `innerHTML`; here they are data, so the same sentence can be rendered
 * without handing user-invisible markup to `dangerouslySetInnerHTML`.
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
        readonly financingLabel: string
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
        title: 'Free Plastic Surgery Consultation in Miami | Alluring Plastic Surgery',
        description:
            'Free, confidential consultation with double board-certified surgeons in Miami. Real before-and-after results, your all-inclusive price in writing, financing from $27/week. Hablamos Español.',
    },
    header: {
        langLabel: 'Language / Idioma',
        callWord: 'Call ',
        cta: 'Free consultation',
    },
    hero: {
        eyebrow: 'Free consultation · Miami, FL',
        trustGoogle: [{ b: '4.7' }, ' on Google · 80+ reviews'],
        trustBoard: 'Double board-certified',
        trustAaaasf: 'AAAASF-accredited facility',
        financingLabel: 'Financing',
        badgesLabel: 'Board certifications',
        nudge: {
            question: '¿Prefieres español?',
            action: 'Ver esta página en español',
        },
    },
    form: {
        eyebrow: 'Free · Private · No obligation',
        title: 'Your free consultation',
        subtitle:
            'Under a minute to complete. A patient coordinator calls you within 24 hours.',
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
        micro: ['Free', 'No obligation', 'English & Spanish'],
        submitLabel: 'Get my free consultation',
        fieldFirstName: 'First name',
        fieldLastName: 'Last name',
        fieldPhone: 'Phone',
        fieldEmail: 'Email',
        fieldProcedure: 'Procedure of Interest',
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
        cta: 'Book my consultation with Dr. Karlinsky',
        portraitAlt: 'Dr. Victoria Karlinsky',
    },
    results: {
        eyebrow: 'Real patients. Real results.',
        heading: ['See it for ', { em: 'yourself' }],
        subtitle:
            'Before and after photos of actual patients of Dr. Karlinsky at Alluring Plastic Surgery.',
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
        cta: 'Get my free consultation',
        link: 'See more results in the gallery',
    },
    writing: {
        eyebrow: 'What you leave with',
        heading: ['Answers, not a pitch. ', { em: 'In writing.' }],
        body: 'Most consultations end with a sales pitch. Yours ends with a straight answer on candidacy, your all-inclusive price and your real monthly payment, put in writing so you can take it home, compare it and sleep on it. Nobody here earns a commission.',
        cta: 'Request my free consultation',
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
                term: 'Monthly payment',
                value: ['Real numbers and financing options, from $27/week*'],
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
        sheetFootLeft: 'Free · No obligation · No commission',
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
        cta: 'Book a virtual consultation',
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
                answer: 'Most patients are back at a desk in one to two weeks and at the gym in four to six. You get a written week-by-week recovery plan before you book, so you can plan childcare, work and travel.',
                tag: 'Written recovery plan up front',
            },
            {
                question: '“What if I’m not ready?”',
                answer: 'Then don’t book. The consultation is free, and you can leave with a price, a plan and no appointment. Nobody here earns a commission for closing you.',
                tag: 'Free · No obligation · No commission',
            },
        ],
    },
    closing: {
        heading: ['Ready for a real ', { em: 'answer?' }],
        body: 'Free, confidential, no obligation. We call within 24 hours.',
        cta: 'Request my free consultation',
        or: 'or call',
    },
    footer: {
        privacy: 'Privacy',
        terms: 'Terms',
        cookies: 'Cookies',
        disclaimer:
            '*Financing subject to credit approval. Rates and terms vary by lender and by procedure. Before-and-after photos show actual patients of Dr. Karlinsky; individual results vary. All surgical procedures carry risk. This page is for general information and is not medical advice.',
    },
    sticky: { call: 'Call', cta: 'Free consultation' },
}

const es: LpDictionary = {
    meta: {
        title: 'Consulta gratis de cirugía plástica en Miami | Alluring Plastic Surgery',
        description:
            'Consulta gratis y confidencial con cirujanos con doble certificación en Miami. Resultados reales de antes y después, precio todo incluido por escrito, financiamiento desde $27/semana.',
    },
    header: {
        langLabel: 'Idioma / Language',
        callWord: 'Llama ',
        cta: 'Consulta gratis',
    },
    hero: {
        eyebrow: 'Consulta gratis · Miami, FL',
        trustGoogle: [{ b: '4.7' }, ' en Google · Más de 80 reseñas'],
        trustBoard: 'Doble certificación',
        trustAaaasf: 'Clínica acreditada AAAASF',
        financingLabel: 'Financiamiento',
        badgesLabel: 'Certificaciones',
        nudge: {
            question: 'Prefer English?',
            action: 'View this page in English',
        },
    },
    form: {
        eyebrow: 'Gratis · Privada · Sin compromiso',
        title: 'Tu consulta gratis',
        subtitle:
            'Toma menos de un minuto. Una coordinadora de pacientes te llama en 24 horas.',
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
        micro: ['Gratis', 'Sin compromiso', 'En español'],
        submitLabel: 'Quiero mi consulta gratis',
        fieldFirstName: 'Nombre',
        fieldLastName: 'Apellido',
        fieldPhone: 'Teléfono',
        fieldEmail: 'Correo electrónico',
        fieldProcedure: 'Procedimiento de interés',
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
        cta: 'Pedir mi consulta con la Dra. Karlinsky',
        portraitAlt: 'Dra. Victoria Karlinsky',
    },
    results: {
        eyebrow: 'Pacientes reales. Resultados reales.',
        heading: ['Míralo con tus ', { em: 'propios ojos' }],
        subtitle:
            'Fotos de antes y después de pacientes reales de la Dra. Karlinsky en Alluring Plastic Surgery.',
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
        cta: 'Quiero mi consulta gratis',
        link: 'Ver más resultados en la galería',
    },
    writing: {
        eyebrow: 'Con qué sales de la consulta',
        heading: [
            'Respuestas, no un discurso de venta. ',
            { em: 'Por escrito.' },
        ],
        body: 'La mayoría de las consultas terminan en una venta. La tuya termina con una respuesta clara sobre si eres candidata, tu precio todo incluido y tu pago mensual real, por escrito, para que te lo lleves a casa, lo compares y lo pienses con calma. Aquí nadie gana comisión.',
        cta: 'Pedir mi consulta gratis',
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
                term: 'Pago mensual',
                value: [
                    'Cifras reales y opciones de financiamiento, desde $27/semana*',
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
        sheetFootLeft: 'Gratis · Sin compromiso · Sin comisiones',
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
                answer: 'Entonces no reserves. La consulta es gratis y puedes irte con un precio, un plan y sin cita programada. Aquí nadie gana comisión por convencerte.',
                tag: 'Gratis · Sin compromiso · Sin comisiones',
            },
        ],
    },
    closing: {
        heading: ['¿Lista para una respuesta ', { em: 'de verdad?' }],
        body: 'Gratis, confidencial y sin compromiso. Te llamamos en 24 horas.',
        cta: 'Pedir mi consulta gratis',
        or: 'o llama al',
    },
    footer: {
        privacy: 'Privacidad',
        terms: 'Términos',
        cookies: 'Cookies',
        disclaimer:
            '*Financiamiento sujeto a aprobación de crédito. Las tasas y condiciones varían según el prestamista y el procedimiento. Las fotos de antes y después muestran pacientes reales de la Dra. Karlinsky; los resultados varían según la persona. Toda cirugía conlleva riesgos. Esta página es informativa y no constituye consejo médico.',
    },
    sticky: { call: 'Llamar', cta: 'Consulta gratis' },
}

export const LP_COPY: Readonly<Record<LpLang, LpDictionary>> = { en, es }

/** Narrows an arbitrary string (a query param, a stored choice) to a language. */
export function toLpLang(value: string | null | undefined): LpLang | null {
    const candidate = (value ?? '').toLowerCase().slice(0, 2)
    return candidate === 'en' || candidate === 'es' ? candidate : null
}
