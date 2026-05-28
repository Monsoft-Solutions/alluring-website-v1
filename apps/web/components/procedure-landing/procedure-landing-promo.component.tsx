/**
 * ProcedureLandingPromo
 *
 * Procedure-specific promotion strip rendered directly under the hero
 * when an active promotion exists for the slug. Mirrors the luxury
 * aesthetic of the homepage PromoSection but every CTA routes back to
 * the LP's hero form — visitors never leave the page.
 */
import { ArrowRight, Clock, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { type Promotion } from '@workspace/db/schema/promotion'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { formatDiscount, getRemainingDays } from '@/lib/queries/promotion.query'

export type ProcedureLandingPromoProps = {
    readonly id?: string
    readonly promotion: Promotion
    readonly formAnchor?: string
}

export function ProcedureLandingPromo({
    id = 'promotion',
    promotion,
    formAnchor = '#hero-form',
}: ProcedureLandingPromoProps) {
    const discount = formatDiscount(promotion)
    const daysRemaining = getRemainingDays(promotion)

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-900'
            paddingY='py-14 lg:py-20'
            aria-label='Limited-time offer'
        >
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-800'
            />
            <div
                aria-hidden='true'
                className='from-gold-600/0 via-gold-500/60 to-gold-600/0 absolute inset-x-0 top-0 h-px bg-gradient-to-r'
            />
            <div
                aria-hidden='true'
                className='from-gold-600/0 via-gold-500/60 to-gold-600/0 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r'
            />

            <ContentWrapper size='xl' className='relative z-10'>
                <div className='grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-16'>
                    <div className='order-2 md:order-1'>
                        <div className='mb-5 inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-800/50 px-4 py-2 backdrop-blur-sm'>
                            <Sparkles className='text-gold-400 h-4 w-4' />
                            <span className='text-gold-400 text-xs font-bold tracking-widest uppercase'>
                                Limited-time offer
                            </span>
                        </div>

                        {discount && (
                            <div className='mb-3'>
                                <span className='from-gold-500 to-gold-600 inline-block bg-gradient-to-r bg-clip-text font-serif text-4xl font-bold text-transparent md:text-5xl lg:text-6xl'>
                                    {discount}
                                </span>
                            </div>
                        )}

                        <h2 className='mb-4 font-serif text-3xl leading-tight text-white md:text-4xl lg:text-5xl'>
                            {promotion.title}
                        </h2>

                        {promotion.excerpt && (
                            <p className='mb-6 max-w-lg text-base leading-relaxed text-stone-400 lg:text-lg'>
                                {promotion.excerpt}
                            </p>
                        )}

                        {daysRemaining !== null && daysRemaining > 0 && (
                            <div className='mb-7 inline-flex items-center gap-3 rounded-lg border border-stone-700/50 bg-stone-800/30 px-5 py-3'>
                                <Clock className='text-gold-400 h-5 w-5' />
                                <div>
                                    <span className='text-gold-400 block text-2xl leading-none font-bold'>
                                        {daysRemaining}
                                    </span>
                                    <span className='text-[10px] tracking-wide text-stone-500 uppercase'>
                                        Days remaining
                                    </span>
                                </div>
                            </div>
                        )}

                        <a
                            href={formAnchor}
                            className='group from-gold-500 to-gold-600 shadow-gold-500/20 hover:shadow-gold-500/40 inline-flex items-center gap-3 rounded-full bg-gradient-to-r px-8 py-4 text-sm font-bold tracking-wide text-stone-900 uppercase shadow-lg transition-all duration-300 hover:brightness-110'
                        >
                            {promotion.ctaText || 'Claim this offer'}
                            <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                        </a>
                    </div>

                    <div className='relative order-1 md:order-2'>
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
                                />
                            ) : (
                                <div className='flex h-full items-center justify-center'>
                                    <Sparkles className='text-gold-500/30 h-24 w-24' />
                                </div>
                            )}

                            <div
                                aria-hidden='true'
                                className='pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent'
                            />
                        </div>

                        <div
                            aria-hidden='true'
                            className='from-gold-500/30 to-gold-500/0 absolute -top-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br blur-3xl'
                        />
                        <div
                            aria-hidden='true'
                            className='from-gold-600/20 to-gold-600/0 absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-gradient-to-tr blur-3xl'
                        />
                    </div>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
