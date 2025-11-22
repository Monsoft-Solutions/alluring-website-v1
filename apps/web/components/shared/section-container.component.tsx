/**
 * SectionContainer Component
 *
 * A flexible section wrapper that provides consistent vertical spacing,
 * background variants, and semantic HTML for page sections.
 *
 * @example
 * ```tsx
 * <SectionContainer variant="muted">
 *   <ContentWrapper>
 *     <h2>Section Content</h2>
 *   </ContentWrapper>
 * </SectionContainer>
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'

import type {
    SectionBackgroundVariant,
    SectionContainerProps,
} from '@/lib/types/sections/section-container.type'

/**
 * Maps background variant to Tailwind classes
 */
const backgroundVariants: Record<SectionBackgroundVariant, string> = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    accent: 'bg-accent/30',
    gradient: 'bg-gradient-to-br from-background via-muted/20 to-accent/10',
    'gradient-reverse':
        'bg-gradient-to-br from-accent/10 via-muted/20 to-background',
    subtle: 'bg-gradient-to-b from-background to-muted/20',
}

export function SectionContainer({
    children,
    variant = 'default',
    as: Element = 'section',
    id,
    className,
    noPadding = false,
    paddingY,
    ariaLabel,
}: SectionContainerProps) {
    return (
        <Element
            id={id}
            className={cn(
                // Base styles
                'w-full',
                // Background variant
                backgroundVariants[variant],
                // Vertical padding (can be overridden)
                !noPadding && (paddingY || 'py-16 md:py-24'),
                // Custom classes
                className
            )}
            aria-label={ariaLabel}
        >
            {children}
        </Element>
    )
}
