/**
 * StorySection Component
 *
 * Displays company story with image and text in a two-column layout.
 * Supports flexible image positioning (left/right) and responsive behavior.
 *
 * @example
 * ```tsx
 * <StorySection
 *   headline="Our Journey"
 *   content="Founded in 2010 with a vision..."
 *   image={{ src: "/images/story.jpg", alt: "Our office" }}
 *   imagePosition="right"
 * />
 * ```
 */
import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { SectionHeader } from '@/components/shared/section-header.component'
import type { StorySectionProps } from '@/lib/types/sections/story-section.type'

export function StorySection({
    badge,
    headline,
    content,
    image,
    imagePosition = 'right',
    variant = 'default',
    enableAnimations = true,
    className,
    id,
}: StorySectionProps) {
    return (
        <SectionContainer
            variant={variant}
            id={id}
            className={cn('py-16 md:py-24 lg:py-32', className)}
        >
            <ContentWrapper>
                <div className='grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16'>
                    {/* Content Container */}
                    <div
                        className={cn(
                            'flex flex-col space-y-6',
                            imagePosition === 'right' && 'lg:order-1',
                            imagePosition === 'left' && 'lg:order-2',
                            enableAnimations && 'animate-fade-in'
                        )}
                    >
                        {/* Badge and Headline */}
                        <SectionHeader
                            badge={badge}
                            title={headline}
                            align='left'
                        />

                        {/* Content */}
                        <div className='text-muted-foreground space-y-4 text-base leading-relaxed md:text-lg'>
                            {typeof content === 'string'
                                ? content
                                      .split('\n\n')
                                      .map((paragraph, index) => (
                                          <p key={`story-paragraph-${index}`}>
                                              {paragraph}
                                          </p>
                                      ))
                                : content}
                        </div>
                    </div>

                    {/* Image Container */}
                    <div
                        className={cn(
                            'relative overflow-hidden rounded-lg',
                            imagePosition === 'right' && 'lg:order-2',
                            imagePosition === 'left' && 'lg:order-1',
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
                                priority={image.priority ?? false}
                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw'
                            />
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
