/**
 * ServiceCard Component
 *
 * A card component that displays service information in a visually appealing
 * and interactive format. Used on the services listing page to showcase
 * individual services with their key features and a call-to-action.
 *
 * Features:
 * - Displays service icon image
 * - Shows category badge in top-right corner
 * - Renders service title and excerpt with line clamping
 * - Lists up to 3 key features with checkmark icons
 * - Full-width "Learn More" button at bottom
 * - Smooth hover effects with lift animation
 * - Mobile-first responsive design
 * - Accessible keyboard navigation
 * - SSR-compatible (uses only images, no React icon components)
 *
 * @example
 * ```tsx
 * <ServiceCard service={webDevelopmentService} />
 * ```
 */

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { ServiceCardProps } from '@/lib/types/services/service-card.type'

export function ServiceCard({
    service,
    className,
    showFullDescription = false,
}: ServiceCardProps) {
    const {
        slug,
        title,
        excerpt,
        description,
        iconConfig,
        features,
        category,
        categoryLabel,
    } = service

    // Determine which description to show
    const displayDescription = showFullDescription ? description : excerpt

    // Get first 3 features for card display
    const displayFeatures = features.slice(0, 3)

    return (
        <Link
            href={`/services/${slug}`}
            className={cn(
                'group block h-full transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-lg',
                className
            )}
            aria-label={`Learn more about ${title}`}
        >
            <Card className='border-border/50 group-hover:border-border relative flex h-full flex-col overflow-hidden transition-all duration-300 group-hover:shadow-md'>
                {/* Category Badge - Positioned absolutely in top-right */}
                <div className='absolute top-4 right-4 z-10'>
                    <Badge
                        variant='secondary'
                        className='shadow-sm'
                        aria-label={`Category: ${categoryLabel}`}
                    >
                        {categoryLabel}
                    </Badge>
                </div>

                <CardHeader className='pb-4'>
                    {/* Service Icon Image */}
                    <div className='mb-4 flex items-center justify-center'>
                        <div className='bg-primary/10 group-hover:bg-primary/20 relative h-16 w-16 overflow-hidden rounded-lg p-3 transition-colors duration-300'>
                            <Image
                                src={iconConfig.cardIconPath}
                                alt={iconConfig.imageAlt}
                                fill
                                sizes='64px'
                                className='text-primary object-contain p-2 transition-transform duration-300 group-hover:scale-110'
                                priority={false}
                            />
                        </div>
                    </div>

                    {/* Service Title */}
                    <CardTitle className='text-xl leading-tight font-semibold'>
                        <span className='line-clamp-2'>{title}</span>
                    </CardTitle>
                </CardHeader>

                <CardContent className='flex flex-grow flex-col gap-4'>
                    {/* Service Excerpt/Description */}
                    <p className='text-muted-foreground line-clamp-3 text-sm'>
                        {displayDescription}
                    </p>

                    {/* Service Features (max 3) */}
                    {displayFeatures.length > 0 && (
                        <ul
                            className='space-y-2'
                            aria-label={`Key features of ${title}`}
                        >
                            {displayFeatures.map((feature, index) => (
                                <li
                                    key={
                                        feature.title ||
                                        `${category}-feature-${index}`
                                    }
                                    className='flex items-start gap-2 text-sm'
                                >
                                    <Check
                                        className='text-primary mt-0.5 h-4 w-4 flex-shrink-0'
                                        aria-hidden='true'
                                    />
                                    <span className='text-foreground/90 line-clamp-1'>
                                        {feature.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>

                <CardFooter className='mt-auto pt-4'>
                    <Button
                        variant='outline'
                        className='group-hover:bg-primary group-hover:text-primary-foreground w-full transition-all duration-300'
                        asChild
                    >
                        <span>
                            Learn More
                            <span className='sr-only'>about {title}</span>
                        </span>
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}
