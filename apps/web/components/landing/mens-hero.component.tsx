'use client'
/**
 * MensHero Component
 *
 * A conversion-focused hero section targeting men (30-55):
 * - Emphasizes confidence, professional appearance, and discretion
 * - Addresses male-specific concerns (gynecomastia, stubborn fat, aging)
 * - Growing market segment (15%+ of cosmetic procedures)
 *
 * Optimized for high-intent male cosmetic surgery searches.
 */
import {
    Award,
    ShieldCheck,
    Clock,
    CreditCard,
    Quote,
    UserCheck,
    Dumbbell,
    CheckCircle,
} from 'lucide-react'
import Image from 'next/image'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { siteConfig } from '@/lib/data/site-config'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export type MensHeroProps = {
    readonly id?: string
}

export function MensHero({ id = 'hero' }: MensHeroProps) {
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
                                src='/images/landing/mens-plastic-surgery-hero.jpg'
                                alt='Confident man after cosmetic procedure in Miami'
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
                                    <UserCheck className='text-gold-400 h-4 w-4' />
                                    <span className='text-sm font-medium'>
                                        Men&apos;s Cosmetic Surgery
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className='animate-fade-in-up flex w-full flex-col justify-center px-6 py-8 delay-200 md:px-12 lg:w-1/2 lg:py-16'>
                    <div className='mx-auto w-full max-w-2xl'>
                        {/* Procedure Badge - Desktop */}
                        <div className='mb-4 hidden items-center gap-2 lg:flex'>
                            <UserCheck className='text-gold-400 h-4 w-4' />
                            <span className='text-sm font-medium text-stone-400'>
                                Men&apos;s Plastic Surgery Miami
                            </span>
                            <span className='text-gold-400'>|</span>
                            <span className='text-sm font-medium text-stone-400'>
                                Discreet & Professional
                            </span>
                        </div>

                        {/* Emotional Headline */}
                        <div className='mb-6 text-center lg:text-left'>
                            <h1 className='mb-3 font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                                Look as{' '}
                                <span className='text-gold-400 italic'>
                                    Strong
                                </span>{' '}
                                as You Feel
                                <br />
                                <span className='text-2xl md:text-3xl lg:text-4xl'>
                                    Men&apos;s Cosmetic Surgery in Miami
                                </span>
                            </h1>
                            <p className='text-lg leading-relaxed text-stone-300'>
                                You work hard on your fitness and career. But
                                some things—stubborn fat, gynecomastia, signs of
                                aging—don&apos;t respond to willpower alone.
                                We&apos;ll help you look as confident as you
                                feel.
                            </p>
                        </div>

                        {/* Trust Indicators */}
                        <div className='mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start'>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <ShieldCheck className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Board-Certified Surgeons
                                </span>
                            </div>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <Dumbbell className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Athletic Results
                                </span>
                            </div>
                        </div>

                        {/* Procedures List */}
                        <div className='mb-6 flex items-center justify-center gap-2 lg:justify-start'>
                            <div className='inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2'>
                                <CheckCircle className='h-4 w-4 text-emerald-400' />
                                <span className='text-sm font-medium text-emerald-300'>
                                    Gynecomastia • Lipo • Face • Body
                                </span>
                            </div>
                        </div>

                        {/* Financing Callout */}
                        <div className='mb-6 flex items-center justify-center gap-2 lg:justify-start'>
                            <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2'>
                                <CreditCard className='text-gold-400 h-4 w-4' />
                                <span className='text-sm font-medium text-stone-300'>
                                    From $45/week | 0% APR available
                                </span>
                            </div>
                        </div>

                        {/* Form Container */}
                        <div
                            id='hero-form'
                            className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8'
                        >
                            <ConsultationForm
                                title='Claim Your Free Consultation'
                                subtitle='Confidential Assessment with Our Specialists'
                                source={CONTACT_SOURCES.LANDING_PAGE}
                                analyticsFormName='mens_landing_hero_form'
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
                                        &ldquo;I worked out for years but
                                        couldn&apos;t get rid of my chest. After
                                        gynecomastia surgery at Alluring, I
                                        finally feel comfortable taking my shirt
                                        off. Wish I&apos;d done it
                                        sooner.&rdquo;
                                    </p>
                                    <p className='text-gold-400 mt-2 text-xs font-medium'>
                                        — Michael T., 8 months post-op
                                    </p>
                                </div>
                            </div>

                            {/* Trust Indicators */}
                            <div className='flex flex-wrap justify-center gap-6 lg:justify-start'>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <ShieldCheck className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        {siteConfig.trustStats?.accreditation ??
                                            'Board-Certified'}{' '}
                                        Surgeons
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Award className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        15+ Years Experience
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Clock className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        Same-Week Consultations
                                    </span>
                                </div>
                            </div>

                            {/* Risk Reversal Message */}
                            <p className='text-center text-sm text-stone-500 lg:text-left'>
                                ✓ Free consultation • ✓ Confidential & discreet
                                • ✓ Flexible financing
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
