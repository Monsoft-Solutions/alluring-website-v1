/**
 * LandingHero Component
 *
 * An immersive 50/50 split hero section for the lead generation landing page featuring:
 * - Left column: Emotional transformation imagery with badge overlay
 * - Right column: Consultation form for lead capture with trust indicators
 *
 * Adapted from SpecialsHero for maximum lead generation conversions.
 */
import {
    Award,
    ShieldCheck,
    Clock,
    CreditCard,
    Quote,
    MapPin,
} from 'lucide-react'
import Image from 'next/image'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { siteConfig } from '@/lib/data/site-config'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export type LandingHeroProps = {
    readonly id?: string
}

export function LandingHero({ id = 'hero' }: LandingHeroProps) {
    return (
        <section
            id={id}
            className='relative min-h-screen w-full overflow-hidden bg-stone-900 pt-32 lg:pt-40'
        >
            {/* Background Gradient for right side */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900' />
                <div className='bg-gold-600/10 absolute -top-[20%] right-0 h-[800px] w-[800px] rounded-full blur-3xl' />
                <div className='bg-gold-500/5 absolute right-[20%] bottom-[10%] h-[400px] w-[400px] rounded-full blur-3xl' />
            </div>

            {/* 50/50 Split Layout */}
            <div className='relative z-10 flex min-h-screen flex-col lg:flex-row'>
                {/* Left Column - Transformation Image */}
                <div className='animate-fade-in-up relative w-full lg:w-1/2'>
                    <div className='h-[65vh] p-4 lg:h-full lg:p-20'>
                        {/* Hero Image with Overlay Content */}
                        <div className='shadow-gold-500/20 relative h-full w-full overflow-hidden rounded-2xl shadow-2xl sm:rounded-none sm:shadow-none'>
                            <Image
                                src='/images/hero-beautiful-latin-woman.jpg'
                                alt='Beautiful woman confidently smiling after her transformation'
                                fill
                                className='object-cover object-top lg:object-contain lg:object-center'
                                priority
                                sizes='(max-width: 1024px) 100vw, 50vw'
                            />
                            {/* Gradient overlay for text readability */}
                            <div className='absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent lg:hidden' />

                            {/* Mobile Badge Overlay */}
                            <div className='absolute right-6 bottom-6 left-6 lg:hidden'>
                                <div className='flex items-center gap-2 text-white'>
                                    <MapPin className='text-gold-400 h-4 w-4' />
                                    <span className='text-sm font-medium'>
                                        Miami, FL
                                    </span>
                                    <span className='text-gold-400'>|</span>
                                    <span className='text-sm font-medium'>
                                        Board-Certified Surgeons
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className='animate-fade-in-up flex w-full flex-col justify-center px-6 py-8 delay-200 md:px-12 lg:w-1/2 lg:py-16'>
                    <div className='mx-auto w-full max-w-2xl'>
                        {/* Location Badge - Desktop */}
                        <div className='mb-4 hidden items-center gap-2 lg:flex'>
                            <MapPin className='text-gold-400 h-4 w-4' />
                            <span className='text-sm font-medium text-stone-400'>
                                Miami, FL
                            </span>
                            <span className='text-gold-400'>|</span>
                            <span className='text-sm font-medium text-stone-400'>
                                Board-Certified Surgeons
                            </span>
                        </div>

                        {/* Emotional Headline */}
                        <div className='mb-6 text-center lg:text-left'>
                            <h1 className='mb-3 font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                                Your Confidence is{' '}
                                <span className='text-gold-400 italic'>
                                    Waiting
                                </span>
                            </h1>
                            <p className='text-lg leading-relaxed text-stone-300'>
                                Join 5,000+ women who trusted Alluring to feel
                                like themselves again. Free consultation. No
                                obligation.
                            </p>
                        </div>

                        {/* Financing Callout */}
                        <div className='mb-6 flex items-center justify-center gap-2 lg:justify-start'>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-4 py-2'>
                                <CreditCard className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    From $27/week | 0% APR available
                                </span>
                            </div>
                        </div>

                        {/* Form Container */}
                        <div
                            id='hero-form'
                            className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8'
                        >
                            <ConsultationForm
                                title='Start Your Transformation'
                                subtitle='Free Consultation • No Pressure • Hablamos Español'
                                source={CONTACT_SOURCES.LANDING_PAGE}
                                analyticsFormName='landing_hero_form'
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                showPreferredContactTime={false}
                            />
                        </div>

                        {/* Trust Cluster */}
                        <div className='mt-8 space-y-6'>
                            {/* Testimonial Quote */}
                            <div className='flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-4'>
                                <Quote className='text-gold-400 mt-1 h-5 w-5 shrink-0' />
                                <div>
                                    <p className='text-sm leading-relaxed text-stone-300 italic'>
                                        &ldquo;The team made me feel so
                                        comfortable from day one. Best decision
                                        I ever made for myself.&rdquo;
                                    </p>
                                    <p className='text-gold-400 mt-2 text-xs font-medium'>
                                        — Maria R., BBL Patient
                                    </p>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className='flex flex-wrap justify-center gap-6 lg:justify-start'>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <ShieldCheck className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        {siteConfig.trustStats?.accreditation ??
                                            'Double Board-Certified'}{' '}
                                        Accredited
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Award className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        Board-Certified
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Clock className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        24hr Response
                                    </span>
                                </div>
                            </div>

                            {/* Risk Reversal Message */}
                            <p className='text-center text-sm text-stone-500 lg:text-left'>
                                ✓ Free consultation • ✓ No obligation • ✓
                                Pricing locked once you book
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
