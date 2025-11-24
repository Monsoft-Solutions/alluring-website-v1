/**
 * ContactTestimonial Component
 *
 * Full-width featured testimonial with large quote.
 * Designed to build trust and emotional connection.
 *
 * Features:
 * - Large quote display with decorative elements
 * - Star rating visualization
 * - Patient info with procedure type
 * - Elegant animations
 */
'use client'

import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

export type ContactTestimonialProps = {
    readonly id?: string
}

export function ContactTestimonial({
    id = 'testimonial',
}: ContactTestimonialProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-white'
            paddingY='py-24 lg:py-32'
        >
            {/* Background Decorations */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-100/40 absolute -top-[15%] left-[10%] h-[400px] w-[400px] rounded-full blur-3xl' />
                <div className='absolute right-[10%] -bottom-[15%] h-[350px] w-[350px] rounded-full bg-stone-100 blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className='mx-auto max-w-4xl text-center'
                >
                    {/* Large Quote Icon */}
                    <Quote className='text-gold-200 mx-auto mb-8 h-20 w-20 fill-current' />

                    {/* Quote Text */}
                    <blockquote className='mb-10 font-serif text-2xl leading-relaxed text-stone-800 md:text-3xl lg:text-4xl'>
                        &ldquo;From my very first consultation, I knew I was in
                        the right hands. Dr. Karlinsky listened to every
                        concern, explained everything clearly, and never made me
                        feel rushed. Six months later, I finally feel like the
                        woman I was meant to be. This team gave me back my
                        confidence.&rdquo;
                    </blockquote>

                    {/* Rating */}
                    <div className='text-gold-400 mb-6 flex justify-center gap-1'>
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className='h-5 w-5 fill-current' />
                        ))}
                    </div>

                    {/* Patient Info */}
                    <div className='space-y-1'>
                        <p className='text-sm font-bold tracking-widest text-stone-900 uppercase'>
                            Jennifer M.
                        </p>
                        <p className='text-sm text-stone-500'>
                            Mommy Makeover Patient • Miami, FL
                        </p>
                    </div>

                    {/* Decorative Line */}
                    <div className='bg-gold-400 mx-auto mt-10 h-1 w-20' />
                </motion.div>

                {/* Additional Review Highlights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className='mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3'
                >
                    {[
                        {
                            quote: 'Best decision I ever made. The results exceeded my expectations.',
                            author: 'Maria G.',
                            procedure: 'BBL Patient',
                        },
                        {
                            quote: "The team's attention to detail and care made all the difference.",
                            author: 'Sarah K.',
                            procedure: 'Breast Augmentation',
                        },
                        {
                            quote: 'Professional, caring, and truly talented. I felt safe the entire time.',
                            author: 'Lisa R.',
                            procedure: 'Facelift Patient',
                        },
                    ].map((testimonial, index) => (
                        <motion.div
                            key={testimonial.author}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.4 + index * 0.1,
                            }}
                            viewport={{ once: true }}
                            className='border border-stone-200 bg-stone-50 p-6'
                        >
                            <div className='text-gold-400 mb-4 flex gap-0.5'>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className='h-3 w-3 fill-current'
                                    />
                                ))}
                            </div>
                            <p className='mb-4 text-sm leading-relaxed text-stone-600 italic'>
                                &ldquo;{testimonial.quote}&rdquo;
                            </p>
                            <div>
                                <p className='text-xs font-bold tracking-widest text-stone-900 uppercase'>
                                    {testimonial.author}
                                </p>
                                <p className='text-xs text-stone-500'>
                                    {testimonial.procedure}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </ContentWrapper>
        </SectionContainer>
    )
}
