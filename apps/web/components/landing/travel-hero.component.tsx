/**
 * TravelHero Component
 *
 * A travel/medical tourism focused hero section for out-of-town patients:
 * - Emphasizes fly-in concierge services
 * - Virtual consultation first approach
 * - Recovery accommodation support
 * - "Vacation + transformation" positioning
 *
 * Optimized for patients traveling from other states or countries.
 */
import {
    ShieldCheck,
    Clock,
    CreditCard,
    Quote,
    Plane,
    Video,
    Building,
    Palmtree,
} from 'lucide-react'
import Image from 'next/image'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export type TravelHeroProps = {
    readonly id?: string
}

export function TravelHero({ id = 'hero' }: TravelHeroProps) {
    return (
        <section
            id={id}
            className='relative min-h-screen w-full overflow-hidden bg-stone-900 pt-32 lg:pt-40'
        >
            {/* Background Gradient */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900' />
                <div className='bg-gold-600/10 absolute -top-[20%] right-0 h-[800px] w-[800px] rounded-full blur-3xl' />
                <div className='bg-gold-500/5 absolute right-[20%] bottom-[10%] h-[400px] w-[400px] rounded-full blur-3xl' />
            </div>

            {/* 50/50 Split Layout */}
            <div className='relative z-10 flex min-h-screen flex-col lg:flex-row'>
                {/* Left Column - Image */}
                <div className='animate-fade-in-up relative w-full lg:w-1/2'>
                    <div className='h-[65vh] p-4 lg:h-full lg:p-20'>
                        <div className='shadow-gold-500/20 relative h-full w-full overflow-hidden rounded-2xl shadow-2xl sm:rounded-none sm:shadow-none'>
                            <Image
                                src='/images/hero-beautiful-latin-woman.jpg'
                                alt='Beautiful woman enjoying her Miami transformation journey'
                                fill
                                className='object-cover object-top lg:object-contain lg:object-center'
                                priority
                                sizes='(max-width: 1024px) 100vw, 50vw'
                            />
                            {/* Gradient overlay */}
                            <div className='absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent lg:hidden' />

                            {/* Mobile Badge Overlay */}
                            <div className='absolute right-6 bottom-6 left-6 lg:hidden'>
                                <div className='flex items-center gap-2 text-white'>
                                    <Plane className='text-gold-400 h-4 w-4' />
                                    <span className='text-sm font-medium'>
                                        Fly-In Concierge Service
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
                            <Plane className='text-gold-400 h-4 w-4' />
                            <span className='text-sm font-medium text-stone-400'>
                                Out-of-Town Patients Welcome
                            </span>
                            <span className='text-gold-400'>|</span>
                            <span className='text-sm font-medium text-stone-400'>
                                We Guide Your Journey
                            </span>
                        </div>

                        {/* Emotional Headline - Travel Focused */}
                        <div className='mb-6 text-center lg:text-left'>
                            <h1 className='mb-3 font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                                Your Miami{' '}
                                <span className='text-gold-400 italic'>
                                    Transformation Trip
                                </span>
                            </h1>
                            <p className='text-lg leading-relaxed text-stone-300'>
                                World-class results in sunny Miami. Our
                                specialists guide you through every step—from
                                your first call to recovery recommendations.
                            </p>
                        </div>

                        {/* Travel Benefits */}
                        <div className='mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start'>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <Video className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Virtual Consult First
                                </span>
                            </div>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <Building className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Recovery Stay Recommendations
                                </span>
                            </div>
                        </div>

                        {/* Financing Callout */}
                        <div className='mb-6 flex items-center justify-center gap-2 lg:justify-start'>
                            <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2'>
                                <CreditCard className='text-gold-400 h-4 w-4' />
                                <span className='text-sm font-medium text-stone-300'>
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
                                title='Speak with Our Specialists'
                                subtitle='Free Consultation • Travel Guidance • Hablamos Español'
                                source={CONTACT_SOURCES.LANDING_PAGE}
                                analyticsFormName='travel_landing_hero_form'
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                showPreferredContactTime={false}
                            />
                        </div>

                        {/* Trust Cluster */}
                        <div className='mt-8 space-y-6'>
                            {/* Travel Testimonial Quote */}
                            <div className='flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-4'>
                                <Quote className='text-gold-400 mt-1 h-5 w-5 shrink-0' />
                                <div>
                                    <p className='text-sm leading-relaxed text-stone-300 italic'>
                                        &ldquo;Flying from New York felt so
                                        easy. Their team recommended a great
                                        recovery house and checked on me daily.
                                        Best decision I ever made.&rdquo;
                                    </p>
                                    <p className='text-gold-400 mt-2 text-xs font-medium'>
                                        — Rachel K., New York
                                    </p>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className='flex flex-wrap justify-center gap-6 lg:justify-start'>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Palmtree className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        Recovery in Paradise
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <ShieldCheck className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        Board-Certified
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Clock className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        24/7 Concierge Support
                                    </span>
                                </div>
                            </div>

                            {/* Risk Reversal Message */}
                            <p className='text-center text-sm text-stone-500 lg:text-left'>
                                ✓ Free consultation • ✓ Recovery stay
                                recommendations • ✓ No hidden fees
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
