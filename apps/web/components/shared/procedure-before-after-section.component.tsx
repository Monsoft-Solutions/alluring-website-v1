import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { getBeforeAfterPairsByProcedure } from '@/lib/queries/gallery/before-after.query'

import { ContentWrapper } from './content-wrapper.component'
import { SectionContainer } from './section-container.component'
import { BeforeAfterSlider } from '../gallery/before-after-slider.component'

type ProcedureBeforeAfterSectionProps = {
    /** The procedure page slug to fetch before/after pairs for */
    readonly procedureSlug: string
    /** Optional procedure title for the section header */
    readonly procedureTitle?: string
    /** Maximum number of pairs to display (default: 6) */
    readonly limit?: number
    /** Additional CSS classes */
    readonly className?: string
    /**
     * Hide the "View Full Gallery" button below the sliders. Used on
     * paid-ad landing pages where the convert-or-exit directive
     * forbids sending the visitor to another route.
     */
    readonly hideViewAllButton?: boolean
    /**
     * Hide the procedure-type metadata pill on each slider. Defaults to
     * showing the pill, which is useful on the general /gallery page
     * but redundant on a procedure-specific landing page where the
     * visitor already knows which procedure they're looking at.
     */
    readonly hideProcedureTypePill?: boolean
}

/**
 * Procedure Before & After Section
 *
 * A server component that displays before/after comparison sliders
 * for a specific procedure. Designed to be placed on procedure pages
 * to showcase real patient transformations.
 *
 * Features:
 * - Server-side data fetching with caching
 * - Responsive grid layout (3 cols desktop, 2 tablet, 1 mobile)
 * - Elegant section header with gold accent styling
 * - CTA button linking to full gallery
 * - Graceful handling when no pairs exist
 */
export async function ProcedureBeforeAfterSection({
    procedureSlug,
    procedureTitle,
    limit = 6,
    className,
    hideViewAllButton = false,
    hideProcedureTypePill = false,
}: ProcedureBeforeAfterSectionProps) {
    const pairs = await getBeforeAfterPairsByProcedure(procedureSlug, limit)

    // Don't render anything if no pairs are available
    if (pairs.length === 0) {
        return null
    }

    const displayTitle = procedureTitle
        ? `${procedureTitle} Results`
        : 'Real Results'

    return (
        <SectionContainer
            id='before-after-results'
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
                                Before &amp; After
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className='mb-6 font-serif text-4xl text-stone-900 md:text-5xl'>
                            {displayTitle.includes('Results') ? (
                                <>
                                    {displayTitle.replace(' Results', '')}{' '}
                                    <span className='text-gold-600'>
                                        Results
                                    </span>
                                </>
                            ) : (
                                <>
                                    Real{' '}
                                    <span className='text-gold-600'>
                                        Transformations
                                    </span>
                                </>
                            )}
                        </h2>

                        {/* Description */}
                        <p className='text-lg leading-relaxed font-light text-stone-600'>
                            Drag the slider to see the remarkable
                            transformations achieved by our expert surgeons.
                            These authentic results showcase the precision and
                            artistry we bring to every procedure.
                        </p>
                    </div>
                </div>

                {/* Before/After Sliders Grid */}
                <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {pairs.map((pair) => (
                        <BeforeAfterSlider
                            key={pair.id}
                            pair={pair}
                            hideProcedureTypePill={hideProcedureTypePill}
                        />
                    ))}
                </div>

                {!hideViewAllButton && (
                    <div className='mt-12 text-center md:mt-16'>
                        <Button
                            asChild
                            variant='outline'
                            size='lg'
                            className='group hover:border-gold-500 hover:bg-gold-50 border-stone-300'
                        >
                            <Link href='/gallery'>
                                <span>View Full Gallery</span>
                                <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                            </Link>
                        </Button>
                    </div>
                )}
            </ContentWrapper>
        </SectionContainer>
    )
}
