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
    h2: 'text-3xl md:text-4xl lg:text-5xl',
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
    sticky = false,
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
                // Sticky behavior
                sticky && 'lg:sticky lg:top-32',
                // Custom classes
                className
            )}
        >
            {/* Optional Badge */}
            {badge && (
                <div className='inline-flex'>
                    {isBadgeString ? (
                        <span className='text-gold-500 block text-sm font-bold tracking-[0.2em] uppercase'>
                            {badge}
                        </span>
                    ) : (
                        badge
                    )}
                </div>
            )}

            {/* Title */}
            <Heading
                className={cn(
                    headingStyles[Heading],
                    'font-serif tracking-tight text-stone-900',
                    titleClassName
                )}
            >
                {title}
            </Heading>

            {/* Optional Description */}
            {description && (
                <div
                    className={cn(
                        'max-w-md text-lg leading-relaxed font-light text-stone-600',
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
