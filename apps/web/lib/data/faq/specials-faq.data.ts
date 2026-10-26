/**
 * Specials FAQ Data
 *
 * Comprehensive FAQ data specifically for the specials landing page.
 * Addresses common objections and questions about promotional offers.
 */
import { faqDataContact } from '@/lib/data/faq/contact-faq-data'
import { getFinancingPartnersString, siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_SHORT_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { FaqItem } from '@/lib/types/shared/faq.type'

/** An approved answer from the contact page, word for word. */
const fromContactPage = (category: string, question: string): FaqItem => {
    const item = faqDataContact[category]?.find(
        (faq) => faq.question === question
    )
    if (!item) throw new Error(`Contact FAQ missing: ${question}`)
    return item
}

/**
 * Specials FAQ items
 */
export const specialsFaqData: FaqItem[] = [
    {
        question: 'How do I claim a special offer?',
        answer: `Answer the three quick questions in the message thread on this page, or call us at ${siteConfig.contact.phoneDisplay}. A patient coordinator texts you, books your free consultation and makes sure the current offer is applied to your written quote.`,
    },
    // Four in five visitors to this page are outside Florida (#274).
    fromContactPage('consultations', 'Do you offer virtual consultations?'),
    fromContactPage('preparation', 'Do you help with travel arrangements?'),
    {
        question: 'Do specials apply to all procedures?',
        answer: 'Each promotion says which procedures it covers, and some apply only to combined procedures. Your coordinator confirms exactly how the current offer applies to your plan before you commit to anything.',
    },
    {
        question: 'Can I combine special offers with financing?',
        answer: `Yes. Financing through ${getFinancingPartnersString()} can be used with a current offer, for qualified applicants. Approval and terms are set by the lender.`,
    },
    {
        question: 'What does a promotional price include?',
        answer: `${KARLINSKY_SHORT_NAME} confirms your price, and what it covers, at your consultation.`,
    },
    {
        question: 'What if the offer expires before my surgery date?',
        answer: 'Ask your Specialist how an offer applies to your surgery date.',
    },
    {
        question: 'Is the consultation really free?',
        answer: `Yes. Your consultation is free and there is no obligation. You meet ${KARLINSKY_SHORT_NAME}, who is board certified in general surgery by the American Board of Surgery, and you leave with a personalized quote.`,
    },
]

/**
 * FAQ section configuration for specials page
 */
export const specialsFaqConfig = {
    title: 'Questions About Our Specials',
    description:
        'Everything you need to know about claiming promotional offers at Alluring Plastic Surgery.',
}
