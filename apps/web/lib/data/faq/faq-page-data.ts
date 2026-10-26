/**
 * FAQ Page Data
 *
 * Comprehensive FAQ data for the dedicated FAQ page at /faq.
 * Organized by patient journey stage to address concerns at every
 * decision-making point.
 *
 * Content Strategy:
 * - Address common objections: safety, cost, recovery, results
 * - Follow the claims canon (docs/claims/canon.md, #354)
 * - Support both local and out-of-town patients
 * - Guide toward booking a consultation
 */

import {
    FINANCING_SENTENCE_LONG,
    FINANCING_SENTENCE_SHORT,
} from '@workspace/shared/claims/financing'

import type {
    FaqCategory,
    FaqItem,
    FaqCtaConfig,
} from '@/lib/types/shared/faq.type'
import { siteConfig } from '@/lib/data/site-config'
import {
    KARLINSKY_CREDENTIALS,
    KARLINSKY_NAME,
} from '@/lib/data/surgeons/karlinsky-credentials.constant'

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
            answer: 'You can request a consultation with our online form or by calling our Miami office. We offer consultations in person in Miami or by video for out-of-town patients.',
        },
        {
            question: 'What happens during a consultation?',
            answer: `Your consultation is a private, unhurried conversation with ${KARLINSKY_NAME}. We'll discuss your goals, examine the areas you'd like to address, review your medical history, and create a personalized treatment plan. You'll receive a detailed quote and have all your questions answered—no pressure, just clarity.`,
        },
        {
            question: 'How long does a consultation take?',
            answer: 'Plan for 45-60 minutes. We never rush a consultation, because understanding your goals comes first. Some patients finish sooner, but we always allocate enough time for a thorough discussion.',
        },
        {
            question: 'Do you offer virtual consultations?',
            answer: "Yes. We offer secure video consultations for patients who can't visit our Miami office in person. Virtual consultations work well for initial discussions, procedure education, and treatment planning. Many out-of-town patients complete their virtual consult first, then fly in for their surgery.",
        },
        {
            question: 'Do I need a referral from my doctor?',
            answer: 'No, cosmetic procedures generally do not require a referral. However, we will conduct a thorough health history review to ensure you are a safe candidate for surgery.',
        },
        {
            question:
                "How do I know if I'm a good candidate for cosmetic surgery?",
            answer: "Ideal candidates are in good overall health, maintain a stable weight, don't smoke (or are willing to quit), and have realistic expectations. Certain medical conditions may require additional evaluation. The best way to know is a consultation, where Dr. Karlinsky reviews your health history and goals and decides whether surgery is right for you.",
        },
    ],
    procedures: [
        {
            question: 'What procedures do you specialize in?',
            answer: `We specialize in body contouring and facial procedures, including Brazilian Butt Lift (BBL), Breast Augmentation, Breast Lift, Breast Reduction, Tummy Tuck, Liposuction, Mommy Makeover, Facelift, and Blepharoplasty (eyelid surgery). One surgeon, ${KARLINSKY_NAME}, performs every procedure at Alluring.`,
        },
        {
            question: 'How do I know which procedure is right for me?',
            answer: `That's exactly what your consultation is for. You'll speak with one of our dedicated Specialists who will discuss your goals, answer your questions, and guide you through the entire process. They'll help you understand your options and prepare you for a thorough evaluation with ${KARLINSKY_NAME}. Every treatment plan is customized to you.`,
        },
        {
            question: 'Can I combine multiple procedures in one surgery?',
            answer: 'Yes, and combining them in one surgery lowers the total. Popular combinations include the Mommy Makeover (tummy tuck + breast procedure), BBL with liposuction, or breast augmentation with a lift. Your surgeon will determine if combining procedures is safe and appropriate for your goals.',
        },
        {
            question: "What if I'm not sure what I want?",
            answer: "Absolutely come in for a consultation! Many patients come in with general goals like 'I want to look more youthful' or 'I'm unhappy with my midsection' without knowing the specific procedure. Our Specialists listen to your goals and walk you through the options, and your surgeon decides what's right for you at consultation.",
        },
        {
            question: 'Where is the surgery performed?',
            answer: `Every procedure is performed in Miami by one surgeon, ${KARLINSKY_NAME}, and you go home the same day. We prioritize privacy, safety, and comfort.`,
        },
    ],
    safety: [
        {
            question: "What are your surgeon's credentials?",
            answer: `One surgeon performs every procedure at Alluring: ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}`,
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
            question: 'Will my results look natural?',
            answer: 'Natural-looking results are the goal. Dr. Karlinsky plans around your natural proportions while enhancing your features.',
        },
        {
            question: 'How long will my results last?',
            answer: 'Results vary by procedure, and most are long-lasting. The key to maintaining your results is a stable weight and healthy lifestyle.',
        },
        {
            question: 'When will I see my final results?',
            answer: "You'll see immediate improvement, but final results develop over time as swelling resolves. Most body procedures show their final result at about 3 to 6 months. Facial swelling can take several months to settle fully. We'll provide a timeline specific to your procedure.",
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
            answer: 'No. Consultations are free, so you can explore your options and get personalized guidance with no obligation to book surgery.',
        },
        {
            question: 'Do you offer package pricing for multiple procedures?',
            answer: 'Yes. [[combo-discount]] Your Specialist will discuss all options and provide pricing during your consultation.',
        },
        {
            question: 'Does insurance cover cosmetic surgery?',
            answer: "Elective cosmetic procedures are typically not covered by insurance. However, certain reconstructive components—like hernia repair during a tummy tuck—may be partially covered. We can provide documentation if you'd like to check with your insurance provider.",
        },
        {
            question: 'What financing credit score is required?',
            answer: 'Each lender sets its own requirements, and our team can go through the options with you.',
        },
    ],
    recovery: [
        {
            question: 'How long will I need to take off work?',
            answer: 'It depends on the procedure. After a BBL, most people return to desk work in 10 to 14 days, sitting on a pillow (Cleveland Clinic, The Aesthetic Society); ASPS says some go back between days 7 and 10. After a mommy makeover, plan on about 2 to 3 weeks. After breast augmentation, most people are back to light activity in about a week. After a facelift, plan on about 2 to 3 weeks, and after eyelid surgery most people are back at work in 7 to 10 days. Your surgeon gives you your own timeline.',
        },
        {
            question: 'When can I exercise again after surgery?',
            answer: 'Walking starts right away. Strenuous exercise waits until your surgeon clears you: about 4 to 6 weeks after liposuction (The Aesthetic Society), 4 to 8 weeks after a tummy tuck (Cleveland Clinic) and 8 weeks after a BBL (The Aesthetic Society).',
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
        details: `During your consultation, you'll meet ${KARLINSKY_NAME}, who will discuss your goals, examine you, and create a personalized treatment plan.`,
    },
    {
        question: 'What financing options are available?',
        answer: FINANCING_SENTENCE_SHORT,
        details:
            'Approval and terms are set by the lender. You can apply online or in the office, and our patient coordinators can go through the options with you.',
    },
    {
        question: "What are your surgeon's credentials?",
        answer: `One surgeon performs every procedure at Alluring: ${KARLINSKY_NAME}. ${KARLINSKY_CREDENTIALS}`,
    },
    {
        question: 'What is the recovery time for plastic surgery?',
        answer: 'Recovery varies by procedure: about 1 week to light activity after breast augmentation; 10 to 14 days to desk work after a BBL (Cleveland Clinic, The Aesthetic Society), with exercise after 8 weeks once cleared; and about 2 weeks to work after a tummy tuck (Cindy Wu, MD, on the ASPS website).',
        details:
            'Our team provides detailed post-operative instructions and follow-up during your recovery.',
    },
    {
        question: 'Do you offer surgery for out-of-town patients?',
        answer: 'Yes. Out-of-town patients start with a virtual consultation, then travel to Miami for their pre-op appointment and surgery.',
        details:
            'We schedule your surgery and follow-up dates and tell you how many nights you need to stay. You book your own flights, lodging and transport — we are not affiliated with any recovery house.',
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
        'Find answers to the most common questions our patients ask about cosmetic surgery, financing, recovery, and more.',
}

/**
 * CTA configuration for the FAQ section
 */
export const faqPageCtaConfig: FaqCtaConfig = {
    title: 'Still have questions?',
    description: 'Our patient coordinators are ready to help you.',
    buttonText: 'Call Us Now',
    phoneNumber: siteConfig.contact.phone.replace(/[\s()-]/g, ''),
}

/**
 * Final CTA section data
 */
export const faqFinalCtaData = {
    eyebrow: 'Ready to Begin?',
    heading: 'Your Transformation Starts with a Conversation',
    description: `Schedule your free consultation today. ${KARLINSKY_NAME} is ready to discuss your goals and create a personalized treatment plan.`,
    primaryButton: {
        text: 'Book Free Consultation',
        href: '/contact-us',
    },
    secondaryButton: {
        text: `Call ${siteConfig.contact.phoneDisplay}`,
        href: `tel:${siteConfig.contact.phone.replace(/[\s()-]/g, '')}`,
    },
}

/**
 * SEO configuration for the FAQ page
 */
export const faqPageSeoData = {
    title: 'Plastic Surgery FAQ Miami | Your Questions Answered',
    description:
        'Get answers to common questions about plastic surgery in Miami. Learn about procedures, costs, financing options, recovery times, and safety. One surgeon: Victoria Karlinsky, MD, FACS.',
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
