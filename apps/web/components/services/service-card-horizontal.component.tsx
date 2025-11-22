/**
 * ServiceCardHorizontal Component
 *
 * A horizontal card component that displays service information in a 60/40 image/text
 * split layout with alternating image positions. Used on the services listing page
 * to showcase services in a more visual and engaging format.
 *
 * Features:
 * - 60/40 image to text ratio on desktop/tablet
 * - Alternating image position (left/right)
 * - Stacks vertically on mobile devices
 * - Category badge overlay on image
 * - Service features with checkmark icons
 * - Smooth hover effects and transitions
 * - Full accessibility support
 * - SSR-compatible with Next.js Image optimization
 *
 * @example
 * ```tsx
 * <ServiceCardHorizontal
 *   service={webDevelopmentService}
 *   imagePosition="left"
 * />
 * ```
 */

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { ServiceCardProps } from '@/lib/types/services/service-card.type'

export function ServiceCardHorizontal({
    service,
    className,
    showFullDescription = false,
    imagePosition = 'left',
}: ServiceCardProps) {
    const {
        slug,
        title,
        excerpt,
        description,
        iconConfig,
        features,
        categoryLabel,
    } = service

    // Determine which description to show
    const displayDescription = showFullDescription ? description : excerpt

    // Get first 3 features for card display
    const displayFeatures = features.slice(0, 3)

    // Layout classes based on image position
    const containerClasses = cn(
        'group block transition-all duration-300',
        'hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10',
        className
    )

    const cardClasses = cn(
        'border-border/50 group-hover:border-border',
        'relative overflow-hidden transition-all duration-300 rounded-lg',
        'group-hover:shadow-xl group-hover:shadow-primary/5',
        'bg-gradient-to-br from-card via-card/95 to-muted/30',
        // Horizontal layout for desktop/tablet
        'flex flex-col md:flex-row',
        // Image position determines flex direction on desktop
        imagePosition === 'right' && 'md:flex-row-reverse',
        'py-0'
    )

    return (
        <Link
            href={`/services/${slug}`}
            className={containerClasses}
            aria-label={`Learn more about ${title}`}
        >
            <Card className={cardClasses}>
                {/* Image Section - 60% width on desktop */}
                <div className='relative w-full md:w-3/5'>
                    {/* Service Hero Image */}
                    <div
                        className={cn(
                            'relative aspect-[4/3] overflow-hidden md:aspect-[3/2]',
                            'rounded-t-lg md:rounded-t-none',
                            imagePosition === 'left'
                                ? 'md:rounded-l-lg'
                                : 'md:rounded-r-lg'
                        )}
                    >
                        <Image
                            src={
                                iconConfig.heroImagePath ||
                                iconConfig.cardIconPath
                            }
                            alt={iconConfig.imageAlt}
                            fill
                            sizes='(max-width: 768px) 100vw, 60vw'
                            className='object-cover transition-transform duration-500 group-hover:scale-105'
                            priority={false}
                        />

                        {/* Overlay gradient for better badge visibility and visual interest */}
                        <div className='to-primary/10 absolute inset-0 bg-gradient-to-br from-black/30 via-transparent' />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30' />

                        {/* Category Badge - Positioned in top corner */}
                        <div className='absolute top-4 left-4 z-10'>
                            <Badge
                                variant='secondary'
                                className='bg-background/95 border-border/50 border shadow-md backdrop-blur-sm'
                                aria-label={`Category: ${categoryLabel}`}
                            >
                                {categoryLabel}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Content Section - 40% width on desktop */}
                <div className='flex flex-1 flex-col justify-between p-6 md:w-2/5'>
                    {/* Main Content */}
                    <div className='space-y-4'>
                        {/* Service Title */}
                        <h3 className='text-2xl leading-tight font-bold'>
                            <span className='line-clamp-2'>{title}</span>
                        </h3>

                        {/* Service Description */}
                        <p className='text-muted-foreground line-clamp-3 text-sm leading-relaxed'>
                            {displayDescription}
                        </p>

                        {/* Service Features */}
                        {displayFeatures.length > 0 && (
                            <ul
                                className='space-y-2'
                                aria-label={`Key features of ${title}`}
                            >
                                {displayFeatures.map((feature, index) => (
                                    <li
                                        key={
                                            feature.title || `feature-${index}`
                                        }
                                        className='flex items-start gap-3 text-sm'
                                    >
                                        <Check
                                            className='text-primary mt-1 h-4 w-4 flex-shrink-0'
                                            aria-hidden='true'
                                        />
                                        <span className='text-foreground/90 line-clamp-2'>
                                            <strong className='font-medium'>
                                                {feature.title}:
                                            </strong>{' '}
                                            {feature.description}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* CTA Button */}
                    <div className='mt-6 pt-4'>
                        <Button
                            variant='outline'
                            size='lg'
                            className='group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-primary/25 group-hover:border-primary w-full transition-all duration-300 group-hover:shadow-lg'
                            asChild
                        >
                            <span>
                                Learn More
                                <span className='sr-only'>about {title}</span>
                            </span>
                        </Button>
                    </div>
                </div>
            </Card>
        </Link>
    )
}
