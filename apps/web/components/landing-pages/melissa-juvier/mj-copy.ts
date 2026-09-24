/**
 * Every string on /landing/melissa-juvier, in both languages.
 *
 * ---------------------------------------------------------------------
 * VOICE
 * ---------------------------------------------------------------------
 * First person, from Melissa. The visitor arrives from her social bio link,
 * so they already know her face — the page talks like her DMs do: warm,
 * direct, short sentences, no sales language. She is the patient
 * coordinator, not a patient and not the surgeon, and the copy never
 * suggests otherwise.
 *
 * ---------------------------------------------------------------------
 * CLAIMS
 * ---------------------------------------------------------------------
 * Every practice claim is one the site already publishes (see the header of
 * `request-consultation/lp-copy.ts`): the surgeon named as an MD with the
 * boards `karlinsky-credentials.constant.ts` allows, the AAAASF-accredited
 * facility, board-certified anesthesiologists, the 4.7
 * Google rating, the procedure counts, the all-inclusive figure in writing,
 * the confirmed dates, the 24-hour response, no commission. Nothing here
 * offers travel coordination — what the practice provides is dates in
 * writing and how many nights to stay in Miami before being cleared to fly.
 *
 * The consent wording, the reviews, the surgeon's credentials and the
 * disclaimer are not restated: they are read from the ads landing page's
 * deck, so the legal text lives in exactly one place.
 */

import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

import { LP_COPY, type RichText } from '../request-consultation/lp-copy'

export type MjLang = 'en' | 'es'

export interface MjOption {
    readonly value: string
    readonly label: string
}

export interface MjDictionary {
    readonly meta: { readonly title: string; readonly description: string }
    readonly header: {
        readonly practice: string
        /** Label of the link that switches to the *other* language. */
        readonly switchLabel: string
        readonly switchAria: string
    }
    readonly hero: {
        readonly eyebrow: string
        readonly hello: string
        readonly name: string
        readonly lead: string
        readonly cta: string
        readonly ctaNote: string
        readonly portraitAlt: string
        readonly caption: string
    }
    readonly trust: readonly string[]
    readonly chat: {
        readonly title: string
        readonly role: string
        readonly status: string
        readonly greeting: string
        readonly qProcedure: string
        readonly procedures: readonly MjOption[]
        readonly qTimeline: string
        readonly timelines: readonly MjOption[]
        /** The last step asks for the name and the mobile number together. */
        readonly qContact: string
        readonly fieldName: string
        readonly fieldPhone: string
        readonly consent: RichText
        readonly submit: string
        readonly submitting: string
        readonly change: string
        readonly you: string
        readonly typing: string
        readonly stepLabel: string
        readonly reassure: string
        readonly errors: {
            readonly name: string
            readonly phone: string
            readonly consent: string
            readonly submit: string
        }
    }
    readonly letter: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly paragraphs: readonly string[]
        readonly signoff: string
    }
    readonly steps: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly items: readonly {
            readonly title: string
            readonly body: string
        }[]
        readonly after: string
        readonly cta: string
    }
    readonly surgeon: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly role: string
        readonly body: string
        readonly stats: readonly {
            readonly value: string
            readonly label: string
        }[]
        readonly credentials: readonly string[]
        readonly portraitAlt: string
    }
    readonly results: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly tag: string
        readonly note: string
        readonly captions: (typeof LP_COPY)['en']['results']['captions']
        readonly swipe: string
    }
    readonly reviews: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly source: string
        readonly items: (typeof LP_COPY)['en']['reviews']['items']
    }
    readonly faq: {
        readonly eyebrow: string
        readonly heading: RichText
        readonly items: readonly {
            readonly question: string
            readonly answer: string
        }[]
    }
    readonly closing: {
        readonly heading: RichText
        readonly body: string
        readonly cta: string
    }
    readonly footer: {
        readonly privacy: string
        readonly terms: string
        readonly disclaimer: string
    }
    readonly sticky: { readonly cta: string; readonly note: string }
    readonly thankYou: {
        readonly metaTitle: string
        readonly eyebrow: string
        /** `{name}` is replaced when the first name is known. */
        readonly headingNamed: string
        readonly heading: string
        readonly body: string
        readonly nextTitle: string
        readonly next: readonly string[]
        readonly signoff: string
        readonly back: string
    }
}

