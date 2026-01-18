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
            answer: `We recommend 3-6 months before your wedding for most procedures. This allows time for full healing, scar maturation, and any swelling to resolve. For more extensive procedures like mommy makeover, 6-9 months is ideal. During your consultation, we'll create a timeline specific to your procedure and wedding date.`,
        },
        {
            question: 'Is 3 months enough time before my wedding?',
            answer: `Three months is workable for less invasive procedures like breast augmentation, rhinoplasty, or liposuction. However, you should be fully healed with minimal swelling by your wedding day. We'll be honest if we think your timeline is too tight and may recommend waiting until after your honeymoon.`,
        },
        {
            question: 'What if my wedding is in 6+ months?',
            answer: `Six months or more is ideal timing! This gives you plenty of time to heal completely, for scars to fade, and to enjoy your results at dress fittings. You can finalize your dress size after your body has settled into its new shape. This is the perfect window for most bridal procedures.`,
        },
        {
            question: 'Can I have surgery after my wedding instead?',
            answer: `Absolutely! Some brides prefer to wait until after the wedding and honeymoon, especially for more involved procedures. This removes timeline pressure and lets you recover without wedding stress. You can still have your consultation now to plan for post-wedding surgery.`,
        },
    ],
    procedures: [
        {
            question: 'What are the most popular procedures for brides?',
            answer: `The most requested bridal procedures are: breast augmentation (to fill out strapless dresses), rhinoplasty (for perfect profile photos), liposuction (for stubborn areas that diet won't fix), skin treatments (for glowing skin), and lip enhancement. Many brides combine multiple procedures.`,
        },
        {
            question: 'Will breast augmentation affect my dress fitting?',
            answer: `Yes, that's why timing matters. We recommend having breast augmentation at least 3-4 months before your final dress fitting. Most brides have a preliminary dress fitting before surgery, then a final fitting after their results have settled. Your seamstress can make adjustments to fit your new figure perfectly.`,
        },
        {
            question: 'Can I have liposuction to fit into my dress?',
            answer: `Yes! Liposuction is popular for brides who have target areas that won't respond to diet and exercise. Common areas include the back (to smooth bra bulge in strapless gowns), arms, and waist. Results are visible within weeks, with final results at 3-6 months.`,
        },
        {
            question: 'What about non-surgical options for my wedding?',
            answer: `We offer non-surgical treatments that can enhance your wedding look with minimal downtime: dermal fillers, Botox, skin tightening treatments, and medical-grade facials. These can be done closer to your wedding date and are perfect for achieving that bridal glow.`,
        },
    ],
    recovery: [
        {
            question: 'Will my scars be visible in my wedding photos?',
            answer: `With proper timing (3-6 months), scars should be well-healed and significantly faded by your wedding day. We strategically place incisions to be hidden by most dress styles—under the breast fold, around the areola, or in natural body creases. We also provide scar care guidance to optimize healing.`,
        },
        {
            question: 'How long until swelling goes down completely?',
            answer: `Most swelling resolves within 2-4 weeks, but subtle swelling can persist for 3-6 months depending on the procedure. This is why we recommend surgery well in advance of your wedding. By the time you walk down the aisle, any residual swelling will be gone.`,
        },
        {
            question: 'Can I work out and maintain my figure after surgery?',
            answer: `Yes, but you'll need to wait 4-6 weeks to resume exercise after most procedures. Once cleared, you can continue your workout routine. Many brides find they're more motivated to maintain their results, which helps them stay in shape for the wedding and beyond.`,
        },
        {
            question: 'What about tanning or spray tans?',
            answer: `You should avoid sun exposure on healing incisions for 6-12 months to prevent darkening of scars. Spray tans are generally safe after 2-3 weeks but should avoid direct application on incision sites. We'll provide specific guidance based on your procedure and wedding timeline.`,
        },
    ],
    planning: [
        {
            question: 'Should I buy my dress before or after surgery?',
            answer: `We recommend having a preliminary fitting before surgery so you know what style you want. After surgery, wait 2-3 months for your body to settle, then have your final fittings. A good seamstress can adjust the dress to your new figure. Communicate your surgery plans with your bridal consultant.`,
        },
        {
            question:
                'How do I coordinate surgery with wedding planning stress?',
            answer: `Planning a wedding is stressful enough! We recommend scheduling surgery during a relatively calm period in your planning timeline—not right before a major vendor meeting or dress fitting. Recovery requires rest, so plan for 1-2 weeks of reduced activity and wedding planning.`,
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
