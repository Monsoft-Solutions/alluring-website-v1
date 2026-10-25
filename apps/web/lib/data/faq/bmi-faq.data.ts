/**
 * The BMI page's FAQ (/bmi-calculator, #346).
 *
 * A data file because two surfaces read it: the visible FAQ (`ModuleFaq`)
 * and the page's `FAQPage` structured data, which must match it word for
 * word. Every figure comes from `lib/data/bmi/bmi.facts.ts`, and the copy
 * sweep (`check:procedure-copy --slug bmi-calculator`) checks them on the
 * built page.
 *
 * Questions follow how people search (Search Console, 90 days to
 * 2026-10-14) and don't repeat the page's section headings.
 */
import type { ProcedureFAQ } from '@/lib/types/procedure.type'

export const bmiFaqs: ProcedureFAQ[] = [
    {
        question: 'Is there a BMI limit for plastic surgery?',
        answer: 'No society sets one hard limit. For most body and breast procedures the published evidence points to a BMI under 30, and BMI 35 or under for breast reduction, because complications rise step by step with BMI. We encourage you to reach your range before surgery, and your surgeon decides case by case.',
    },
    {
        question: 'What is the ideal BMI for a BBL?',
        answer: "We recommend a BMI under 30 before a BBL. No society publishes a BBL-specific number, so the range follows the wider evidence on cosmetic surgery risk. Very lean patients face the opposite question, whether there's enough fat to transfer, which only an exam answers.",
    },
    {
        question: 'Can I get lipo 360 with a BMI over 30?',
        answer: "Sometimes, but we recommend reaching a BMI under 30 first. Liposuction isn't a weight-loss treatment, and studies tie a higher BMI and larger volumes to more complications. Tell us your BMI and your goals; your surgeon will tell you what applies to you and whether to lose weight first.",
    },
    {
        question: 'Can I get a tummy tuck with a BMI of 35?',
        answer: "It's possible, but it isn't what we recommend. In a study of 25,478 patients having a tummy tuck, a BMI of 30 or more was an independent risk factor for major complications. We encourage you to reach a BMI under 30 first, and your surgeon weighs your whole health case by case.",
    },
    {
        question: 'What should I weigh for a mommy makeover?',
        answer: "It depends on your height. We recommend a BMI under 30 before a mommy makeover, and the height and weight chart on this page shows the most you can weigh at each height to stay under it. ASPS lists being at your ideal body weight among the signs you're ready.",
    },
    {
        question: 'Does BMI matter for breast augmentation?',
        answer: 'Yes. We recommend a BMI under 30 before breast augmentation. Lower is better still: in 6,515 patients having cosmetic breast augmentation, complications in the first 30 days were 4.3% at a BMI of 25.2 or more and 1.3% below it. Your surgeon weighs that with your health and your goals.',
    },
    {
        question: 'Is there a BMI limit for breast reduction?',
        answer: "ASPS doesn't set one. The 2022 ASPS guideline on breast reduction tells surgeons to counsel patients that a BMI over 35 may mean a higher risk of complications, mainly infection and wound healing problems, and it offers surgery for symptoms rather than weight. We recommend a BMI of 35 or under before a breast reduction and decide case by case.",
    },
    {
        question: 'Why is BMI 30 the line for so many procedures?',
        answer: "Because that's where the evidence turns. In 127,961 patients having cosmetic surgery, 1.6% of those at BMI 18.5 to 24.9 had a major complication, against 3.1% at BMI 30 to 39.9. In patients having a tummy tuck, a BMI of 30 or more was an independent risk factor. Risk rises gradually, so the range is a recommendation, not a wall.",
    },
    {
        question: 'How long should my weight be stable before surgery?',
        answer: "After dramatic weight loss or bariatric surgery, The Aesthetic Society's guidance for a buttock lift is a stable weight for at least six months, with no further loss expected. For other procedures the societies ask for a stable weight without setting a number, so tell us your history and we'll plan the timing with you.",
    },
    {
        question: 'Can I have surgery while taking a GLP-1 medicine?',
        answer: "Often, yes, with planning. Because GLP-1 medicines slow how fast the stomach empties, anesthesia and surgery societies issued joint guidance in 2024: most patients can keep taking them before elective surgery, and those at highest risk may be asked to follow a liquid diet for 24 hours before. Follow your prescriber's and your surgeon's instructions.",
    },
    {
        question: 'Why does Florida law care about BMI?',
        answer: "Florida's office surgery rule allows surgery under deep sedation or general anesthesia in a doctor's office only for patients classed ASA I or II; ASA III and higher must have it in a hospital or an ambulatory surgery center. In the ASA's own examples, a BMI of 40 or more is class III.",
    },
    {
        question: 'Is BMI the only thing that decides if I can have surgery?',
        answer: "No. The CDC calls BMI a screening measure, and it doesn't measure body fat directly. Your surgeon also looks at your health conditions, whether you smoke, your skin, where your fat sits and your goals. Tell us where you are, and we'll tell you exactly what applies to you.",
    },
]
