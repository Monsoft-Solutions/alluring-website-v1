/**
 * About Page Data
 *
 * Data structures and content for the about page sections.
 * All content is centralized here for easy maintenance and localization.
 *
 * Alluring Plastic Surgery - Custom About Page Content
 */

/**
 * Final CTA Section Content (for end of about page)
 */
export const aboutCTAData = {
    title: 'Ready to Start Your Transformation?',
    description:
        'Schedule a consultation with our board-certified surgeons. Experience the Alluring difference—where luxury meets affordability, and your safety is always our priority.',
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
