/**
 * BBL Miami Landing Page FAQ Data
 *
 * FAQ data specifically for the BBL landing page.
 * Organized by categories addressing BBL seekers' concerns:
 * - Safety: Critical for BBL marketing due to procedure risks
 * - Procedure: How it works, what to expect
 * - Results: Natural vs dramatic, longevity
 * - Recovery: Timeline, post-op care
 */
import { siteConfig } from '@/lib/data/site-config'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * BBL landing page FAQ categories
 */
export const bblFaqCategories: FaqCategory[] = [
    { id: 'safety', label: 'Safety' },
    { id: 'procedure', label: 'Procedure' },
    { id: 'results', label: 'Results' },
    { id: 'recovery', label: 'Recovery' },
]

/**
 * BBL landing page FAQ items organized by category
 */
export const bblFaqData: Record<string, FaqItem[]> = {
    safety: [
        {
            question: 'Is a BBL safe?',
            answer: `BBL safety depends entirely on the surgeon and facility. At Alluring, we use ultrasound-guided fat injection, which is the gold standard for safe BBL technique. This technology helps ensure fat is placed safely in the subcutaneous layer, not in or below the muscle. Our facility is AAAASF-accredited, and our surgeons follow all current safety protocols.`,
        },
        {
            question: 'What safety measures do you take during BBL surgery?',
            answer: `Our safety protocols include: ultrasound guidance during fat injection, limiting the total volume of fat transferred, using specialized cannulas designed for safe injection depth, board-certified anesthesiologists, AAAASF-accredited surgical facility, and comprehensive pre-operative health screening.`,
        },
        {
            question: 'Why is Miami considered the best place for a BBL?',
            answer: `Miami surgeons perform more BBLs than anywhere else in the world, which means more experience and refined techniques. Additionally, our high-volume practice allows us to invest in the latest safety technology like ultrasound guidance. We've seen what works and what doesn't across thousands of cases.`,
        },
        {
            question: "How do I know if I'm a good candidate for BBL?",
            answer: `Good BBL candidates have enough fat to harvest (typically at least 15-20 lbs to spare), are in good overall health, don't smoke, and have realistic expectations. During your consultation, we'll assess your anatomy, discuss your goals, and determine if BBL is right for you—or if another procedure might achieve your goals more safely.`,
        },
    ],
    procedure: [
        {
            question: 'How does a BBL work?',
            answer: `A Brazilian Butt Lift uses your own fat to enhance your buttocks. First, we perform liposuction to harvest fat from areas like your abdomen, back, and thighs. Then, that fat is purified and carefully injected into your buttocks to create fuller, rounder curves. You get the dual benefit of slimming where you don't want fat and adding it where you do.`,
        },
        {
            question: 'Where do you take the fat from?',
            answer: `We harvest fat from wherever you have excess—commonly the abdomen, flanks (love handles), back, and thighs. This is actually a major benefit of BBL: you get liposuction contouring in addition to buttock enhancement. Most patients love that their waist is slimmer while their curves are enhanced.`,
        },
        {
            question: "What if I don't have enough fat for a BBL?",
            answer: `During your consultation, we'll assess whether you have enough fat to achieve your goals. If you're very slim, we may recommend gaining some weight before surgery, or we might discuss alternative options like buttock implants. However, many patients are surprised by how much fat can be harvested—even from seemingly "thin" areas.`,
        },
        {
            question: 'How long does BBL surgery take?',
            answer: `A typical BBL takes 2-4 hours depending on the amount of liposuction needed and the volume of fat being transferred. You'll go home the same day after recovering from anesthesia. We recommend having someone drive you home and stay with you the first night.`,
        },
    ],
    results: [
        {
            question: 'Will my BBL results look natural?',
            answer: `Natural-looking results are our specialty. During your consultation, we'll discuss exactly the look you want—whether that's a subtle enhancement or more dramatic curves. We use 3D imaging to show you projected results before surgery. Many patients specifically choose us because they want to avoid the "overdone" look.`,
        },
        {
            question: 'How much bigger will my butt be after BBL?',
            answer: `Results vary based on how much fat you have to transfer and your body's unique response. On average, patients see a 1-2 size increase in clothing fit, with significant improvement in shape and projection. We'll give you a realistic expectation based on your specific anatomy during consultation.`,
        },
        {
            question: 'How long do BBL results last?',
            answer: `BBL results are long-lasting. After the initial healing period (during which some fat is naturally reabsorbed), the remaining fat cells are permanent. However, these cells can grow or shrink with weight changes. Maintaining a stable weight helps preserve your results for many years.`,
        },
        {
            question: 'What percentage of the fat survives?',
            answer: `Typically, 60-80% of the transferred fat survives permanently. We account for this by initially transferring more than the final desired volume. The survival rate depends on technique (our ultrasound-guided approach optimizes survival), your body's response, and how well you follow post-op instructions.`,
        },
    ],
    recovery: [
        {
            question: 'How long is BBL recovery?',
            answer: `Most patients take 2 weeks off work. You'll need to avoid sitting directly on your buttocks for 2-3 weeks (we provide a special BBL pillow). Light activity can resume after 2 weeks, but exercise and strenuous activity should wait 6-8 weeks. Full results are visible around 3-6 months.`,
        },
        {
            question: 'How do I sit after a BBL?',
            answer: `For the first 2-3 weeks, you'll either stand, lie on your side or stomach, or use a BBL pillow when sitting is unavoidable. The BBL pillow shifts your weight to your thighs, taking pressure off your buttocks. This protects the newly transferred fat cells while they establish blood supply.`,
        },
        {
            question: 'When can I exercise after BBL?',
            answer: `Light walking is encouraged from day one to prevent blood clots. After 2 weeks, you can increase walking intensity. Lower body exercises like squats and lunges should wait until 6-8 weeks minimum. We'll provide a detailed timeline based on your healing progress.`,
        },
        {
            question: 'Will I need to wear a compression garment?',
            answer: `Yes, you'll wear a compression garment for 6-8 weeks. This helps reduce swelling, supports healing, and helps your skin contract smoothly over your new contours. We provide your first garment, and you may need to purchase additional ones as you progress.`,
        },
    ],
}

/**
 * FAQ section configuration for BBL landing page
 */
export const bblFaqConfig = {
    title: 'BBL Questions',
    subtitle: 'Answered',
    badge: 'Brazilian Butt Lift FAQ',
    description: `Get answers to what women considering a BBL in Miami ask most. Still have questions? Call us at ${siteConfig.contact.phoneDisplay}.`,
}
