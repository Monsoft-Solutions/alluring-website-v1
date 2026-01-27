/**
 * FAQ Data
 *
 * Centralized FAQ data for the home page categorized FAQ section.
 * Data is organized by category for the CategorizedFAQ component.
 */

import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'
import { getFinancingPartnersString } from '@/lib/data/site-config'

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
            answer: 'All procedures are performed in our state-of-the-art surgical facility located right here in Miami by Double Board-Certified surgeons. We prioritize privacy, safety, and comfort.',
        },
        {
            question: 'What procedures are included in a mommy makeover?',
            answer: 'A mommy makeover typically combines a tummy tuck (abdominoplasty), breast procedure (augmentation, lift, or both), and often liposuction to restore pre-pregnancy contours. During your consultation, we customize the combination to address your specific concerns and goals.',
        },
        {
            question: 'How long does BBL recovery take?',
            answer: 'BBL recovery typically requires 2 weeks off work and avoiding sitting directly on your buttocks for 6-8 weeks. Most patients see initial results immediately, with final results visible at 3-6 months once swelling subsides. We provide detailed post-op care instructions and recovery supplies.',
        },
        {
            question: 'Do you serve patients from outside Miami?',
            answer: 'Absolutely! We welcome patients from across South Florida, Latin America, the Caribbean, and beyond. Our Miami clinic is a top destination for medical tourism. We offer virtual consultations, airport pickup coordination, and can recommend trusted recovery houses nearby. Many patients fly in for their procedure and stay in Miami during their initial recovery.',
        },
        {
            question:
                'What travel packages are available for out-of-town patients?',
            answer: 'Our patient concierge can coordinate your entire surgical journey. We partner with luxury recovery suites offering 24/7 nursing care, transportation services, and all-inclusive packages. We also provide detailed pre-travel checklists, virtual pre-op appointments, and can recommend nearby hotels and Airbnbs for accompanying family members. Contact us for a personalized travel surgery quote.',
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
            question: 'How much does a BBL cost in Miami?',
            answer: 'BBL pricing at our Miami clinic starts at $6,500, which includes surgeon fees, anesthesia, facility fees, and all pre/post-op appointments. Final cost depends on the amount of liposuction needed and whether additional procedures are combined. We offer financing starting at $99/month.',
        },
        {
            question: 'How much does a mommy makeover cost?',
            answer: 'Mommy makeover pricing ranges from $12,000-$18,000 depending on the combination of procedures (tummy tuck, breast surgery, liposuction). This all-inclusive pricing covers surgeon fees, anesthesia, facility, and follow-up care. Financing plans available with 0% interest for qualified applicants.',
        },
        {
            question: 'Do you offer 0% financing for plastic surgery?',
            answer: `Yes! We partner with ${getFinancingPartnersString()} to offer 0% interest financing for qualified applicants. Plans range from 6-24 months. Many patients pay as little as $99-$199/month for their dream results. Apply during your free consultation.`,
        },
        {
            question: 'Do you offer payment plans?',
            answer: `Yes. We believe luxury care should be accessible. We work with ${getFinancingPartnersString()} to offer flexible monthly payment plans, some with 0% interest for qualified applicants.`,
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
