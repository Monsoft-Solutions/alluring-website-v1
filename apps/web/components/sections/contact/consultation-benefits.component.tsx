/**
 * ConsultationBenefits Component
 *
 * Explains what patients can expect from their consultation.
 * Features a 4-column grid with icons and descriptions.
 *
 * Features:
 * - Elegant card design with hover animations
 * - Framer Motion entrance animations
 * - Mobile-first responsive layout
 */
'use client'

import { motion } from 'framer-motion'
import { UserCheck, FileText, DollarSign, Heart, Sparkles } from 'lucide-react'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'

const BENEFITS = [
    {
        icon: UserCheck,
        title: 'Personalized Assessment',
        description:
            'Your surgeon will examine your unique anatomy and discuss your aesthetic goals to determine the best approach for your body.',
    },
    {
        icon: FileText,
        title: 'Custom Treatment Plan',
        description:
            "You'll receive a detailed surgical plan tailored specifically to you, including technique recommendations and expected outcomes.",
    },
    {
        icon: DollarSign,
        title: 'Transparent Pricing',
        description:
            'No surprises. Walk away with a complete cost breakdown including surgeon fees, anesthesia, facility, and all follow-up care.',
    },
    {
        icon: Heart,
        title: 'Zero Pressure',
        description:
            "We're here to educate, not sell. Take your time to make the right decision for you—we'll be here when you're ready.",
    },
]

export type ConsultationBenefitsProps = {
    readonly id?: string
}

export function ConsultationBenefits({
    id = 'consultation-benefits',
}: ConsultationBenefitsProps) {
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
                    <div className='bg-gold-100 text-gold-600 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest uppercase'>
                        <Sparkles className='h-3 w-3' />
                        Your Consultation
                    </div>
                    <h2 className='mb-6 font-serif text-3xl text-stone-900 md:text-4xl lg:text-5xl'>
                        What to Expect
                    </h2>
                    <p className='text-lg leading-relaxed text-stone-600'>
                        Your consultation is the foundation of your
                        transformation. Here's what you'll experience during
                        your visit.
                    </p>
                </motion.div>

                {/* Benefits Grid */}
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    {BENEFITS.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -8 }}
                            className='group'
                        >
                            <div className='hover:border-gold-200 h-full border border-stone-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl'>
                                {/* Icon */}
                                <div className='group-hover:bg-gold-500 mb-6 flex h-14 w-14 items-center justify-center bg-stone-100 text-stone-500 transition-all duration-300 group-hover:text-white'>
                                    <benefit.icon className='h-7 w-7' />
                                </div>

                                {/* Content */}
                                <h3 className='mb-3 font-serif text-xl font-semibold text-stone-900'>
                                    {benefit.title}
                                </h3>
                                <p className='text-base leading-relaxed text-stone-600'>
                                    {benefit.description}
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
                        schedules. Get expert guidance from the comfort of your
                        home.
                    </p>
                </motion.div>
            </ContentWrapper>
        </SectionContainer>
    )
}
