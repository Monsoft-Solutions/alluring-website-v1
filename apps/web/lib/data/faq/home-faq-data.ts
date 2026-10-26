/**
 * FAQ Data
 *
 * Centralized FAQ data for the home page categorized FAQ section.
 * Data is organized by category for the CategorizedFAQ component.
 */

import {
    FINANCING_SENTENCE_LONG,
    FINANCING_SENTENCE_SHORT,
} from '@workspace/shared/claims/financing'

import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

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
            answer: 'You can request a consultation with our online form or by calling our Miami office. We offer consultations in person in Miami or by video for out-of-town patients.',
        },
        {
            question: 'Do I need a referral from my doctor?',
            answer: 'No, cosmetic procedures generally do not require a referral. However, we will conduct a thorough health history review to ensure you are a safe candidate for surgery.',
        },
        {
            question: 'Where is the surgery performed?',
            answer: `Every procedure is performed in Miami by one surgeon, ${KARLINSKY_NAME}, and you go home the same day. We prioritize privacy, safety, and comfort.`,
        },
        {
            question: 'What procedures are included in a mommy makeover?',
            answer: 'A mommy makeover typically combines a tummy tuck (abdominoplasty), breast procedure (augmentation, lift, or both), and often liposuction to restore pre-pregnancy contours. During your consultation, we customize the combination to address your specific concerns and goals.',
        },
        {
            question: 'How long does BBL recovery take?',
            answer: 'Most people return to desk work 10 to 14 days after a BBL, sitting on a pillow (Cleveland Clinic, The Aesthetic Society); ASPS says some go back between days 7 and 10. Avoid sitting directly on your buttocks for at least 2 weeks (Cleveland Clinic), then sit only on a BBL pillow until about week 8. Most patients see initial results immediately, with final results visible at 3-6 months once swelling subsides. We provide detailed post-op care instructions.',
        },
        {
            question: 'Do you serve patients from outside Miami?',
            answer: 'Yes. We welcome patients from across South Florida and from other states. You start with a virtual consultation, so you meet your surgeon and get your quote before you commit to a trip. To be clear about what we do and do not handle: we schedule your surgery, pre-op and follow-up appointments, and we tell you how many nights you need to stay in Miami — but you arrange your own flights, lodging and transportation.',
        },
        {
            question:
                'How far in advance should out-of-town patients plan a trip?',
            answer: 'Plan ahead: allow time for your virtual consultation, medical clearance and any lab work before your surgery date is locked in. Once your date is confirmed in writing, you can book travel around it. After a BBL, plan on 7 to 10 days in Miami. For other procedures, your surgeon tells you how many nights to stay so you can be seen at follow-up and cleared to fly home — we give you the exact number for your procedure before you buy a ticket.',
        },
    ],
    recovery: [
        {
            question: 'How long will I need to take off work?',
            answer: 'It depends on the procedure. After a BBL, most people return to desk work in 10 to 14 days, sitting on a pillow (Cleveland Clinic, The Aesthetic Society); ASPS says some go back between days 7 and 10. After a mommy makeover, plan on about 2 to 3 weeks. After breast augmentation, most people are back to light activity in about a week. We will provide a customized timeline during your consult.',
        },
        {
            question: 'Do you offer recovery houses?',
            answer: 'No. We do not operate recovery houses and we are not affiliated with any, so we cannot book one for you or vouch for one. Patients who want that kind of stay research and book it themselves. What we do provide is the clinical side of your recovery: written post-op instructions, your follow-up appointment schedule, and a number to call if something does not look right.',
        },
        {
            question: 'When can I exercise again?',
            answer: 'Walking starts right away. Strenuous exercise waits until your surgeon clears you: about 4 to 6 weeks after liposuction (The Aesthetic Society), 4 to 8 weeks after a tummy tuck (Cleveland Clinic) and 8 weeks after a BBL (The Aesthetic Society).',
        },
    ],
    financing: [
        {
            question: 'How much does a BBL cost in Miami?',
            // Prices are claim tokens, resolved from the admin's price list
            // where the FAQ renders (#354).
            answer: 'A BBL at Alluring starts at [[price:bbl]], and [[price-range:bbl]]. Every price is personalized: it depends on the amount of liposuction needed and whether additional procedures are combined, and your surgeon confirms it at consultation. Financing is available. [[discount-statement]]',
        },
        {
            question: 'How much does a mommy makeover cost?',
            // Parts from the practice's price sheet of 2026-09-15, as in
            // mommy-makeover-miami.data.ts. The sheet has no mommy makeover
            // total, and what a price includes waits on the practice (#309).
            answer: 'A mommy makeover is priced from the procedures in your plan. On the practice price list a tummy tuck starts at [[price:tummy-tuck:mini]] (mini) or [[price:tummy-tuck:full]] (full), breast augmentation at [[price:breast-augmentation:saline]] (saline) or [[price:breast-augmentation:silicone]] (silicone), and a breast lift at [[price:breast-lift:modified]] (modified lift). Combining two procedures takes [[combo-discount:2]] off the total, and three take [[combo-discount:3]] off. Your surgeon confirms your price at consultation, and financing is available for qualified applicants. [[discount-statement]]',
        },
        {
            // Partners named, no payment figure, rate or term (canon D6).
            question: 'Do you offer financing for plastic surgery?',
            answer: `Yes. ${FINANCING_SENTENCE_LONG} You can apply during your free consultation.`,
        },
        {
            question: 'Do you offer payment plans?',
            answer: `Yes. ${FINANCING_SENTENCE_SHORT} Approval and terms are set by the lender.`,
        },
        {
            question: 'Does insurance cover these procedures?',
            answer: 'Elective cosmetic surgery is typically not covered by insurance. However, strictly medical portions (like hernia repair during a tummy tuck) might be eligible depending on your provider.',
        },
    ],
    safety: [
        {
            question: "What are your surgeon's credentials?",
            answer: `Yes. One surgeon performs every procedure at Alluring: ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}`,
        },
        {
            question: 'What anesthesia do you use?',
            answer: 'Most procedures are done under general anesthesia; liposuction and eyelid surgery can also be done under local anesthesia with sedation. An anesthesia provider monitors you throughout surgery, and your surgeon explains your plan at consultation.',
        },
    ],
}
