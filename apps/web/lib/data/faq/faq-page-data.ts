/**
 * FAQ Page Data
 *
 * Comprehensive FAQ data for the dedicated FAQ page at /faq.
 * Organized by patient journey stage to address concerns at every
 * decision-making point.
 *
 * Content Strategy:
 * - Address common objections: safety, cost, recovery, results
 * - Reinforce "Luxury Made Affordable" positioning
 * - Support both local and out-of-town patients
 * - Guide toward booking a consultation
 */

import type {
    FaqCategory,
    FaqItem,
    FaqCtaConfig,
} from '@/lib/types/shared/faq.type'
import { getFinancingPartnersString, siteConfig } from '@/lib/data/site-config'

/**
 * FAQ page categories
 * Ordered by patient journey: awareness → consideration → decision
 */
export const faqPageCategories: FaqCategory[] = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'procedures', label: 'Procedures' },
    { id: 'safety', label: 'Safety & Credentials' },
    { id: 'results', label: 'Results' },
    { id: 'cost', label: 'Cost & Financing' },
    { id: 'recovery', label: 'Recovery' },
]

/**
 * Comprehensive FAQ data organized by category
 */
export const faqPageData: Record<string, FaqItem[]> = {
    'getting-started': [
        {
            question: 'How do I schedule a consultation?',
            answer: 'You can request a consultation via our online form, WhatsApp concierge, or by calling our Miami office directly. We offer both in-person appointments and virtual consultations for our out-of-town patients.',
        },
        {
            question: 'What happens during a consultation?',
            answer: "Your consultation is a private, unhurried conversation with our board-certified surgeon. We'll discuss your goals, examine the areas you'd like to address, review your medical history, and create a personalized treatment plan. You'll receive a detailed quote and have all your questions answered—no pressure, just clarity.",
        },
        {
            question: 'How long does a consultation take?',
            answer: 'Plan for 45-60 minutes. We never rush our consultations because we believe understanding your vision is the foundation of exceptional results. Some patients finish sooner, but we always allocate enough time for a thorough discussion.',
        },
        {
            question: 'Do you offer virtual consultations?',
            answer: "Yes! We offer secure video consultations for patients who can't visit our Miami office in person. Virtual consultations are perfect for initial discussions, procedure education, and treatment planning. Many out-of-town patients complete their virtual consult first, then fly in for their surgery.",
        },
        {
            question: 'Do I need a referral from my doctor?',
            answer: 'No, cosmetic procedures generally do not require a referral. However, we will conduct a thorough health history review to ensure you are a safe candidate for surgery.',
        },
        {
            question:
                "How do I know if I'm a good candidate for cosmetic surgery?",
            answer: "Ideal candidates are in good overall health, maintain a stable weight, don't smoke (or are willing to quit), and have realistic expectations. Certain medical conditions may require additional evaluation. The best way to know for sure is to schedule a consultation—our team will review your health history and goals with you.",
        },
    ],
    procedures: [
        {
            question: 'What procedures do you specialize in?',
            answer: 'We specialize in a comprehensive range of body contouring and facial procedures including Brazilian Butt Lift (BBL), Breast Augmentation, Breast Lift, Breast Reduction, Tummy Tuck, Liposuction, Mommy Makeover, Facelift, and Blepharoplasty (eyelid surgery). Our surgeons have performed thousands of these procedures with exceptional results.',
        },
        {
            question: 'How do I know which procedure is right for me?',
            answer: "That's exactly what your consultation is for. You'll speak with one of our dedicated Specialists who will discuss your goals, answer your questions, and guide you through the entire process. They'll help you understand your options and prepare you for a thorough evaluation with our board-certified surgeon. Every treatment plan is customized to you.",
        },
        {
            question: 'Can I combine multiple procedures in one surgery?',
            answer: 'Yes, combining procedures is very common and can be more cost-effective. Popular combinations include the Mommy Makeover (tummy tuck + breast procedure), BBL with liposuction, or breast augmentation with a lift. Your surgeon will determine if combining procedures is safe and appropriate for your goals.',
        },
        {
            question: "What if I'm not sure what I want?",
            answer: "Absolutely come in for a consultation! Many patients come in with general goals like 'I want to look more youthful' or 'I'm unhappy with my midsection' without knowing the specific procedure. Our Specialists are experts at understanding your vision and guiding you toward the right options.",
        },
        {
            question: 'Where is the surgery performed?',
            answer: 'All procedures are performed in our state-of-the-art surgical facility located right here in Miami by Double Board-Certified surgeons. We prioritize privacy, safety, and comfort.',
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
            answer: 'We use general anesthesia administered exclusively by board-certified MD anesthesiologists—never nurse anesthetists working without physician supervision. Your safety during surgery is our non-negotiable priority.',
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
            question: 'Will my results look natural?',
            answer: "Natural-looking results are our signature. We believe the best cosmetic surgery is the kind no one can tell you've had—you simply look like the best version of yourself. Our surgeons take an artistic approach, respecting your natural proportions while enhancing your features.",
        },
        {
            question: 'How long will my results last?',
            answer: 'Results vary by procedure, but most are designed to be long-lasting. BBL and breast augmentation results can last 10+ years. Facelift results typically last 7-10 years. The key to maintaining your results is a stable weight and healthy lifestyle.',
        },
        {
            question: 'When will I see my final results?',
            answer: "You'll see immediate improvement, but final results develop over time as swelling resolves. For most body procedures, expect 3-6 months for final results. Facial procedures may settle in 6-12 months. We'll provide a timeline specific to your procedure.",
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
            answer: 'Our pricing is transparent and comprehensive. Your quote typically includes surgeon fees, anesthesia, facility fees, and standard post-operative care. Your Specialist will provide a detailed breakdown during your consultation so there are no surprises.',
        },
        {
            question: 'Is there a consultation fee?',
            answer: "Consultations are completely free. We believe in making it easy for you to explore your options and get personalized guidance without any upfront cost. During your free consultation, you'll receive undivided attention and a thorough evaluation.",
        },
        {
            question: 'Do you offer package pricing for multiple procedures?',
            answer: 'Yes, combining procedures often provides savings compared to having them separately. Packages like our Mommy Makeover bundle multiple procedures at a combined rate. Your Specialist will discuss all options and provide pricing during your consultation.',
        },
        {
            question: 'Does insurance cover cosmetic surgery?',
            answer: "Elective cosmetic procedures are typically not covered by insurance. However, certain reconstructive components—like hernia repair during a tummy tuck—may be partially covered. We can provide documentation if you'd like to check with your insurance provider.",
        },
        {
            question: 'What financing credit score is required?',
            answer: 'Qualification requirements vary by partner. Cherry accepts credit scores as low as 520, making financing accessible to more patients. CareCredit and United Credit may have different requirements, and our team can help you find the best option for your situation.',
        },
    ],
    recovery: [
        {
            question: 'How long will I need to take off work?',
            answer: 'Recovery time varies by procedure. For BBL or Mommy Makeover, plan for 2 weeks off. Breast augmentation patients often return to desk work in 5-7 days. Facial procedures typically require 1-2 weeks before returning to public activities.',
        },
        {
            question: 'When can I exercise again after surgery?',
            answer: 'Light walking is encouraged immediately to promote circulation. Most patients can resume light cardio at 3-4 weeks and return to full workouts, including heavy lifting, at 6 weeks. Specific restrictions vary by procedure.',
        },
        {
            question: "I'm traveling from out of town—when can I fly home?",
            answer: "For most procedures, we recommend staying in Miami for 7-10 days post-surgery for initial follow-up appointments and to ensure you're healing well before flying. For procedures like BBL, you may need special seating arrangements for your flight. Our concierge team helps out-of-town patients plan every detail.",
        },
        {
            question: 'Do you offer recovery accommodations?',
            answer: 'Yes, we partner with luxury recovery suites in Miami that provide 24/7 nursing care, medication management, healthy meals, and transportation to follow-up appointments. These facilities offer a hotel-like experience with medical-grade support. Our concierge can handle all booking details.',
        },
        {
            question: 'What aftercare and support do you provide?',
            answer: "Your care doesn't end when surgery does. We provide detailed post-operative instructions, prescribed medications, compression garments (if needed), and scheduled follow-up appointments. Our team is available by phone for any questions or concerns during your recovery.",
        },
        {
            question: 'What should I prepare before surgery?',
            answer: "You'll receive detailed pre-operative instructions specific to your procedure. Generally, this includes stopping certain medications and supplements, arranging transportation and recovery support, completing any required lab work, and following dietary guidelines. Our team will guide you through every step.",
        },
    ],
}

