/**
 * Procedures Page FAQ Data
 *
 * FAQ data specifically tailored for the procedures page.
 * Focuses on helping visitors choose the right procedure,
 * understand safety, costs, and recovery to drive consultations.
 *
 * Content Strategy:
 * - Address pain points: safety, cost, recovery, results
 * - Reinforce "Luxury Made Affordable" positioning
 * - Guide toward booking a consultation
 * - Support out-of-town/medical tourism visitors
 */

import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'
import { getFinancingPartnersString } from '@/lib/data/site-config'

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
            answer: "That's exactly what your consultation is for. You'll first speak with one of our dedicated Specialists who will discuss your goals, answer your questions, and guide you through the entire process. They'll help you understand your options and prepare you for a thorough evaluation with our board-certified surgeon. There's no one-size-fits-all approach; every treatment plan is customized to you.",
        },
        {
            question: 'What procedures do you specialize in?',
            answer: 'We specialize in a comprehensive range of body contouring and facial procedures including Brazilian Butt Lift (BBL), Breast Augmentation, Breast Lift, Breast Reduction, Tummy Tuck, Liposuction, Mommy Makeover, Facelift, Rhinoplasty, and Blepharoplasty (eyelid surgery). Our surgeons have performed thousands of these procedures with exceptional results.',
        },
        {
            question: 'Can I combine multiple procedures in one surgery?',
            answer: 'Yes, combining procedures is very common and can be more cost-effective. Popular combinations include the Mommy Makeover (tummy tuck + breast procedure), BBL with liposuction, or breast augmentation with a lift. Your Specialist will walk you through the options, and your surgeon will ultimately determine if combining procedures is safe and appropriate for your goals.',
        },
        {
            question:
                "How do I know if I'm a good candidate for cosmetic surgery?",
            answer: "Ideal candidates are in good overall health, maintain a stable weight, don't smoke (or are willing to quit), and have realistic expectations. Certain medical conditions may require additional evaluation. The best way to know for sure is to schedule a consultation—our Specialist will review your health history and goals with you to help determine the best path forward.",
        },
        {
            question:
                "What if I'm not sure what I want—can I still book a consultation?",
            answer: "Absolutely. Many patients come in with general goals like 'I want to look more youthful' or 'I'm unhappy with my midsection' without knowing the specific procedure. Our Specialists are experts at understanding your vision and guiding you toward the right options. That's what consultations are for—we're here to help you discover what's possible.",
        },
    ],
    safety: [
        {
            question: 'Are your surgeons board-certified?',
            answer: 'Yes. Our surgeons are board-certified and specialize specifically in cosmetic and plastic surgery procedures. They maintain the highest standards of training, continuing education, and surgical excellence. You can verify credentials and learn more about each surgeon on our website.',
        },
        {
            question: 'Is your surgical facility accredited?',
            answer: 'Yes. All procedures are performed in our state-of-the-art surgical facility right here in Miami by Double Board-Certified surgeons. Our facility meets rigorous safety protocols, equipment standards, and staff qualifications.',
        },
        {
            question: 'What type of anesthesia do you use?',
            answer: 'We use general anesthesia administered exclusively by board-certified MD anesthesiologists—never nurse anesthetists working without physician supervision. Your safety during surgery is our non-negotiable priority, which is why we only work with the most qualified anesthesia professionals.',
        },
        {
            question: 'What safety protocols do you follow?',
            answer: 'We follow strict safety protocols including comprehensive pre-operative health screenings, state-of-the-art monitoring equipment, proper patient selection criteria, and evidence-based surgical techniques. Our facility maintains emergency equipment and protocols, and our entire team is trained in advanced life support.',
        },
        {
            question: 'How do you minimize surgical risks?',
            answer: "Risk minimization starts with proper patient selection—we thoroughly evaluate your health to ensure you're a safe candidate. We use proven surgical techniques, limit operating times appropriately, and provide detailed pre- and post-operative instructions. Our surgeons never compromise safety for results.",
        },
    ],
    results: [
        {
            question: 'How long will my results last?',
            answer: 'Results vary by procedure, but most are designed to be long-lasting. BBL and breast augmentation results can last 10+ years. Facelift results typically last 7-10 years. The key to maintaining your results is a stable weight and healthy lifestyle. Your Specialist will discuss realistic expectations for your specific procedure during your consultation.',
        },
        {
            question: 'Will my results look natural?',
            answer: "Natural-looking results are our signature. We believe the best cosmetic surgery is the kind no one can tell you've had—you simply look like the best version of yourself. Our surgeons take an artistic approach, respecting your natural proportions while enhancing your features.",
        },
        {
            question: 'When will I see my final results?',
            answer: "You'll see immediate improvement, but final results develop over time as swelling resolves. For most body procedures, expect 3-6 months for final results. Facial procedures may settle in 6-12 months. We'll provide a timeline specific to your procedure and track your progress at follow-up appointments.",
        },
        {
            question: 'Can I see before and after photos?',
            answer: "Yes, we maintain an extensive gallery of before and after photos from real patients. Your Specialist can show you results from patients with similar anatomy and goals during your consultation. This helps set realistic expectations and gives you confidence in what's achievable.",
        },
        {
            question: "What if I'm not happy with my results?",
            answer: "Patient satisfaction is our priority. We set clear expectations during consultation so you know exactly what to expect. In the rare case that results don't meet expectations, we work with you to address any concerns. Many issues resolve naturally as healing progresses; others may be addressed with minor revisions.",
        },
    ],
    cost: [
        {
            question: 'Do you offer financing options?',
            answer: `Yes—we believe luxury results should be accessible. We partner with ${getFinancingPartnersString()} to offer flexible monthly payment plans, many with promotional 0% interest periods for qualified applicants. Our patient coordinator can help you explore options that fit your budget.`,
        },
        {
            question: "What's included in the procedure price?",
            answer: 'Our pricing is transparent and comprehensive. Your quote typically includes surgeon fees, anesthesia, facility fees, and standard post-operative care. Your Specialist will provide a detailed breakdown during your consultation so there are no surprises. Some items like compression garments or special post-op supplies may be additional.',
        },
        {
            question: 'Is there a consultation fee?',
            answer: "No, consultations are completely free. We believe in making it easy for you to explore your options and get personalized guidance from our Specialists without any upfront cost. During your free consultation, you'll receive undivided attention and a thorough evaluation to help you make informed decisions about your procedure.",
        },
        {
            question: 'Do you offer package pricing for multiple procedures?',
            answer: 'Yes, combining procedures often provides savings compared to having them separately. Packages like our Mommy Makeover bundle multiple procedures at a combined rate. Your Specialist will discuss all options and provide pricing for both individual and combined procedures during your consultation.',
        },
        {
            question: 'Does insurance cover cosmetic surgery?',
            answer: "Elective cosmetic procedures are typically not covered by insurance. However, certain reconstructive components—like hernia repair during a tummy tuck or functional rhinoplasty for breathing issues—may be partially covered depending on your policy. We can provide documentation if you'd like to check with your insurance provider.",
        },
    ],
    recovery: [
        {
            question: 'How long will I need to take off work?',
            answer: 'Recovery time varies by procedure. For BBL or Mommy Makeover, plan for 2 weeks off. Breast augmentation patients often return to desk work in 5-7 days. Facial procedures typically require 1-2 weeks before returning to public activities. Your Specialist will provide a customized recovery timeline during your consultation.',
        },
        {
            question: "I'm traveling from out of town—when can I fly home?",
            answer: "For most procedures, we recommend staying in Miami for 7-10 days post-surgery for initial follow-up appointments and to ensure you're healing well before flying. For procedures like BBL, you may need special seating arrangements for your flight. Our concierge team helps out-of-town patients plan every detail.",
        },
        {
            question: 'Do you offer recovery accommodations?',
            answer: 'Yes, we partner with luxury recovery suites in Miami that provide 24/7 nursing care, medication management, healthy meals, and transportation to follow-up appointments. These facilities offer a hotel-like experience with medical-grade support. Our concierge can handle all booking details for you.',
        },
        {
            question: 'What aftercare and support do you provide?',
            answer: "Your care doesn't end when surgery does. We provide detailed post-operative instructions, prescribed medications, compression garments (if needed), and scheduled follow-up appointments. Our team is available by phone for any questions or concerns during your recovery. Many patients say our aftercare is what sets us apart.",
        },
        {
            question: 'When can I exercise again after surgery?',
            answer: 'Light walking is encouraged immediately to promote circulation. Most patients can resume light cardio at 3-4 weeks and return to full workouts, including heavy lifting, at 6 weeks. Specific restrictions vary by procedure—your surgeon will provide a detailed activity timeline for your recovery plan.',
        },
    ],
}
