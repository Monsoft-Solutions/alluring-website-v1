/**
 * ServicesTestimonials Component
 *
 * Displays client testimonials in a responsive grid layout.
 * Shows real feedback from clients about our services.
 *
 * Features:
 * - Responsive grid layout (1-2-3 columns)
 * - Star ratings display
 * - Client photos and company information
 * - Quote styling with proper typography
 * - Service tagging
 *
 * @example
 * ```tsx
 * <ServicesTestimonials
 *   title="What Our Clients Say"
 *   showAll={false}
 * />
 * ```
 */

import { Card, CardContent } from '@workspace/ui/components/card'
import { cn } from '@workspace/ui/lib/utils'
import { Star } from 'lucide-react'
import Image from 'next/image'

import { ContentWrapper } from '@/components/shared/ContentWrapper.component'
import { SectionContainer } from '@/components/shared/SectionContainer.component'
import { SectionHeader } from '@/components/shared/SectionHeader.component'
import { servicesTestimonials } from '@/lib/data/services/services-page-content'
import type { ServicesTestimonialsProps } from '@/lib/types/services/services-page.type'

export function ServicesTestimonials({
    title = 'What Our Clients Say',
    description = 'Real feedback from clients who have experienced our services firsthand',
    className,
    showAll = false,
}: ServicesTestimonialsProps) {
    // Show first 6 testimonials by default, or all if showAll is true
    const displayTestimonials = showAll
        ? servicesTestimonials
        : servicesTestimonials.slice(0, 6)

    return (
        <SectionContainer
            variant='muted'
            className={cn('py-16 md:py-24', className)}
        >
            <ContentWrapper size='lg'>
                {/* Section Header */}
                <SectionHeader
                    title={title}
                    description={description}
                    align='center'
                    spacing='loose'
                    className='mb-12'
                />

                {/* Testimonials Grid */}
                <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {displayTestimonials.map((testimonial, index) => (
                        <Card
                            key={`testimonial-${index}`}
                            className='from-card via-card/95 to-muted/20 border-border/50 hover:shadow-primary/5 relative h-full bg-gradient-to-br transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
                        >
                            <CardContent className='p-6'>
                                {/* Star Rating */}
                                <div className='mb-4 flex items-center gap-1'>
                                    {[...Array(testimonial.rating)].map(
                                        (_, starIndex) => (
                                            <Star
                                                key={starIndex}
                                                className='text-primary h-4 w-4 fill-current'
                                                aria-hidden='true'
                                            />
                                        )
                                    )}
                                    <span className='sr-only'>
                                        {testimonial.rating} out of 5 stars
                                    </span>
                                </div>

                                {/* Quote */}
                                <blockquote className='text-foreground/90 mb-6 text-sm leading-relaxed'>
                                    &ldquo;{testimonial.quote}&rdquo;
                                </blockquote>

                                {/* Author Info */}
                                <div className='flex items-start gap-3'>
                                    {/* Avatar */}
                                    <div className='bg-muted relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full'>
                                        {testimonial.author.avatar ? (
                                            <Image
                                                src={testimonial.author.avatar}
                                                alt={`${testimonial.author.name} profile photo`}
                                                fill
                                                sizes='48px'
                                                className='object-cover'
                                            />
                                        ) : (
                                            <div className='bg-primary/10 text-primary flex h-full w-full items-center justify-center text-sm font-semibold'>
                                                {testimonial.author.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Name and Company */}
                                    <div className='min-w-0 flex-1'>
                                        <div className='text-sm font-medium'>
                                            {testimonial.author.name}
                                        </div>
                                        <div className='text-muted-foreground text-xs'>
                                            {testimonial.author.title}
                                        </div>
                                        <div className='text-muted-foreground text-xs'>
                                            {testimonial.author.company}
                                        </div>
                                    </div>
                                </div>

                                {/* Service Tag */}
                                <div className='border-border/50 mt-4 border-t pt-4'>
                                    <div className='bg-primary/10 text-primary inline-block rounded-full px-3 py-1 text-xs font-medium'>
                                        {testimonial.service}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* View More CTA - if not showing all */}
                {!showAll && servicesTestimonials.length > 6 && (
                    <div className='mt-12 text-center'>
                        <a
                            href='/testimonials'
                            className='text-primary font-medium underline-offset-4 hover:underline'
                            aria-label='View all client testimonials'
                        >
                            View all testimonials
                        </a>
                    </div>
                )}
            </ContentWrapper>
        </SectionContainer>
    )
}
