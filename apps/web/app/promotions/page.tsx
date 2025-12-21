import type { Metadata } from 'next'
import { Sparkles } from 'lucide-react'

import { ContainerLayout } from '@/components/container-layout.component'
import { PromotionCard } from '@/components/promotions/promotion-card.component'
import { getActivePromotions } from '@/lib/queries/promotion.query'
import Link from 'next/link'

const pageTitle = 'Special Offers & Promotions'

export const metadata: Metadata = {
    title: pageTitle,
    description:
        'Discover our current special offers and promotions on cosmetic surgery procedures. Limited-time discounts, seasonal specials, and exclusive package deals in Miami.',
    openGraph: {
        title: pageTitle,
        description:
            'Discover our current special offers and promotions on cosmetic surgery procedures.',
        type: 'website',
    },
}

export default async function PromotionsPage() {
    const promotions = await getActivePromotions()

    return (
        <ContainerLayout>
            <div className='py-16 md:py-24'>
                {/* Header */}
                <div className='mb-12 text-center'>
                    <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2'>
                        <Sparkles className='text-gold-500 h-4 w-4' />
                        <span className='text-sm font-medium tracking-wide text-stone-600 uppercase'>
                            Limited Time Offers
                        </span>
                    </div>

                    <h1 className='mb-4 font-serif text-4xl text-stone-900 md:text-5xl lg:text-6xl'>
                        Special Offers &{' '}
                        <span className='font-light text-stone-600 italic'>
                            Promotions
                        </span>
                    </h1>

                    <div className='bg-gold-500 mx-auto mb-6 h-1 w-24' />

                    <p className='mx-auto max-w-2xl text-lg leading-relaxed font-light text-stone-600'>
                        Take advantage of our exclusive promotions and make your
                        transformation journey more accessible. All offers are
                        for a limited time.
                    </p>
                </div>

                {/* Promotions Grid */}
                {promotions.length > 0 ? (
                    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        {promotions.map((promotion) => (
                            <PromotionCard
                                key={promotion.id}
                                promotion={promotion}
                            />
                        ))}
                    </div>
                ) : (
                    <div className='rounded-2xl border border-stone-200 bg-stone-50 py-16 text-center'>
                        <Sparkles className='mx-auto mb-4 h-12 w-12 text-stone-300' />
                        <h2 className='mb-2 font-serif text-2xl text-stone-700'>
                            No Active Promotions
                        </h2>
                        <p className='text-stone-500'>
                            Check back soon for new special offers and exclusive
                            deals.
                        </p>
                    </div>
                )}

                {/* CTA Section */}
                <div className='mt-16 rounded-2xl bg-stone-900 p-8 text-center md:p-12'>
                    <h2 className='mb-4 font-serif text-2xl text-white md:text-3xl'>
                        Don&apos;t Miss Out on Future Offers
                    </h2>
                    <p className='mx-auto mb-6 max-w-xl text-stone-300'>
                        Schedule a consultation today to learn about all
                        available options and how we can help you achieve your
                        aesthetic goals.
                    </p>
                    <Link
                        href='/contact-us'
                        className='bg-gold-500 hover:bg-gold-600 inline-flex items-center rounded-lg px-8 py-4 font-bold tracking-wide text-white uppercase shadow-lg transition-all'
                    >
                        Book Consultation
                    </Link>
                </div>
            </div>
        </ContainerLayout>
    )
}
