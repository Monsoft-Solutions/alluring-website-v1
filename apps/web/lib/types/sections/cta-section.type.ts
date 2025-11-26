/**
 * CTASection Type Definitions
 *
 * Type definitions for the CTASection component which provides
 * a prominent call-to-action section with heading, description, and buttons.
 */
import type { ReactNode } from 'react'

/**
 * Trust badge configuration for luxury CTA variant
 */
export interface CTATrustBadge {
    /**
     * Icon to display (React element)
     */
    readonly icon: ReactNode

    /**
     * Badge label text
     */
    readonly label: string
}

/**
 * CTA button configuration
 */
export interface CTAButton {
    /**
     * Button text
     */
    readonly text: string

    /**
     * Button link URL
     */
    readonly href: string

    /**
     * Button variant
     * @default 'default'
     */
    readonly variant?: 'default' | 'outline' | 'secondary' | 'ghost'

    /**
     * Whether the link is external
     * @default false
     */
    readonly external?: boolean

    /**
     * Optional icon to display (Lucide icon name or React element)
     */
    readonly icon?: ReactNode

    /**
     * Icon position
     * @default 'left'
     */
    readonly iconPosition?: 'left' | 'right'

    /**
     * Optional onClick handler (overrides href)
     */
    readonly onClick?: () => void
}

/**
 * Props for the CTASection component
 */
export interface CTASectionProps {
    /**
     * Main heading text
     */
    readonly heading: string

    /**
     * Optional description text
     */
    readonly description?: string | ReactNode

    /**
     * Primary CTA button
     */
    readonly primaryButton: CTAButton

    /**
     * Optional secondary CTA button
     */
    readonly secondaryButton?: CTAButton

    /**
     * Background variant
     * - default: White/light background
     * - muted: Subtle muted background
     * - accent: Accent color background
     * - primary: Primary color background
     * - luxury: Premium split-layout with background image, trust badges, and gold accents
     * @default 'accent'
     */
    readonly variant?: 'default' | 'muted' | 'accent' | 'primary' | 'luxury'

    /**
     * Text alignment (not applicable to luxury variant which uses split layout)
     * @default 'center'
     */
    readonly align?: 'left' | 'center' | 'right'

    /**
     * Additional CSS classes
     */
    readonly className?: string

    /**
     * Optional id for anchor linking
     */
    readonly id?: string

    /**
     * Button layout on mobile
     * @default 'stack'
     */
    readonly buttonLayout?: 'stack' | 'inline'

    /**
     * Section size/padding variant
     * @default 'default'
     */
    readonly size?: 'sm' | 'default' | 'lg'

    /**
     * Optional background image URL for immersive effect
     */
    readonly backgroundImage?: string

    /**
     * Trust badges to display (only applicable to luxury variant)
     * Shows credibility indicators like "Board-Certified", "15+ Years Experience"
     */
    readonly trustBadges?: readonly CTATrustBadge[]

    /**
     * Eyebrow/badge text above the heading (luxury variant)
     * Example: "Your Journey Starts Here"
     */
    readonly eyebrow?: string
}
