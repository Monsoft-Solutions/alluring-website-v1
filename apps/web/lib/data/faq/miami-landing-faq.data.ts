/**
 * Miami Landing Page FAQ Data
 *
 * FAQ data specifically for the Miami-focused landing page (/start/miami).
 * Organized by categories addressing local Miami audience concerns:
 * - Location: Office location and the areas served
 * - Experience: Local expertise and community trust
 * - Consultation: What to expect in-person
 * - Aftercare: Local follow-up convenience
 */
import { getFullAddress, siteConfig } from '@/lib/data/site-config'
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'
import type { FaqCategory, FaqItem } from '@/lib/types/shared/faq.type'

/**
 * Miami landing page FAQ categories
 */
export const miamiLandingFaqCategories: FaqCategory[] = [
    { id: 'location', label: 'Location' },
    { id: 'experience', label: 'Experience' },
    { id: 'consultation', label: 'Consultation' },
    { id: 'aftercare', label: 'Aftercare' },
]

/**
 * Miami landing page FAQ items organized by category
 */
export const miamiLandingFaqData: Record<string, FaqItem[]> = {
    location: [
        {
            question: 'Where is your Miami office located?',
            answer: `Our office is at ${getFullAddress()}, in Miami-Dade County.`,
        },
        {
            question: 'Do you serve all of Miami-Dade County?',
            answer: `Yes. We see patients from all Miami neighborhoods including Brickell, Downtown Miami, Miami Beach, Coral Gables, Coconut Grove, South Miami, Kendall, Doral, Hialeah, and surrounding areas. Our central location makes us convenient for the entire community.`,
        },
    ],
    experience: [
        {
            question: 'Do you speak Spanish?',
            answer: `Sí. Hablamos español. From your first phone call through your recovery, you can talk with us in Spanish or English, whichever is more comfortable.`,
        },
        {
            question: 'Why do Miami residents choose you?',
            answer: `Because we're local: follow-up care is close to home, and Dr. Karlinsky plans for natural-looking results that enhance, never overdo.`,
        },
    ],
    consultation: [
        {
            question: 'What happens at my Miami consultation?',
            answer: `Your consultation takes place at our office at ${getFullAddress()}. You'll meet one-on-one with ${KARLINSKY_NAME}, who will listen to your goals, examine your anatomy, show you before/after photos of similar cases, and provide a detailed quote—all in about an hour. No rush, no pressure.`,
        },
        {
            question: 'Can I bring someone to my consultation?',
            answer: `Of course. Many patients bring a spouse, partner, friend, or family member for support. We have a comfortable waiting area, and your guest is welcome to join you for any part of the consultation you'd like.`,
        },
        {
            question: 'How quickly can I get a consultation?',
            answer: `Call us at ${siteConfig.contact.phoneDisplay} or send the form, and a patient coordinator will find a time that works for you.`,
        },
        {
            question: 'Is the consultation really free?',
            answer: `Yes, your initial consultation is completely complimentary with no obligation. We believe you should be able to explore your options and get all your questions answered before making any decisions—at no cost to you.`,
        },
    ],
    aftercare: [
        {
            question: 'How convenient is follow-up care?',
            answer: `Your follow-up appointments are at our Miami office, close to home.`,
        },
        {
            question: 'What if I have concerns after my surgery?',
            answer: `If you have any concerns during recovery, call the office at ${siteConfig.contact.phoneDisplay}. Your surgeon is right here in Miami.`,
        },
        {
            question: 'Can I return to my normal Miami routine quickly?',
            answer: `Most people are back to light daily activity within about 1 to 3 weeks, depending on the procedure; your surgeon gives you your own timeline. Because you're local, your surgeon is close by while you ease back into your routine.`,
        },
    ],
}

/**
 * FAQ section configuration for Miami landing page
 */
export const miamiLandingFaqConfig = {
    title: 'Questions from Our',
    subtitle: 'Miami Neighbors',
    badge: 'Local Expertise',
    description:
        'Get answers to what Miami residents ask most about choosing a local cosmetic surgeon.',
}