/**
 * Featured FAQs for AI citation optimization
 * These are the most important/searched questions displayed prominently
 * using the QuickAnswerList component for LLM-friendly extraction.
 */
export const featuredFaqs: Array<{
    question: string
    answer: string
    details?: string
}> = [
    {
        question: 'How do I schedule a consultation?',
        answer: 'Schedule a free consultation by calling our office or filling out the online form. We offer both in-person and virtual consultations.',
        details:
            "During your consultation, you'll meet with a board-certified surgeon who will discuss your goals, examine you, and create a personalized treatment plan.",
    },
    {
        question: 'What financing options are available?',
        answer: 'We offer flexible financing through Cherry, CareCredit, and United Credit with plans starting as low as $99/month and 0% APR options.',
        details:
            'Apply online or in-office for instant approval. Our patient coordinators can help you find the best plan for your budget.',
    },
    {
        question: 'Are your surgeons board-certified?',
        answer: 'Yes, our surgeons are double board-certified by both the American Board of Plastic Surgery and the American Board of Surgery.',
        details:
            'This dual certification demonstrates the highest level of training and expertise in plastic surgery.',
    },
    {
        question: 'What is the recovery time for plastic surgery?',
        answer: 'Recovery varies by procedure: 1-2 weeks for breast augmentation, 2-3 weeks for BBL, and 2-4 weeks for tummy tuck before returning to normal activities.',
        details:
            'Our team provides detailed post-operative instructions and 24/7 support during your recovery.',
    },
    {
        question: 'Do you offer surgery for out-of-town patients?',
        answer: 'Yes, we welcome medical tourists from across the US, Latin America, and the Caribbean with virtual consultations and recovery concierge services.',
        details:
            'We can recommend nearby hotels and recovery houses, and coordinate your entire surgical journey.',
    },
]

