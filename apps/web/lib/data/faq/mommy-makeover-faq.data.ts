/**
 * Mommy Makeover Landing Page FAQ Data
 *
 * FAQ data specifically for the mommy makeover landing page.
 * Organized by categories addressing post-pregnancy mothers' concerns:
 * - Timing: When to have the procedure relative to children
 * - Procedures: What's included, customization options
 * - Recovery: Managing recovery with kids at home
 * - Results: What to expect, longevity
 *
 * Every figure comes from the source named in its answer (the facts table in the
 * 2026-10-05 mommy makeover cluster plan). The FAQ JSON-LD reads these answers,
 * so AI engines quote them as the practice's.
 */
import { getFinancingPartnersString, siteConfig } from '@/lib/data/site-config'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/** The approved financing sentence: partners named, no payment figure. */
const FINANCING_SENTENCE = `Financing is available through ${getFinancingPartnersString()} for qualified applicants. Approval and terms are set by the lender.`

/**
 * Mommy makeover landing page FAQ categories
 */
export const mommyMakeoverFaqCategories: FaqCategory[] = [
    { id: 'timing', label: 'Timing' },
    { id: 'procedures', label: 'Procedures' },
    { id: 'cost', label: 'Cost & Financing' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'results', label: 'Results' },
]

/**
 * Mommy makeover landing page FAQ items organized by category
 */
export const mommyMakeoverFaqData: Record<string, FaqItem[]> = {
    timing: [
        {
            question: 'When should I have a mommy makeover?',
            answer: `When you are done having children and your weight has settled. Kristy Hamilton, MD, quoted by ASPS, tells patients to wait at least six months after delivery, longer if their weight is still changing, and another surgeon quoted by ASPS calls one year the sweet spot. Dr. Karlinsky looks at where you are at your consultation.`,
        },
        {
            question: 'What if I get pregnant after my mommy makeover?',
            answer: `A later pregnancy can stretch the skin and muscles again, and ASPS advises women who may want more children to postpone a tummy tuck. That's why it helps to wait until you're confident you're done having children.`,
        },
        {
            question: 'How long after breastfeeding should I wait?',
            answer: `Kristy Hamilton, MD, quoted by ASPS, tells patients to have stopped breastfeeding for at least six weeks, preferably three months, before surgery. Dr. Karlinsky confirms the timing for your breast procedure at your consultation.`,
        },
        {
            question: 'Can I have a mommy makeover if I had a C-section?',
            answer: `Yes. ASPS says that after a C-section, the existing scar may be incorporated into the new one. Dr. Karlinsky looks at your scar at your consultation.`,
        },
    ],
    cost: [
        {
            question: 'How much does a mommy makeover cost in Miami?',
            answer: `A mommy makeover is priced from the procedures in your plan. On the practice price list a tummy tuck starts at $3,000 (mini) or $4,500 (full), breast augmentation at $3,500 (saline) or $4,500 (silicone), and a breast lift at $5,000. Combining two procedures takes $500 off the total, and three take $1,000 off. Dr. Karlinsky confirms your exact price at your free consultation.`,
        },
        {
            question: 'Does insurance cover a mommy makeover?',
            answer: `Most health insurance plans do not cover tummy tuck surgery or its complications (ASPS). ${FINANCING_SENTENCE}`,
        },
        {
            question: 'What payment options are there?',
            answer: FINANCING_SENTENCE,
        },
        {
            question:
                'What is a mini mommy makeover and how much does it cost?',
            answer: `A mini mommy makeover includes a mini tummy tuck (lower abdomen only) combined with breast surgery. A mini tummy tuck is $3,000 on the practice price list, against $4,500 for a full one, so it costs less than a full mommy makeover. It suits mothers with moderate post-pregnancy changes who want targeted improvement.`,
        },
    ],
    procedures: [
        {
            question: 'What procedures are included in a mommy makeover?',
            answer: `A mommy makeover is customized to your specific needs, but typically includes a combination of: tummy tuck (abdominoplasty) to address loose skin and separated muscles, breast lift or augmentation (or both), and liposuction to contour areas resistant to diet and exercise. Dr. Karlinsky builds your plan with you at your consultation.`,
        },
        {
            question: 'Do I need breast augmentation or just a lift?',
            answer: `This depends on your goals and how your breasts have changed after nursing. Some moms just need a lift to restore position and shape, others want augmentation to restore lost volume, and many choose both. We'll discuss your options and show you examples during your consultation.`,
        },
        {
            question: 'Will a tummy tuck fix my separated muscles?',
            answer: `ASPS says a tummy tuck removes excess fat and skin and, in most cases, restores weakened or separated muscles. A mini tummy tuck does not include muscle repair. Dr. Karlinsky examines your abdomen and tells you which one fits.`,
        },
        {
            question: 'Can I add other procedures to my mommy makeover?',
            answer: `Sometimes. Each procedure you add makes the surgery longer, and longer surgery carries more risk, so Dr. Karlinsky decides what can be combined based on your health and how long the surgery would take.`,
        },
    ],
    recovery: [
        {
            question: 'How long is recovery from a mommy makeover?',
            answer: `Plan on about two weeks off work and someone else caring for young children for at least two weeks (The Aesthetic Society). Driving usually waits two to three weeks, lifting your children four to six weeks and strenuous exercise six weeks.`,
        },
        {
            question: 'How do I manage recovery with kids at home?',
            answer: `Arrange help before surgery. The Aesthetic Society says to have someone at home for at least the first 24 hours, and someone else caring for young children for at least the first two weeks. You won't be able to pick up your children or carry baskets of laundry for four to six weeks.`,
        },
        {
            question: 'When can I pick up my kids again?',
            answer: `The Aesthetic Society says no heavy lifting, such as picking up your children or baskets of laundry, for four to six weeks. Dr. Karlinsky tells you when you are cleared.`,
        },
        {
            question: 'Is the recovery painful?',
            answer: `Expect it to be hard at first. The Aesthetic Society says the first week will be the worst, and you may still feel like you are recovering for two to three weeks. Dr. Karlinsky goes over how your pain will be managed at your consultation.`,
        },
    ],
    results: [
        {
            question: 'How long do mommy makeover results last?',
            answer: `With a stable weight and no future pregnancies, results are long-lasting, though natural aging continues. The FDA says breast implants are not lifetime devices, so they may need replacing.`,
        },
        {
            question: 'Will I have visible scars?',
            answer: `Yes. A full tummy tuck scar usually runs from hip bone to hip bone, just above the pubic area (Cleveland Clinic). It becomes thinner and lighter at around 12 to 18 months (Cindy Wu, MD, on the ASPS website), and The Aesthetic Society says scars keep fading and flattening for six months to two years.`,
        },
        {
            question: 'When will I see my final results?',
            answer: `Swelling keeps going down for about three months, and the final result can take six months to a year (Frank Campanile, MD, on the ASPS website).`,
        },
        {
            question: 'What if I gain or lose weight after my procedure?',
            answer: `Large weight changes can affect how your breasts and abdomen look. A plastic surgeon writing on the ASPS website advises being close to your goal weight for 6 to 12 months before a tummy tuck.`,
        },
    ],
}

/**
 * FAQ section configuration for mommy makeover landing page
 */
export const mommyMakeoverFaqConfig = {
    title: 'Questions Every Mom',
    subtitle: 'Asks Us',
    badge: 'Mommy Makeover FAQ',
    description: `Get answers to what mothers considering a mommy makeover ask most. Still have questions? Call us at ${siteConfig.contact.phoneDisplay}.`,
}
