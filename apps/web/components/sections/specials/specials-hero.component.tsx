/**
 * SpecialsHero Component
 *
 * An immersive 50/50 split hero section for the specials landing page featuring:
 * - Left column: Full-height promotion image with discount badge and urgency timer
 * - Right column: Consultation form for lead capture with trust indicators
 *
 * Designed for maximum conversions with prominent promotional imagery.
 */
import { Award, Clock, ShieldCheck, Sparkles } from 'lucide-react'
import Image from 'next/image'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { siteConfig } from '@/lib/data/site-config'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'
import type { FeaturedPromotionData } from '@/lib/types/specials/featured-promotion.type'

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
    const discount = featuredPromotion?.discount ?? null
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
                <div className='animate-fade-in-up relative h-[50vh] w-full p-6 lg:h-auto lg:w-1/2 lg:p-12'>
                    {/* Promotion Image */}
                    {featuredPromotion?.imageUrl ? (
                        <div className='relative h-full w-full overflow-hidden rounded-2xl shadow-2xl'>
                            <Image
                                src={featuredPromotion.imageUrl}
                                alt={
                                    featuredPromotion.imageAlt ??
                                    featuredPromotion.title
                                }
                                fill
                                className='object-cover object-center'
                                priority
                                sizes='(max-width: 1024px) 100vw, 50vw'
                            />

                            {/* Gradient Overlay for text readability */}
                            <div className='absolute inset-0 bg-linear-to-t from-stone-900/80 via-stone-900/20 to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-transparent lg:to-stone-900/60' />

                            {/* Discount Badge - Top Right */}
                            {discount && (
                                <div className='bg-gold-500 animate-fade-in absolute top-6 right-6 z-20 px-5 py-3 shadow-2xl delay-300 lg:top-8 lg:right-8'>
                                    <span className='font-serif text-2xl font-bold text-stone-900 lg:text-3xl'>
                                        {discount}
                                    </span>
                                </div>
                            )}

                            {/* Urgency Timer - Bottom */}
                            {expiringSoon && daysRemaining !== null && (
                                <div className='animate-fade-in absolute right-6 bottom-6 left-6 z-20 delay-500 lg:right-auto lg:bottom-8 lg:left-8'>
                                    <div className='inline-flex items-center gap-3 rounded-full bg-red-500/90 px-5 py-3 backdrop-blur-sm'>
                                        <Clock className='h-5 w-5 text-white' />
                                        <span className='text-base font-bold text-white'>
                                            {daysRemaining === 0
                                                ? 'ENDS TODAY!'
                                                : daysRemaining === 1
                                                  ? 'ONLY 1 DAY LEFT!'
                                                  : `ONLY ${daysRemaining} DAYS LEFT!`}
                                        </span>
                                    </div>
                                </div>
                            )}
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
                                    procedures with board-certified surgeons.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Form */}
                <div className='animate-fade-in-up flex w-full flex-col justify-center px-6 py-12 delay-200 md:px-12 lg:w-1/2 lg:py-16'>
                    <div className='mx-auto w-full max-w-lg'>
                        {/* More Offers Indicator */}
                        {totalPromotions > 1 && (
                            <div className='animate-fade-in mb-6 flex items-center justify-center gap-2 text-stone-400 delay-500 lg:justify-start'>
                                <Sparkles className='text-gold-400 h-5 w-5' />
                                <span className='text-sm font-medium'>
                                    +{totalPromotions - 1} more exclusive{' '}
                                    {totalPromotions - 1 === 1
                                        ? 'offer'
                                        : 'offers'}{' '}
                                    available below
                                </span>
                            </div>
                        )}

                        {/* Form Container */}
                        <div
                            id='specials-form'
                            className='border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8'
                        >
                            <ConsultationForm
                                title='Claim Your Special Offer'
                                subtitle='Free Consultation • No Obligation • Limited Time'
                                source={CONTACT_SOURCES.SPECIALS_PAGE}
                                analyticsFormName='specials_hero_form'
                                enableAnalytics
                            />
                        </div>

                        {/* Trust Indicators */}
                        <div className='mt-8 flex flex-wrap justify-center gap-6 lg:justify-start'>
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
                    </div>
                </div>
            </div>
        </section>
    )
}
