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
import { FINANCING_SENTENCE_SHORT } from '@workspace/shared/claims/financing'

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
            answer: `Ideally, when you're done having children. Most surgeons advise waiting at least 6 months after giving birth and a few months after you stop breastfeeding, so your body can settle and results are more predictable. Your surgeon sets your timing at consultation.`,
        },
        {
            question: 'What if I get pregnant after my mommy makeover?',
            answer: `A future pregnancy is generally considered safe after a mommy makeover, but it can affect your results, especially the tummy tuck. That's why we recommend waiting until you're confident you're done having children.`,
        },
        {
            question: 'How long after breastfeeding should I wait?',
            answer: `Most surgeons advise waiting at least 6 months after giving birth and a few months after you stop breastfeeding, so your body can settle and results are more predictable. Your surgeon sets your timing at consultation.`,
        },
        {
            question: 'Can I have a mommy makeover if I had a C-section?',
            answer: `Yes. A tummy tuck incision usually sits low, close to where a C-section scar is, so the old scar can often be removed with it, leaving one scar.`,
        },
    ],
    cost: [
        {
            question: 'How much does a mommy makeover cost in Miami?',
            // Prices are claim tokens, resolved where the FAQ renders (#354).
            answer: `A mommy makeover is priced from the procedures in your plan. On the practice price list a tummy tuck starts at [[price:tummy-tuck:mini]] (mini) or [[price:tummy-tuck:full]] (full), breast augmentation at [[price:breast-augmentation:saline]] (saline) or [[price:breast-augmentation:silicone]] (silicone), and a breast lift at [[price:breast-lift:modified]] (modified lift). Combining two procedures takes [[combo-discount:2]] off the total, and three take [[combo-discount:3]] off. Dr. Karlinsky confirms your exact price at your free consultation. [[discount-statement]]`,
        },
        {
            question: 'Does insurance cover a mommy makeover?',
            answer: `No, mommy makeovers are elective cosmetic procedures and not covered by insurance. ${FINANCING_SENTENCE_SHORT}`,
        },
        {
            question: 'What payment options are there?',
            answer: `${FINANCING_SENTENCE_SHORT} Approval and terms are set by the lender.`,
        },
        {
            question:
                'What is a mini mommy makeover and how much does it cost?',
            answer: `A mini mommy makeover includes a mini tummy tuck (lower abdomen only) combined with breast surgery. A mini tummy tuck is [[price:tummy-tuck:mini]] on the practice price list, against [[price:tummy-tuck:full]] for a full one, so it costs less than a full mommy makeover, and your surgeon confirms your price at consultation. It suits mothers with moderate post-pregnancy changes who want targeted improvement. [[discount-statement]]`,
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
            answer: `Diastasis recti (separated abdominal muscles) is common after pregnancy, and exercise does not always close it. In most cases, ASPS says, a tummy tuck restores weakened or separated muscles; your surgeon decides at consultation whether you need it. During your tummy tuck, Dr. Karlinsky repairs the separated muscles, which tightens the abdominal wall and flattens the abdomen.`,
        },
        {
            question: 'Can I add other procedures to my mommy makeover?',
            answer: `Yes, many patients choose to add complementary procedures like arm lift (brachioplasty), thigh lift, or a Brazilian Butt Lift (BBL). However, safety is our priority—we'll discuss what can be safely combined based on operative time and your overall health.`,
        },
    ],
    recovery: [
        {
            question: 'How long is recovery from a mommy makeover?',
            answer: `Most people take about 2 to 3 weeks off work and normal activities. Line up help with childcare: picking up children is strongly advised against for the first few weeks (Shahram Salemy, MD, on the ASPS website). Full healing continues for several months.`,
        },
        {
            question: 'How do I manage recovery with kids at home?',
            answer: `It's a common concern. We recommend arranging help (a partner, family member or hired caregiver) for the first few weeks, since picking up children is strongly advised against then (Shahram Salemy, MD, on the ASPS website). You won't be able to lift children, do laundry, or perform strenuous activities. Many moms send their kids to stay with grandparents for the first week.`,
        },
        {
            question: 'When can I pick up my kids again?',
            answer: `Avoid running and lifting for 6 weeks (Cindy Wu, MD, on the ASPS website); heavy lifting waits until your surgeon clears it, usually 4 to 8 weeks after surgery (Cleveland Clinic). This means no picking up toddlers or young children during this time. We know this is challenging, but it's essential for proper healing and protecting your results.`,
        },
        {
            question: 'Is the recovery painful?',
            answer: `Most patients describe the first few days as uncomfortable rather than severely painful. The tummy tuck portion typically causes the most discomfort due to muscle repair. Your surgeon prescribes pain medication for the first days of recovery and tells you when to switch to over-the-counter pain relievers.`,
        },
    ],
    results: [
        {
            question: 'How long do mommy makeover results last?',
            answer: `With stable weight and no future pregnancies, your mommy makeover results are long-lasting. The muscle repair and skin removal are long-lasting. The FDA says breast implants are not lifetime devices, and they may eventually need to be replaced. Natural aging will continue.`,
        },
        {
            question: 'Will I have visible scars?',
            answer: `Yes, but they're placed low, so most underwear and swimwear cover them. Your tummy tuck scar runs along your bikini line, and breast scars are typically around the areola or in the breast crease. Scars fade over time, and we provide scar care guidance.`,
        },
        {
            question: 'When will I see my final results?',
            answer: `Your result settles over several months as swelling goes down. A tummy tuck shows its final result at up to about 3 months (Cleveland Clinic), and scars keep fading for a year or more. We'll document your progress at each follow-up visit.`,
        },
        {
            question: 'What if I gain or lose weight after my procedure?',
            answer: `Small weight changes usually have little effect on your results. Significant weight gain or loss can change how your breasts and abdomen look. We recommend reaching a stable, maintainable weight before your procedure.`,
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
