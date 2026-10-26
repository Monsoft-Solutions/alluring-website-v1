/**
 * Travel Landing Page FAQ Data
 *
 * FAQ data specifically for out-of-town patients (/start/travel).
 * Organized by categories addressing travel patient concerns:
 * - Planning: How to plan your trip
 * - Virtual: Virtual consultation process
 * - Logistics: How long to stay, getting around
 * - Recovery: Staying in Miami for recovery
 *
 * IMPORTANT: the practice does not book travel or lodging and is not
 * affiliated with any recovery house. Answers here must stay limited to
 * clinical scheduling and medical guidance. Do not reintroduce claims
 * about arranging accommodation, transport or "recommended" recovery
 * houses.
 */
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Travel landing page FAQ categories
 */
export const travelLandingFaqCategories: FaqCategory[] = [
    { id: 'planning', label: 'Planning' },
    { id: 'virtual', label: 'Virtual Consult' },
    { id: 'logistics', label: 'Travel & Stay' },
    { id: 'recovery', label: 'Recovery' },
]

/**
 * Travel landing page FAQ items organized by category
 */
export const travelLandingFaqData: Record<string, FaqItem[]> = {
    planning: [
        {
            question: 'How do I start planning my surgery trip to Miami?',
            answer: `Start with a free consultation. Our patient specialists will discuss your goals, answer your questions, and give you a detailed quote. Once you're ready to proceed we'll confirm your surgery, pre-op and follow-up dates in writing, and tell you how many nights you need to be in Miami — so you can book your own flights and lodging around a schedule that is already fixed.`,
        },
        {
            question: 'How far in advance should I book?',
            answer: `Plan ahead: allow time for your consultation and pre-operative planning, and book your own travel once your dates are confirmed. Our team will work with you to find dates that suit you.`,
        },
        {
            question: 'What if I need to reschedule my trip?',
            answer: `We understand travel plans can change. Our team will work with you to reschedule your surgery date. Let us know as early as you can.`,
        },
        {
            question: 'Can I combine my surgery with a vacation?',
            answer: `Some patients extend their stay, though it's worth being realistic: the first week is for resting, not sightseeing. If you want time to enjoy Miami, plan it for before surgery or well after your surgeon has cleared you. We'll tell you what activity is safe at each stage of healing.`,
        },
    ],
    virtual: [
        {
            question: 'How does the initial consultation work?',
            answer: `Your consultation is with our patient specialists. You'll discuss your goals, learn about procedures and what to expect, and get a personalized price quote, which your surgeon confirms when she examines you. This consultation is free with no obligation.`,
        },
        {
            question: 'What do I need for my consultation?',
            answer: `You'll need a device with a camera (smartphone, tablet, or computer), a stable internet connection, and a private space where you feel comfortable discussing your goals. We'll send you instructions for taking photos beforehand so our team can better understand your needs.`,
        },
        {
            question: 'When do I meet my surgeon?',
            answer: `You'll meet your surgeon, ${KARLINSKY_NAME}, in person when you arrive in Miami for your pre-op appointment. During this meeting, she examines you, confirms your surgical plan, and answers any final questions.`,
        },
        {
            question: 'Can I get an accurate quote before traveling?',
            answer: `Yes. From your photos and goals, our specialists can give you an estimate before you travel. Your price is set after an exam, estimates may change, and Dr. Karlinsky confirms your price at consultation.`,
        },
    ],
    logistics: [
        {
            question: 'Do you arrange somewhere for me to stay?',
            answer: `No. We don't book lodging and we're not affiliated with any recovery house, so we can't reserve one for you or vouch for one. Patients arrange their own stay. What we will tell you is which dates you need to be in Miami and how mobile you're likely to be in the first week, so you can choose somewhere that suits your recovery.`,
        },
        {
            question: 'How long do I need to stay in Miami?',
            answer: `After a BBL, plan on 7 to 10 days in Miami. For other procedures, your surgeon tells you how many nights to stay before you're cleared to fly home. The stay covers your pre-op appointment, the procedure itself, initial recovery, and your first follow-up appointments.`,
        },
        {
            question: "What about transportation while I'm in Miami?",
            answer: `You arrange your own — we don't provide transport or airport pickup. Rideshare works for appointments. Plan on not driving yourself for the first week or so after surgery, and while you're taking prescription pain medication.`,
        },
        {
            question: 'What should I look for in a place to stay?',
            answer: `Practical things: somewhere quiet, a bed you can get in and out of without straining, and no stairs if you can avoid them. We are not affiliated with any recovery house, hotel or rental, so research and book whichever suits you.`,
        },
    ],
    recovery: [
        {
            question: 'How will I be cared for during recovery in Miami?',
            answer: `You'll have scheduled follow-up appointments with your surgeon while you're here, written post-op instructions, and a number to call if something doesn't look right. To be clear about the limits: we provide clinical care and follow-up, not in-person daily care where you're staying. Arrange for an adult to stay with you for at least the first 24 to 48 hours, or longer if your surgeon advises.`,
        },
        {
            question: "What if something goes wrong while I'm recovering?",
            answer: `You'll have a number to call if something doesn't look right, and follow-up visits with your surgeon while you're in Miami. That is why you stay near your surgeon rather than flying home right after surgery.`,
        },
        {
            question: 'When can I fly home after surgery?',
            answer: `Flight clearance depends on your procedure. After a BBL, most people fly home after 7 to 10 days in Miami, once cleared at follow-up; for other procedures, your surgeon tells you when you're cleared to fly. Some patients choose to extend their stay for a more relaxed recovery.`,
        },
        {
            question: 'What follow-up care will I need after returning home?',
            answer: `We'll schedule virtual follow-up appointments to monitor your healing after you return home. If you need to be seen in person, we can send your operative details to a physician you choose. You can also come back to Miami to be seen.`,
        },
    ],
}

/**
 * FAQ section configuration for travel landing page
 */
export const travelLandingFaqConfig = {
    title: 'Questions from',
    subtitle: 'Traveling Patients',
    badge: 'Out-of-State Patients',
    description:
        'Everything you need to know about planning your surgical trip to Miami.',
}
