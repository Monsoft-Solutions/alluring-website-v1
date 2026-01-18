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
            answer: `The reality is that most people won't even know—they'll just notice you look refreshed and vibrant. Modern techniques focus on natural rejuvenation, not dramatic changes. And frankly, at this stage of life, you've earned the right to do what makes you happy. This is about how YOU feel, not others' opinions.`,
        },
        {
            question: 'Is this the right time, or should I wait?',
            answer: `There's never a "perfect" time, but there are good times. Many patients find that a life transition—divorce, empty nest, retirement, career change—is actually an ideal time because they're already in a period of reinvention. If you're healthy and have realistic expectations, the right time is when you're ready.`,
        },
    ],
    procedures: [
        {
            question: 'What procedures help me look refreshed, not different?',
            answer: `For facial rejuvenation: mini facelift or full facelift, eyelid surgery (blepharoplasty), brow lift, neck lift, and non-surgical options like fillers and Botox. For body contouring: liposuction, tummy tuck, arm lift, breast lift. We specialize in natural results that make you look like a refreshed, well-rested version of yourself.`,
        },
        {
            question:
                "What's the difference between a mini facelift and a full facelift?",
            answer: `A mini facelift addresses mild to moderate sagging in the lower face and jowl area with smaller incisions and faster recovery (1-2 weeks). A full facelift addresses more significant sagging throughout the face and neck with longer-lasting results and 2-3 week recovery. During consultation, we'll recommend the best option for your goals.`,
        },
        {
            question: 'Can I combine facial and body procedures?',
            answer: `Yes, many patients choose to address multiple areas at once for a comprehensive transformation. Common combinations include facelift with eyelid surgery, or tummy tuck with breast lift. We'll discuss what can be safely combined based on your health and desired downtime.`,
        },
        {
            question: 'What about non-surgical options?',
            answer: `We offer many non-surgical treatments: Botox for wrinkles, dermal fillers for volume loss, skin tightening treatments, chemical peels, and laser treatments. These can be great standalone options or complement surgical procedures. Some patients start with non-surgical options and later choose surgery.`,
        },
    ],
    results: [
        {
            question: 'Will I still look like myself after a facelift?',
            answer: `Absolutely. Our goal is natural rejuvenation—you should look like a refreshed, well-rested version of yourself, not a different person. Modern facelift techniques restore youthful contours without the "pulled" or "windswept" look of outdated methods. Friends will notice you look great, not that you've had surgery.`,
        },
        {
            question: 'How many years younger will I look?',
            answer: `Most patients report looking 7-10 years younger after a facelift, though this varies by individual. More importantly, patients report feeling more confident and vibrant. We focus on helping you look like the best version of yourself rather than chasing a specific "age."`,
        },
        {
            question: 'How long do results last?',
            answer: `Facelift results typically last 7-10 years, though you'll continue to age naturally. Many patients feel they always look better than they would have without surgery. Body contouring results are permanent as long as you maintain a stable weight. We'll give you specific guidance based on your procedures.`,
        },
        {
            question: "What if I don't like my results?",
            answer: `This is why consultation is so important—we'll thoroughly discuss your goals, show you before/after photos, and ensure we're aligned on expectations. Most patients are thrilled with their results. In rare cases where adjustments are needed, we'll discuss revision options at your follow-up appointments.`,
        },
    ],
    lifestyle: [
        {
            question:
                'How much time do I need to take off from work and social life?',
            answer: `Recovery varies by procedure: facelift typically requires 2-3 weeks before you're comfortable in public, eyelid surgery about 1-2 weeks, and body contouring 2-4 weeks depending on extent. Many patients plan a "transformation vacation"—taking time off to heal and emerge refreshed without explaining their absence.`,
        },
        {
            question: 'Can I travel after surgery?',
            answer: `We recommend staying local for at least 1-2 weeks after most procedures to attend follow-up appointments and be close to your surgical team. After that, travel is usually fine, though you should avoid flying for the first 2 weeks after some procedures due to swelling concerns.`,
        },
        {
            question: 'How do I maintain my results long-term?',
            answer: `Sun protection is crucial—always wear sunscreen and protective clothing. Maintain a healthy weight, stay hydrated, don't smoke, and consider maintenance treatments like Botox, fillers, or skin treatments. Good skincare and healthy lifestyle habits help preserve your results for years.`,
        },
        {
            question: 'Should I tell people about my surgery?',
            answer: `This is entirely your choice. Some patients are open about it, while others prefer privacy. If you take enough time to heal before returning to social activities, most people won't suspect surgery—they'll just think you look well-rested or happy. You're under no obligation to share.`,
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
