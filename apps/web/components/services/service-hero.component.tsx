/**
 * ServiceHero Component
 *
 * Hero section for service detail pages displaying the service title,
 * description, category badge, hero image, and call-to-action buttons.
 *
 * Features:
 * - Large service title with semantic heading
 * - Category badge for visual classification
 * - Full service description
 * - Primary and optional secondary CTA buttons
 * - Optional hero image with Next.js Image optimization
 * - Mobile-first responsive design
 * - Proper accessibility attributes
 *
 * @example
 * <ServiceHero
 *   title="Web Development"
 *   description="Build fast, scalable web applications..."
 *   category="development"
 *   categoryLabel="Development"
 *   heroImage={{ url: '/images/services/web-dev.jpg', alt: 'Web development' }}
 *   primaryButton={{ text: 'Get Started', href: '/contact' }}
 *   secondaryButton={{ text: 'Learn More', href: '/about' }}
 * />
 */

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { ServiceHeroProps } from '@/lib/types/services/service-hero.type'

export function ServiceHero({
    title,
    description,
    categoryLabel,
    heroImage,
    primaryButton,
    secondaryButton,
}: ServiceHeroProps) {
    return (
        <section
            className='relative overflow-hidden py-12 md:py-16 lg:py-20'
            aria-labelledby='service-hero-title'
        >
            {/* Content Container */}
            <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
                <div
                    className={`grid gap-8 lg:gap-12 ${
                        heroImage
                            ? 'lg:grid-cols-2 lg:items-center'
                            : 'lg:grid-cols-1'
                    }`}
                >
                    {/* Text Content */}
                    <div
                        className={`space-y-6 ${!heroImage ? 'mx-auto max-w-3xl text-center' : ''}`}
                    >
                        {/* Category Badge */}
                        <div
                            className={!heroImage ? 'flex justify-center' : ''}
                        >
                            <Badge
                                variant='secondary'
                                className='text-sm'
                                aria-label={`Service category: ${categoryLabel}`}
                            >
                                {categoryLabel}
                            </Badge>
                        </div>

                        {/* Service Title */}
                        <h1
                            id='service-hero-title'
                            className='text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl'
                        >
                            {title}
                        </h1>

                        {/* Service Description */}
                        <p className='text-muted-foreground text-lg text-pretty sm:text-xl'>
                            {description}
                        </p>

                        {/* CTA Buttons */}
                        <div
                            className={`flex flex-wrap gap-4 ${!heroImage ? 'justify-center' : ''}`}
                        >
                            <Button asChild size='lg'>
                                <Link href={primaryButton.href}>
                                    {primaryButton.text}
                                    <ArrowRight
                                        className='ml-2 size-5'
                                        aria-hidden='true'
                                    />
                                </Link>
                            </Button>

                            {secondaryButton && (
                                <Button asChild variant='outline' size='lg'>
                                    <Link href={secondaryButton.href}>
                                        {secondaryButton.text}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Hero Image (if provided) */}
                    {heroImage && (
                        <div className='relative aspect-video w-full overflow-hidden rounded-lg lg:aspect-square'>
                            <Image
                                src={heroImage.url}
                                alt={heroImage.alt}
                                fill
                                className='object-cover'
                                priority
                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw'
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
