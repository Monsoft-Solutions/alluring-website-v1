/**
 * ContainerLayout Component
 *
 * A flexible container component that serves as the standard page-level wrapper
 * for all marketing pages. Provides consistent width constraints, horizontal
 * padding, marketing template styles, and proper top padding to clear the
 * fixed header.
 *
 * @example
 * ```tsx
 * // Standard page with top padding (clears fixed header)
 * <ContainerLayout as="main" noPadding size="full">
 *   <SomeSection />
 * </ContainerLayout>
 *
 * // Full-bleed hero page (hero handles its own spacing)
 * <ContainerLayout as="main" noPaddingTop noPadding size="full">
 *   <HeroSection />
 *   <OtherSection />
 * </ContainerLayout>
 *
 * // Content page with container width
 * <ContainerLayout size="sm" className="py-12">
 *   <h1>Blog Post Title</h1>
 *   <p>Content goes here...</p>
 * </ContainerLayout>
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'
import type { ReactNode } from 'react'

import { PAGE_TOP_PADDING } from '@/lib/constants/layout'

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

    /**
     * Whether to remove default top padding that clears the fixed header.
     * Use this for pages with full-bleed heroes that handle their own spacing.
     * @default false
     */
    noPaddingTop?: boolean

    /**
     * Whether to apply marketing page template styles (bg-stone-50, font-sans, etc.).
     * @default true
     */
    withMarketingStyles?: boolean
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
    noPaddingTop = false,
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
                // Marketing template styles (default on)
                // withMarketingStyles && MARKETING_PAGE_STYLES,
                // Top padding to clear fixed header (default on)
                !noPaddingTop && PAGE_TOP_PADDING,
                // Container size
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
