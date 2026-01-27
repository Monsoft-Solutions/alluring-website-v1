import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { procedures } from '@/lib/data/procedures.data'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'

/**
 * Signature procedure slugs (shown in main carousel)
 * These are excluded from secondary procedures
 */
const signatureProcedureSlugs = [
    'brazilian-butt-lift-bbl-miami',
    'mommy-makeover-miami',
    'breast-augmentation-miami',
    'liposuction-miami',
]

/**
 * Secondary procedures (not in main carousel)
 * Sorted for optimal SEO value
 */
const secondaryProcedures = procedures
    .filter((proc) => !signatureProcedureSlugs.includes(proc.slug))
    .sort((a, b) => {
        // Priority order for SEO (high-volume searches first)
        const priority: Record<string, number> = {
            'tummy-tuck-miami': 1,
            'breast-lift-miami': 2,
            'breast-reduction-miami': 3,
            'facelift-miami': 4,
            'blepharoplasty-miami': 5,
        }
        return (priority[a.slug] ?? 99) - (priority[b.slug] ?? 99)
    })

/**
 * Secondary Procedures Component
 *
 * Server-rendered component displaying additional procedures
 * not shown in the main signature procedures carousel.
 * Provides important internal links for SEO.
 *
 * Procedures shown:
 * - Tummy Tuck Miami
 * - Breast Lift Miami
 * - Breast Reduction Miami
 * - Facelift Miami
 * - Blepharoplasty Miami
 */
export function SecondaryProcedures() {
    if (secondaryProcedures.length === 0) {
        return null
    }

    return (
        <SectionContainer
            as='div'
            variant='default'
            className='bg-stone-900'
            paddingY='pb-16 md:pb-24'
            ariaLabel='More plastic surgery procedures'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Section Header */}
                <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                    <h3 className='text-lg font-medium tracking-wider text-stone-400 uppercase'>
                        More Procedures
                    </h3>
                    <Link
                        href='/procedures'
                        className='hover:text-gold-400 hover:border-gold-400 inline-flex w-fit items-center gap-2 border-b border-stone-600 pb-1 text-sm tracking-widest text-white uppercase transition-all'
                    >
                        View All Procedures <ArrowRight className='h-4 w-4' />
                    </Link>
                </div>

                {/* Procedure Links Grid */}
                <div
                    className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                    role='list'
                    aria-label='Additional procedure options'
                >
                    {secondaryProcedures.map((procedure) => (
                        <SecondaryProcedureCard
                            key={procedure.slug}
                            procedure={procedure}
                        />
                    ))}
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}

/**
 * Secondary Procedure Card
 *
 * Compact card linking to a procedure page.
 * Includes keyword-rich anchor text for SEO.
 */
function SecondaryProcedureCard({
    procedure,
}: {
    readonly procedure: (typeof secondaryProcedures)[number]
}) {
    return (
        <Link
            href={`/procedures/${procedure.slug}`}
            className='group flex items-center justify-between rounded-lg border border-stone-700 bg-stone-800/50 px-4 py-3 transition-all hover:border-stone-600 hover:bg-stone-800'
            role='listitem'
        >
            <span className='group-hover:text-gold-400 text-sm font-medium text-white transition-colors'>
                {procedure.title}
            </span>
            <ArrowRight className='group-hover:text-gold-400 h-4 w-4 flex-shrink-0 text-stone-500 transition-colors' />
        </Link>
    )
}
