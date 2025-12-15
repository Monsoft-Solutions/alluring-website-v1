/**
 * SpecialsHowItWorks Component
 *
 * Explains the 4-step process to claim promotional offers.
 * Features numbered steps with icons and descriptions.
 *
 * Features:
 * - Elegant card design with hover animations
 * - Framer Motion entrance animations
 * - Mobile-first responsive layout
 */
'use client'

import { motion } from 'framer-motion'
import { Calendar, Phone, Star, Tag } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

const STEPS = [
    {
        step: 1,
        icon: Phone,
        title: 'Request Consultation',
        description:
            'Fill out the form above or call us directly. Mention the special offer you are interested in when scheduling your visit.',
    },
    {
        step: 2,
        icon: Calendar,
        title: 'Meet Our Surgeons',
        description:
            'During your complimentary consultation, a board-certified surgeon will assess your goals and create a personalized treatment plan.',
    },
    {
        step: 3,
        icon: Tag,
        title: 'Lock In Your Savings',
        description:
            'Confirm your procedure date and your promotional pricing is guaranteed—even if the public offer expires before your surgery.',
    },
    {
        step: 4,
        icon: Star,
        title: 'Start Your Transformation',
        description:
            'Experience luxury care from our expert team. World-class results at exclusive promotional pricing are now yours.',
    },
]

export type SpecialsHowItWorksProps = {
    readonly id?: string
}

export function SpecialsHowItWorks({
    id = 'how-it-works',
}: SpecialsHowItWorksProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-white'
            paddingY='py-24 lg:py-32'
        >
            {/* Subtle Background */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='bg-gold-100/30 absolute -top-[10%] right-[10%] h-[400px] w-[400px] rounded-full blur-3xl' />
                <div className='absolute -bottom-[10%] left-[5%] h-[300px] w-[300px] rounded-full bg-stone-100 blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className='mx-auto mb-16 max-w-2xl text-center'
                >
                    <div className='text-gold-500 mb-4 text-sm font-bold tracking-[0.2em] uppercase'>
                        Simple Process
                    </div>
                    <h2 className='mb-6 font-serif text-3xl text-stone-900 md:text-4xl lg:text-5xl'>
                        How to Claim Your Special
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        Securing your promotional pricing is easy. Follow these
                        four simple steps to lock in exclusive savings on your
                        procedure.
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    {STEPS.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            className='group'
                        >
                            <div className='hover:border-gold-200 relative h-full border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl'>
                                {/* Step Number */}
                                <div className='text-gold-500/20 absolute -top-4 -right-2 font-serif text-7xl font-bold'>
                                    {step.step}
                                </div>

                                {/* Icon */}
                                <div className='group-hover:bg-gold-500 relative z-10 mb-6 flex h-14 w-14 items-center justify-center bg-stone-100 text-stone-500 transition-all duration-300 group-hover:text-white'>
                                    <step.icon className='h-7 w-7' />
                                </div>

                                {/* Content */}
                                <h3 className='relative z-10 mb-3 font-serif text-xl font-semibold text-stone-900'>
                                    {step.title}
                                </h3>
                                <p className='relative z-10 text-base leading-relaxed text-stone-600'>
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Note */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className='mt-16 text-center'
                >
                    <p className='mx-auto max-w-2xl text-stone-500'>
                        <span className='font-semibold text-stone-700'>
                            Virtual consultations available
                        </span>{' '}
                        — Perfect for out-of-town patients or those with busy
                        schedules. Claim your special offer from the comfort of
                        your home.
                    </p>
                </motion.div>
            </ContentWrapper>
        </SectionContainer>
    )
}
