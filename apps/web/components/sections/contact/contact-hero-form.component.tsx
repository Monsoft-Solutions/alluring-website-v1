/**
 * ContactHeroForm Component
 *
 * An immersive, conversion-optimized hero section with consultation form.
 * Designed as the primary conversion element for the contact page.
 *
 * Features:
 * - Emotional headline addressing patient desires
 * - Pain-agitate-solution subheadline
 * - Financing callout (affordability messaging)
 * - Testimonial quote for social proof
 * - Trust badges and risk reversal
 * - Reduced friction form
 */
'use client'

import { motion } from 'framer-motion'
import {
    Award,
    Clock,
    CreditCard,
    Languages,
    Quote,
    ShieldCheck,
} from 'lucide-react'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
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
                    {/* Left Column - Emotional Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className='text-center lg:text-left'
                    >
                        <div className='mb-6 inline-flex items-center gap-2'>
                            <span className='bg-gold-400 h-px w-8' />
                            <span className='text-gold-400 text-sm font-bold tracking-[0.2em] uppercase'>
                                Finally Feel Like You
                            </span>
                        </div>

                        <h1 className='mb-6 font-serif text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl'>
                            You Deserve to Love{' '}
                            <br className='hidden lg:block' />
                            <span className='text-gold-400 italic'>
                                What You See
                            </span>
                        </h1>

                        <p className='mx-auto mb-8 max-w-xl text-xl leading-relaxed font-light text-stone-300 lg:mx-0'>
                            You&apos;ve dreamed about it. You&apos;ve researched
                            it. Now it&apos;s time to take the first step. Meet
                            with Miami&apos;s trusted board-certified surgeons —
                            no pressure, just honest answers about your options.
                        </p>

                        {/* Financing Callout */}
                        <div className='mb-8 flex items-center justify-center gap-2 lg:justify-start'>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-4 py-2'>
                                <CreditCard className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Flexible financing from $27/week — 0% APR
                                    available
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
                                    {siteConfig.trustStats?.accreditation ??
                                        'Double Board-Certified'}{' '}
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

                    {/* Right Column - Form with Trust Elements */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                            ease: 'easeOut',
                        }}
                        className='space-y-6'
                    >
                        {/* Form Container */}
                        <div className='rounded-xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl md:p-10'>
                            <ConsultationForm
                                title='Start My Transformation'
                                subtitle='Free • Confidential • Hablamos Español'
                                source={CONTACT_SOURCES.CONTACT_HERO}
                                analyticsFormName='contact_hero_form'
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                showPreferredContactTime={false}
                            />
                        </div>

                        {/* Testimonial Quote */}
                        <div className='flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-4'>
                            <Quote className='text-gold-400 mt-1 h-5 w-5 shrink-0' />
                            <div>
                                <p className='text-sm leading-relaxed text-stone-300 italic'>
                                    &ldquo;I finally feel confident in my own
                                    skin. Dr. Karlinsky and the entire team made
                                    me feel safe and cared for every step of the
                                    way.&rdquo;
                                </p>
                                <p className='text-gold-400 mt-2 text-xs font-medium'>
                                    — Jennifer M., Mommy Makeover
                                </p>
                            </div>
                        </div>

                        {/* Risk Reversal */}
                        <p className='text-center text-sm text-stone-500'>
                            ✓ Free consultation • ✓ No obligation • ✓ Your
                            questions answered honestly
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
