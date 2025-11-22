/**
 * HeroSection Component
 *
 * A generic hero section for the homepage displaying:
 * - Headline and subheadline
 * - Primary and Secondary CTAs
 * - Hero image
 *
 * Features:
 * - Responsive layout (Grid on desktop, Stack on mobile)
 * - Animated entrance
 * - Configurable content
 *
 * @example
 * ```tsx
 * <HeroSection
 *   badge="New Release"
 *   headline="Build Faster"
 *   subheadline="The ultimate starting point..."
 *   primaryCTA={{ text: "Get Started", href: "/start" }}
 *   secondaryCTA={{ text: "Learn More", href: "/about" }}
 *   image={{ src: "/hero.png", alt: "Hero Image" }}
 * />
 * ```
 */
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'

export interface HeroSectionProps {
    badge?: string
    headline: string
    subheadline?: string
    primaryCTA?: {
        text: string
        href: string
    }
    secondaryCTA?: {
        text: string
        href: string
    }
    image?: {
        src: string
        alt: string
        priority?: boolean
    }
    variant?: 'default' | 'muted' | 'accent'
    className?: string
    id?: string
}

export function HeroSection({
    badge,
    headline,
    subheadline,
    primaryCTA,
    secondaryCTA,
    image,
    variant = 'default',
    className,
    id,
}: HeroSectionProps) {
    return (
        <SectionContainer
            variant={variant}
            id={id}
            className={cn('py-20 md:py-28 lg:py-32', className)}
        >
            <ContentWrapper>
                <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
                    {/* Content Container */}
                    <div className='animate-fade-in flex flex-col space-y-8'>
                        {/* Badge */}
                        {badge && (
                            <div className='text-primary text-sm font-semibold tracking-wider uppercase md:text-base'>
                                {badge}
                            </div>
                        )}

                        {/* Headline */}
                        <h1 className='text-foreground text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl'>
                            {headline}
                        </h1>

                        {/* Subheadline */}
                        {subheadline && (
                            <p className='text-muted-foreground text-lg leading-relaxed md:text-xl'>
                                {subheadline}
                            </p>
                        )}

                        {/* CTAs */}
                        {(primaryCTA || secondaryCTA) && (
                            <div className='flex flex-col gap-4 sm:flex-row'>
                                {primaryCTA && (
                                    <Button size='lg' asChild>
                                        <Link href={primaryCTA.href}>
                                            {primaryCTA.text}
                                            <ArrowRight className='ml-2 h-4 w-4' />
                                        </Link>
                                    </Button>
                                )}
                                {secondaryCTA && (
                                    <Button size='lg' variant='outline' asChild>
                                        <Link href={secondaryCTA.href}>
                                            {secondaryCTA.text}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Image Container */}
                    {image && (
                        <div className='animate-fade-in relative overflow-hidden rounded-lg [animation-delay:200ms]'>
                            <div className='relative aspect-video lg:aspect-square'>
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className='object-cover'
                                    priority={image.priority ?? true}
                                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw'
                                />
                            </div>
                        </div>
                    )}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
