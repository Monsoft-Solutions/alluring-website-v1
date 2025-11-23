/**
 * FAQ Data
 *
 * Centralized FAQ data for the home page categorized FAQ section.
 * Data is organized by category for the CategorizedFAQ component.
 */

import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Available FAQ categories
 */
export const faqCategoriesHome: FaqCategory[] = [
    { id: 'general', label: 'General' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'financing', label: 'Financing' },
    { id: 'safety', label: 'Safety' },
]

/**
 * FAQ data organized by category
 */
export const faqDataHome: Record<string, FaqItem[]> = {
    general: [
        {
            question: 'How do I schedule a consultation?',
            answer: 'You can request a consultation via our online form, WhatsApp concierge, or by calling our Miami office directly. We offer both in-person appointments and virtual consultations for our out-of-town patients.',
        },
        {
            question: 'Do I need a referral from my doctor?',
            answer: 'No, cosmetic procedures generally do not require a referral. However, we will conduct a thorough health history review to ensure you are a safe candidate for surgery.',
        },
        {
            question: 'Where is the surgery performed?',
            answer: 'All procedures are performed in our state-of-the-art, AAAASF-accredited surgical facility located right here in Miami. We prioritize privacy, safety, and comfort.',
        },
    ],
    recovery: [
        {
            question: 'How long will I need to take off work?',
            answer: 'This varies by procedure. For a BBL or Mommy Makeover, most patients take 2 weeks off. For breast augmentation, many return to desk work within 5-7 days. We will provide a customized timeline during your consult.',
        },
        {
            question: 'Do you offer recovery houses?',
            answer: 'We partner with top-tier luxury recovery suites in Miami that offer 24/7 nursing care, transportation, and meals. Our concierge can handle all booking details for you.',
        },
        {
            question: 'When can I exercise again?',
            answer: 'Light walking is encouraged immediately. Cardio can usually resume at 3-4 weeks, and heavy lifting or intense workouts typically require 6 weeks of healing.',
        },
    ],
    financing: [
        {
            question: 'Do you offer payment plans?',
            answer: 'Yes. We believe luxury care should be accessible. We work with CareCredit, Alphaeon, and PatientFi to offer flexible monthly payment plans, some with 0% interest for qualified applicants.',
        },
        {
            question: 'Does insurance cover these procedures?',
            answer: 'Elective cosmetic surgery is typically not covered by insurance. However, strictly medical portions (like hernia repair during a tummy tuck) might be eligible depending on your provider.',
        },
    ],
    safety: [
        {
            question: 'Are your surgeons board-certified?',
            answer: 'Absolutely. Our surgeons hold board certifications and specialize specifically in aesthetic procedures. We maintain the highest standards of training and safety protocols.',
        },
        {
            question: 'What anesthesia do you use?',
            answer: 'We use general anesthesia administered by board-certified MD anesthesiologists—never nurse anesthetists without supervision. Your safety is our non-negotiable priority.',
        },
    ],
}
