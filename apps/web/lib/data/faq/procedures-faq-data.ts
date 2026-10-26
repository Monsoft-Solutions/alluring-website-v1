/**
 * Procedures Page FAQ Data
 *
 * FAQ data specifically tailored for the procedures page.
 * Focuses on helping visitors choose the right procedure,
 * understand safety, costs, and recovery to drive consultations.
 *
 * Content Strategy:
 * - Address pain points: safety, cost, recovery, results
 * - Follow the claims canon (docs/claims/canon.md, #354)
 * - Guide toward booking a consultation
 * - Support patients travelling in from other US states
 */

import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'
import { FINANCING_SENTENCE_LONG } from '@workspace/shared/claims/financing'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * Procedures page FAQ categories
 * Ordered by conversion priority - procedures first to help with decision,
 * safety to build trust, then practical concerns
 */
export const faqCategoriesProcedures: FaqCategory[] = [
    { id: 'procedures', label: 'Procedures' },
    { id: 'safety', label: 'Safety' },
    { id: 'results', label: 'Results' },
    { id: 'cost', label: 'Cost & Financing' },
    { id: 'recovery', label: 'Recovery' },
]

/**
 * Procedures page FAQ data organized by category
 */
export const faqDataProcedures: Record<string, FaqItem[]> = {
    procedures: [
        {
            question: 'How do I know which procedure is right for me?',
            answer: `That's exactly what your consultation is for. You'll first speak with one of our dedicated Specialists who will discuss your goals, answer your questions, and guide you through the entire process. They'll help you understand your options and prepare you for a thorough evaluation with ${KARLINSKY_NAME}. There's no one-size-fits-all approach; every treatment plan is customized to you.`,
        },
        {
            question: 'What procedures do you specialize in?',
            answer: `We specialize in body contouring and facial procedures, including Brazilian Butt Lift (BBL), Breast Augmentation, Breast Lift, Breast Reduction, Tummy Tuck, Liposuction, Mommy Makeover, Facelift, and Blepharoplasty (eyelid surgery). One surgeon, ${KARLINSKY_NAME}, performs every procedure at Alluring.`,
        },
        {
            question: 'Can I combine multiple procedures in one surgery?',
            answer: 'Yes, and combining them in one surgery lowers the total. Popular combinations include the Mommy Makeover (tummy tuck + breast procedure), BBL with liposuction, or breast augmentation with a lift. Your Specialist will walk you through the options, and your surgeon will ultimately determine if combining procedures is safe and appropriate for your goals.',
        },
        {
            question:
                "How do I know if I'm a good candidate for cosmetic surgery?",
            answer: "Ideal candidates are in good overall health, maintain a stable weight, don't smoke (or are willing to quit), and have realistic expectations. Certain medical conditions may require additional evaluation. The best way to know is a consultation, where Dr. Karlinsky reviews your health history and goals and decides whether surgery is right for you.",
        },
        {
            question:
                "What if I'm not sure what I want—can I still book a consultation?",
            answer: "Absolutely. Many patients come in with general goals like 'I want to look more youthful' or 'I'm unhappy with my midsection' without knowing the specific procedure. Our Specialists listen to your goals and walk you through the options, and your surgeon decides what's right for you at consultation. That's what consultations are for—we're here to help you discover what's possible.",
        },
    ],
    safety: [
        {
            question: "What are your surgeon's credentials?",
            answer: `${KARLINSKY_NAME} performs every surgery at Alluring. ${KARLINSKY_CREDENTIALS}`,
        },
        {
            question: 'What type of anesthesia do you use?',
            answer: 'Most procedures are done under general anesthesia; liposuction and eyelid surgery can also be done under local anesthesia with sedation. An anesthesia provider monitors you throughout surgery, and your surgeon explains your plan at consultation.',
        },
        {
            question: 'What safety protocols do you follow?',
            answer: 'We follow strict safety protocols including comprehensive pre-operative health screenings, proper patient selection criteria, and evidence-based surgical techniques.',
        },
        {
            question: 'How do you minimize surgical risks?',
            answer: "Risk minimization starts with proper patient selection—we thoroughly evaluate your health to ensure you're a safe candidate. We use proven surgical techniques, limit operating times appropriately, and provide detailed pre- and post-operative instructions.",
        },
    ],
    results: [
        {
            question: 'How long will my results last?',
            answer: 'Results vary by procedure, and most are long-lasting. The key to maintaining your results is a stable weight and healthy lifestyle. Your Specialist will discuss realistic expectations for your specific procedure during your consultation.',
        },
        {
            question: 'Will my results look natural?',
            answer: 'Natural-looking results are the goal. Dr. Karlinsky plans around your natural proportions while enhancing your features.',
        },
        {
            question: 'When will I see my final results?',
            answer: "You'll see immediate improvement, but final results develop over time as swelling resolves. Most body procedures show their final result at about 3 to 6 months. Facial swelling can take several months to settle fully. We'll provide a timeline specific to your procedure and track your progress at follow-up appointments.",
        },
        {
            question: 'Can I see before and after photos?',
            answer: "Yes. Our gallery has before and after photos from real patients. Your Specialist can show you results from patients with similar anatomy and goals during your consultation. This helps set realistic expectations and gives you confidence in what's achievable.",
        },
        {
            question: "What if I'm not happy with my results?",
            answer: "Patient satisfaction is our priority. We set clear expectations during consultation so you know exactly what to expect. If results don't meet expectations, we work with you to address any concerns. Many issues resolve naturally as healing progresses; others may be addressed with minor revisions.",
        },
    ],
    cost: [
        {
            question: 'Do you offer financing options?',
            answer: `Yes. ${FINANCING_SENTENCE_LONG} Our patient coordinator can go through the options with you.`,
        },
        {
            question: "What's included in the procedure price?",
            answer: 'Your price is set for you after an exam, and Dr. Karlinsky confirms it at consultation. Your Specialist goes through what your quote covers with you.',
        },
        {
            question: 'Is there a consultation fee?',
            answer: 'No. Consultations are free, so you can explore your options and get personalized guidance from our Specialists with no obligation to book surgery.',
        },
        {
            question: 'Do you offer package pricing for multiple procedures?',
            answer: 'Yes. [[combo-discount]] Your Specialist will discuss all options and provide pricing for both individual and combined procedures during your consultation.',
        },
        {
            question: 'Does insurance cover cosmetic surgery?',
            answer: "Elective cosmetic procedures are typically not covered by insurance. However, certain reconstructive components—like hernia repair during a tummy tuck—may be partially covered depending on your policy. We can provide documentation if you'd like to check with your insurance provider.",
        },
    ],
    recovery: [
        {
            question: 'How long will I need to take off work?',
            answer: 'It depends on the procedure. After a BBL, most people return to desk work in 10 to 14 days, sitting on a pillow (Cleveland Clinic, The Aesthetic Society); ASPS says some go back between days 7 and 10. After a mommy makeover, plan on about 2 to 3 weeks. After breast augmentation, most people are back to light activity in about a week. After a facelift, plan on about 2 to 3 weeks, and after eyelid surgery most people are back at work in 7 to 10 days. Your surgeon gives you your own timeline.',
        },
        {
            question: "I'm traveling from out of town—when can I fly home?",
            answer: "After a BBL, plan on 7 to 10 days in Miami, so you can be seen for follow-up and cleared before you fly. For other procedures, your surgeon tells you how many nights to stay before you're cleared to fly home. On the flight home after a BBL, get up and walk for 5 to 10 minutes for every hour you sit (ASPS's article on traveling after a BBL). We confirm your dates in writing before you book a ticket — you arrange the travel itself.",
        },
        {
            question: 'Do you offer recovery accommodations?',
            answer: 'No. We do not operate recovery accommodation and we are not affiliated with any recovery house, so we cannot book one for you or vouch for one. Patients arrange their own stay. What we provide is the clinical side: your follow-up appointments, written post-op instructions, and a number to call if something does not look right.',
        },
        {
            question: 'What aftercare and support do you provide?',
            answer: "Your care doesn't end when surgery does. We provide detailed post-operative instructions, prescribed medications, and scheduled follow-up appointments. Our team is available by phone for any questions or concerns during your recovery.",
        },
        {
            question: 'When can I exercise again after surgery?',
            answer: 'Walking starts right away. Strenuous exercise waits until your surgeon clears you: about 4 to 6 weeks after liposuction (The Aesthetic Society), 4 to 8 weeks after a tummy tuck (Cleveland Clinic) and 8 weeks after a BBL (The Aesthetic Society).',
        },
    ],
}
