/**
 * About Page Data
 *
 * Data structures and content for the about page sections.
 * All content is centralized here for easy maintenance and localization.
 *
 * Alluring Plastic Surgery - Custom About Page Content
 */
import { KARLINSKY_NAME } from '@/lib/data/surgeons/karlinsky-credentials.constant'

/**
 * Final CTA Section Content (for end of about page)
 */
export const aboutCTAData = {
    title: 'Ready to Start Your Transformation?',
    description: `Schedule a consultation with ${KARLINSKY_NAME}, the one surgeon who performs every procedure at Alluring. Your surgeon confirms your plan and your price at consultation.`,
    primaryButton: {
        text: 'Book Consultation',
        href: '/contact-us',
    },
    secondaryButton: {
        text: 'View Procedures',
        href: '/procedures',
    },
    variant: 'accent' as const,
}
