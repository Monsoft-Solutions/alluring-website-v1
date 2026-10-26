/**
 * Landing Page FAQ Data
 *
 * FAQ data specifically for the lead generation landing page (/start).
 * Organized by categories to address common concerns at the top of funnel:
 * - Consultation: What to expect from the free consultation
 * - Safety: Addressing safety concerns
 * - Financing: Payment and financing questions
 * - Recovery: What to expect during recovery
 */
import {
    FINANCING_SENTENCE_LONG,
    FINANCING_SENTENCE_SHORT,
} from '@workspace/shared/claims/financing'

import { siteConfig } from '@/lib/data/site-config'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Landing page FAQ categories
 */
export const landingFaqCategories: FaqCategory[] = [
    { id: 'consultation', label: 'Consultation' },
    { id: 'safety', label: 'Safety' },
    { id: 'financing', label: 'Financing' },
    { id: 'recovery', label: 'Recovery' },
]

/**
 * Landing page FAQ items organized by category
 */
export const landingFaqData: Record<string, FaqItem[]> = {
    consultation: [
        {
            question: 'Is the consultation really free?',
            answer: `Yes, your initial consultation is completely complimentary with no obligation. You will meet ${KARLINSKY_NAME}, who will assess your goals, explain your options, and provide a personalized quote—all at no cost to you.`,
        },
        {
            question: 'What happens during the consultation?',
            answer: `During your consultation, you will discuss your aesthetic goals with ${KARLINSKY_NAME}. She will evaluate your anatomy, explain suitable procedures, show you before/after photos of similar cases, and confirm your price. There's no pressure to make any decisions.`,
        },
        {
            question: 'Can I do a virtual consultation first?',
            answer: `Yes. We offer virtual consultations for patients who prefer to start from home or are traveling from out of state. You can discuss your goals, see preliminary recommendations, and get a quote estimate before visiting in person.`,
        },
        {
            question: 'How soon can I schedule my consultation?',
            answer: `Call us at ${siteConfig.contact.phoneDisplay} or fill out the form above, and a patient coordinator will find a time that works for you.`,
        },
    ],
    safety: [
        {
            question: "What are your surgeon's credentials?",
            answer: `${KARLINSKY_NAME} performs every surgery at Alluring. ${KARLINSKY_CREDENTIALS}`,
        },
        {
            question: 'Is plastic surgery safe?',
            answer: `Every surgery carries risk. Your surgeon, ${KARLINSKY_NAME}, is board certified in general surgery by the American Board of Surgery, every patient has pre-op lab work before being cleared, and an anesthesia provider monitors you throughout surgery. She goes through the risks that apply to you at consultation.`,
        },
        {
            question: 'How do you ensure natural-looking results?',
            answer: `Dr. Karlinsky plans for subtle, natural-looking enhancements. During your consultation, you will review before/after photos and discuss your goals in detail. The objective is always "you, enhanced"—never overdone or artificial.`,
        },
    ],
    financing: [
        {
            question: 'What financing options do you offer?',
            answer: FINANCING_SENTENCE_LONG,
        },
        {
            question: 'How is my price set?',
            answer: `Your price is set for you after an exam, estimates may change, and Dr. Karlinsky confirms your price at consultation.`,
        },
        {
            question: 'Do you offer payment plans?',
            answer: `Yes. ${FINANCING_SENTENCE_SHORT} Approval and terms are set by the lender.`,
        },
    ],
    recovery: [
        {
            question: 'How long is the typical recovery?',
            answer: `Recovery varies by procedure. Most people are back at desk work in about 1 to 3 weeks; exercise waits about 4 to 6 weeks after liposuction, 4 to 8 weeks after a tummy tuck and 8 weeks after a BBL, once your surgeon clears you. Your surgeon gives you a timeline for your procedure at consultation.`,
        },
        {
            question: 'Will I have support during recovery?',
            answer: `Yes. We provide detailed post-operative instructions, schedule your follow-up appointments, and give you a direct number to call if something does not look right during your recovery.`,
        },
        {
            question: 'What if I am traveling from out of state?',
            answer: `We welcome patients travelling in from out of state. You start with a virtual consultation, then come to Miami for your pre-op appointment and surgery. After a BBL, plan on 7 to 10 days in Miami; for other procedures, your surgeon tells you how many nights to stay so you can be seen for follow-up and cleared to fly home. You arrange your own flights and lodging — we're not affiliated with any recovery house.`,
        },
        {
            question: 'When will I see my final results?',
            answer: `While you will see improvement immediately, final results typically emerge over 3-6 months as swelling subsides and tissues settle. Your surgeon will monitor your progress through follow-up appointments and provide guidance throughout your healing journey.`,
        },
    ],
}

/**
 * FAQ section configuration for landing page
 */
export const landingFaqConfig = {
    title: 'Your Questions,',
    subtitle: 'Answered.',
    badge: 'Clarity & Confidence',
    description:
        'Get the facts before you decide. Here are honest answers to the questions we hear most.',
}
