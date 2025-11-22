/**
 * SectionHeader Component
 *
 * A reusable section header with title, optional description, badge,
 * and flexible alignment. Follows design system typography patterns.
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   badge="Our Services"
 *   title="What We Offer"
 *   description="Comprehensive solutions tailored to your needs"
 *   align="center"
 * />
 * ```
 */
import { Badge } from '@workspace/ui/components/badge'
import { cn } from '@workspace/ui/lib/utils'

import type {
    HeadingLevel,
    SectionHeaderProps,
    TextAlignment,
} from '@/lib/types/sections/section-header.type'

/**
 * Maps heading level to Tailwind typography classes
 */
const headingStyles: Record<HeadingLevel, string> = {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
    h3: 'text-2xl md:text-3xl lg:text-4xl font-semibold',
    h4: 'text-xl md:text-2xl font-semibold',
    h5: 'text-lg md:text-xl font-semibold',
    h6: 'text-base md:text-lg font-semibold',
}

/**
 * Maps text alignment to Tailwind classes
 */
const alignmentStyles: Record<TextAlignment, string> = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
}

/**
 * Maps spacing variant to gap classes
 */
const spacingStyles = {
    tight: 'space-y-2',
    default: 'space-y-4',
    loose: 'space-y-6',
}

export function SectionHeader({
    title,
    description,
    as: Heading = 'h2',
    align = 'center',
    className,
    titleClassName,
    descriptionClassName,
    badge,
    spacing = 'default',
}: SectionHeaderProps) {
    const isBadgeString = typeof badge === 'string'

    return (
        <div
            className={cn(
                // Flex container for alignment
                'flex flex-col',
                // Spacing between elements
                spacingStyles[spacing],
                // Alignment
                alignmentStyles[align],
                // Custom classes
                className
            )}
        >
            {/* Optional Badge */}
            {badge && (
                <div className='inline-flex'>
                    {isBadgeString ? (
                        <Badge
                            variant='secondary'
                            className='text-xs font-medium'
                        >
                            {badge}
                        </Badge>
                    ) : (
                        badge
                    )}
                </div>
            )}

            {/* Title */}
            <Heading
                className={cn(
                    headingStyles[Heading],
                    'text-foreground tracking-tight',
                    titleClassName
                )}
            >
                {title}
            </Heading>

            {/* Optional Description */}
            {description && (
                <div
                    className={cn(
                        'text-muted-foreground max-w-3xl text-base md:text-lg',
                        align === 'center' && 'mx-auto',
                        descriptionClassName
                    )}
                >
                    {description}
                </div>
            )}
        </div>
    )
}