const en: MjDictionary = {
    meta: {
        title: 'Melissa Juvier · Your Patient Coordinator | Alluring Plastic Surgery',
        description:
            'Message Melissa, your patient coordinator at Alluring Plastic Surgery in Miami. Free consultation with double board-certified Dr. Karlinsky — your price and dates in writing. Hablamos español.',
    },
    header: {
        practice: 'Alluring Plastic Surgery',
        switchLabel: 'Español',
        switchAria: 'Ver esta página en español',
    },
    hero: {
        eyebrow: 'Patient coordinator · Miami',
        hello: 'Hi, I’m',
        name: 'Melissa.',
        lead: 'You’ve been thinking about it. Let me make it simple — I’ll be your person at Alluring from your first question to your last follow-up.',
        cta: 'Message me',
        ctaNote: 'Free consultation · 30 seconds · No obligation',
        portraitAlt:
            'Melissa Juvier, patient coordinator at Alluring Plastic Surgery in Miami',
        caption: 'Melissa Juvier — Patient coordinator',
    },
    trust: [
        'Free consultation',
        '4.7★ on Google',
        'Double board-certified surgeon',
        'AAAASF-accredited facility',
        'Virtual or in person',
        'Hablamos español',
    ],
    chat: {
        title: 'Message Melissa',
        role: 'Patient coordinator',
        status: 'Replies by text within 24 hours',
        greeting: 'Hi! I’m so glad you’re here.',
        qProcedure: 'What are you thinking about doing?',
        procedures: [
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
        ],
        qTimeline: 'Love that. When are you hoping to have it done?',
        timelines: [
            { value: 'asap', label: 'As soon as possible' },
            { value: '1-3-months', label: 'In 1–3 months' },
            { value: '3-6-months', label: 'In 3–6 months' },
            { value: 'researching', label: 'Just researching' },
        ],
        qContact:
            'Perfect. What’s your name and mobile number? I’ll text you to set up your free consultation.',
        fieldName: 'Your name',
        fieldPhone: 'Mobile number',
        consent: LP_COPY.en.consent,
        submit: 'Send to Melissa',
        submitting: 'Sending…',
        change: 'Change',
        you: 'You',
        typing: 'Melissa is typing',
        stepLabel: 'Step {n} of 3',
        reassure: 'Private. Goes straight to me — never to a sales team.',
        errors: {
            name: 'Enter your name.',
            phone: 'Enter a valid US mobile number, with area code.',
            consent: 'Please tick the box so I’m allowed to text you.',
            submit: 'That didn’t go through. Please try again in a moment.',
        },
    },
    letter: {
        eyebrow: 'A note from me',
        heading: ['Ask me the things you’d ', { em: 'never ask a stranger.' }],
        paragraphs: [
            'If you’re here, you’ve probably been thinking about this for a while. Saving photos. Doing the math. Watching every video and still wondering if it’s really for you.',
            'That’s exactly where I come in. I set up your free consultation with Dr. Karlinsky, make sure your price and your dates are in writing, and I’m the person you message when you’re not sure about something — before surgery and after.',
            'No pressure and no sales pitch. When you’re ready, I’m here.',
        ],
        signoff: 'With love,',
    },
    steps: {
        eyebrow: 'How it works with me',
        heading: ['From “I’m thinking about it” to ', { em: 'your plan.' }],
        items: [
            {
                title: 'You message me',
                body: 'Thirty seconds, right on this page. Tell me what you’re thinking about — no commitment.',
            },
            {
                title: 'I reach out within 24 hours',
                body: 'By text. I answer your first questions and book your free consultation with Dr. Karlinsky — in person in Miami, or by video from anywhere in the U.S.',
            },
            {
                title: 'You leave with a plan, in writing',
                body: 'A straight answer on whether you’re a candidate, your all-inclusive price, and your surgery, pre-op and follow-up dates — in writing, so you can decide in your own time.',
            },
        ],
        after: 'And I don’t disappear once you book. I’m your point of contact through surgery day and every follow-up.',
        cta: 'Start with me',
    },
    surgeon: {
        eyebrow: 'Who I’ll introduce you to',
        heading: ['Dr. Victoria ', { em: 'Karlinsky' }],
        role: `${KARLINSKY_NAME} · Medical Director`,
        body: 'Your consultation is with the surgeon who operates — not an advisor, not a closer. Dr. Karlinsky tells you honestly what she can do for you, and what she won’t.',
        stats: [
            { value: '5,000+', label: 'Procedures' },
            { value: '15+', label: 'Years in practice' },
            { value: '4.7★', label: 'Google, 80+ reviews' },
        ],
        credentials: LP_COPY.en.surgeon.credentials,
        portraitAlt: LP_COPY.en.surgeon.portraitAlt,
    },
    results: {
        eyebrow: 'Real patients',
        heading: ['The results ', { em: 'speak.' }],
        tag: LP_COPY.en.results.beforeAfterTag,
        note: 'Actual patients of Dr. Karlinsky. Individual results vary.',
        captions: LP_COPY.en.results.captions,
        swipe: 'Swipe',
    },
    reviews: {
        eyebrow: LP_COPY.en.reviews.eyebrow,
        heading: ['How our patients ', { em: 'feel.' }],
        source: LP_COPY.en.reviews.source,
        items: LP_COPY.en.reviews.items,
    },
    faq: {
        eyebrow: 'Questions people DM me',
        heading: ['Let’s talk about ', { em: 'it.' }],
        items: [
            {
                question: 'Is the consultation really free?',
                answer: 'Yes. No cost and no obligation. You can leave with a price, a plan and no appointment — nobody here earns a commission for booking you.',
            },
            {
                question: 'How much will it cost me?',
                answer: 'It depends on your body and your goals, which is why your price comes out of your consultation: all-inclusive, in writing, with no surprise fees. Financing is available, and I’ll walk you through your options.',
            },
            {
                question: 'I don’t live in Miami. Can I still do this?',
                answer: 'Yes. Your consultation can be by video. Before you book anything, you get your surgery, pre-op and follow-up dates in writing, and exactly how many nights to plan in Miami before you’re cleared to fly home.',
            },
            {
                question: 'Is it safe?',
                answer: 'Surgery happens in an AAAASF-accredited facility with board-certified anesthesiologists, not an office suite. Every patient has pre-op lab work before they’re cleared, and your surgeon is double board-certified.',
            },
            {
                question: 'What is recovery like?',
                answer: 'It depends on the procedure. You get a written, week-by-week recovery plan before you book, so you can plan work and family around it — and you can message me with questions the whole way through.',
            },
            {
                question: 'What if I’m not ready yet?',
                answer: 'Then we go at your pace. Ask me anything now and book when it feels right. I’d rather you be sure.',
            },
        ],
    },
    closing: {
        heading: ['Your turn. ', { em: 'I’ve got you.' }],
        body: 'One message. I reach out within 24 hours, and we take it from there — together.',
        cta: 'Message Melissa',
    },
    footer: {
        privacy: LP_COPY.en.footer.privacy,
        terms: LP_COPY.en.footer.terms,
        disclaimer: LP_COPY.en.footer.disclaimer,
    },
    sticky: { cta: 'Message Melissa', note: 'Free · 30 seconds' },
    thankYou: {
        metaTitle: 'Got it — talk soon | Melissa Juvier',
        eyebrow: 'Message sent',
        headingNamed: 'Got it, {name}.',
        heading: 'Got it.',
        body: 'I’ll text you within 24 hours. Keep an eye on your messages — it’ll be me.',
        nextTitle: 'What happens next',
        next: [
            'I reach out and answer your first questions.',
            'We book your free consultation with Dr. Karlinsky — in person or by video.',
            'You leave with your price and your dates, in writing.',
        ],
        signoff: 'Talk soon,',
        back: 'Back to my page',
    },
}

