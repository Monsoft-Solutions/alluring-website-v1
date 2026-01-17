/**
 * BMI Calculator FAQ Data
 *
 * Comprehensive FAQ data specifically for the BMI calculator page.
 * Covers BMI requirements, surgical candidacy, and procedure-specific questions.
 *
 * Research sources:
 * - beautybydrcat.com/blog/what-is-the-bmi-requirement-for-plastic-surgery
 * - vadoplasticsurgery.com/blog/is-there-a-bmi-requirement-for-plastic-surgery
 * - careagaplasticsurgery.com/blog/does-your-bmi-affect-your-plastic-surgery-candidacy
 * - frontrangeplasticsurgery.com/patient-information/bmi
 * - drglennlyle.com/blog/tummy-tuck-and-bmi
 */
import { siteConfig } from '@/lib/data/site-config'
import type { FaqItem } from '@/lib/types/shared/faq.type'

/**
 * BMI FAQ items
 */
export const bmiFaqData: FaqItem[] = [
    {
        question: 'What is the ideal BMI for plastic surgery?',
        answer: 'Most plastic surgeons consider patients with a BMI between 18 and 32 to be optimal candidates for cosmetic surgery. While many surgeons set their BMI requirement at 30 or below, some are comfortable working with patients up to BMI 35-40 depending on overall health. Patients in the "normal" range (18.5-24.9) typically have the lowest surgical risk and best outcomes. Our surgeons evaluate each patient individually.',
    },
    {
        question: 'Can I have plastic surgery if my BMI is over 30?',
        answer: 'Yes, many surgeons perform procedures on patients with BMI between 30-35, though additional health screenings are typically required. For patients with BMI 35-40 without major health problems, some procedures may be performed in a hospital setting for enhanced safety. Each practice sets its own guidelines—a patient turned down by one surgeon may be accepted by another. A consultation will determine your specific options.',
    },
    {
        question: 'How does BMI affect BBL surgery candidacy?',
        answer: 'For Brazilian Butt Lift (BBL) and combo procedures like BBL with breast augmentation, a BMI of 32 or less is typically recommended. Patients need adequate fat deposits for transfer, so those with BMI under 23 may not have enough donor fat. A BMI between 25-30 is often optimal, providing sufficient fat while maintaining safe surgical conditions. Your consultation will assess your fat distribution and candidacy.',
    },
    {
        question: 'What BMI do I need for a tummy tuck?',
        answer: "For tummy tucks (abdominoplasty) and combo procedures, most surgeons recommend a BMI of 32 or less, with many preferring 30 or below. Patients with BMI up to 35 may still be candidates if they have no underlying health problems, often with surgery performed in a hospital setting. It's important to note that tummy tucks are for body contouring, not weight loss—you should be close to your goal weight for best results.",
    },
    {
        question: 'Is BMI the only factor in surgical candidacy?',
        answer: 'No, BMI is just one of many factors we consider. We also evaluate your overall health, medical history, medications, smoking status, previous surgeries, and specific aesthetic goals. A patient with a higher BMI but excellent health may be a better candidate than someone with a lower BMI who has underlying health conditions. Your personalized consultation will assess all relevant factors.',
    },
    {
        question: 'How accurate is the BMI calculator?',
        answer: "The BMI calculator provides an estimate based on the standard formula (weight in kg divided by height in meters squared). While BMI is a useful screening tool, it doesn't account for muscle mass, bone density, age, sex, or fat distribution. Athletes and muscular individuals may have a high BMI despite low body fat. Our surgeons use BMI alongside other assessments for a complete picture.",
    },
    {
        question: 'What should I do if my BMI is too high for surgery?',
        answer: `If your BMI is above the recommended range for your desired procedure, don't be discouraged. We offer supportive consultations to discuss safe weight management strategies and timeline planning. Many patients successfully reach their target BMI with guidance and return for their procedures. Our team can connect you with nutritional resources and create a roadmap to your goals.`,
    },
    {
        question: 'Do you offer consultations for patients with higher BMIs?',
        answer: `Absolutely. We welcome patients at all stages of their journey. During your consultation, our board-certified surgeons will honestly assess your candidacy, discuss any modifications needed, and help you understand your options. Even if surgery isn't immediately recommended, we can create a plan to help you become a candidate in the future. Call ${siteConfig.contact.phoneDisplay} to schedule.`,
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
