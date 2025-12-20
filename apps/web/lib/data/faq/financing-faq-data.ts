/**
 * Financing FAQ Data
 *
 * Comprehensive FAQ data specifically for the financing page.
 * Covers application process, eligibility, payment terms, and more.
 */
import { getFinancingPartnersString, siteConfig } from '@/lib/data/site-config'
import type { FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Financing FAQ items
 */
export const financingFaqData: FaqItem[] = [
    {
        question: 'What financing options do you offer?',
        answer: `We partner with ${getFinancingPartnersString()} to provide flexible payment plans. Each partner offers unique benefits—from instant approval with Cherry to healthcare-specific credit with CareCredit and high loan limits with United Credit.`,
    },
    {
        question: 'Will applying for financing affect my credit score?',
        answer: 'Most of our financing partners use a soft credit check for pre-qualification, which does not impact your credit score. A hard inquiry may occur only after you formally accept a loan offer.',
    },
    {
        question: 'What credit score do I need to qualify?',
        answer: 'Qualification requirements vary by partner. Cherry accepts credit scores as low as 520, making financing accessible to more patients. CareCredit and United Credit may have different requirements, and our team can help you find the best option for your situation.',
    },
    {
        question: 'How quickly can I get approved?',
        answer: 'Most patients receive approval within seconds. The application process is entirely online, and you can complete it from your phone or computer. Once approved, you can schedule your procedure immediately.',
    },
    {
        question: 'Are there 0% APR options available?',
        answer: 'Yes! CareCredit offers promotional 0% APR financing for qualifying purchases. The promotional period length depends on the amount financed and your creditworthiness. Our financing specialists can explain all available options during your consultation.',
    },
    {
        question: 'What is the maximum amount I can finance?',
        answer: 'Financing limits depend on the partner and your credit profile. Cherry offers up to $10,000 for aesthetic treatments, while United Credit can provide loans up to $25,000 or more based on your credit history.',
    },
    {
        question: 'Can I pay off my loan early without penalties?',
        answer: 'United Credit offers no early payment penalties, allowing you to pay off your loan ahead of schedule without extra fees. CareCredit and Cherry terms vary, so we recommend reviewing the specific terms of your chosen plan.',
    },
    {
        question: 'How do I apply for financing?',
        answer: `The easiest way is to call our office at ${siteConfig.contact.phoneDisplay} or request a consultation. Our financing specialists will guide you through the application process, help you compare options, and find the plan that best fits your budget.`,
    },
    {
        question: 'Can I use financing for any procedure?',
        answer: 'Yes! All of our cosmetic procedures are eligible for financing, including Brazilian Butt Lift (BBL), breast augmentation, tummy tuck, liposuction, mommy makeover, facelift, and more.',
    },
    {
        question: 'What documents do I need to apply?',
        answer: 'The application process is straightforward. You typically need basic personal information, income details, and your Social Security number for the credit check. No extensive documentation is required for most applications.',
    },
    {
        question: 'Does insurance cover cosmetic surgery?',
        answer: 'Elective cosmetic procedures are generally not covered by insurance. However, certain medically necessary components (such as hernia repair during a tummy tuck) may be eligible for insurance coverage depending on your provider. Our team can help clarify what applies to your specific situation.',
    },
    {
        question: 'What happens if I need to reschedule my procedure?',
        answer: "Your financing approval typically remains valid for a set period (usually 30-90 days depending on the partner). If you need to reschedule, contact our office and we'll work with you to ensure your financing remains in good standing.",
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
