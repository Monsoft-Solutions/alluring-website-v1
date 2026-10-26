/**
 * Dr. Victoria Karlinsky Landing Page FAQ Data
 *
 * Tightly scoped FAQ for warm Instagram-bio-link traffic. Six questions,
 * two categories — only the objections IG-warm visitors actually voice
 * before booking: price, financing, recovery, safety/results, language,
 * and virtual consults.
 */
import { FINANCING_SENTENCE_LONG } from '@workspace/shared/claims/financing'

import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

export const drKarlinskyFaqCategories: FaqCategory[] = [
    { id: 'booking-cost', label: 'Booking & Cost' },
    { id: 'safety-results', label: 'Safety & Results' },
]

export const drKarlinskyFaqData: Record<string, FaqItem[]> = {
    'booking-cost': [
        {
            question: 'How much does it cost?',
            answer: `Pricing depends on the procedure and is set for you after an exam. You'll get a personalized quote at your free consult, and your surgeon confirms your price at consultation.`,
        },
        {
            question: 'What financing do you offer?',
            answer: FINANCING_SENTENCE_LONG,
        },
        {
            question: 'Can I do a virtual consult first?',
            answer: `Yes. Many out-of-state patients start virtual — discuss your goals, see preliminary options, get a quote estimate — then fly in for surgery.`,
        },
    ],
    'safety-results': [
        {
            question: 'Will I look natural — or "done"?',
            answer: `Natural is the entire point. Dr. Karlinsky tailors every plan to your proportions. The goal is always "you, refreshed" — never the cookie-cutter look.`,
        },
        {
            question: 'How long is recovery?',
            answer: `It depends on the procedure. Most people are back at desk work in about 1 to 3 weeks; exercise waits about 4 to 6 weeks after liposuction, 4 to 8 weeks after a tummy tuck and 8 weeks after a BBL, once you're cleared. You'll get a procedure-specific timeline at your consult, plus a direct number to call after surgery.`,
        },
        {
            question: '¿Hablan español?',
            answer: `Sí. Toda la consulta y el cuidado postoperatorio están disponibles en español. Just let us know when you book.`,
        },
    ],
}

export const drKarlinskyFaqConfig = {
    badge: 'Honest Answers',
    title: 'The questions we hear',
    subtitle: 'before every consult.',
    description:
        "Six things almost every patient wants to know upfront. Don't see yours? Bring it to your consult — no question is off-limits.",
}
