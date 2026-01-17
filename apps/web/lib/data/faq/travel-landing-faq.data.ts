/**
 * Travel Landing Page FAQ Data
 *
 * FAQ data specifically for out-of-town patients (/start/travel).
 * Organized by categories addressing travel patient concerns:
 * - Planning: How to plan your trip
 * - Virtual: Virtual consultation process
 * - Logistics: Flights, hotels, transportation
 * - Recovery: Staying in Miami for recovery
 */
import { siteConfig } from '@/lib/data/site-config'
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
            answer: `It's simple: Start with a free consultation. Our patient specialists will discuss your goals, answer your questions, and provide a detailed quote. Once you're ready to proceed, we'll help you plan your surgery date and provide recommendations for recovery accommodations.`,
        },
        {
            question: 'How far in advance should I book?',
            answer: `We recommend booking 4-6 weeks in advance to allow time for your consultation, pre-operative planning, and travel arrangements. However, we can often accommodate shorter timelines for patients with flexible schedules. Our team will work with you to find the best dates.`,
        },
        {
            question: 'What if I need to reschedule my trip?',
            answer: `We understand travel plans can change. Our team will work with you to reschedule your surgery date. We ask for at least 2 weeks notice when possible so we can accommodate your new schedule.`,
        },
        {
            question: 'Can I combine my surgery with a vacation?',
            answer: `Many of our travel patients extend their stay to enjoy Miami before or after their recovery period. While you'll need to rest during the initial recovery phase, you can absolutely plan some relaxation time in sunny Miami. Our team can recommend recovery-friendly activities appropriate for your healing timeline.`,
        },
    ],
    virtual: [
        {
            question: 'How does the initial consultation work?',
            answer: `Your consultation is with our experienced patient specialists. You'll discuss your goals, learn about procedures and what to expect, and get an all-inclusive price quote. This consultation is completely free with no obligation.`,
        },
        {
            question: 'What do I need for my consultation?',
            answer: `You'll need a device with a camera (smartphone, tablet, or computer), a stable internet connection, and a private space where you feel comfortable discussing your goals. We'll send you instructions for taking photos beforehand so our team can better understand your needs.`,
        },
        {
            question: 'When do I meet my surgeon?',
            answer: `You'll meet your board-certified surgeon in person when you arrive in Miami for your pre-op appointment. During this meeting, you'll have a detailed consultation where the surgeon examines you, confirms your surgical plan, and answers any final questions.`,
        },
        {
            question: 'Can I get an accurate quote before traveling?',
            answer: `Absolutely. Based on the photos you provide and your goals, our specialists can give you a comprehensive, all-inclusive quote. This quote includes surgeon fees, anesthesia, facility costs, and standard follow-up care. There are no surprise fees.`,
        },
    ],
    logistics: [
        {
            question: 'Do you recommend places to stay?',
            answer: `Yes! Our specialists have trusted recommendations for recovery houses and accommodations near our facility. These are places that understand surgical recovery needs—comfortable environments with staff experienced in caring for recovering patients. We'll provide you with options at various price points.`,
        },
        {
            question: 'How long do I need to stay in Miami?',
            answer: `Most procedures require a 7-14 day stay in Miami, depending on the surgery. This allows time for your pre-op appointment, the procedure itself, initial recovery, and your first follow-up appointments. Our team will give you a specific timeline based on your procedure.`,
        },
        {
            question: "What about transportation while I'm in Miami?",
            answer: `Many of our recommended recovery houses offer transportation services or can help arrange rides to your appointments. We suggest using rideshare services like Uber or Lyft for convenient, on-demand transportation during your stay.`,
        },
        {
            question: 'What are recovery houses like?',
            answer: `Recovery houses are accommodations specifically designed for patients recovering from surgery. They typically offer comfortable beds, quiet environments, staff who understand post-operative care, and often include meals and basic recovery supplies. Our team can recommend options based on your budget and preferences.`,
        },
    ],
    recovery: [
        {
            question: 'How will I be cared for during recovery in Miami?',
            answer: `You're never alone during your Miami recovery. Our concierge team checks on you daily, you have 24/7 access to our nurse line, and you'll have scheduled follow-up appointments with your surgeon. Many patients also choose to have a private nurse visit their accommodation.`,
        },
        {
            question: "What if something goes wrong while I'm recovering?",
            answer: `Your safety is our top priority. You'll have direct access to our medical team 24/7. If any concerns arise, we can see you immediately at our facility. This is one of the major benefits of recovering near your surgical team rather than flying home immediately.`,
        },
        {
            question: 'When can I fly home after surgery?',
            answer: `Flight clearance depends on your specific procedure. Generally, patients can fly 7-14 days after surgery once cleared by their surgeon. We'll give you specific guidelines and ensure you're medically ready before your return flight. Some patients choose to extend their stay for a more relaxed recovery.`,
        },
        {
            question: 'What follow-up care will I need after returning home?',
            answer: `We'll schedule virtual follow-up appointments to monitor your healing after you return home. We can also coordinate with a local physician if needed. Most patients only need virtual check-ins, but we're always available if you need to return to Miami for any reason.`,
        },
    ],
}

/**
 * FAQ section configuration for travel landing page
 */
export const travelLandingFaqConfig = {
    title: 'Questions from',
    subtitle: 'Traveling Patients',
    badge: 'Fly-In Concierge',
    description:
        'Everything you need to know about planning your surgical trip to Miami.',
}
