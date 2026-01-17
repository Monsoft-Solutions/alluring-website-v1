/**
 * Miami Landing Page FAQ Data
 *
 * FAQ data specifically for the Miami-focused landing page (/start/miami).
 * Organized by categories addressing local Miami audience concerns:
 * - Location: Office location, parking, accessibility
 * - Experience: Local expertise and community trust
 * - Consultation: What to expect in-person
 * - Aftercare: Local follow-up convenience
 */
import { siteConfig } from '@/lib/data/site-config'
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
            answer: `Our state-of-the-art surgical facility is located in the heart of Coral Gables, easily accessible from anywhere in Miami-Dade County. We're just minutes from Brickell, Coconut Grove, South Miami, and Kendall. Free parking is available for all patients.`,
        },
        {
            question: 'Do you serve all of Miami-Dade County?',
            answer: `Yes! We proudly serve patients from all Miami neighborhoods including Brickell, Downtown Miami, Miami Beach, Coral Gables, Coconut Grove, South Miami, Kendall, Doral, Hialeah, and surrounding areas. Our central location makes us convenient for the entire community.`,
        },
        {
            question: 'Is parking available at your facility?',
            answer: `Yes, we offer complimentary parking for all patients. Our facility features a private parking lot with easy access, so you won't have to worry about street parking or garages.`,
        },
        {
            question: 'Are you close to public transportation?',
            answer: `Our Coral Gables location is accessible via Metrorail and local bus routes. We're happy to provide directions from any transit station. Many of our patients from Downtown and Brickell find us easy to reach.`,
        },
    ],
    experience: [
        {
            question: 'How long have you been serving Miami?',
            answer: `Alluring Plastic Surgery has been part of the Miami community for over 15 years. Our surgeons have deep roots in South Florida and understand the unique aesthetic preferences and lifestyle of our local patients.`,
        },
        {
            question: 'Do your surgeons speak Spanish?',
            answer: `¡Sí! Our entire team is bilingual. From your first phone call through your recovery, you can communicate in Spanish or English—whatever makes you most comfortable. Hablamos Español con mucho gusto.`,
        },
        {
            question: 'Why do Miami residents choose you?',
            answer: `Miami locals choose us because we're their neighbors. They can see our results in their own community, get referrals from friends and family, and enjoy the convenience of local follow-up care. Plus, our surgeons understand Miami's unique aesthetic—natural beauty that enhances, never overdoes.`,
        },
        {
            question: 'Do you have references from local patients?',
            answer: `Absolutely. Many of our patients are happy to share their experiences with prospective patients from their same neighborhood. During your consultation, ask about connecting with past patients from your area.`,
        },
    ],
    consultation: [
        {
            question: 'What happens at my Miami consultation?',
            answer: `Your consultation takes place at our Coral Gables office. You'll meet one-on-one with a board-certified surgeon who will listen to your goals, examine your anatomy, show you before/after photos of similar cases, and provide a detailed quote—all in about an hour. No rush, no pressure.`,
        },
        {
            question: 'Can I bring someone to my consultation?',
            answer: `Of course! Many patients bring a spouse, partner, friend, or family member for support. We have a comfortable waiting area, and your guest is welcome to join you for any part of the consultation you'd like.`,
        },
        {
            question: 'How quickly can I get a consultation?',
            answer: `We typically have consultation appointments available within a few days. As a local Miami practice, we can often accommodate same-week appointments. Call us at ${siteConfig.contact.phoneDisplay} to find a time that works for you.`,
        },
        {
            question: 'Is the consultation really free?',
            answer: `Yes, your initial consultation is completely complimentary with no obligation. We believe you should be able to explore your options and get all your questions answered before making any decisions—at no cost to you.`,
        },
    ],
    aftercare: [
        {
            question: 'How convenient is follow-up care?',
            answer: `This is one of the biggest benefits of choosing a local Miami surgeon. Your follow-up appointments are right here in Coral Gables—no long drives, no flights, no hotels. Most patients have 3-4 follow-up visits over 6 months, and they're quick and easy.`,
        },
        {
            question: 'What if I have concerns after my surgery?',
            answer: `Being local means we're always nearby. If you have any concerns during recovery, you can visit our office or reach our 24/7 nurse line. You're never alone—your surgical team is right here in Miami with you.`,
        },
        {
            question: 'Do you provide post-op care supplies locally?',
            answer: `Yes! Everything you need for recovery is provided at our Miami office. You won't need to ship anything or wait for deliveries. We'll send you home with comprehensive care instructions and all necessary supplies.`,
        },
        {
            question: 'Can I return to my normal Miami routine quickly?',
            answer: `Most patients return to light activities within 1-2 weeks. Because you're local, you can ease back into your routine with the comfort of knowing your surgeon is just minutes away. No need to coordinate travel during your recovery.`,
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
        'Get answers to what Miami residents ask most about choosing a local plastic surgeon.',
}
