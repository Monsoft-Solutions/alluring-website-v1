/**
 * MiamiHero Component
 *
 * A Miami-focused hero section for local audience targeting:
 * - Emphasizes local presence and convenience (no travel)
 * - Highlights Miami community trust
 * - Strong Spanish language support messaging
 * - Local landmarks and cultural references
 *
 * Optimized for Miami residents who want a local, trusted surgeon.
 */
import {
    Award,
    ShieldCheck,
    Clock,
    CreditCard,
    MapPin,
    Building2,
    Heart,
} from 'lucide-react'
import Image from 'next/image'

import { formatRatingBadge, TRUST_BADGES } from '@workspace/shared/claims/trust'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { siteConfig } from '@/lib/data/site-config'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

export type MiamiHeroProps = {
    readonly id?: string
}

export function MiamiHero({ id = 'hero' }: MiamiHeroProps) {
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
                {/* Left Column - Transformation Image */}
                <div className='animate-fade-in-up relative w-full lg:w-1/2'>
                    <div className='h-[65vh] p-4 lg:h-full lg:p-20'>
                        <div className='shadow-gold-500/20 relative h-full w-full overflow-hidden rounded-2xl shadow-2xl sm:rounded-none sm:shadow-none'>
                            <Image
                                src='/images/hero-beautiful-latin-woman.jpg'
                                alt='Beautiful Miami woman confidently smiling'
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
                                Your Neighborhood Surgeon
                            </span>
                        </div>

                        {/* Emotional Headline - Miami Focused */}
                        <div className='mb-6 text-center lg:text-left'>
                            <h1 className='mb-3 font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                                Your surgeon,{' '}
                                <span className='text-gold-400 italic'>
                                    right here
                                </span>{' '}
                                in Miami
                            </h1>
                            <p className='text-lg leading-relaxed text-stone-300'>
                                Right here in your community. One surgeon
                                performs every procedure at Alluring. Hablamos
                                Espa&ntilde;ol.
                            </p>
                        </div>

                        {/* Local Trust Indicators */}
                        <div className='mb-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start'>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <Building2 className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    {TRUST_BADGES.board}
                                </span>
                            </div>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                                <Heart className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Hablamos español
                                </span>
                            </div>
                        </div>

                        {/* Financing Callout */}
                        <div className='mb-6 flex items-center justify-center gap-2 lg:justify-start'>
                            <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2'>
                                <CreditCard className='text-gold-400 h-4 w-4' />
                                <span className='text-sm font-medium text-stone-300'>
                                    Financing available
                                </span>
                            </div>
                        </div>

                        {/* Form Container */}
                        <div
                            id='hero-form'
                            className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8'
                        >
                            <ConsultationForm
                                title='Book Your Free Consultation'
                                subtitle='In-Person at Our Miami Office • Hablamos Español'
                                source={CONTACT_SOURCES.LANDING_PAGE}
                                analyticsFormName='miami_landing_hero_form'
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                showPreferredContactTime={false}
                            />
                        </div>

                        {/* Trust Cluster */}
                        <div className='mt-8 space-y-6'>
                            {/* Trust Indicators */}
                            <div className='flex flex-wrap justify-center gap-6 lg:justify-start'>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <ShieldCheck className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        One surgeon for every procedure
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Award className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        {formatRatingBadge(
                                            siteConfig.trustStats?.rating
                                        )}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2 text-stone-400 transition-colors hover:text-stone-300'>
                                    <Clock className='text-gold-400 h-5 w-5' />
                                    <span className='text-sm font-medium'>
                                        In person or by video
                                    </span>
                                </div>
                            </div>

                            {/* Risk Reversal Message */}
                            <p className='text-center text-sm text-stone-500 lg:text-left'>
                                ✓ Free consultation • ✓ No obligation • ✓
                                Convenient Miami location
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
