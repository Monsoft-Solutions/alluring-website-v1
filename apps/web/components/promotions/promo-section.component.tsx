import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Clock, ArrowRight } from 'lucide-react'
import { type Promotion } from '@workspace/db/schema/promotion'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import {
    getPromotionLink,
    formatDiscount,
    getRemainingDays,
} from '@/lib/queries/promotion.query'

type PromoSectionProps = {
    promotion: Promotion
}

/**
 * PromoSection Component
 *
 * A luxurious homepage section showcasing the highest-priority active promotion.
 * Designed for a high-end boutique plastic surgery clinic.
 *
 * Features:
 * - Full-width dark background with subtle gradient
 * - Asymmetric layout with large promotion image
 * - Gold accent elements and glassmorphism effects
 * - Urgency indicators (countdown, limited time badge)
 * - Prominent CTA button
 */
export function PromoSection({ promotion }: PromoSectionProps) {
    const link = getPromotionLink(promotion)
    const discount = formatDiscount(promotion)
    const daysRemaining = getRemainingDays(promotion)

    return (
        <section
            className='relative overflow-hidden bg-stone-900'
            aria-label='Special Promotion'
        >
            {/* Subtle gradient overlay */}
            <div className='pointer-events-none absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-800' />

            {/* Gold accent line at top */}
            <div className='from-gold-600/0 via-gold-500/60 to-gold-600/0 absolute top-0 right-0 left-0 h-px bg-gradient-to-r' />

            <ContentWrapper size='xl' className='relative'>
                <div className='grid items-center gap-8 py-16 md:grid-cols-2 md:gap-12 md:py-24 lg:gap-16'>
                    {/* Content Side */}
                    <div className='order-2 md:order-1'>
                        {/* Limited Time Badge */}
                        <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800/50 px-4 py-2 backdrop-blur-sm'>
                            <Sparkles className='text-gold-400 h-4 w-4' />
                            <span className='text-gold-400 text-xs font-bold tracking-widest uppercase'>
                                Limited Time Offer
                            </span>
                        </div>

                        {/* Discount Badge */}
                        {discount && (
                            <div className='mb-4'>
                                <span className='from-gold-500 to-gold-600 inline-block bg-gradient-to-r bg-clip-text font-serif text-4xl font-bold text-transparent md:text-5xl lg:text-6xl'>
                                    {discount}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h2 className='mb-4 font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                            {promotion.title}
                        </h2>

                        {/* Description */}
                        {promotion.excerpt && (
                            <p className='mb-8 max-w-lg text-lg leading-relaxed text-stone-400'>
                                {promotion.excerpt}
                            </p>
                        )}

                        {/* Countdown / Urgency */}
                        {daysRemaining !== null && daysRemaining > 0 && (
                            <div className='mb-8 inline-flex items-center gap-3 rounded-lg border border-stone-700/50 bg-stone-800/30 px-5 py-3'>
                                <Clock className='text-gold-400 h-5 w-5' />
                                <div>
                                    <span className='text-gold-400 block text-2xl font-bold'>
                                        {daysRemaining}
                                    </span>
                                    <span className='text-xs tracking-wide text-stone-500 uppercase'>
                                        Days Remaining
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* CTA Button */}
                        <Link
                            href={link}
                            className='group from-gold-500 to-gold-600 shadow-gold-500/20 hover:shadow-gold-500/40 inline-flex items-center gap-3 rounded-full bg-gradient-to-r px-8 py-4 text-sm font-bold tracking-wide text-stone-900 uppercase shadow-lg transition-all duration-300 hover:brightness-110'
                        >
                            {promotion.ctaText}
                            <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                        </Link>
                    </div>

                    {/* Image Side */}
                    <div className='relative order-1 md:order-2'>
                        {/* Glassmorphism frame */}
                        <div className='border-gold-500/20 relative aspect-[4/5] overflow-hidden rounded-2xl border bg-stone-800/20 shadow-2xl backdrop-blur-sm md:aspect-[3/4]'>
                            {promotion.imageUrl ? (
                                <Image
                                    src={promotion.imageUrl}
                                    alt={
                                        promotion.imageAlt ||
                                        `${promotion.title} promotion`
                                    }
                                    fill
                                    className='object-cover'
                                    sizes='(max-width: 768px) 100vw, 50vw'
                                    priority
                                />
                            ) : (
                                <div className='flex h-full items-center justify-center'>
                                    <Sparkles className='text-gold-500/30 h-24 w-24' />
                                </div>
                            )}

                            {/* Gradient overlay on image */}
                            <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent' />
                        </div>

                        {/* Decorative elements */}
                        <div className='from-gold-500/30 to-gold-500/0 absolute -top-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br blur-3xl' />
                        <div className='from-gold-600/20 to-gold-600/0 absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-gradient-to-tr blur-3xl' />
                    </div>
                </div>
            </ContentWrapper>

            {/* Gold accent line at bottom */}
            <div className='from-gold-600/0 via-gold-500/60 to-gold-600/0 absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r' />
        </section>
    )
}
