/**
 * Blog CTA Content Configuration
 *
 * Predefined CTA content variants for blog posts.
 * Branded for Alluring Plastic Surgery with conversion-focused messaging.
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
 * The available CTA IDs are defined once in `@workspace/shared/content`
 * (`BLOG_CTA_IDS`) so the AI writer, the marker validator and this file cannot
 * drift apart — an id the writer invents renders no CTA at all.
 */
import type { BlogCtaId } from '@workspace/shared/content'

import { getPhoneLink, siteConfig } from '@/lib/data/site-config'
import type { BlogCTAContent } from '@/lib/types/blog/blog-cta.type'

/**
 * Available CTA content variants - Branded for Alluring Plastic Surgery
 */
export const blogCTAContents = [
    {
        id: 'default',
        heading: 'Considering Your Transformation?',
        description:
            'Our board-certified surgeons at Alluring Plastic Surgery combine artistry with precision to help you achieve your aesthetic goals. Schedule your free consultation today.',
        colorScheme: 'gold',
        phoneNumber: siteConfig.contact.phoneDisplay,
        primaryButton: {
            text: 'Book Free Consultation',
            href: '/contact-us',
            iconName: 'arrow-right',
        },
    },
    {
        id: 'consultation',
        heading: 'Ready for Your Free Consultation?',
        description:
            'Take the first step toward your transformation. Our Miami specialists will create a personalized plan tailored to your unique goals.',
        colorScheme: 'gold',
        phoneNumber: siteConfig.contact.phoneDisplay,
        primaryButton: {
            text: 'Schedule Now',
            href: '/contact-us',
            iconName: 'arrow-right',
        },
        secondaryButton: {
            text: 'Call Us',
            href: getPhoneLink(),
            variant: 'outline',
        },
    },
    {
        id: 'bbl',
        heading: 'Transform Your Curves with BBL',
        description:
            "Miami's premier Brazilian Butt Lift specialists. Our signature technique combines liposuction with precise fat transfer for natural, stunning results.",
        colorScheme: 'gold',
        phoneNumber: siteConfig.contact.phoneDisplay,
        primaryButton: {
            text: 'Explore BBL Options',
            href: '/procedures/bbl-miami',
            iconName: 'arrow-right',
        },
        secondaryButton: {
            text: 'Book Consultation',
            href: '/contact-us',
            variant: 'outline',
        },
    },
    {
        id: 'breast',
        heading: 'Enhance Your Confidence',
        description:
            'From augmentation to lift and reduction, our board-certified surgeons deliver natural-looking results that complement your body.',
        colorScheme: 'gold',
        phoneNumber: siteConfig.contact.phoneDisplay,
        primaryButton: {
            text: 'View Breast Procedures',
            href: '/procedures/breast-augmentation-miami',
            iconName: 'arrow-right',
        },
        secondaryButton: {
            text: 'Free Consultation',
            href: '/contact-us',
            variant: 'outline',
        },
    },
    {
        id: 'body',
        heading: 'Sculpt Your Dream Body',
        description:
            "Whether it's liposuction, tummy tuck, or mommy makeover — our Miami surgeons combine precision techniques with artistic vision.",
        colorScheme: 'gold',
        phoneNumber: siteConfig.contact.phoneDisplay,
        primaryButton: {
            text: 'Explore Body Contouring',
            href: '/procedures/liposuction-miami',
            iconName: 'arrow-right',
        },
        secondaryButton: {
            text: 'Book Consultation',
            href: '/contact-us',
            variant: 'outline',
        },
    },
    {
        id: 'facial',
        heading: 'Reveal Your Best Self',
        description:
            'Expert facial procedures including facelift and blepharoplasty. Turn back the clock with natural-looking rejuvenation.',
        colorScheme: 'gold',
        phoneNumber: siteConfig.contact.phoneDisplay,
        primaryButton: {
            text: 'View Facial Procedures',
            href: '/procedures/facelift-miami',
            iconName: 'arrow-right',
        },
        secondaryButton: {
            text: 'Free Consultation',
            href: '/contact-us',
            variant: 'outline',
        },
    },
] as const satisfies readonly BlogCTAContent[]

/**
 * Compile-time proof that every id the pipeline may write has a variant here.
 *
 * `BlogCTA` renders nothing when it cannot resolve an id, so a marker naming a
 * variant nobody defined is a silently missing conversion point. Adding an id
 * to `BLOG_CTA_IDS` without adding a variant below breaks the build here rather
 * than dropping a CTA in production.
 */
type DefinedCtaId = (typeof blogCTAContents)[number]['id']
const _everyCtaIdHasContent: BlogCtaId extends DefinedCtaId ? true : never =
    true
void _everyCtaIdHasContent

/**
 * Footer CTA configuration for lead capture form
 */
export const footerCTAConfig = {
    heading: 'Start Your Journey Today',
    subheading: 'Get a Free Consultation at Alluring Plastic Surgery',
    description:
        "Leave your name and phone number. We'll call you within 24 hours to discuss your goals.",
    submitButtonText: 'Request Callback',
    trustBadge: '5,000+ Happy Patients • Board-Certified Surgeons',
    phoneNumber: siteConfig.contact.phoneDisplay,
}

/**
 * Default CTA content to use when no ctaId or content is provided
 *
 * Widened to `BlogCTAContent`: the array keeps literal types so the id coverage
 * check above can work, but consumers read optional fields off this value.
 */
export const defaultCTAContent: BlogCTAContent = blogCTAContents[0]

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