const es: MjDictionary = {
    meta: {
        title: 'Melissa Juvier · Tu coordinadora de pacientes | Alluring Plastic Surgery',
        description:
            'Escríbele a Melissa, tu coordinadora de pacientes en Alluring Plastic Surgery en Miami. Consulta gratis con la Dra. Karlinsky, cirujana con doble certificación. Tu precio y tus fechas, por escrito.',
    },
    header: {
        practice: 'Alluring Plastic Surgery',
        switchLabel: 'English',
        switchAria: 'View this page in English',
    },
    hero: {
        eyebrow: 'Coordinadora de pacientes · Miami',
        hello: 'Hola, soy',
        name: 'Melissa.',
        lead: 'Lo has estado pensando. Déjame hacerlo fácil: voy a estar contigo en Alluring desde tu primera pregunta hasta tu último control.',
        cta: 'Escríbeme',
        ctaNote: 'Consulta gratis · 30 segundos · Sin compromiso',
        portraitAlt:
            'Melissa Juvier, coordinadora de pacientes en Alluring Plastic Surgery en Miami',
        caption: 'Melissa Juvier — Coordinadora de pacientes',
    },
    trust: [
        'Consulta gratis',
        '4.7★ en Google',
        'Cirujana con doble certificación',
        'Clínica acreditada AAAASF',
        'Virtual o en persona',
        'Hablamos español',
    ],
    chat: {
        title: 'Escríbele a Melissa',
        role: 'Coordinadora de pacientes',
        status: 'Te responde por texto en 24 horas',
        greeting: '¡Hola! Qué alegría que estés aquí.',
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
        qTimeline: 'Me encanta. ¿Para cuándo te gustaría hacerlo?',
        timelines: [
            { value: 'asap', label: 'Lo antes posible' },
            { value: '1-3-months', label: 'En 1–3 meses' },
            { value: '3-6-months', label: 'En 3–6 meses' },
            { value: 'researching', label: 'Solo estoy averiguando' },
        ],
        qContact:
            'Perfecto. ¿Cómo te llamas y cuál es tu celular? Te escribo por texto para agendar tu consulta gratis.',
        fieldName: 'Tu nombre',
        fieldPhone: 'Número de celular',
        consent: LP_COPY.es.consent,
        submit: 'Enviar a Melissa',
        submitting: 'Enviando…',
        change: 'Cambiar',
        you: 'Tú',
        typing: 'Melissa está escribiendo',
        stepLabel: 'Paso {n} de 3',
        reassure: 'Privado. Me llega directo a mí, nunca a un vendedor.',
        errors: {
            name: 'Escribe tu nombre.',
            phone: 'Escribe un celular válido de EE. UU., con código de área.',
            consent: 'Marca la casilla para que pueda escribirte.',
            submit: 'No se pudo enviar. Inténtalo de nuevo en un momento.',
        },
    },
    letter: {
        eyebrow: 'Una nota mía',
        heading: [
            'Pregúntame lo que ',
            { em: 'nunca le preguntarías a un extraño.' },
        ],
        paragraphs: [
            'Si estás aquí, seguramente llevas un tiempo pensándolo. Guardando fotos. Sacando cuentas. Viendo todos los videos y preguntándote si de verdad es para ti.',
            'Para eso estoy yo. Te agendo tu consulta gratis con la Dra. Karlinsky, me aseguro de que tu precio y tus fechas queden por escrito, y soy a quien le escribes cuando tengas una duda, antes y después de tu cirugía.',
            'Sin presión y sin ventas. Cuando estés lista, aquí estoy.',
        ],
        signoff: 'Con cariño,',
    },
    steps: {
        eyebrow: 'Cómo trabajamos juntas',
        heading: ['De “lo estoy pensando” a ', { em: 'tu plan.' }],
        items: [
            {
                title: 'Me escribes',
                body: 'Treinta segundos, aquí mismo. Cuéntame qué tienes en mente, sin compromiso.',
            },
            {
                title: 'Te contacto en menos de 24 horas',
                body: 'Por mensaje de texto. Respondo tus primeras preguntas y te agendo tu consulta gratis con la Dra. Karlinsky: en persona en Miami o por video desde cualquier lugar de EE. UU.',
            },
            {
                title: 'Sales con un plan por escrito',
                body: 'Una respuesta clara sobre si eres candidata, tu precio todo incluido y tus fechas de cirugía, preoperatorio y controles, por escrito, para que decidas a tu ritmo.',
            },
        ],
        after: 'Y no desaparezco cuando reservas. Soy tu persona de contacto hasta el día de tu cirugía y en cada control.',
        cta: 'Empieza conmigo',
    },
    surgeon: {
        eyebrow: 'A quién te voy a presentar',
        heading: ['Dra. Victoria ', { em: 'Karlinsky' }],
        role: `${KARLINSKY_NAME} · Directora médica`,
        body: 'Tu consulta es con la cirujana que opera, no con una asesora ni con un vendedor. La Dra. Karlinsky te dice con honestidad lo que puede hacer por ti, y lo que no.',
        stats: [
            { value: '5,000+', label: 'Procedimientos' },
            { value: '15+', label: 'Años de experiencia' },
            { value: '4.7★', label: 'Google, más de 80 reseñas' },
        ],
        credentials: LP_COPY.es.surgeon.credentials,
        portraitAlt: LP_COPY.es.surgeon.portraitAlt,
    },
    results: {
        eyebrow: 'Pacientes reales',
        heading: ['Los resultados ', { em: 'hablan.' }],
        tag: LP_COPY.es.results.beforeAfterTag,
        note: 'Pacientes reales de la Dra. Karlinsky. Los resultados varían según la persona.',
        captions: LP_COPY.es.results.captions,
        swipe: 'Desliza',
    },
    reviews: {
        eyebrow: LP_COPY.es.reviews.eyebrow,
        heading: ['Cómo se sienten ', { em: 'nuestras pacientes.' }],
        source: LP_COPY.es.reviews.source,
        items: LP_COPY.es.reviews.items,
    },
    faq: {
        eyebrow: 'Lo que más me preguntan por DM',
        heading: ['Hablemos ', { em: 'claro.' }],
        items: [
            {
                question: '¿La consulta de verdad es gratis?',
                answer: 'Sí. Sin costo y sin compromiso. Puedes irte con un precio, un plan y sin cita. Aquí nadie gana comisión por convencerte.',
            },
            {
                question: '¿Cuánto me va a costar?',
                answer: 'Depende de tu cuerpo y de lo que quieras lograr, por eso tu precio sale de tu consulta: todo incluido, por escrito y sin sorpresas. Hay financiamiento, y yo te explico tus opciones.',
            },
            {
                question: 'No vivo en Miami. ¿Igual puedo hacerlo?',
                answer: 'Sí. Tu consulta puede ser por video. Antes de reservar nada, recibes por escrito tus fechas de cirugía, preoperatorio y controles, y cuántas noches debes quedarte en Miami antes de que te autoricen a volar a casa.',
            },
            {
                question: '¿Es seguro?',
                answer: 'La cirugía se realiza en una clínica acreditada por la AAAASF con anestesiólogos certificados, no en un consultorio. Toda paciente pasa por exámenes de laboratorio antes de ser aprobada, y tu cirujana tiene doble certificación.',
            },
            {
                question: '¿Cómo es la recuperación?',
                answer: 'Depende del procedimiento. Recibes un plan de recuperación semana a semana por escrito antes de reservar, para que organices tu trabajo y tu familia, y puedes escribirme con cualquier duda en todo el proceso.',
            },
            {
                question: '¿Y si todavía no estoy lista?',
                answer: 'Entonces vamos a tu ritmo. Pregúntame lo que quieras ahora y reserva cuando te sientas segura. Prefiero que estés convencida.',
            },
        ],
    },
    closing: {
        heading: ['Te toca a ti. ', { em: 'Yo te acompaño.' }],
        body: 'Un mensaje. Te contacto en menos de 24 horas y seguimos juntas desde ahí.',
        cta: 'Escríbele a Melissa',
    },
    footer: {
        privacy: LP_COPY.es.footer.privacy,
        terms: LP_COPY.es.footer.terms,
        disclaimer: LP_COPY.es.footer.disclaimer,
    },
    sticky: { cta: 'Escríbele a Melissa', note: 'Gratis · 30 segundos' },
    thankYou: {
        metaTitle: 'Recibido — hablamos pronto | Melissa Juvier',
        eyebrow: 'Mensaje enviado',
        headingNamed: 'Listo, {name}.',
        heading: 'Listo.',
        body: 'Te escribo en menos de 24 horas. Pendiente a tus mensajes, que voy a ser yo.',
        nextTitle: 'Lo que sigue',
        next: [
            'Te contacto y respondo tus primeras preguntas.',
            'Agendamos tu consulta gratis con la Dra. Karlinsky, en persona o por video.',
            'Sales con tu precio y tus fechas, por escrito.',
        ],
        signoff: 'Hablamos pronto,',
        back: 'Volver a mi página',
    },
}

export const MJ_COPY: Readonly<Record<MjLang, MjDictionary>> = { en, es }
