/**
 * Financing FAQ Data
 *
 * Comprehensive FAQ data specifically for the financing page.
 * Covers application process, eligibility, payment terms, and more.
 */
import {
    FINANCING_SENTENCE_LONG,
    getFinancingPartnersString,
} from '@workspace/shared/claims/financing'

import { siteConfig } from '@/lib/data/site-config'
import type { FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Financing FAQ items. The partners are named and no number is quoted: no
 * payment, rate, limit, term or approval speed (claims canon §6, D6, #354).
 * Each lender sets its own terms, so the answers point there.
 */
export const financingFaqData: FaqItem[] = [
    {
        question: 'What financing options do you offer?',
        answer: FINANCING_SENTENCE_LONG,
    },
    {
        question: 'Will applying for financing affect my credit score?',
        answer: 'Each lender runs its own application and credit check. Ask the lender how its check affects your credit before you apply.',
    },
    {
        question: 'What credit score do I need to qualify?',
        answer: 'Each lender sets its own requirements, and our team can go through the options with you.',
    },
    {
        question: 'How do I get approved?',
        answer: 'You apply with the lender, online from your phone or computer, and the lender decides. Once approved, you can schedule your procedure.',
    },
    {
        question: 'What is the maximum amount I can finance?',
        answer: 'Each lender sets its own limit, based on your application.',
    },
    {
        question: 'Can I pay off my loan early without penalties?',
        answer: "Each lender sets its own terms, so review your plan's terms before you accept it.",
    },
    {
        question: 'How do I apply for financing?',
        answer: `The easiest way is to call our office at ${siteConfig.contact.phoneDisplay} or request a consultation. Our team will guide you through the application process and help you compare the lenders' options.`,
    },
    {
        question: 'Can I use financing for any procedure?',
        answer: `Financing through ${getFinancingPartnersString()} can be used for BBL, breast augmentation, tummy tuck, liposuction, mommy makeover, facelift and our other procedures, for qualified applicants. Approval and terms are set by the lender.`,
    },
    {
        question: 'What documents do I need to apply?',
        answer: 'The application process is straightforward. You typically need basic personal information, income details, and your Social Security number for the credit check. The lender tells you what it needs.',
    },
    {
        question: 'Does insurance cover cosmetic surgery?',
        answer: 'Elective cosmetic procedures are generally not covered by insurance. However, certain medically necessary components (such as hernia repair during a tummy tuck) may be eligible for insurance coverage depending on your provider. Our team can help clarify what applies to your specific situation.',
    },
    {
        question: 'What happens if I need to reschedule my procedure?',
        answer: "Your financing approval stays valid for a period the lender sets. If you need to reschedule, contact our office and we'll work with you to ensure your financing remains in good standing.",
    },
]

/**
 * FAQ section configuration for financing page
 */
export const financingFaqConfig = {
    title: 'Financing Questions Answered',
    description:
        'Everything you need to know about financing your cosmetic procedure at Alluring Plastic Surgery.',
}
