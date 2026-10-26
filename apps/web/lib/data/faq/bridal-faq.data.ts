/**
 * Bridal Landing Page FAQ Data
 *
 * FAQ data specifically for the bridal/wedding landing page.
 * Organized by categories addressing brides-to-be concerns:
 * - Timing: When to have procedures relative to wedding date
 * - Procedures: Popular bridal procedures
 * - Recovery: Scar healing, being photo-ready
 * - Planning: Coordinating with wedding timeline
 */
import { siteConfig } from '@/lib/data/site-config'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Bridal landing page FAQ categories
 */
export const bridalFaqCategories: FaqCategory[] = [
    { id: 'timing', label: 'Timing' },
    { id: 'procedures', label: 'Procedures' },
    { id: 'recovery', label: 'Recovery' },
    { id: 'planning', label: 'Planning' },
]

/**
 * Bridal landing page FAQ items organized by category
 */
export const bridalFaqData: Record<string, FaqItem[]> = {
    timing: [
        {
            question:
                'How far before my wedding should I have plastic surgery?',
            answer: `For most procedures, plan surgery at least 3 to 6 months before your wedding, because most body procedures show their final result at about 3 to 6 months. For a bigger surgery such as a mommy makeover, leave more time, about 6 to 9 months. Your surgeon sets your timing at consultation.`,
        },
        {
            question: 'Is 3 months enough time before my wedding?',
            answer: `Three months is workable for some procedures, such as breast augmentation or liposuction. However, you should be fully healed with minimal swelling by your wedding day. We'll be honest if we think your timeline is too tight and may recommend waiting until after your honeymoon.`,
        },
        {
            question: 'What if my wedding is in 6+ months?',
            answer: `Six months or more gives you time to heal, for swelling to settle, and to enjoy your results at dress fittings. You can finalize your dress size after your body has settled into its new shape.`,
        },
        {
            question: 'Can I have surgery after my wedding instead?',
            answer: `Yes. Some brides prefer to wait until after the wedding and honeymoon, especially for more involved procedures. This removes timeline pressure and lets you recover without wedding stress. You can still have your consultation now to plan for post-wedding surgery.`,
        },
    ],
    procedures: [
        {
            question: 'What are the most popular procedures for brides?',
            answer: `The most requested bridal procedures are breast augmentation (to fill out strapless dresses) and liposuction (for stubborn areas that diet won't fix). Many brides combine procedures.`,
        },
        {
            question: 'Will breast augmentation affect my dress fitting?',
            answer: `Yes, that's why timing matters. Plan breast augmentation at least 3 to 4 months before your final dress fitting, so swelling has time to settle; your surgeon confirms the timing. Most brides have a preliminary dress fitting before surgery, then a final fitting after their results have settled. Your seamstress can adjust the dress to your new figure.`,
        },
        {
            question: 'Can I have liposuction to fit into my dress?',
            answer: `Yes. Liposuction is popular for brides who have target areas that won't respond to diet and exercise. Common areas include the back (to smooth bra bulge in strapless gowns), arms, and waist. Results are visible within weeks, with final results at 3-6 months.`,
        },
    ],
    recovery: [
        {
            question: 'Will my scars be visible in my wedding photos?',
            answer: `With 3 to 6 months, incisions are healed, but scars keep fading for a year or more (a tummy tuck scar lightens at around 12 to 18 months, Cindy Wu, MD, on the ASPS website). Incisions are placed where most dress styles cover them—under the breast fold, around the areola, or in natural body creases—and your surgeon can show you where yours will sit. We also provide scar care guidance.`,
        },
        {
            question: 'How long until swelling goes down completely?',
            answer: `Most swelling goes down in the first few weeks, and slight swelling can last several months, depending on the procedure. This is why we recommend surgery well in advance of your wedding.`,
        },
        {
            question: 'Can I work out and maintain my figure after surgery?',
            answer: `Yes. Exercise waits until your surgeon clears you: about 4 to 6 weeks after liposuction (The Aesthetic Society), 4 to 8 weeks after a tummy tuck (Cleveland Clinic) and 8 weeks after a BBL (The Aesthetic Society). Once cleared, you can continue your workout routine. Many brides find they're more motivated to maintain their results, which helps them stay in shape for the wedding and beyond.`,
        },
        {
            question: 'What about tanning or spray tans?',
            answer: `Keep healing scars out of the sun. Cleveland Clinic advises SPF 30 sunscreen on a tummy tuck scar for 12 to 18 months whenever you are in the sun. Ask your surgeon before a spray tan, and wait until your incisions have fully healed. We'll provide specific guidance based on your procedure and wedding timeline.`,
        },
    ],
    planning: [
        {
            question: 'Should I buy my dress before or after surgery?',
            answer: `We recommend having a preliminary fitting before surgery so you know what style you want. Have your final fittings once your surgeon says swelling has mostly settled, usually a few months after surgery. A good seamstress can adjust the dress to your new figure. Communicate your surgery plans with your bridal consultant.`,
        },
        {
            question:
                'How do I coordinate surgery with wedding planning stress?',
            answer: `Planning a wedding is stressful enough. We recommend scheduling surgery during a relatively calm period in your planning timeline—not right before a major vendor meeting or dress fitting. Recovery requires rest, so plan for about 1 to 3 weeks of reduced activity, depending on the procedure.`,
        },
        {
            question: 'Should my partner know about my procedure?',
            answer: `This is entirely your personal choice. Many brides are open with their partners, while others prefer to keep it private. Either way, you'll need someone to drive you home and help during recovery. If you choose not to tell your partner, consider enlisting a trusted friend or family member.`,
        },
        {
            question: 'What about my engagement photos?',
            answer: `If your engagement photos are scheduled before you've fully healed, let us know during your consultation. We can help you plan timing so you look your best for engagement photos, or you can schedule your photos after you've healed. Many photographers offer both engagement and "bridal boudoir" sessions.`,
        },
    ],
}

/**
 * FAQ section configuration for bridal landing page
 */
export const bridalFaqConfig = {
    title: 'Questions Every Bride',
    subtitle: 'Asks Us',
    badge: 'Bridal Consultation FAQ',
    description: `Get answers to what brides-to-be ask most about plastic surgery before their wedding. Call us at ${siteConfig.contact.phoneDisplay} to discuss your timeline.`,
}
