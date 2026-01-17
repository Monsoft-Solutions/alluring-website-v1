/**
 * Landing Page FAQ Data
 *
 * FAQ data specifically for the lead generation landing page (/start).
 * Organized by categories to address common concerns at the top of funnel:
 * - Consultation: What to expect from the free consultation
 * - Safety: Addressing safety concerns
 * - Financing: Payment and affordability questions
 * - Recovery: What to expect during recovery
 */
import { siteConfig } from '@/lib/data/site-config'
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
            answer: `Yes, your initial consultation is completely complimentary with no obligation. You will meet with a board-certified surgeon who will assess your goals, explain your options, and provide a personalized quote—all at no cost to you.`,
        },
        {
            question: 'What happens during the consultation?',
            answer: `During your consultation, you will discuss your aesthetic goals with a board-certified surgeon. They will evaluate your anatomy, explain suitable procedures, show you before/after photos of similar cases, and provide a detailed, all-inclusive quote. There's no pressure to make any decisions.`,
        },
        {
            question: 'Can I do a virtual consultation first?',
            answer: `Absolutely! We offer virtual consultations for patients who prefer to start from home or are traveling from out of state. You can discuss your goals, see preliminary recommendations, and get a quote estimate before visiting in person.`,
        },
        {
            question: 'How soon can I schedule my consultation?',
            answer: `We typically have consultation appointments available within 1-2 weeks. Call us at ${siteConfig.contact.phoneDisplay} or fill out the form above, and our patient concierge will work with your schedule to find a convenient time.`,
        },
    ],
    safety: [
        {
            question: 'Are your surgeons board-certified?',
            answer: `Yes, all of our surgeons are double board-certified by the American Board of Plastic Surgery and have extensive experience in cosmetic procedures. They maintain the highest standards of patient care and safety.`,
        },
        {
            question: 'Is plastic surgery safe?',
            answer: `When performed by board-certified surgeons in an accredited facility, plastic surgery is very safe. We use hospital-grade protocols, advanced monitoring equipment, and follow strict safety standards. Our surgeons have performed over 5,000 procedures with an exceptional safety record.`,
        },
        {
            question: 'What accreditations does your facility have?',
            answer: `Our surgical facility is fully accredited and meets the highest standards for patient safety. We use state-of-the-art equipment, maintain rigorous sterilization protocols, and have a dedicated anesthesiology team for every procedure.`,
        },
        {
            question: 'How do you ensure natural-looking results?',
            answer: `Our surgeons specialize in creating subtle, natural-looking enhancements. During your consultation, you will review before/after photos and discuss your goals in detail. The objective is always "you, enhanced"—never overdone or artificial.`,
        },
    ],
    financing: [
        {
            question: 'What financing options do you offer?',
            answer: `We partner with Cherry, CareCredit, and United Credit to offer flexible financing options. Many patients qualify for 0% APR for 12-24 months, with monthly payments as low as $27/week depending on the procedure.`,
        },
        {
            question: 'Can I get pre-approved before my consultation?',
            answer: `Yes! You can apply for financing pre-approval through our website. This gives you a clear picture of your budget before your consultation, helping you make informed decisions about your treatment plan.`,
        },
        {
            question: 'Are there any hidden fees?',
            answer: `No hidden fees, ever. Your quote includes surgeon fees, anesthesia, facility costs, and standard follow-up care. We believe in complete transparency—what we quote is what you pay.`,
        },
        {
            question: 'Do you offer payment plans?',
            answer: `Yes, we offer various payment plans through our financing partners. You can spread your investment over 12, 24, 36, or even 60 months depending on your preference and approval. Our team will help you find the option that best fits your budget.`,
        },
    ],
    recovery: [
        {
            question: 'How long is the typical recovery?',
            answer: `Recovery varies by procedure. Most patients return to desk work within 1-2 weeks and resume full activities in 4-6 weeks. During your consultation, your surgeon will provide a detailed recovery timeline specific to your procedure.`,
        },
        {
            question: 'Will I have support during recovery?',
            answer: `Absolutely. Your dedicated concierge team is available 24/7 during your recovery. We provide detailed post-operative instructions, schedule follow-up appointments, and are just a phone call away if you have any concerns.`,
        },
        {
            question: 'What if I am traveling from out of state?',
            answer: `We welcome patients from across the country and abroad. Our concierge service helps coordinate everything—from local accommodations and transportation to post-operative care. We recommend staying in Miami for 7-14 days depending on your procedure.`,
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
