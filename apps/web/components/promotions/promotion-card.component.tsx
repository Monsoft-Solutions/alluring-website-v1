import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import type { Promotion } from '@workspace/db/schema/promotion'

import { Button } from '@workspace/ui/components/button'

import {
    formatDiscount,
    getRemainingDays,
    isExpiringSoon,
} from '@/lib/queries/promotion.query'
import { PromotionMarkdown } from '@/components/promotions/promotion-markdown.component'

type PromotionCardProps = {
    promotion: Promotion
}

/**
 * PromotionCard Component
 *
 * Displays a promotion in a card format for listings.
 * Features glassmorphism design with type badges and urgency indicators.
 */
export function PromotionCard({ promotion }: PromotionCardProps) {
    const discount = formatDiscount(promotion)
    const daysRemaining = getRemainingDays(promotion)
    const expiringSoon = isExpiringSoon(promotion)

    const typeColors = {
        discount: 'bg-green-500/10 text-green-400 border-green-500/30',
        seasonal: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        bundle: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        financing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    }

    const typeLabels = {
        discount: 'Discount',
        seasonal: 'Seasonal',
        bundle: 'Bundle',
        financing: 'Financing',
    }

    return (
        <article className='group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl'>
            {/* Image */}
            <div className='relative aspect-[16/9] overflow-hidden'>
                {promotion.imageUrl ? (
                    <Image
                        src={promotion.imageUrl}
                        alt={promotion.imageAlt ?? promotion.title}
                        fill
                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                ) : (
                    <div className='h-full w-full bg-stone-100' />
                )}

                {/* Overlay gradient */}
                <div className='absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent' />

                {/* Type Badge */}
                <div className='absolute top-4 left-4'>
                    <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase ${typeColors[promotion.type]}`}
                    >
                        {typeLabels[promotion.type]}
                    </span>
                </div>

                {/* Discount Badge */}
                {discount && (
                    <div className='absolute top-4 right-4'>
                        <span className='bg-gold-500 rounded-lg px-3 py-1.5 font-serif text-lg font-bold text-stone-900'>
                            {discount}
                        </span>
                    </div>
                )}

                {/* Urgency Badge */}
                {expiringSoon && daysRemaining !== null && (
                    <div className='absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 text-white'>
                        <Clock className='h-3 w-3' />
                        <span className='text-xs font-medium'>
                            {daysRemaining === 0
                                ? 'Ends Today!'
                                : daysRemaining === 1
                                  ? '1 Day Left'
                                  : `${daysRemaining} Days Left`}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className='p-6'>
                <h3 className='mb-2 font-serif text-xl font-semibold text-stone-900 transition-colors group-hover:text-stone-700'>
                    {promotion.title}
                </h3>

                {promotion.excerpt && (
                    <PromotionMarkdown
                        content={promotion.excerpt}
                        className='mb-4 line-clamp-2 text-sm leading-relaxed text-stone-600'
                    />
                )}

                {/* CTA */}
                <Button
                    asChild
                    variant='outline'
                    className='group/btn w-full border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white'
                >
                    <Link href={`/promotions/${promotion.slug}`}>
                        {promotion.ctaText}
                        <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1' />
                    </Link>
                </Button>
            </div>

            {/* Decorative corner */}
            <div className='bg-gold-500/20 absolute -top-8 -right-8 h-16 w-16 rotate-45 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
        </article>
    )
}
