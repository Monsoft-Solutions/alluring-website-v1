/**
 * IconCard Component
 *
 * A lightweight card component with icon, title, and description.
 * Optimized for grid layouts (2, 3, or 4 columns) with minimal styling.
 *
 * @example
 * ```tsx
 * <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 *   <IconCard
 *     icon={Target}
 *     title="Our Mission"
 *     description="To deliver exceptional value through innovative solutions"
 *   />
 * </div>
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'
import Link from 'next/link'

import type { IconCardProps } from '@/lib/types/sections/icon-card.type'

/**
 * Maps icon style to container classes
 */
const iconStyles = {
    outlined: 'rounded-lg border-2 border-primary/20 bg-background p-3',
    filled: 'rounded-lg bg-primary/10 p-3',
    minimal: 'p-0',
}

/**
 * Maps icon variant to color classes
 */
const iconVariants = {
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    accent: 'text-accent-foreground',
    muted: 'text-muted-foreground',
}

/**
 * Maps orientation to layout classes
 */
const orientationStyles = {
    vertical: 'flex-col items-start gap-4',
    horizontal: 'flex-row items-center gap-4',
}

export function IconCard({
    icon: Icon,
    title,
    description,
    href,
    external = false,
    className,
    iconStyle = 'outlined',
    iconVariant = 'primary',
    orientation = 'vertical',
    showBorder = true,
    onClick,
    ariaLabel,
}: IconCardProps) {
    const isClickable = Boolean(href || onClick)

    const cardContent = (
        <>
            {/* Icon */}
            <div
                className={cn(
                    'flex w-fit items-center justify-center',
                    iconStyles[iconStyle]
                )}
                aria-hidden='true'
            >
                <Icon className={cn('size-6', iconVariants[iconVariant])} />
            </div>

            {/* Text Content */}
            <div className='flex-1 space-y-2'>
                <h3
                    className={cn(
                        'text-foreground text-lg font-semibold tracking-tight md:text-xl',
                        isClickable &&
                            'group-hover:text-primary transition-colors'
                    )}
                >
                    {title}
                </h3>

                <p className='text-muted-foreground text-sm leading-relaxed md:text-base'>
                    {description}
                </p>
            </div>
        </>
    )

    const baseStyles = cn(
        'flex',
        orientationStyles[orientation],
        showBorder && 'rounded-lg border border-border/50',
        showBorder && 'p-6',
        !showBorder && 'p-0',
        'transition-all',
        className
    )

    if (href && !onClick) {
        return (
            <Link
                href={href}
                {...(external && {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                })}
                className={cn(
                    'group focus-visible:ring-ring block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    'hover:border-primary/50 hover:shadow-sm'
                )}
                aria-label={ariaLabel || title}
            >
                <div className={baseStyles}>{cardContent}</div>
            </Link>
        )
    }

    return (
        <div
            className={cn(
                baseStyles,
                isClickable &&
                    'hover:border-primary/50 group cursor-pointer hover:shadow-sm'
            )}
            onClick={onClick}
            {...(onClick && {
                role: 'button',
                tabIndex: 0,
                onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onClick()
                    }
                },
            })}
            aria-label={ariaLabel || title}
        >
            {cardContent}
        </div>
    )
}
