/**
 * AboutHeroSection Component
 *
 * A hero section for the about page displaying page title, introduction,
 * and hero image. Features subtle fade-in animations and responsive layout.
 *
 * @example
 * ```tsx
 * <AboutHeroSection
 *   badge="Our Story"
 *   headline="About Our Company"
 *   description="Learn more about our mission and values..."
 *   image={{ src: "/images/about.jpg", alt: "About us" }}
 * />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'

import { ContentWrapper } from '@/components/shared/ContentWrapper.component'
import { SectionContainer } from '@/components/shared/SectionContainer.component'
import type { AboutHeroSectionProps } from '@/lib/types/sections/about-hero-section.type'

export function AboutHeroSection({
    badge,
    headline,
    description,
    image,
    variant = 'default',
    enableAnimations = true,
    className,
    id,
}: AboutHeroSectionProps) {
    return (
        <SectionContainer
            variant={variant}
            id={id}
            className={cn('py-20 md:py-28 lg:py-32', className)}
        >
            <ContentWrapper>
                <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
                    {/* Content Container */}
                    <div
                        className={cn(
                            'flex flex-col space-y-6',
                            'lg:order-1',
                            enableAnimations && 'animate-fade-in'
                        )}
                    >
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

                        {/* Description */}
                        {description && (
                            <p className='text-muted-foreground text-base leading-relaxed md:text-lg lg:text-xl'>
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Image Container */}
                    <div
                        className={cn(
                            'relative overflow-hidden rounded-lg',
                            'lg:order-2',
                            enableAnimations &&
                                'animate-fade-in [animation-delay:200ms]'
                        )}
                    >
                        <div
                            className={cn(
                                'relative',
                                image.aspectRatio || 'aspect-video'
                            )}
                        >
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
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
