/**
 * Blog CTA Types
 *
 * Type definitions for the blog CTA system that supports
 * multiple content variants, extensible configurations,
 * and lead capture forms.
 */

import type { BlogCtaId } from '@workspace/shared/content'

export type CTAColorScheme = 'blue' | 'green' | 'orange' | 'gold' | 'default'

export type BlogCTAContent = {
    /**
     * Unique identifier for this CTA content.
     *
     * Constrained to the shared contract's id set: the content pipeline writes
     * `<!-- CTA:id -->` markers from that same list, and `BlogCTA` renders
     * nothing for an id it cannot resolve. Adding a variant here means adding
     * it to `BLOG_CTA_IDS` first.
     */
    readonly id: BlogCtaId

    /**
     * Main heading text for the CTA
     */
    readonly heading: string

    /**
     * Description or subheading text
     */
    readonly description: string

    /**
     * Color scheme for the entire CTA component
     * Affects background, border, and button colors
     */
    readonly colorScheme?: CTAColorScheme

    /**
     * Phone number to display for immediate conversion
     */
    readonly phoneNumber?: string

    /**
     * Primary call-to-action button
     */
    readonly primaryButton: {
        readonly text: string
        readonly href: string
        readonly iconName?: string
        readonly variant?: 'cta-blue' | 'cta-green' | 'cta-orange' | 'cta-gold'
    }

    /**
     * Optional secondary button
     */
    readonly secondaryButton?: {
        readonly text: string
        readonly href: string
        readonly variant?: 'outline' | 'ghost'
    }
}

export type BlogCTAProps = {
    /**
     * Visual variant of the CTA
     * - inline: Accent box within content flow
     * - footer: Lead capture form at end of post
     */
    readonly variant: 'inline' | 'footer'

    /**
     * Custom CTA content to display
     * Takes precedence over ctaId
     */
    readonly content?: BlogCTAContent

    /**
     * ID of predefined CTA content from configuration
     * Used if content prop is not provided
     */
    readonly ctaId?: string

    /**
     * Color scheme for the CTA component
     * Overrides the colorScheme from content if provided
     */
    readonly colorScheme?: CTAColorScheme
}

/**
 * NOTE: Lead capture submissions use the unified /api/contact endpoint
 * with CONTACT_SOURCES.BLOG_LEAD as the source.
 * See @/lib/types/forms/contact-form.type.ts for response types.
 */