/**
 * FAQ page section configuration
 */
export const faqPageConfig = {
    badge: 'Clarity & Confidence',
    title: 'Your Questions,',
    subtitle: 'Answered.',
    description:
        'We believe transparency is the ultimate luxury. Find answers to the most common questions our patients ask about cosmetic surgery, financing, recovery, and more.',
}

/**
 * CTA configuration for the FAQ section
 */
export const faqPageCtaConfig: FaqCtaConfig = {
    title: 'Still have questions?',
    description: 'Our patient concierge is ready to help you.',
    buttonText: 'Call Us Now',
    phoneNumber: siteConfig.contact.phone.replace(/[\s()-]/g, ''),
}

/**
 * Final CTA section data
 */
export const faqFinalCtaData = {
    eyebrow: 'Ready to Begin?',
    heading: 'Your Transformation Starts with a Conversation',
    description:
        'Schedule your free consultation today. Our board-certified surgeons are ready to discuss your goals and create a personalized treatment plan.',
    primaryButton: {
        text: 'Book Free Consultation',
        href: '/contact-us',
    },
    secondaryButton: {
        text: 'Call (786) 305-8649',
        href: `tel:${siteConfig.contact.phone.replace(/[\s()-]/g, '')}`,
    },
}

/**
 * SEO configuration for the FAQ page
 */
export const faqPageSeoData = {
    title: 'Plastic Surgery FAQ Miami | Your Questions Answered',
    description:
        'Get answers to common questions about plastic surgery in Miami. Learn about procedures, costs, financing options, recovery times, and safety. Board-certified surgeons.',
    keywords: [
        'plastic surgery FAQ',
        'cosmetic surgery questions',
        'plastic surgery Miami FAQ',
        'BBL FAQ',
        'mommy makeover questions',
        'breast augmentation FAQ',
        'tummy tuck questions',
        'plastic surgery cost questions',
        'plastic surgery recovery',
        'cosmetic surgery safety',
    ],
    canonical: '/faqs',
}
