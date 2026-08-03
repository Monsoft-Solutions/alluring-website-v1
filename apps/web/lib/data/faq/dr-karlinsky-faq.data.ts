/**
 * Dr. Victoria Karlinsky Landing Page FAQ Data
 *
 * Tightly scoped FAQ for warm Instagram-bio-link traffic. Six questions,
 * two categories — only the objections IG-warm visitors actually voice
 * before booking: price, financing, recovery, safety/results, language,
 * and virtual consults.
 */
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

export const drKarlinskyFaqCategories: FaqCategory[] = [
    { id: 'booking-cost', label: 'Booking & Cost' },
    { id: 'safety-results', label: 'Safety & Results' },
]

export const drKarlinskyFaqData: Record<string, FaqItem[]> = {
    'booking-cost': [
        {
            question: 'How much does it cost?',
            answer: `Pricing depends on the procedure. Every quote is all-inclusive — surgeon, anesthesia, facility, follow-up — with no hidden add-ons. You'll get a personalized quote at your free consult.`,
        },
        {
            question: 'What financing do you offer?',
            answer: `We partner with Cherry, CareCredit, and United Credit. Many patients qualify for 0% APR for 12–24 months, and weekly payments often start around $27/week.`,
        },
        {
            question: 'Can I do a virtual consult first?',
            answer: `Yes. Most out-of-state patients start virtual — discuss your goals, see preliminary options, get a quote estimate — then fly in for surgery.`,
        },
    ],
    'safety-results': [
        {
            question: 'Will I look natural — or "done"?',
            answer: `Natural is the entire point. Dr. Karlinsky tailors every plan to your proportions. The goal is always "you, refreshed" — never the cookie-cutter look.`,
        },
        {
            question: 'How long is recovery?',
            answer: `Most patients are back at desk work in 1–2 weeks and at full activity in 4–6 weeks. You'll get a procedure-specific timeline at your consult, plus 24/7 post-op concierge contact.`,
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
