/**
 * ImageSection Component
 *
 * A two-column layout section with an image and content (title, description, CTAs).
 * Fully responsive with mobile-first design that stacks on smaller screens.
 *
 * @example
 * ```tsx
 * <ImageSection
 *   image={{
 *     src: "/images/about-us.jpg",
 *     alt: "Our team collaborating",
 *     width: 800,
 *     height: 600
 *   }}
 *   badge="About Us"
 *   title="Building the Future Together"
 *   description="We're passionate about creating innovative solutions..."
 *   primaryButton={{ text: "Learn More", href: "/about" }}
 *   imagePosition="left"
 * />
 * ```
 */
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

import type { ImageSectionProps } from '@/lib/types/sections/image-section.type'

import { ContentWrapper } from './ContentWrapper.component'
import { SectionContainer } from './SectionContainer.component'

/**
 * Maps content alignment to flexbox classes
 */
const contentAlignStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
}

export function ImageSection({
    image,
    title,
    description,
    badge,
    primaryButton,
    secondaryButton,
    imagePosition = 'left',
    contentAlign = 'center',
    variant = 'default',
    className,
    id,
    reverseMobile = false,
    imageContainerClassName,
    contentContainerClassName,
}: ImageSectionProps) {
    const isBadgeString = typeof badge === 'string'

    return (
        <SectionContainer variant={variant} id={id} className={className}>
            <ContentWrapper>
                <div
                    className={cn(
                        'grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16',
                        reverseMobile && 'flex flex-col-reverse lg:grid'
                    )}
                >
                    {/* Image Container */}
                    <div
                        className={cn(
                            'relative overflow-hidden rounded-lg',
                            imagePosition === 'right' && 'lg:order-2',
                            imageContainerClassName
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
                                priority={image.priority}
                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw'
                            />
                        </div>
                    </div>

                    {/* Content Container */}
                    <div
                        className={cn(
                            'flex flex-col',
                            contentAlignStyles[contentAlign],
                            'space-y-6',
                            imagePosition === 'right' && 'lg:order-1',
                            contentContainerClassName
                        )}
                    >
                        {/* Badge */}
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
                        <h2 className='text-foreground text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl'>
                            {title}
                        </h2>

                        {/* Description */}
                        <div className='text-muted-foreground text-base leading-relaxed md:text-lg'>
                            {description}
                        </div>

                        {/* CTA Buttons */}
                        {(primaryButton || secondaryButton) && (
                            <div className='flex flex-col gap-4 pt-2 sm:flex-row'>
                                {primaryButton && (
                                    <Button
                                        asChild
                                        size='lg'
                                        variant={
                                            primaryButton.variant || 'default'
                                        }
                                    >
                                        <Link
                                            href={primaryButton.href}
                                            {...(primaryButton.external && {
                                                target: '_blank',
                                                rel: 'noopener noreferrer',
                                            })}
                                        >
                                            {primaryButton.text}
                                        </Link>
                                    </Button>
                                )}

                                {secondaryButton && (
                                    <Button
                                        asChild
                                        size='lg'
                                        variant={
                                            secondaryButton.variant || 'outline'
                                        }
                                    >
                                        <Link
                                            href={secondaryButton.href}
                                            {...(secondaryButton.external && {
                                                target: '_blank',
                                                rel: 'noopener noreferrer',
                                            })}
                                        >
                                            {secondaryButton.text}
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
