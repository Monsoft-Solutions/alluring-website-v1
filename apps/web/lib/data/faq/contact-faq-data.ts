/**
 * Contact Page FAQ Data
 *
 * FAQ data specifically tailored for the contact page.
 * Focuses on consultation process, scheduling, and what to expect.
 */

import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'
import { HOURS_LINE } from '@workspace/shared/claims/contact'
import { FINANCING_SENTENCE_LONG } from '@workspace/shared/claims/financing'
import { KARLINSKY_SHORT_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * Contact page FAQ categories
 */
export const faqCategoriesContact: FaqCategory[] = [
    { id: 'consultations', label: 'Consultations' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'financing', label: 'Financing' },
    { id: 'preparation', label: 'Preparation' },
]

/**
 * Contact page FAQ data organized by category
 */
export const faqDataContact: Record<string, FaqItem[]> = {
    consultations: [
        {
            question: 'What happens during a consultation?',
            answer: `Your consultation is a private, unhurried conversation with ${KARLINSKY_SHORT_NAME}, who is board certified in general surgery by the American Board of Surgery. You'll discuss your goals, she'll examine the areas you'd like to address and review your medical history, and you'll leave with a personalized plan and a detailed quote — no pressure, just clarity.`,
        },
        {
            question: 'How long does a consultation take?',
            answer: 'Plan for 45-60 minutes. We never rush a consultation, because understanding your goals comes first. Some patients finish sooner, but we always allocate enough time for a thorough discussion.',
        },
        {
            question: 'Do you offer virtual consultations?',
            answer: "Yes. We offer secure video consultations for patients who can't visit our Miami office in person. Virtual consultations work well for initial discussions, procedure education, and treatment planning. Many out-of-town patients complete their virtual consult first, then fly in for their surgery.",
        },
    ],
    scheduling: [
        {
            question: 'How far in advance should I book my consultation?',
            answer: "Book whenever you're ready, in person in Miami or by video. A patient coordinator gives you the open dates for your consultation and, later, your surgery.",
        },
        {
            question: 'Can I schedule surgery during my consultation visit?',
            answer: 'Yes. Many patients, especially those traveling to Miami, prefer to schedule their surgery date during their consultation. Our surgical coordinator will help you select a date that works with your schedule, recovery needs, and travel plans.',
        },
        {
            question: 'What if I need to reschedule?',
            answer: 'Life happens—we understand. Please give us as much notice as you can. A patient coordinator will work with you to find a new time that fits your schedule.',
        },
        {
            question: 'Do you have weekend or evening appointments?',
            answer: `Our hours: ${HOURS_LINE}`,
        },
    ],
    financing: [
        {
            question: 'What financing options do you offer?',
            answer: `${FINANCING_SENTENCE_LONG} Our financial coordinator can go through the options with you.`,
        },
        {
            question: 'When is payment due?',
            answer: `A deposit is required to secure your surgery date, with the remaining balance due before your procedure. ${FINANCING_SENTENCE_LONG}`,
        },
        {
            question: 'Does insurance cover any procedures?',
            answer: "Elective cosmetic surgery is typically not covered by insurance. However, procedures with functional components—such as breast reduction for back pain—may have partially covered elements. We're happy to discuss this during your consultation.",
        },
        {
            question: 'What does the quoted price include?',
            answer: `Your price is set for you after an exam, estimates may change, and ${KARLINSKY_SHORT_NAME} confirms your price, in writing, at consultation. She goes through what it covers with you.`,
        },
    ],
    preparation: [
        {
            question: 'What should I bring to my consultation?',
            answer: 'Bring a list of your current medications, any relevant medical records, and photos of results you admire (if applicable). Wear comfortable clothing that allows easy examination of the areas you want to address. Most importantly, bring your questions—we want you to leave feeling informed and confident.',
        },
        {
            question: 'Should I come alone or bring someone?',
            answer: "That's entirely your choice. Some patients prefer a trusted friend or family member for support and to help remember information discussed. Others prefer the privacy of a solo consultation. Either way, we'll ensure you have everything you need.",
        },
        {
            question: 'How do I prepare for surgery after booking?',
            answer: "You'll receive detailed pre-operative instructions specific to your procedure. Generally, this includes stopping certain medications and supplements, arranging transportation and recovery support, completing any required lab work, and following dietary guidelines. Our team will guide you through every step.",
        },
        {
            question: 'Do you help with travel arrangements?',
            answer: "No — we don't book flights, hotels or transport, and we're not affiliated with any recovery house. What we do give you is the part you can't plan without: confirmed surgery, pre-op and follow-up dates in writing, and how many nights you need to be in Miami before your surgeon clears you to fly home.",
        },
    ],
}

const pick = (category: string, question: string): FaqItem => {
    const item = faqDataContact[category]?.find(
        (faq) => faq.question === question
    )
    if (!item) throw new Error(`Contact FAQ missing: ${question}`)
    return item
}

/**
 * The six questions /contact-us shows (#274): what the visit is, how to do
 * it from out of state, when to book, and money. The page asks for one
 * thing, so the FAQ answers only what stands between a visitor and the form.
 */
export const contactPageFaqs: readonly FaqItem[] = [
    pick('consultations', 'What happens during a consultation?'),
    pick('consultations', 'Do you offer virtual consultations?'),
    pick('scheduling', 'How far in advance should I book my consultation?'),
    pick('financing', 'What financing options do you offer?'),
    pick('financing', 'What does the quoted price include?'),
    pick('preparation', 'Do you help with travel arrangements?'),
]
