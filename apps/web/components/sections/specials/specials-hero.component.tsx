/**
 * SpecialsHero Component
 *
 * An immersive 50/50 split hero section for the specials landing page featuring:
 * - Left column: Full-height promotion image with discount badge and urgency timer
 * - Right column: Consultation form for lead capture with trust indicators
 *
 * Designed for maximum conversions with prominent promotional imagery.
 */
import {
    Award,
    ShieldCheck,
    Sparkles,
    Clock,
    CreditCard,
    Quote,
} from 'lucide-react'
import Image from 'next/image'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { siteConfig } from '@/lib/data/site-config'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'
import type { FeaturedPromotionData } from '@/lib/types/specials/featured-promotion.type'
import { PromotionMarkdown } from '@/components/promotions/promotion-markdown.component'

export type SpecialsHeroProps = {
    readonly id?: string
    /** Featured promotion to display prominently (pre-processed by server) */
    readonly featuredPromotion: FeaturedPromotionData | null
    /** Total number of active promotions */
    readonly totalPromotions: number
}

export function SpecialsHero({
    id = 'specials-hero',
    featuredPromotion,
    totalPromotions,
}: SpecialsHeroProps) {
    const daysRemaining = featuredPromotion?.daysRemaining ?? null
    const expiringSoon = featuredPromotion?.expiringSoon ?? false

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
                {/* Left Column - Full Height Promotion Image */}
                <div className='animate-fade-in-up relative w-full lg:w-1/2'>
                    {/* Image Container with Urgency Strip */}
                    <div className='h-[65vh] p-4 lg:h-full lg:p-20'>
                        {/* Promotion Image */}
                        {featuredPromotion?.imageUrl ? (
                            <div className='shadow-gold-500/20 relative h-full w-full overflow-hidden rounded-2xl shadow-2xl sm:rounded-none sm:shadow-none'>
                                <Image
                                    src={featuredPromotion.imageUrl}
                                    alt={
                                        featuredPromotion.imageAlt ??
                                        featuredPromotion.title
                                    }
                                    fill
                                    className='object-cover object-top lg:object-contain lg:object-center'
                                    priority
                                    sizes='(max-width: 1024px) 100vw, 50vw'
                                />
                            </div>
                        ) : (
                            // Fallback when no promotion image
                            <div className='flex h-full w-full flex-col items-center justify-center rounded-2xl bg-linear-to-br from-stone-800 to-stone-900 px-8 text-center shadow-2xl'>
                                <div className='animate-fade-in'>
                                    <div className='mb-6 inline-flex items-center gap-2'>
                                        <span className='bg-gold-400 h-px w-8' />
                                        <span className='text-gold-400 text-sm font-bold tracking-[0.2em] uppercase'>
                                            Limited Time Offers
                                        </span>
                                        <span className='bg-gold-400 h-px w-8' />
                                    </div>
                                    <h1 className='mb-4 font-serif text-4xl leading-tight text-white lg:text-5xl'>
                                        Miami Plastic Surgery{' '}
                                        <span className='text-gold-400 italic'>
                                            Specials
                                        </span>
                                    </h1>
                                    <p className='max-w-md text-lg font-light text-stone-300'>
                                        Exclusive savings on transformative
                                        procedures with board-certified
                                        surgeons.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Urgency Strip - Mobile Only, Below Image */}
                    {expiringSoon && daysRemaining !== null && (
                        <div className='animate-fade-in mx-4 -mt-2 mb-6 delay-300 lg:hidden'>
                            <div className='animate-pulse-subtle flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 shadow-lg'>
                                <Clock className='h-5 w-5 text-white' />
                                <span className='text-sm font-bold tracking-wide text-white uppercase'>
                                    {daysRemaining === 0
                                        ? '⚡ Ends Today!'
                                        : daysRemaining === 1
                                          ? '⚡ Only 1 Day Left!'
                                          : `⚡ Only ${daysRemaining} Days Left!`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Form */}
                <div className='animate-fade-in-up flex w-full flex-col justify-center px-6 py-8 delay-200 md:px-12 lg:w-1/2 lg:py-16'>
                    <div className='mx-auto w-full max-w-2xl'>
                        {/* Emotional Headline */}
                        <div className='mb-6 text-center lg:text-left'>
                            <h1 className='mb-3 font-serif text-3xl leading-tight text-white md:text-4xl'>
                                Your Transformation,{' '}
                                <span className='text-gold-400 italic'>
                                    On Your Terms
                                </span>
                            </h1>
                            <p className='text-lg leading-relaxed text-stone-300'>
                                Exclusive savings on the procedures you&apos;ve
                                been dreaming about. Lock in promotional pricing
                                with a free, no-obligation consultation.
                            </p>

                            {/* Featured Promotion Excerpt */}
                            {featuredPromotion?.excerpt && (
                                <div className='mt-4 rounded-lg border border-white/10 bg-white/5 p-4'>
                                    <div className='mb-2 flex items-center gap-2'>
                                        <Sparkles className='text-gold-400 h-4 w-4' />
                                        <span className='text-gold-400 text-sm font-semibold'>
                                            Featured Offer
                                        </span>
                                    </div>
                                    <PromotionMarkdown
                                        content={featuredPromotion.excerpt}
                                        className='text-sm leading-relaxed text-stone-300'
                                    />
                                </div>
                            )}
                        </div>

                        {/* Financing Callout */}
                        <div className='mb-6 flex items-center justify-center gap-2 lg:justify-start'>
                            <div className='bg-gold-500/20 border-gold-500/30 inline-flex items-center gap-2 rounded-full border px-4 py-2'>
                                <CreditCard className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-300 text-sm font-medium'>
                                    Starting at $27/week — 0% APR available
                                </span>
                            </div>
                        </div>

                        {/* More Offers Indicator */}
                        {totalPromotions > 1 && (
                            <div className='animate-fade-in mb-4 flex items-center justify-center gap-2 text-stone-400 delay-500 lg:justify-start'>
                                <Sparkles className='text-gold-400 h-5 w-5 animate-pulse' />
                                <span className='text-sm font-medium'>
                                    +{totalPromotions - 1} more exclusive{' '}
                                    {totalPromotions - 1 === 1
                                        ? 'offer'
                                        : 'offers'}{' '}
                                    available below
                                </span>
                            </div>
                        )}

                        {/* Urgency Badge - Desktop (shown near form) */}
                        {daysRemaining !== null && daysRemaining <= 14 && (
                            <div className='mb-4 hidden lg:block'>
                                <div
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
                                        expiringSoon
                                            ? 'animate-pulse-subtle bg-red-500/20 text-red-300'
                                            : 'bg-gold-500/20 text-gold-300'
                                    }`}
                                >
                                    <Clock className='h-4 w-4' />
                                    <span className='text-sm font-semibold'>
                                        {daysRemaining === 0
                                            ? 'Offer Ends Today!'
                                            : daysRemaining === 1
                                              ? 'Only 1 Day Left!'
                                              : `${daysRemaining} Days Left to Save`}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Form Container */}
                        <div
                            id='specials-form'
                            className='rounded-xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8'
                        >
                            <ConsultationForm
                                title='Start Your Transformation'
                                subtitle='Free Consultation • No Pressure • Hablamos Español'
                                source={CONTACT_SOURCES.SPECIALS_PAGE}
                                analyticsFormName='specials_hero_form'
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
                                ✓ Free consultation • ✓ No obligation • ✓ Your
                                pricing is locked in
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
