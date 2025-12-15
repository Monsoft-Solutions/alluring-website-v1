/**
 * SpecialsPromotionsGrid Component
 *
 * Server Component displaying all active promotions with urgency elements.
 * Uses the existing PromotionCard component with enhanced CTA linking.
 *
 * Features:
 * - SSR-rendered for SEO
 * - Grid layout responsive for all screen sizes
 * - Direct CTAs to the consultation form
 */
import { Sparkles } from 'lucide-react'
import type { Promotion } from '@workspace/db/schema/promotion'

import { SectionContainer } from '@/components/shared/section-container.component'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { PromotionCard } from '@/components/promotions/promotion-card.component'

export type SpecialsPromotionsGridProps = {
    readonly id?: string
    /** Array of active promotions to display */
    readonly promotions: Promotion[]
}

export function SpecialsPromotionsGrid({
    id = 'all-specials',
    promotions,
}: SpecialsPromotionsGridProps) {
    // Skip first promotion if it's the featured one (already shown in hero)
    const displayPromotions = promotions.length > 1 ? promotions.slice(1) : []

    // If no additional promotions, don't render this section
    if (displayPromotions.length === 0) {
        return null
    }

    return (
        <SectionContainer
            id={id}
            variant='muted'
            className='relative overflow-hidden'
            paddingY='py-24 lg:py-32'
        >
            {/* Subtle Background */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute top-[20%] left-[5%] h-[300px] w-[300px] rounded-full bg-stone-200/50 blur-3xl' />
                <div className='bg-gold-100/20 absolute right-[10%] bottom-[10%] h-[250px] w-[250px] rounded-full blur-3xl' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                {/* Section Header */}
                <div className='mb-12 text-center'>
                    <div className='mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2'>
                        <Sparkles className='text-gold-500 h-4 w-4' />
                        <span className='text-sm font-medium tracking-wide text-stone-600 uppercase'>
                            More Exclusive Offers
                        </span>
                    </div>

                    <h2 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl lg:text-5xl'>
                        All Current{' '}
                        <span className='font-light text-stone-600 italic'>
                            Specials
                        </span>
                    </h2>

                    <div className='bg-gold-500 mx-auto mb-6 h-1 w-24' />

                    <p className='mx-auto max-w-2xl text-lg leading-relaxed font-light text-stone-600'>
                        Explore all our limited-time offers. Each promotion is
                        designed to make your transformation more accessible
                        without compromising on quality.
                    </p>
                </div>

                {/* Promotions Grid */}
                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {displayPromotions.map((promotion) => (
                        <PromotionCard
                            key={promotion.id}
                            promotion={promotion}
                        />
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className='mt-12 text-center'>
                    <p className='text-stone-500'>
                        <span className='font-semibold text-stone-700'>
                            Not sure which offer is right for you?
                        </span>{' '}
                        Our team will help you find the best option during your
                        complimentary consultation.
                    </p>
                    <a
                        href='#specials-form'
                        className='text-gold-600 hover:text-gold-700 mt-4 inline-flex items-center gap-2 font-medium transition-colors'
                    >
                        Request a Consultation
                        <span aria-hidden='true'>↑</span>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
