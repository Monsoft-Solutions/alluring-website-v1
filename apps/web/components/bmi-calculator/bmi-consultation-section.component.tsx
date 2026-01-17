'use client'

/**
 * BMI Consultation Section Component
 *
 * A consultation form section specifically designed for the BMI calculator page.
 * Uses the shared ConsultationForm component with BMI-specific context and messaging.
 */
import { motion } from 'framer-motion'
import { Award, Calculator, Languages, ShieldCheck } from 'lucide-react'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

type BmiConsultationSectionProps = {
    readonly id?: string
    readonly className?: string
}

export function BmiConsultationSection({
    id = 'bmi-consultation',
    className,
}: BmiConsultationSectionProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            noPadding
            className={className}
        >
            <div className='relative overflow-hidden bg-stone-900 py-16 md:py-24'>
                {/* Background Decorative Elements */}
                <div className='pointer-events-none absolute inset-0'>
                    <div className='bg-gold-600/10 absolute -top-[20%] -right-[15%] h-[600px] w-[600px] rounded-full blur-3xl' />
                    <div className='absolute -bottom-[20%] -left-[10%] h-[400px] w-[400px] rounded-full bg-stone-700/30 blur-3xl' />
                </div>

                <ContentWrapper size='lg' className='relative z-10'>
                    <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
                        {/* Left Column - Context & Trust */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            viewport={{ once: true }}
                            className='text-center lg:text-left'
                        >
                            <div className='mb-6 inline-flex items-center gap-2'>
                                <span className='bg-gold-400 h-px w-8' />
                                <span className='text-gold-400 text-sm font-bold tracking-[0.2em] uppercase'>
                                    Beyond the Numbers
                                </span>
                            </div>

                            <h2 className='mb-6 font-serif text-3xl leading-[1.1] text-white md:text-4xl lg:text-5xl'>
                                Your BMI Is Just the{' '}
                                <span className='text-gold-400 italic'>
                                    Starting Point
                                </span>
                            </h2>

                            <p className='mx-auto mb-8 max-w-xl text-lg leading-relaxed font-light text-stone-300 lg:mx-0'>
                                While BMI helps evaluate surgical candidacy, our
                                board-certified surgeons consider your complete
                                health profile, body composition, and personal
                                goals. Get honest, personalized answers about
                                your options — no pressure, just expert
                                guidance.
                            </p>

                            {/* BMI-Specific Value Props */}
                            <div className='mb-8 space-y-3'>
                                <div className='flex items-center justify-center gap-3 lg:justify-start'>
                                    <Calculator className='text-gold-400 h-5 w-5' />
                                    <span className='text-stone-300'>
                                        Comprehensive body composition
                                        assessment
                                    </span>
                                </div>
                                <div className='flex items-center justify-center gap-3 lg:justify-start'>
                                    <ShieldCheck className='text-gold-400 h-5 w-5' />
                                    <span className='text-stone-300'>
                                        Personalized safety evaluation
                                    </span>
                                </div>
                                <div className='flex items-center justify-center gap-3 lg:justify-start'>
                                    <Award className='text-gold-400 h-5 w-5' />
                                    <span className='text-stone-300'>
                                        Honest candidacy assessment
                                    </span>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className='flex flex-wrap justify-center gap-6 lg:justify-start'>
                                <div className='flex items-center gap-2 text-stone-400'>
                                    <Languages className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        Hablamos Español
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400'>
                                    <ShieldCheck className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        Board-Certified Surgeons
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - Consultation Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.2,
                                ease: 'easeOut',
                            }}
                            viewport={{ once: true }}
                        >
                            <div className='rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10'>
                                <ConsultationForm
                                    title='Get Your Personalized Assessment'
                                    subtitle='Free • Confidential • No Obligation'
                                    source={CONTACT_SOURCES.BMI_CALCULATOR}
                                    analyticsFormName='bmi_calculator_consultation_form'
                                    enableAnalytics
                                    redirectOnSuccess='/thank-you'
                                    showPreferredContactTime={false}
                                />
                            </div>

                            {/* Risk Reversal */}
                            <p className='mt-4 text-center text-sm text-stone-500'>
                                ✓ Free consultation • ✓ No obligation • ✓ Your
                                questions answered honestly
                            </p>
                        </motion.div>
                    </div>
                </ContentWrapper>
            </div>
        </SectionContainer>
    )
}
