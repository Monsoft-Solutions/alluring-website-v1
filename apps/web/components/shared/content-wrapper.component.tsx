/**
 * ContentWrapper Component
 *
 * A responsive container that constrains content width and provides
 * consistent horizontal padding. Designed to work within SectionContainer.
 *
 * @example
 * ```tsx
 * <ContentWrapper size="lg">
 *   <h2>Centered Content</h2>
 *   <p>This content will be constrained to max-w-7xl</p>
 * </ContentWrapper>
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'

import type {
    ContentWrapperProps,
    ContentWrapperSize,
} from '@/lib/types/sections/content-wrapper.type'

/**
 * Maps size variant to Tailwind max-width classes
 */
const sizeVariants: Record<ContentWrapperSize, string> = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-full',
}

export function ContentWrapper({
    children,
    size = 'lg',
    className,
    noPadding = false,
    paddingX,
}: ContentWrapperProps) {
    return (
        <div
            className={cn(
                // Max width constraint
                sizeVariants[size],
                // Center alignment
                'mx-auto',
                // Horizontal padding (can be overridden)
                !noPadding && (paddingX || 'px-6'),
                // Custom classes
                className
            )}
        >
            {children}
        </div>
    )
}
