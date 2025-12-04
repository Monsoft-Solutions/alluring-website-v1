import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, Sparkles } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import {
    getFeaturedPromotion,
    getPromotionLink,
    formatDiscount,
    getRemainingDays,
    isExpiringSoon,
} from '@/lib/queries/promotion.query'

/**
 * PromotionBanner Component
 *
 * Displays the highest priority active promotion as a banner on the homepage.
 * Features a luxurious design with glassmorphism, gold accents, and urgency indicators.
 */
export async function PromotionBanner() {
    const promotion = await getFeaturedPromotion()

    // Don't render if no active promotion
    if (!promotion) {
        return null
    }

    const link = getPromotionLink(promotion)
    const discount = formatDiscount(promotion)
    const daysRemaining = getRemainingDays(promotion)
    const expiringSoon = isExpiringSoon(promotion)

    return (
        <SectionContainer
            id='promotion-banner'
            variant='default'
            noPadding
            className='relative overflow-hidden bg-stone-900 py-16 md:py-20'
        >
            {/* Background Image with Overlay */}
            {promotion.imageUrl && (
                <div className='absolute inset-0 z-0'>
                    <Image
                        src={promotion.imageUrl}
                        alt={promotion.imageAlt ?? promotion.title}
                        fill
                        className='object-cover'
                        priority={false}
                    />
                    {/* Sophisticated gradient overlay */}
                    <div className='absolute inset-0 bg-linear-to-r from-stone-900/95 via-stone-900/85 to-stone-900/70' />
                    <div className='absolute inset-0 bg-linear-to-t from-stone-900/80 via-transparent to-stone-900/60' />
                </div>
            )}

            {/* Decorative elements */}
            <div className='bg-gold-500/10 pointer-events-none absolute top-1/4 left-0 h-[300px] w-[300px] -translate-x-1/2 rounded-full blur-[100px]' />
            <div className='bg-gold-400/5 pointer-events-none absolute right-0 bottom-0 h-[200px] w-[200px] translate-x-1/3 rounded-full blur-[80px]' />

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='grid items-center gap-8 lg:grid-cols-12 lg:gap-12'>
                    {/* Left Column - Content */}
                    <div className='lg:col-span-8'>
                        {/* Eyebrow Badge */}
                        <div className='mb-6 inline-flex items-center gap-2'>
                            <div className='border-gold-500/30 bg-gold-500/10 flex items-center gap-2 rounded-full border px-4 py-2'>
                                <Sparkles className='text-gold-400 h-4 w-4' />
                                <span className='text-gold-400 text-sm font-medium tracking-wide uppercase'>
                                    Special Offer
                                </span>
                            </div>

                            {/* Urgency Indicator */}
                            {expiringSoon && daysRemaining !== null && (
                                <div className='flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2'>
                                    <Clock className='h-4 w-4 text-red-400' />
                                    <span className='text-sm font-medium text-red-400'>
                                        {daysRemaining === 0
                                            ? 'Ends Today!'
                                            : daysRemaining === 1
                                              ? '1 Day Left'
                                              : `${daysRemaining} Days Left`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Discount Badge */}
                        {discount && (
                            <div className='mb-4'>
                                <span className='bg-gold-500 inline-block rounded-lg px-4 py-2 font-serif text-2xl font-bold text-stone-900 md:text-3xl'>
                                    {discount}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h2 className='mb-4 font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                            {promotion.title}
                        </h2>

                        {/* Gold Accent Line */}
                        <div className='bg-gold-500 mb-6 h-1 w-20 shadow-[0_0_20px_rgba(234,179,8,0.4)]' />

                        {/* Excerpt/Description */}
                        {promotion.excerpt && (
                            <p className='mb-8 max-w-xl text-lg leading-relaxed font-light text-stone-300'>
                                {promotion.excerpt}
                            </p>
                        )}

                        {/* CTA Button */}
                        <Button
                            asChild
                            size='lg'
                            className='bg-gold-500 hover:bg-gold-600 min-w-[200px] border-none px-8 py-6 text-base font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
                        >
                            <Link href={link} className='group'>
                                {promotion.ctaText}
                                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                            </Link>
                        </Button>
                    </div>

                    {/* Right Column - Visual Element */}
                    <div className='hidden lg:col-span-4 lg:flex lg:justify-end'>
                        {/* Type Badge Card */}
                        <div className='relative'>
                            <div className='rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md'>
                                <div className='text-center'>
                                    <div className='mb-2 font-serif text-xs font-medium tracking-widest text-stone-400 uppercase'>
                                        {promotion.type === 'discount' &&
                                            'Limited Time Offer'}
                                        {promotion.type === 'seasonal' &&
                                            'Seasonal Special'}
                                        {promotion.type === 'bundle' &&
                                            'Package Deal'}
                                        {promotion.type === 'financing' &&
                                            'Financing Available'}
                                    </div>

                                    {promotion.type === 'discount' &&
                                        promotion.discountValue && (
                                            <>
                                                <div className='text-gold-400 font-serif text-5xl font-bold'>
                                                    {promotion.discountTypeValue ===
                                                    'percentage'
                                                        ? `${promotion.discountValue}%`
                                                        : `$${promotion.discountValue}`}
                                                </div>
                                                <div className='text-lg text-stone-300'>
                                                    {promotion.discountTypeValue ===
                                                    'percentage'
                                                        ? 'OFF'
                                                        : 'SAVINGS'}
                                                </div>
                                            </>
                                        )}

                                    {promotion.type !== 'discount' && (
                                        <div className='text-gold-400 py-4 font-serif text-2xl font-bold'>
                                            {promotion.type === 'seasonal' &&
                                                '🌴'}
                                            {promotion.type === 'bundle' &&
                                                '📦'}
                                            {promotion.type === 'financing' &&
                                                '💳'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Decorative corner accent */}
                            <div className='bg-gold-500 absolute -top-2 -right-2 h-12 w-12 rounded-tr-2xl opacity-20 blur-xl' />
                            <div className='border-gold-500 absolute -top-2 -right-2 h-6 w-6 rounded-tr-xl border-t-2 border-r-2' />
                        </div>
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
