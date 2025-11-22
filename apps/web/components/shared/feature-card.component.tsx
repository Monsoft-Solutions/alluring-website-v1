/**
 * FeatureCard Component
 *
 * A card component for displaying features or services with an icon,
 * title, description, and optional CTA link. Includes hover effects
 * and accessibility support.
 *
 * @example
 * ```tsx
 * <FeatureCard
 *   icon={Zap}
 *   title="Lightning Fast"
 *   description="Optimized for performance with sub-second load times"
 *   href="/features/performance"
 *   linkText="Learn more"
 * />
 * ```
 */
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import type { FeatureCardProps } from '@/lib/types/sections/feature-card.type'

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
 * Maps icon size to dimension classes
 */
const iconSizes = {
    sm: 'size-8',
    default: 'size-10',
    lg: 'size-12',
}

/**
 * Maps hover effect to transition classes
 */
const hoverEffects = {
    lift: 'transition-all hover:-translate-y-1 hover:shadow-md',
    border: 'transition-colors hover:border-primary',
    glow: 'transition-shadow hover:shadow-lg hover:shadow-primary/10',
    none: '',
}

export function FeatureCard({
    icon: Icon,
    title,
    description,
    href,
    linkText = 'Learn more',
    external = false,
    className,
    iconVariant = 'primary',
    iconSize = 'default',
    hoverEffect = 'lift',
    onClick,
    ariaLabel,
}: FeatureCardProps) {
    const isClickable = Boolean(href || onClick)

    const cardContent = (
        <>
            <CardHeader className='space-y-4'>
                {/* Icon Container */}
                <div
                    className={cn(
                        'bg-primary/10 w-fit rounded-lg p-3',
                        'flex items-center justify-center'
                    )}
                    aria-hidden='true'
                >
                    <Icon
                        className={cn(
                            iconSizes[iconSize],
                            iconVariants[iconVariant]
                        )}
                    />
                </div>

                {/* Title */}
                <h3 className='text-foreground text-xl font-semibold tracking-tight'>
                    {title}
                </h3>
            </CardHeader>

            <CardContent>
                {/* Description */}
                <p className='text-muted-foreground text-sm leading-relaxed md:text-base'>
                    {description}
                </p>
            </CardContent>

            {/* Optional CTA Link */}
            {href && (
                <CardFooter className='pt-2'>
                    <span
                        className={cn(
                            'inline-flex items-center gap-2',
                            'text-primary text-sm font-medium',
                            'transition-all group-hover:gap-3'
                        )}
                    >
                        {linkText}
                        <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
                    </span>
                </CardFooter>
            )}
        </>
    )

    if (href && !onClick) {
        return (
            <Link
                href={href}
                {...(external && {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                })}
                className='group focus-visible:ring-ring block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                aria-label={ariaLabel || `${title} - ${linkText}`}
            >
                <Card
                    className={cn(
                        hoverEffects[hoverEffect],
                        'h-full cursor-pointer',
                        className
                    )}
                >
                    {cardContent}
                </Card>
            </Link>
        )
    }

    return (
        <Card
            className={cn(
                hoverEffects[hoverEffect],
                isClickable && 'cursor-pointer',
                'h-full',
                className
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
        </Card>
    )
}
