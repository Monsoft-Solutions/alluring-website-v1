import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import type { BeforeAfterPairCard } from '@/lib/types/gallery/before-after.type'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'

import { BeforeAfterSlider } from './before-after-slider.component'

type BeforeAfterShowcaseProps = {
    readonly pairs: BeforeAfterPairCard[]
    readonly className?: string
}

/**
 * Before/After Showcase Section Component
 *
 * Displays featured before/after comparison sliders in an elegant grid.
 */
export function BeforeAfterShowcase({
    pairs,
    className,
}: BeforeAfterShowcaseProps) {
    if (pairs.length === 0) {
        return null
    }

    return (
        <SectionContainer
            id='gallery-showcase'
            variant='muted'
            className={cn('bg-stone-50', className)}
        >
            <ContentWrapper>
                {/* Section Header */}
                <div className='mb-12 md:mb-16'>
                    <div className='mx-auto max-w-3xl text-center'>
                        {/* Badge */}
                        <div className='mb-4 flex justify-center'>
                            <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                Real Results
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className='mb-6 font-serif text-4xl text-stone-900 md:text-5xl'>
                            Before &amp; After{' '}
                            <span className='text-gold-600'>
                                Transformations
                            </span>
                        </h2>

                        {/* Description */}
                        <p className='text-lg leading-relaxed font-light text-stone-600'>
                            Drag the slider to reveal the remarkable
                            transformations achieved by our expert surgeons.
                            These authentic results showcase the precision and
                            artistry of our procedures.
                        </p>
                    </div>
                </div>

                {/* Sliders Grid */}
                <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {pairs.slice(0, 6).map((pair) => (
                        <BeforeAfterSlider key={pair.id} pair={pair} />
                    ))}
                </div>

                {/* CTA */}
                <div className='mt-12 text-center md:mt-16'>
                    <Button
                        asChild
                        variant='outline'
                        size='lg'
                        className='group'
                    >
                        <Link href='#gallery-groups'>
                            <span>View All Galleries</span>
                            <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                        </Link>
                    </Button>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
