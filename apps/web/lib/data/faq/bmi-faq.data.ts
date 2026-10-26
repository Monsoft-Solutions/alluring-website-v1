/**
 * BMI Calculator FAQ Data
 *
 * Comprehensive FAQ data specifically for the BMI calculator page.
 * Covers BMI requirements, surgical candidacy, and procedure-specific questions.
 *
 * Figures come only from the procedure facts files (ASPS candidacy for
 * liposuction, Winocour 2015 for tummy tuck risk): no BMI cutoff is quoted,
 * because no source the practice relies on gives one (claims canon §7, #354).
 */
import { siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { FaqItem } from '@/lib/types/shared/faq.type'

/**
 * BMI FAQ items
 */
export const bmiFaqData: FaqItem[] = [
    {
        question: 'What is the ideal BMI for plastic surgery?',
        answer: 'There is no single BMI cutoff. ASPS describes liposuction candidates as adults within 30% of their ideal weight, and a large insurance-database study found higher tummy tuck risk with a BMI of 30 or more. Your surgeon evaluates each patient individually and decides at consultation.',
    },
    {
        question: 'Can I have plastic surgery if my BMI is over 30?',
        answer: 'Possibly. A BMI of 30 or more is a risk factor, not a cutoff: in an insurance-database study of 25,478 tummy tuck patients, major complications were more likely with a BMI of 30 or more (Winocour and colleagues, Plastic and Reconstructive Surgery, 2015). Your surgeon decides at consultation.',
    },
    {
        question: 'How does BMI affect BBL surgery candidacy?',
        answer: "A BBL needs enough donor fat to transfer, so your surgeon assesses your fat distribution and overall health at consultation and decides whether you're a candidate.",
    },
    {
        question: 'What BMI do I need for a tummy tuck?',
        answer: "ASPS asks for tummy tuck candidates to be at a stable weight and gives no BMI cutoff. In a large insurance-database study, risk was higher with a BMI of 30 or more (Winocour and colleagues, 2015). Your surgeon decides at consultation. It's important to note that tummy tucks are for body contouring, not weight loss—you should be close to your goal weight for best results.",
    },
    {
        question: 'Is BMI the only factor in surgical candidacy?',
        answer: 'No, BMI is just one of many factors we consider. We also evaluate your overall health, medical history, medications, smoking status, previous surgeries, and specific aesthetic goals. Your personalized consultation will assess all relevant factors.',
    },
    {
        question: 'How accurate is the BMI calculator?',
        answer: "The BMI calculator provides an estimate based on the standard formula (weight in kg divided by height in meters squared). While BMI is a useful screening tool, it doesn't account for muscle mass, bone density, age, sex, or fat distribution. Athletes and muscular individuals may have a high BMI despite low body fat. Your surgeon uses BMI alongside other assessments for a complete picture.",
    },
    {
        question: 'What should I do if my BMI is too high for surgery?',
        answer: `If your BMI is above the recommended range for your desired procedure, don't be discouraged. We offer supportive consultations to discuss safe weight management strategies and timeline planning. Our team can connect you with nutritional resources and create a roadmap to your goals.`,
    },
    {
        question: 'Do you offer consultations for patients with higher BMIs?',
        answer: `Yes. We welcome patients at all stages of their journey. During your consultation, ${KARLINSKY_NAME} will honestly assess your candidacy, discuss any modifications needed, and help you understand your options. Even if surgery isn't immediately recommended, we can create a plan to help you become a candidate in the future. Call ${siteConfig.contact.phoneDisplay} to schedule.`,
    },
    {
        question: 'Can weight fluctuations after surgery affect my results?',
        answer: 'Yes, significant weight changes after surgery can impact your results. We recommend being at a stable weight you can maintain before undergoing cosmetic procedures. For body contouring procedures like liposuction or tummy tucks, weight gain can diminish results, while weight loss may create loose skin. Your surgeon will discuss realistic expectations and maintenance strategies.',
    },
    {
        question:
            'Why do different procedures have different BMI requirements?',
        answer: 'Different procedures have varying BMI guidelines because of their specific risks and technical requirements. Procedures involving larger incisions or longer anesthesia times may require stricter BMI limits. Some procedures, like BBL, require adequate fat reserves. Your surgeon will explain the specific considerations for your desired procedure during your consultation.',
    },
]

/**
 * FAQ section configuration for BMI calculator page
 */
export const bmiFaqConfig = {
    title: 'BMI & Plastic Surgery Questions',
    description:
        'Everything you need to know about how BMI affects your cosmetic surgery candidacy at Alluring Plastic Surgery.',
}
