/**
 * SectionHeader Type Definitions
 *
 * Type definitions for the SectionHeader component which provides
 * consistent section titles and descriptions with flexible alignment.
 */
import type { ReactNode } from 'react'

/**
 * Heading level options for section header
 */
export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

/**
 * Text alignment options
 */
export type TextAlignment = 'left' | 'center' | 'right'

/**
 * Props for the SectionHeader component
 */
export interface SectionHeaderProps {
    /**
     * Main heading text
     */
    readonly title: string

    /**
     * Optional description/subtitle text
     */
    readonly description?: string | ReactNode

    /**
     * Heading level for semantic HTML
     * @default 'h2'
     */
    readonly as?: HeadingLevel

    /**
     * Text alignment
     * @default 'center'
     */
    readonly align?: TextAlignment

    /**
     * Additional CSS classes for the container
     */
    readonly className?: string

    /**
     * Additional CSS classes for the title
     */
    readonly titleClassName?: string

    /**
     * Additional CSS classes for the description
     */
    readonly descriptionClassName?: string

    /**
     * Optional badge or label to display above title
     */
    readonly badge?: string | ReactNode

    /**
     * Spacing between title and description
     * @default 'default'
     */
    readonly spacing?: 'tight' | 'default' | 'loose'

    /**
     * Whether the section header should be sticky on large screens
     * @default false
     */
    readonly sticky?: boolean
}
