/**
 * Specials FAQ Data
 *
 * Comprehensive FAQ data specifically for the specials landing page.
 * Addresses common objections and questions about promotional offers.
 */
import { getFinancingPartnersString, siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_SHORT_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Specials FAQ items
 */
export const specialsFaqData: FaqItem[] = [
    {
        question: 'How do I claim a special offer?',
        answer: `Answer the four quick questions in the message thread on this page, or call us at ${siteConfig.contact.phoneDisplay}. A patient coordinator reaches out within 24 hours, books your free consultation and makes sure the current offer is applied to your written quote.`,
    },
    {
        question: 'Do specials apply to all procedures?',
        answer: 'Each promotion says which procedures it covers, and some apply only to combined procedures. Your coordinator confirms exactly how the current offer applies to your plan before you commit to anything.',
    },
    {
        question: 'Can I combine special offers with financing?',
        answer: `Yes. Special offers can be combined with our financing options through ${getFinancingPartnersString()}, so you can keep the promotional price and spread the payments over time.`,
    },
    {
        question: 'Are the promotional prices all-inclusive?',
        answer: 'Your quote lists exactly what is included — surgeon fees, anesthesia, facility and standard follow-up care — in writing, so there are no surprises.',
    },
    {
        question: 'What if the offer expires before my surgery date?',
        answer: 'The offer depends on when you sign, not when you have surgery. Sign your surgery contract and place your reservation deposit before the offer ends, and your price is locked in — even if your surgery date is months away.',
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
