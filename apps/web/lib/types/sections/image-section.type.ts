/**
 * ImageSection Type Definitions
 *
 * Type definitions for the ImageSection component which provides
 * a two-column layout with image and content (title, description, CTA).
 */
import type { ReactNode } from 'react'

/**
 * CTA button configuration for image section
 */
export interface ImageSectionButton {
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
}

/**
 * Image configuration for image section
 */
export interface ImageConfig {
    /**
     * Image source URL
     */
    readonly src: string

    /**
     * Image alt text (required for accessibility)
     */
    readonly alt: string

    /**
     * Image width (for Next.js Image optimization)
     */
    readonly width?: number

    /**
     * Image height (for Next.js Image optimization)
     */
    readonly height?: number

    /**
     * Whether to prioritize loading this image
     * @default false
     */
    readonly priority?: boolean

    /**
     * Image aspect ratio class
     * @default 'aspect-video'
     */
    readonly aspectRatio?: string
}

/**
 * Props for the ImageSection component
 */
export interface ImageSectionProps {
    /**
     * Image configuration
     */
    readonly image: ImageConfig

    /**
     * Section title
     */
    readonly title: string

    /**
     * Section description
     */
    readonly description: string | ReactNode

    /**
     * Optional badge or label above title
     */
    readonly badge?: string | ReactNode

    /**
     * Optional primary CTA button
     */
    readonly primaryButton?: ImageSectionButton

    /**
     * Optional secondary CTA button
     */
    readonly secondaryButton?: ImageSectionButton

    /**
     * Image position
     * @default 'left'
     */
    readonly imagePosition?: 'left' | 'right'

    /**
     * Content vertical alignment
     * @default 'center'
     */
    readonly contentAlign?: 'start' | 'center' | 'end'

    /**
     * Background variant
     * @default 'default'
     */
    readonly variant?: 'default' | 'muted' | 'accent'

    /**
     * Additional CSS classes
     */
    readonly className?: string

    /**
     * Optional id for anchor linking
     */
    readonly id?: string

    /**
     * Whether to reverse column order on mobile
     * @default false (image always stacks on top by default)
     */
    readonly reverseMobile?: boolean

    /**
     * Custom image container classes
     */
    readonly imageContainerClassName?: string

    /**
     * Custom content container classes
     */
    readonly contentContainerClassName?: string

    /**
     * Whether to include ImageObject schema
     * @default false
     */
    readonly includeSchema?: boolean
}
