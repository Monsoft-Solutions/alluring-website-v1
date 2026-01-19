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
            answer: `The most popular procedures for men at our practice are: gynecomastia surgery (male breast reduction), liposuction for stubborn fat areas, rhinoplasty (nose reshaping), facelift and neck lift for aging concerns, and body contouring. Men typically want procedures that enhance their natural masculine features without looking "done."`,
        },
        {
            question: 'Is plastic surgery different for men than women?',
            answer: `Yes, male plastic surgery requires a different approach. Men have thicker skin, different fat distribution patterns, and distinct aesthetic goals. For example, male liposuction focuses on creating angular, athletic contours rather than curves. Our surgeons have extensive experience with male anatomy and aesthetics.`,
        },
        {
            question: 'Can I combine multiple procedures?',
            answer: `Yes, many men combine procedures to achieve comprehensive results in a single recovery period. Common combinations include gynecomastia surgery with liposuction, or facelift with neck lift and eyelid surgery. During your consultation, we'll discuss which combinations are safe and effective for your goals.`,
        },
        {
            question: 'Do many men get plastic surgery?',
            answer: `Absolutely. Men represent over 15% of all cosmetic procedures nationally, and that number grows every year. In our practice, we see men from all walks of life—executives, athletes, fitness enthusiasts, and professionals who want to look as good as they feel. Male cosmetic surgery has become completely mainstream.`,
        },
    ],
    gynecomastia: [
        {
            question: 'What is gynecomastia surgery?',
            answer: `Gynecomastia surgery (male breast reduction) removes excess breast tissue and/or fat from the male chest. Many men develop enlarged breast tissue due to hormones, genetics, medications, or weight fluctuations. No amount of diet or exercise can eliminate true gynecomastia—surgery is the only solution.`,
        },
        {
            question: 'How do I know if I have gynecomastia or just chest fat?',
            answer: `True gynecomastia involves actual breast gland tissue, which feels firm and is located directly behind the nipple. Chest fat (pseudogynecomastia) is softer and more evenly distributed. During your consultation, we'll examine you to determine whether you need gland excision, liposuction, or both for optimal results.`,
        },
        {
            question: 'Will gynecomastia surgery leave scars?',
            answer: `Incisions are strategically placed to minimize visible scarring. For liposuction-only cases, tiny incisions are hidden in natural creases. When gland excision is needed, incisions are made around the edge of the areola where they heal very discreetly. Most patients say their scars are virtually invisible within a year.`,
        },
        {
            question: 'Can gynecomastia come back after surgery?',
            answer: `When performed correctly, gynecomastia surgery provides permanent results. The breast gland tissue is removed and does not regenerate. However, significant weight gain, certain medications, or steroid use could cause recurrence. Maintaining a stable weight and avoiding known causes helps ensure lasting results.`,
        },
    ],
    results: [
        {
            question: 'Will my results look natural?',
            answer: `Natural-looking results are our priority for male patients. We focus on enhancing your masculine features—creating a flat, contoured chest, a defined jawline, or an athletic body shape. Our goal is for you to look like the best version of yourself, not like you had surgery.`,
        },
        {
            question: 'How long until I see final results?',
            answer: `You'll see improvement immediately, but final results typically appear at 3-6 months once all swelling has resolved. For procedures like gynecomastia surgery or liposuction, you'll notice dramatic improvement within weeks. Facial procedures may take longer for subtle swelling to completely subside.`,
        },
        {
            question: 'How long do results last?',
            answer: `Most male cosmetic surgery results are long-lasting or permanent. Gynecomastia surgery permanently removes breast tissue. Liposuction permanently removes fat cells. Facial procedures turn back the clock but don't stop aging—however, you'll always look younger than you would have without surgery.`,
        },
        {
            question: 'Will people be able to tell I had surgery?',
            answer: `Our approach focuses on natural-looking enhancement, not dramatic transformation. Most patients report that people notice they look better, more rested, or fitter—but can't pinpoint why. The goal is for you to look refreshed and confident, not "worked on."`,
        },
    ],
    recovery: [
        {
            question: 'How much time will I need off work?',
            answer: `Recovery time varies by procedure. Gynecomastia surgery: 3-5 days for desk work. Liposuction: 5-7 days. Facelift: 2 weeks. Many men schedule procedures before a vacation or work from home during initial recovery. We'll give you a specific timeline based on your procedure and job requirements.`,
        },
        {
            question: 'When can I return to the gym?',
            answer: `Light walking is encouraged immediately. Most patients can return to lower body workouts at 2 weeks. Upper body and core exercises typically resume at 4-6 weeks depending on the procedure. Full athletic activity is usually cleared at 6-8 weeks. We'll provide a detailed return-to-exercise plan.`,
        },
        {
            question: 'Is the recovery painful?',
            answer: `Most men describe recovery as more uncomfortable than painful—like the soreness after an intense workout. We prescribe appropriate pain medication for the first few days, but many patients transition to over-the-counter medications within 3-5 days. We prioritize your comfort throughout recovery.`,
        },
        {
            question: 'Will I need to wear compression garments?',
            answer: `Yes, compression garments are important for optimal results. For gynecomastia and liposuction, you'll wear a compression vest for 4-6 weeks. This reduces swelling, supports healing, and helps your skin conform to your new contours. Most men find it comfortable and discrete under clothing.`,
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
