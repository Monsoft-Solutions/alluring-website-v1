/**
 * ContactHeroForm Component
 *
 * An immersive hero section with an integrated consultation form.
 * Designed as the primary conversion element for the contact page.
 *
 * Features:
 * - Full viewport hero with elegant background treatment
 * - Uses shared ConsultationForm component
 * - Trust badges below the form
 * - Responsive design with mobile-first approach
 */
'use client'

import { motion } from 'framer-motion'
import { Award, Clock, ShieldCheck } from 'lucide-react'

import { ConsultationForm } from '@/components/shared/forms'
import { siteConfig } from '@/lib/data/site-config'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export type ContactHeroFormProps = {
    readonly id?: string
}

export function ContactHeroForm({ id = 'contact-hero' }: ContactHeroFormProps) {
    return (
        <section
            id={id}
            className='relative min-h-screen w-full overflow-hidden bg-stone-900'
        >
            {/* Background Layers */}
            <div className='pointer-events-none absolute inset-0'>
                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900' />

                {/* Decorative Blurs */}
                <div className='bg-gold-600/10 absolute -top-[20%] -right-[15%] h-[800px] w-[800px] rounded-full blur-3xl' />
                <div className='absolute -bottom-[30%] -left-[15%] h-[600px] w-[600px] rounded-full bg-stone-700/30 blur-3xl' />
                <div className='bg-gold-500/5 absolute top-[40%] left-[20%] h-[400px] w-[400px] rounded-full blur-3xl' />

                {/* Subtle Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-[0.02]" />
            </div>

            {/* Content Container */}
            <div className='relative z-10 container mx-auto px-6 py-20 md:px-12 lg:py-32'>
                <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-20'>
                    {/* Left Column - Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className='text-center lg:text-left'
                    >
                        <div className='mb-6 inline-flex items-center gap-2'>
                            <span className='bg-gold-400 h-px w-8' />
                            <span className='text-gold-400 text-sm font-bold tracking-[0.2em] uppercase'>
                                Start Your Journey
                            </span>
                        </div>

                        <h1 className='mb-6 font-serif text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl'>
                            Your Transformation{' '}
                            <br className='hidden lg:block' />
                            <span className='text-gold-400 italic'>
                                Begins Here
                            </span>
                        </h1>

                        <p className='mx-auto mb-10 max-w-xl text-xl leading-relaxed font-light text-stone-300 lg:mx-0'>
                            Schedule your private consultation with our
                            board-certified surgeons. We&apos;ll discuss your
                            goals, answer every question, and create a
                            personalized plan for your aesthetic journey.
                        </p>

                        {/* Trust Indicators */}
                        <div className='flex flex-wrap justify-center gap-6 lg:justify-start'>
                            <div className='flex items-center gap-2 text-stone-400'>
                                <ShieldCheck className='text-gold-400 h-5 w-5' />
                                <span className='text-sm font-medium'>
                                    {siteConfig.trustStats?.accreditation ??
                                        'AAAASF'}{' '}
                                    Accredited
                                </span>
                            </div>
                            <div className='flex items-center gap-2 text-stone-400'>
                                <Award className='text-gold-400 h-5 w-5' />
                                <span className='text-sm font-medium'>
                                    Board-Certified
                                </span>
                            </div>
                            <div className='flex items-center gap-2 text-stone-400'>
                                <Clock className='text-gold-400 h-5 w-5' />
                                <span className='text-sm font-medium'>
                                    24hr Response
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: 'easeOut',
                        }}
                    >
                        <div className='border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10'>
                            <ConsultationForm
                                title='Request Your Consultation'
                                subtitle='Complimentary • Confidential • No Obligation'
                                source={CONTACT_SOURCES.CONTACT_HERO}
                                analyticsFormName='contact_hero_form'
                                enableAnalytics
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
