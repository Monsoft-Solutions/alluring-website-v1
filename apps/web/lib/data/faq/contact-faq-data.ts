/**
 * Contact Page FAQ Data
 *
 * FAQ data specifically tailored for the contact page.
 * Focuses on consultation process, scheduling, and what to expect.
 */

import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'
import { getFinancingPartnersString } from '@/lib/data/site-config'

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
            answer: "Your consultation is a private, unhurried conversation with our board-certified surgeon. We'll discuss your goals, examine the areas you'd like to address, review your medical history, and create a personalized treatment plan. You'll receive a detailed quote and have all your questions answered—no pressure, just clarity.",
        },
        {
            question: 'How long does a consultation take?',
            answer: 'Plan for 45-60 minutes. We never rush our consultations because we believe understanding your vision is the foundation of exceptional results. Some patients finish sooner, but we always allocate enough time for a thorough discussion.',
        },
        {
            question: 'Do you offer virtual consultations?',
            answer: "Yes! We offer secure video consultations for patients who can't visit our Miami office in person. Virtual consultations are perfect for initial discussions, procedure education, and treatment planning. Many out-of-town patients complete their virtual consult first, then fly in for their surgery.",
        },
        {
            question: 'Is there a consultation fee?',
            answer: 'Yes, there is a consultation fee that goes toward your procedure cost if you decide to move forward. This ensures we can provide you with undivided attention and comprehensive care during your visit. The fee is discussed when you schedule your appointment.',
        },
    ],
    scheduling: [
        {
            question: 'How far in advance should I book my consultation?',
            answer: 'We recommend booking 2-3 weeks in advance for in-person consultations, though we can sometimes accommodate urgent requests. Virtual consultations often have more immediate availability. For surgery scheduling, popular months (November-February) book 4-8 weeks out.',
        },
        {
            question: 'Can I schedule surgery during my consultation visit?',
            answer: 'Absolutely. Many patients, especially those traveling to Miami, prefer to schedule their surgery date during their consultation. Our surgical coordinator will help you select a date that works with your schedule, recovery needs, and travel plans.',
        },
        {
            question: 'What if I need to reschedule?',
            answer: "Life happens—we understand. Please give us at least 48 hours' notice for consultations and as much advance notice as possible for surgery dates. Our patient concierge will work with you to find a new time that fits your schedule.",
        },
        {
            question: 'Do you have weekend or evening appointments?',
            answer: 'We primarily operate Monday through Friday, with Saturday consultations available by special arrangement. Surgery is typically scheduled Tuesday through Thursday to ensure optimal staffing and post-operative care availability.',
        },
    ],
    financing: [
        {
            question: 'What financing options do you offer?',
            answer: `We partner with ${getFinancingPartnersString()} to offer flexible payment plans. Many patients qualify for 0% interest promotional periods. Our financial coordinator can help you explore options and find a plan that fits your budget.`,
        },
        {
            question: 'When is payment due?',
            answer: "A deposit is required to secure your surgery date, with the remaining balance due before your procedure. We accept major credit cards, financing plans, wire transfers, and cashier's checks. Payment plans through our financing partners allow you to spread costs over time.",
        },
        {
            question: 'Does insurance cover any procedures?',
            answer: "Elective cosmetic surgery is typically not covered by insurance. However, procedures with functional components—such as breast reduction for back pain—may have partially covered elements. We're happy to discuss this during your consultation.",
        },
        {
            question: 'What does the quoted price include?',
            answer: 'Our quotes are comprehensive and include surgeon fees, anesthesia, facility fees, post-operative garments, and standard follow-up appointments. We believe in transparent pricing with no hidden costs or surprise fees.',
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
