/**
 * New Beginning Landing Page FAQ Data
 *
 * FAQ data specifically for the new beginning/life transitions landing page.
 * Organized by categories addressing concerns of women 35-55 in life transitions:
 * - Mindset: Self-investment, emotional readiness
 * - Procedures: Anti-aging, body contouring options
 * - Results: Natural rejuvenation vs dramatic change
 * - Lifestyle: Recovery, maintaining results
 */
import { siteConfig } from '@/lib/data/site-config'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * New beginning landing page FAQ categories
 */
export const newBeginningFaqCategories: FaqCategory[] = [
    { id: 'mindset', label: 'Getting Ready' },
    { id: 'procedures', label: 'Procedures' },
    { id: 'results', label: 'Results' },
    { id: 'lifestyle', label: 'Lifestyle' },
]

/**
 * New beginning landing page FAQ items organized by category
 */
export const newBeginningFaqData: Record<string, FaqItem[]> = {
    mindset: [
        {
            question: 'Is it selfish to invest in plastic surgery for myself?',
            answer: `Absolutely not. Taking care of yourself isn't selfish—it's necessary. After years of putting others first (children, spouse, career, aging parents), investing in your appearance and confidence is a form of self-care. When you feel good about yourself, it positively affects every area of your life.`,
        },
        {
            question: "How do I know if I'm emotionally ready for surgery?",
            answer: `You're likely ready if: you're making this decision for yourself (not to please someone else), you have realistic expectations about what surgery can achieve, you're in a relatively stable emotional place, and you have support during recovery. If you're going through acute emotional crisis, we may recommend waiting until you're in a more grounded place.`,
        },
        {
            question:
                'Will people judge me for having plastic surgery at my age?',
            answer: `Many people won't know—they may just notice you look refreshed. Modern techniques focus on natural rejuvenation, not dramatic changes. And frankly, at this stage of life, you've earned the right to do what makes you happy. This is about how YOU feel, not others' opinions.`,
        },
        {
            question: 'Is this the right time, or should I wait?',
            answer: `There's never a "perfect" time, but there are good times. Many patients find that a life transition—divorce, empty nest, retirement, career change—is actually an ideal time because they're already in a period of reinvention. If you're healthy and have realistic expectations, the right time is when you're ready.`,
        },
    ],
    procedures: [
        {
            question: 'What procedures help me look refreshed, not different?',
            answer: `For facial rejuvenation: facelift (face and neck lift), eyelid surgery (blepharoplasty) and brow lift. For body contouring: liposuction, tummy tuck, arm lift and breast lift. The goal is a natural result that makes you look like a refreshed, well-rested version of yourself.`,
        },
        {
            question: 'Can I combine facial and body procedures?',
            answer: `Yes, many patients choose to address multiple areas at once for a comprehensive transformation. Common combinations include facelift with eyelid surgery, or tummy tuck with breast lift. We'll discuss what can be safely combined based on your health and desired downtime.`,
        },
    ],
    results: [
        {
            question: 'Will I still look like myself after a facelift?',
            answer: `Yes. Our goal is natural rejuvenation—you should look like a refreshed, well-rested version of yourself, not a different person. Modern facelift techniques restore youthful contours without the "pulled" or "windswept" look of outdated methods.`,
        },
        {
            question: 'How many years younger will I look?',
            answer: `We focus on helping you look refreshed rather than chasing a specific "age." Your surgeon talks through what a facelift can and can't do for you at consultation.`,
        },
        {
            question: 'How long do results last?',
            answer: `Facelift results are long-lasting, though you'll continue to age naturally. Liposuction permanently removes fat cells, Cleveland Clinic says, and ASPS says results last as long as you keep a stable weight and general fitness. We'll give you specific guidance based on your procedures.`,
        },
        {
            question: "What if I don't like my results?",
            answer: `This is why consultation is so important—we'll thoroughly discuss your goals, show you before/after photos, and ensure we're aligned on expectations. If adjustments are needed, we'll discuss revision options at your follow-up appointments.`,
        },
    ],
    lifestyle: [
        {
            question:
                'How much time do I need to take off from work and social life?',
            answer: `Recovery varies by procedure: a facelift typically needs about 2 to 3 weeks before you're comfortable in public, eyelid surgery about 7 to 10 days, and body procedures about 1 to 3 weeks or more, depending on the procedure. Many patients plan a "transformation vacation"—taking time off to heal and emerge refreshed without explaining their absence.`,
        },
        {
            question: 'Can I travel after surgery?',
            answer: `If you fly in for a BBL, plan on 7 to 10 days in Miami. For other procedures, your surgeon tells you how many nights to stay before you're cleared to fly home, so you can attend your follow-up appointments first.`,
        },
        {
            question: 'How do I maintain my results long-term?',
            answer: `Sun protection is crucial—always wear sunscreen and protective clothing. Maintain a healthy weight, stay hydrated and don't smoke. Good skincare and healthy lifestyle habits help preserve your results for years.`,
        },
        {
            question: 'Should I tell people about my surgery?',
            answer: `This is entirely your choice. Some patients are open about it, while others prefer privacy. If you take enough time to heal before returning to social activities, people may simply think you look well-rested or happy. You're under no obligation to share.`,
        },
    ],
}

/**
 * FAQ section configuration for new beginning landing page
 */
export const newBeginningFaqConfig = {
    title: 'Questions About Your',
    subtitle: 'New Chapter',
    badge: 'Starting Fresh FAQ',
    description: `Get answers to what women starting a new chapter of life ask most about rejuvenation. Call us at ${siteConfig.contact.phoneDisplay} for a compassionate, no-pressure conversation.`,
}
