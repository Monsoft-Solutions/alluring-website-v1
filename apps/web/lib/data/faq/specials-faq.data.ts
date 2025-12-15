/**
 * Specials FAQ Data
 *
 * Comprehensive FAQ data specifically for the specials landing page.
 * Addresses common objections and questions about promotional offers.
 */
import { siteConfig } from '@/lib/data/site-config'
import type { FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Specials FAQ items
 */
export const specialsFaqData: FaqItem[] = [
    {
        question: 'How do I claim a special offer?',
        answer: `Simply fill out the consultation form on this page or call us at ${siteConfig.contact.phoneDisplay}. Mention the promotion you're interested in when scheduling, and our team will ensure the discount is applied to your quote.`,
    },
    {
        question: 'Can I combine special offers with financing?',
        answer: 'Absolutely! Our special offers can be combined with our flexible financing options through Cherry, CareCredit, and United Credit. This means you can enjoy promotional pricing while spreading payments over time with low monthly payments.',
    },
    {
        question: 'Are the promotional prices all-inclusive?',
        answer: 'Our promotional pricing typically includes surgeon fees, anesthesia, facility costs, and standard follow-up care. During your consultation, you will receive a detailed breakdown of exactly what is included so there are no surprises.',
    },
    {
        question: 'What if the offer expires before my surgery date?',
        answer: 'Once you schedule your consultation and confirm your procedure, the promotional price is locked in for you—even if the public promotion ends before your surgery date. We honor the price at the time of booking.',
    },
    {
        question: 'Do specials apply to all procedures?',
        answer: 'Each promotion specifies which procedures are included. Some offers apply to specific procedures like BBL or breast augmentation, while others may cover multiple treatments. Check the promotion details or ask during your consultation.',
    },
    {
        question: 'Is the consultation really free?',
        answer: 'Yes! Your initial consultation is completely complimentary with no obligation. You will meet with a board-certified surgeon who will assess your goals, explain your options, and provide a personalized quote—all at no cost to you.',
    },
    {
        question: 'How long are special offers valid?',
        answer: 'Each promotion has its own timeline, which is clearly displayed on the offer. Some specials run for a few weeks, while seasonal promotions may be available for a month or longer. We recommend booking early to ensure availability.',
    },
    {
        question: 'Can I book now and schedule surgery later?',
        answer: 'Yes, you can secure your promotional pricing by scheduling a consultation now, even if your preferred surgery date is months away. Our team will work with you to find the perfect timing for your transformation.',
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
