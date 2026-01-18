/**
 * Post-Weight Loss Landing Page FAQ Data
 *
 * FAQ data specifically for the after weight loss body contouring landing page.
 * Organized by categories addressing post-weight loss patients' concerns:
 * - Eligibility: Weight stability, timing after bariatric surgery
 * - Procedures: Body lift, tummy tuck, arm lift, thigh lift options
 * - Planning: Staged procedures, what to expect
 * - Recovery: Healing after major weight loss
 */
import { siteConfig } from '@/lib/data/site-config'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Post-weight loss landing page FAQ categories
 */
export const weightLossFaqCategories: FaqCategory[] = [
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'procedures', label: 'Procedures' },
    { id: 'planning', label: 'Planning' },
    { id: 'recovery', label: 'Recovery' },
]

/**
 * Post-weight loss landing page FAQ items organized by category
 */
export const weightLossFaqData: Record<string, FaqItem[]> = {
    eligibility: [
        {
            question:
                'How much weight do I need to lose before skin removal surgery?',
            answer: `There's no minimum weight loss requirement, but most patients seeking body contouring have lost 50+ pounds through bariatric surgery, diet, exercise, or a combination. The key factor is that you've achieved and can maintain a stable weight. We evaluate each patient individually during consultation.`,
        },
        {
            question: 'How long should my weight be stable before surgery?',
            answer: `We recommend maintaining a stable weight for at least 3-6 months before body contouring surgery. This ensures your body has settled and allows us to plan procedures that will give you long-lasting results. Continuing to lose significant weight after surgery can affect your results.`,
        },
        {
            question:
                'How soon after bariatric surgery can I have skin removal?',
            answer: `Most bariatric surgeons and plastic surgeons agree on waiting 12-18 months after gastric bypass or sleeve gastrectomy. This allows your weight to stabilize and ensures you're nutritionally healthy enough for another major surgery. We'll coordinate with your bariatric team if needed.`,
        },
        {
            question: 'Will my insurance cover skin removal after weight loss?',
            answer: `Some insurance plans cover skin removal if you have documented medical issues like chronic rashes, skin infections, or functional problems. However, coverage varies widely. We can provide documentation for your insurance company, but most body contouring is considered cosmetic and not covered.`,
        },
    ],
    procedures: [
        {
            question: 'What procedures remove loose skin after weight loss?',
            answer: `The most common procedures include: lower body lift (addresses abdomen, hips, thighs, and buttocks in one procedure), tummy tuck (abdominoplasty), arm lift (brachioplasty), thigh lift, breast lift, and liposuction. Your surgeon will recommend specific procedures based on where you have the most excess skin.`,
        },
        {
            question: 'What is a lower body lift?',
            answer: `A lower body lift, also called a belt lipectomy or circumferential body lift, is a comprehensive procedure that removes excess skin from the entire lower trunk—abdomen, hips, outer thighs, and buttocks. It's often the most transformative single procedure for post-weight loss patients.`,
        },
        {
            question: 'Can I have multiple procedures done at once?',
            answer: `Yes, but safety is our priority. Common combinations include tummy tuck with arm lift, or lower body lift with breast lift. However, very long surgeries increase risks. We may recommend staging your procedures—doing some now and others later—based on your health and the extent of work needed.`,
        },
        {
            question: 'Will I need liposuction too?',
            answer: `Often, yes. Even after major weight loss, some stubborn fat deposits may remain. Liposuction can refine your contours and complement skin removal procedures. We'll assess during your consultation whether liposuction would benefit your results.`,
        },
    ],
    planning: [
        {
            question: 'What is staged body contouring?',
            answer: `Staging means dividing your transformation into multiple surgeries performed months apart. For example, you might have a lower body lift first, recover for 3-6 months, then have an arm lift and breast lift. This approach reduces surgical risk and allows your body to heal optimally between procedures.`,
        },
        {
            question: 'How do you prioritize which procedures to do first?',
            answer: `We typically start with the area causing you the most physical discomfort or emotional distress. Many patients begin with the lower body lift since it addresses the largest area. Others prioritize arm lifts because they can't hide excess arm skin in clothing. We'll discuss your priorities during consultation.`,
        },
        {
            question: 'How long does the entire transformation take?',
            answer: `If staging is recommended, your complete transformation might span 12-24 months to allow for proper healing between procedures. However, many patients can achieve significant improvement with one or two surgeries. We'll create a personalized timeline during your consultation.`,
        },
        {
            question: 'What should I do to prepare for skin removal surgery?',
            answer: `Maintain your current weight, continue good nutrition (protein is especially important for healing), stop smoking at least 4-6 weeks before surgery, and follow any specific instructions from your bariatric team. We'll provide detailed preparation guidelines tailored to your situation.`,
        },
    ],
    recovery: [
        {
            question:
                'How long is recovery from body contouring after weight loss?',
            answer: `Recovery varies by procedure, but most patients take 2-4 weeks off work. Lower body lifts typically require the longest recovery (3-4 weeks), while arm lifts may only need 1-2 weeks. You'll have activity restrictions for 4-6 weeks and should avoid heavy lifting for 6-8 weeks.`,
        },
        {
            question: 'Will I have drains after surgery?',
            answer: `Yes, drains are typically placed during skin removal surgery to prevent fluid buildup. You'll go home with drains and learn how to care for them. Most drains are removed within 1-3 weeks, depending on how quickly your body heals and how much fluid they're collecting.`,
        },
        {
            question: 'Will there be a lot of scarring?',
            answer: `Yes, skin removal surgery does leave scars—you're trading excess skin for scars. However, we strategically place incisions to be hidden by underwear and clothing whenever possible. Scars fade significantly over 12-18 months, and we provide scar care guidance to optimize healing.`,
        },
        {
            question:
                'Is recovery harder after weight loss than for other patients?',
            answer: `Post-weight loss patients may need extra attention to nutrition and wound healing, especially if you've had bariatric surgery. We may recommend working with a nutritionist and may prescribe supplements to ensure optimal healing. Your history of major weight loss shows you have the dedication to succeed with recovery.`,
        },
    ],
}

/**
 * FAQ section configuration for post-weight loss landing page
 */
export const weightLossFaqConfig = {
    title: 'Questions After',
    subtitle: 'Weight Loss',
    badge: 'Body Contouring FAQ',
    description: `Get answers to what post-weight loss patients ask most about skin removal and body contouring. Call us at ${siteConfig.contact.phoneDisplay} for personalized guidance.`,
}
