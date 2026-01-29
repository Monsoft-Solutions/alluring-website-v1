/**
 * Mommy Makeover Landing Page FAQ Data
 *
 * FAQ data specifically for the mommy makeover landing page.
 * Organized by categories addressing post-pregnancy mothers' concerns:
 * - Timing: When to have the procedure relative to children
 * - Procedures: What's included, customization options
 * - Recovery: Managing recovery with kids at home
 * - Results: What to expect, longevity
 */
import { siteConfig } from '@/lib/data/site-config'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

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
            answer: `We recommend waiting at least 6 months after you've finished breastfeeding, and ideally when you're done having children. Your body needs time to stabilize after pregnancy and nursing before we can achieve optimal results. During your consultation, we'll evaluate your individual timeline.`,
        },
        {
            question: 'What if I get pregnant after my mommy makeover?',
            answer: `While a future pregnancy won't harm you medically, it can affect your results—especially the tummy tuck portion. That's why we recommend waiting until you're confident you're done having children. If you do become pregnant afterward, touch-up procedures are always an option.`,
        },
        {
            question: 'How long after breastfeeding should I wait?',
            answer: `We typically recommend waiting 3-6 months after you've completely stopped breastfeeding. This allows your breast tissue to settle into its final shape and size, ensuring we can plan your breast procedure accurately.`,
        },
        {
            question: 'Can I have a mommy makeover if I had a C-section?',
            answer: `Absolutely! In fact, having a C-section can be beneficial for your tummy tuck because the incision is often made in a similar location. We can revise the C-section scar and create a single, well-hidden incision. Most of our mommy makeover patients have had C-sections.`,
        },
    ],
    cost: [
        {
            question: 'How much does a mommy makeover cost in Miami?',
            answer: `The average mommy makeover price in Miami ranges from $7,000 to $20,000, depending on the procedures included and complexity. During your free consultation, we provide a detailed cost breakdown based on your personalized surgical plan.`,
        },
        {
            question: 'Does insurance cover a mommy makeover?',
            answer: `No, mommy makeovers are elective cosmetic procedures and not covered by insurance. However, we offer flexible financing through Cherry, CareCredit, and United Credit with payments starting at $67/week and 0% APR options available.`,
        },
        {
            question: 'Are there affordable payment options?',
            answer: `Yes! Our "Luxury Made Affordable" approach means you don't have to choose between quality and accessibility. We partner with multiple financing providers offering weekly payments starting at $67, 0% APR options, and no penalty for early payoff.`,
        },
        {
            question:
                'What is a mini mommy makeover and how much does it cost?',
            answer: `A mini mommy makeover includes a mini tummy tuck (lower abdomen only) combined with breast surgery. It costs 30-40% less than a full procedure—typically $5,000 to $12,000—and is ideal for mothers with moderate post-pregnancy changes who want targeted improvement.`,
        },
    ],
    procedures: [
        {
            question: 'What procedures are included in a mommy makeover?',
            answer: `A mommy makeover is customized to your specific needs, but typically includes a combination of: tummy tuck (abdominoplasty) to address loose skin and separated muscles, breast lift or augmentation (or both), and liposuction to contour areas resistant to diet and exercise. Your surgeon will create a personalized plan during your consultation.`,
        },
        {
            question: 'Do I need breast augmentation or just a lift?',
            answer: `This depends on your goals and how your breasts have changed after nursing. Some moms just need a lift to restore position and shape, others want augmentation to restore lost volume, and many choose both. We'll discuss your options and show you examples during your consultation.`,
        },
        {
            question: 'Will a tummy tuck fix my separated muscles?',
            answer: `Yes! Diastasis recti (separated abdominal muscles) is extremely common after pregnancy and cannot be fixed with exercise alone. During your tummy tuck, we repair the muscle wall, restoring core strength and creating a flatter, more defined abdomen.`,
        },
        {
            question: 'Can I add other procedures to my mommy makeover?',
            answer: `Yes, many patients choose to add complementary procedures like arm lift (brachioplasty), thigh lift, or a Brazilian Butt Lift (BBL). However, safety is our priority—we'll discuss what can be safely combined based on operative time and your overall health.`,
        },
    ],
    recovery: [
        {
            question: 'How long is recovery from a mommy makeover?',
            answer: `Most patients take 2-3 weeks off from work and normal activities. You'll need help with childcare and household tasks for the first 1-2 weeks, especially lifting. By 6 weeks, most patients are back to their normal routine, though full healing continues for several months.`,
        },
        {
            question: 'How do I manage recovery with kids at home?',
            answer: `This is the most common concern we hear! We recommend arranging for help—a partner, family member, or hired caregiver—for at least the first 2 weeks. You won't be able to lift children, do laundry, or perform strenuous activities. Many moms send their kids to stay with grandparents for the first week.`,
        },
        {
            question: 'When can I pick up my kids again?',
            answer: `Lifting restrictions are typically 10-15 pounds for the first 4-6 weeks. This means no picking up toddlers or young children during this time. We know this is challenging, but it's essential for proper healing and protecting your results.`,
        },
        {
            question: 'Is the recovery painful?',
            answer: `Most patients describe the first few days as uncomfortable rather than severely painful. The tummy tuck portion typically causes the most discomfort due to muscle repair. We provide comprehensive pain management including prescription medication for the first week, and most patients transition to over-the-counter pain relievers within 7-10 days.`,
        },
    ],
    results: [
        {
            question: 'How long do mommy makeover results last?',
            answer: `With stable weight and no future pregnancies, your mommy makeover results are long-lasting. The muscle repair and skin removal are permanent. Breast implants may eventually need replacement (typically 10-15 years), and natural aging will continue, but you'll always look better than if you hadn't had the procedure.`,
        },
        {
            question: 'Will I have visible scars?',
            answer: `Yes, but they're strategically placed to be hidden by underwear and swimwear. Your tummy tuck scar runs along your bikini line, and breast scars are typically around the areola or in the breast crease. Scars fade significantly over time, and we provide scar care guidance to optimize healing.`,
        },
        {
            question: 'When will I see my final results?',
            answer: `You'll see dramatic improvement immediately, but final results emerge over 6-12 months as swelling resolves. Breast results typically settle within 3-4 months, while abdominal results continue to refine for up to a year. We'll document your progress at each follow-up visit.`,
        },
        {
            question: 'What if I gain or lose weight after my procedure?',
            answer: `Moderate weight fluctuations (10-15 pounds) are normal and won't significantly affect your results. However, significant weight gain or loss can impact the appearance of your breasts and abdomen. We recommend reaching a stable, maintainable weight before your procedure.`,
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
