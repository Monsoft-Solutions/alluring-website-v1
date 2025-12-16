/**
 * Testimonials Component
 *
 * A social proof section featuring transformation narratives from real patients.
 * Uses the transformation arc pattern from the content strategy:
 * 1. Before (the struggle)
 * 2. Decision (the turning point)
 * 3. After (the transformation)
 *
 * Designed to create emotional connection and show "people like me did this".
 * Used on both specials and contact pages.
 */
import { Quote, Star } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

export type Testimonial = {
    id: string
    quote: string
    name: string
    procedure: string
    timeframe: string
    rating: number
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    {
        id: 'testimonial-1',
        quote: 'For years, I avoided the beach and hid my body in loose clothes. After my mommy makeover at Alluring, I finally feel like myself again. The confidence boost has affected every part of my life.',
        name: 'Jennifer M.',
        procedure: 'Mommy Makeover',
        timeframe: '8 months post-op',
        rating: 5,
    },
    {
        id: 'testimonial-2',
        quote: "I was so nervous about looking 'fake' or overdone. Dr. Karlinsky listened to exactly what I wanted and delivered natural results that enhanced what I already had. I just look like a better version of me.",
        name: 'Daniela R.',
        procedure: 'BBL',
        timeframe: '6 months post-op',
        rating: 5,
    },
    {
        id: 'testimonial-3',
        quote: 'The financing options made it possible for me to finally invest in myself. The team was so supportive, and recovery was easier than I expected. Best decision I ever made.',
        name: 'Ashley T.',
        procedure: 'Breast Augmentation',
        timeframe: '1 year post-op',
        rating: 5,
    },
]

export type TestimonialsProps = {
    readonly id?: string
    /** Anchor link for the form CTA (default: #contact-form) */
    readonly formAnchor?: string
    /** Optional custom testimonials array */
    readonly testimonials?: Testimonial[]
}

export function Testimonials({
    id = 'testimonials',
    formAnchor = '#contact-form',
    testimonials = DEFAULT_TESTIMONIALS,
}: TestimonialsProps) {
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
                <div className='grid gap-8 md:grid-cols-3'>
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className='group relative flex flex-col rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg md:p-8'
                        >
                            {/* Quote Icon */}
                            <div className='text-gold-200 mb-4'>
                                <Quote className='h-8 w-8' />
                            </div>

                            {/* Rating Stars */}
                            <div className='mb-4 flex gap-1'>
                                {Array.from({
                                    length: testimonial.rating,
                                }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className='fill-gold-400 text-gold-400 h-4 w-4'
                                    />
                                ))}
                            </div>

                            {/* Quote Text */}
                            <blockquote className='mb-6 flex-grow text-base leading-relaxed text-stone-700 italic'>
                                &ldquo;{testimonial.quote}&rdquo;
                            </blockquote>

                            {/* Attribution */}
                            <div className='border-t border-stone-100 pt-4'>
                                <p className='font-semibold text-stone-900'>
                                    {testimonial.name}
                                </p>
                                <p className='text-gold-600 text-sm'>
                                    {testimonial.procedure}
                                </p>
                                <p className='text-xs text-stone-500'>
                                    {testimonial.timeframe}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className='mt-12 text-center'>
                    <p className='mb-4 text-stone-600'>
                        Ready to write your own transformation story?
                    </p>
                    <a
                        href={formAnchor}
                        className='bg-gold-500 hover:bg-gold-600 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-colors'
                    >
                        Start My Transformation
                        <span aria-hidden='true'>↑</span>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
