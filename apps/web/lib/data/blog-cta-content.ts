/**
 * Blog CTA Content Configuration
 *
 * Predefined CTA content variants for blog posts.
 * Add new CTA variants here to use across different blog posts.
 *
 * ## Usage in Blog Posts
 *
 * ### Option 1: Automatic CTA Insertion (No Marker)
 * If no marker is present, the CTA will be automatically inserted at ~40% of the content,
 * intelligently splitting at paragraph boundaries without breaking markdown structures.
 * The default CTA will be used.
 *
 * ### Option 2: Manual Placement with Default CTA
 * Place `<!-- CTA -->` in your markdown where you want the CTA to appear:
 * ```markdown
 * Your content before the CTA...
 *
 * <!-- CTA -->
 *
 * Your content after the CTA...
 * ```
 *
 * ### Option 3: Manual Placement with Specific CTA Type
 * Specify which CTA variant to use by adding the CTA ID:
 * ```markdown
 * Your content before the CTA...
 *
 * <!-- CTA:consultation -->
 *
 * Your content after the CTA...
 * ```
 *
 * Available CTA IDs: default, consultation, keel-product, newsletter, contact
 */
import type { BlogCTAContent } from '@/lib/types/blog/blog-cta.type'

/**
 * Available CTA content variants
 */
export const blogCTAContents: readonly BlogCTAContent[] = [
    {
        id: 'default',
        heading: 'Need Help Getting Started?',
        description:
            'Our team is here to help you implement these solutions for your business. Get in touch for a free consultation.',
        colorScheme: 'blue',
        primaryButton: {
            text: 'Get Started',
            href: '/contact-us',
            iconName: 'arrow-right',
        },
    },
    {
        id: 'consultation',
        heading: 'Ready to Take the Next Step?',
        description:
            'Schedule a free consultation to discuss your specific needs and how we can help you achieve your goals.',
        colorScheme: 'blue',
        primaryButton: {
            text: 'Book Consultation',
            href: '/contact-us',
            iconName: 'message-circle',
        },
        secondaryButton: {
            text: 'Learn More',
            href: '/about',
            variant: 'outline',
        },
    },
    {
        id: 'keel-product',
        heading: 'Build Your Production Website Today',
        description:
            'Keel gives you everything you need to launch a professional website in hours, not weeks. Type-safe, production-ready, and fully customizable.',
        colorScheme: 'blue',
        primaryButton: {
            text: 'Get Keel',
            href: '/#features',
            iconName: 'sparkles',
        },
        secondaryButton: {
            text: 'View Documentation',
            href: '/blog',
            variant: 'outline',
        },
    },
    {
        id: 'newsletter',
        heading: 'Want More Tips Like This?',
        description:
            'Subscribe to our newsletter for weekly insights, tutorials, and best practices delivered straight to your inbox.',
        colorScheme: 'blue',
        primaryButton: {
            text: 'Subscribe Now',
            href: '/contact-us',
            iconName: 'mail',
        },
    },
    {
        id: 'contact',
        heading: 'Questions About Implementation?',
        description:
            'Our experts are ready to answer your questions and guide you through the implementation process.',
        colorScheme: 'blue',
        primaryButton: {
            text: 'Contact Us',
            href: '/contact-us',
            iconName: 'mail',
        },
        secondaryButton: {
            text: 'Learn More',
            href: '/about',
            variant: 'outline',
        },
    },
] as const

/**
 * Default CTA content to use when no ctaId or content is provided
 */
export const defaultCTAContent = blogCTAContents[0]

/**
 * Get CTA content by ID
 * Returns undefined if ID not found (will fall back to default in component)
 */
export function getCTAContentById(id: string): BlogCTAContent | undefined {
    return blogCTAContents.find((cta) => cta.id === id)
}

/**
 * Get all available CTA IDs
 */
export function getAvailableCTAIds(): string[] {
    return blogCTAContents.map((cta) => cta.id)
}
