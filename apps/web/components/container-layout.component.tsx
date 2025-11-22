/**
 * ContainerLayout Component
 *
 * A flexible container component for simple content pages that provides
 * consistent width constraints and horizontal padding. Ideal for blog posts,
 * category pages, and other single-purpose content pages.
 *
 * @example
 * ```tsx
 * <ContainerLayout size="sm" className="py-12">
 *   <h1>Blog Post Title</h1>
 *   <p>Content goes here...</p>
 * </ContainerLayout>
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'
import type { ReactNode } from 'react'

/**
 * Container size options
 */
export type ContainerLayoutSize =
    | 'default' // container mx-auto (responsive breakpoints)
    | 'sm' // max-w-3xl
    | 'md' // max-w-5xl
    | 'lg' // max-w-6xl
    | 'xl' // max-w-7xl
    | 'full' // w-full

/**
 * Props for the ContainerLayout component
 */
export interface ContainerLayoutProps {
    /**
     * Child elements to render inside the container
     */
    children: ReactNode

    /**
     * Container size variant
     * @default 'default'
     */
    size?: ContainerLayoutSize

    /**
     * Additional CSS classes
     */
    className?: string

    /**
     * Whether to remove default horizontal padding
     * @default false
     */
    noPadding?: boolean

    /**
     * Custom horizontal padding (overrides default responsive padding)
     */
    paddingX?: string

    /**
     * HTML element to render as
     * @default 'div'
     */
    as?: 'div' | 'main' | 'section' | 'article' | 'aside'

    /**
     * Element ID for navigation/accessibility
     */
    id?: string

    /**
     * Accessible label for screen readers
     */
    ariaLabel?: string
}

export function ContainerLayout({
    children,
    size = 'default',
    className,
    noPadding = false,
    paddingX,
    as: Element = 'div',
    id,
    ariaLabel,
}: ContainerLayoutProps) {
    const sizeClasses = {
        default: 'container mx-auto',
        sm: 'container mx-auto max-w-3xl',
        md: 'container mx-auto max-w-5xl',
        lg: 'container mx-auto max-w-6xl',
        xl: 'container mx-auto max-w-7xl',
        full: 'w-full',
    }

    return (
        <Element
            id={id}
            className={cn(
                // Base container styles
                sizeClasses[size],
                // Horizontal padding (can be overridden)
                !noPadding && (paddingX || 'px-4 sm:px-6 lg:px-8'),
                // Custom classes
                className
            )}
            aria-label={ariaLabel}
        >
            {children}
        </Element>
    )
}
