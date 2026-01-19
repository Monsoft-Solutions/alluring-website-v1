/**
 * Featured Testimonials Component
 *
 * A server component that fetches and displays featured testimonials from the database.
 * Supports video testimonials with inline playback.
 * Returns null if no featured testimonials exist.
 */
import Link from 'next/link'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { getFeaturedTestimonials } from '@/lib/queries/testimonials/testimonial.query'
import { FeaturedTestimonialCard } from './featured-testimonial-card.component'

export type FeaturedTestimonialsProps = {
    readonly id?: string
    /** Maximum number of testimonials to display */
    readonly limit?: number
    /** Show the "View All" link */
    readonly showViewAll?: boolean
}

export async function FeaturedTestimonials({
    id = 'testimonials',
    limit = 6,
    showViewAll = true,
}: FeaturedTestimonialsProps) {
    // Fetch featured testimonials from database
    const testimonials = await getFeaturedTestimonials(limit)

    // Return null if no featured testimonials exist
    if (testimonials.length === 0) {
        return null
    }

    return (
        <SectionContainer
            id={id}
            variant='muted'
            className='relative overflow-hidden bg-stone-50'
            paddingY='py-20 lg:py-28'
        >
            {/* Subtle Background */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute top-[30%] left-[5%] h-[300px] w-[300px] rounded-full bg-stone-200/50 blur-3xl' />
                <div className='bg-gold-100/30 absolute right-[10%] bottom-[20%] h-[250px] w-[250px] rounded-full blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <div className='mx-auto mb-12 max-w-2xl text-center lg:mb-16'>
                    <div className='text-gold-500 mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
                        Real Stories
                    </div>
                    <h2 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl'>
                        They Took the{' '}
                        <span className='text-gold-600 italic'>Leap</span>
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        These patients were once where you are now — dreaming,
                        researching, wondering. Here&apos;s what happened when
                        they finally said yes.
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {testimonials.map((testimonial) => (
                        <FeaturedTestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                        />
                    ))}
                </div>

                {/* View All Link */}
                {showViewAll && (
                    <div className='mt-12 text-center'>
                        <Link
                            href='/testimonials'
                            className='bg-gold-500 hover:bg-gold-600 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-colors'
                        >
                            View All Testimonials
                            <span aria-hidden='true'>&rarr;</span>
                        </Link>
                    </div>
                )}
            </ContentWrapper>
        </SectionContainer>
    )
}
