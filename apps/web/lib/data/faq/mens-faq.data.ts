/**
 * Men's Plastic Surgery Landing Page FAQ Data
 *
 * FAQ data specifically for the men's cosmetic surgery landing page.
 * Organized by categories addressing men's primary concerns:
 * - Procedures: Common procedures for men
 * - Gynecomastia: Male breast reduction (top concern)
 * - Results: Natural, masculine outcomes
 * - Recovery: Downtime, return to gym
 */
import { siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Men's landing page FAQ categories
 */
export const mensFaqCategories: FaqCategory[] = [
    { id: 'procedures', label: 'Procedures' },
    { id: 'gynecomastia', label: 'Gynecomastia' },
    { id: 'results', label: 'Results' },
    { id: 'recovery', label: 'Recovery' },
]

/**
 * Men's landing page FAQ items organized by category
 */
export const mensFaqData: Record<string, FaqItem[]> = {
    procedures: [
        {
            question: 'What cosmetic procedures are most popular for men?',
            answer: `Procedures men often ask about at Alluring include gynecomastia surgery (male breast reduction), liposuction, face and neck lift, and body contouring. Men typically want procedures that enhance their natural masculine features without looking "done."`,
        },
        {
            question: 'Is plastic surgery different for men than women?',
            answer: `Yes, male plastic surgery requires a different approach. Men have thicker skin, different fat distribution patterns, and distinct aesthetic goals. For example, male liposuction focuses on creating angular, athletic contours rather than curves. One surgeon, ${KARLINSKY_NAME}, performs every procedure at Alluring and plans male procedures around these differences.`,
        },
        {
            question: 'Can I combine multiple procedures?',
            answer: `Yes, many men combine procedures to achieve comprehensive results in a single recovery period. Common combinations include gynecomastia surgery with liposuction, or facelift with neck lift and eyelid surgery. During your consultation, we'll discuss which combinations are safe and effective for your goals.`,
        },
        {
            question: 'Do many men get plastic surgery?',
            answer: `Yes. In our practice, we see men from all walks of life—executives, athletes, fitness enthusiasts, and professionals who want to look as good as they feel.`,
        },
    ],
    gynecomastia: [
        {
            question: 'What is gynecomastia surgery?',
            answer: `Gynecomastia surgery (male breast reduction) removes excess breast tissue and/or fat from the male chest. Many men develop enlarged breast tissue due to hormones, genetics, medications, or weight fluctuations. Diet and exercise can't remove glandular breast tissue, so when true gynecomastia persists, surgery is the usual treatment.`,
        },
        {
            question: 'How do I know if I have gynecomastia or just chest fat?',
            answer: `True gynecomastia involves actual breast gland tissue, which feels firm and is located directly behind the nipple. Chest fat (pseudogynecomastia) is softer and more evenly distributed. During your consultation, we'll examine you to determine whether you need gland excision, liposuction, or both.`,
        },
        {
            question: 'Will gynecomastia surgery leave scars?',
            answer: `Incisions are placed to keep scars discreet. For liposuction-only cases, tiny incisions are hidden in natural creases. When gland excision is needed, incisions are made around the edge of the areola where they tend to heal discreetly. Scars usually fade over the first year, and your surgeon gives you scar-care guidance.`,
        },
        {
            question: 'Can gynecomastia come back after surgery?',
            answer: `Gynecomastia surgery results are long-lasting. The breast gland tissue is removed and does not regenerate. However, significant weight gain, certain medications, or steroid use could cause recurrence. Maintaining a stable weight and avoiding known causes helps ensure lasting results.`,
        },
    ],
    results: [
        {
            question: 'Will my results look natural?',
            answer: `Natural-looking results are our priority for male patients. We focus on enhancing your masculine features—creating a flat, contoured chest, a defined jawline, or an athletic body shape. Our goal is for you to look like yourself, refreshed, not like you had surgery.`,
        },
        {
            question: 'How long until I see final results?',
            answer: `You'll see improvement immediately, but final results typically appear at 3-6 months once all swelling has resolved. For procedures like gynecomastia surgery or liposuction, you'll notice a clear improvement within weeks. Facial procedures may take longer for subtle swelling to completely subside.`,
        },
        {
            question: 'How long do results last?',
            answer: `Most male cosmetic surgery results are long-lasting. Gynecomastia surgery removes the excess breast tissue, and the results are long-lasting. Liposuction permanently removes fat cells, Cleveland Clinic says, as long as you keep a stable weight. Facial procedures don't stop aging, and you'll continue to age naturally.`,
        },
        {
            question: 'Will people be able to tell I had surgery?',
            answer: `Our approach focuses on natural-looking enhancement, not dramatic transformation. The goal is for you to look refreshed and confident, not "worked on."`,
        },
    ],
    recovery: [
        {
            question: 'How much time will I need off work?',
            answer: `Recovery time varies by procedure. Liposuction: within a few days, depending on your job (The Aesthetic Society), or weeks 2 to 3 (ASPS). Facelift: about 2 to 3 weeks. Gynecomastia: your surgeon gives you your timeline at consultation. Many men schedule procedures before a vacation or work from home during initial recovery. We'll give you a specific timeline based on your procedure and job requirements.`,
        },
        {
            question: 'When can I return to the gym?',
            answer: `Walking starts right away. Strenuous exercise waits about 4 to 6 weeks after liposuction (The Aesthetic Society). Your surgeon tells you when you can lift and train fully.`,
        },
        {
            question: 'Is the recovery painful?',
            answer: `Most men describe recovery as more uncomfortable than painful—like the soreness after an intense workout. Your surgeon prescribes pain medicine for the first days and tells you when to switch to over-the-counter relief. We prioritize your comfort throughout recovery.`,
        },
        {
            question: 'Will I need to wear compression garments?',
            answer: `Yes, compression garments are part of recovery. For gynecomastia and liposuction, you'll wear a compression vest for about 4 to 6 weeks, or as your surgeon directs. This reduces swelling, supports healing, and helps your skin conform to your new contours. Most men find it comfortable and discrete under clothing.`,
        },
    ],
}

/**
 * FAQ section configuration for men's landing page
 */
export const mensFaqConfig = {
    title: "Men's Surgery",
    subtitle: 'Questions Answered',
    badge: "Men's Cosmetic Surgery FAQ",
    description: `Get answers to what men considering cosmetic surgery in Miami ask most. Still have questions? Call us at ${siteConfig.contact.phoneDisplay}.`,
}
