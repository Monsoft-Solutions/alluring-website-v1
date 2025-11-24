/**
 * CTASection Type Definitions
 *
 * Type definitions for the CTASection component which provides
 * a prominent call-to-action section with heading, description, and buttons.
 */
import type { ReactNode } from 'react'

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
     * @default 'accent'
     */
    readonly variant?: 'default' | 'muted' | 'accent' | 'primary'

    /**
     * Text alignment
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
}
