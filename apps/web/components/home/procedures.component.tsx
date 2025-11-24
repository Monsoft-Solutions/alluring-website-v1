'use client'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'
import { SignatureProcedureCard } from '../shared/signature-procedure-card.component'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { procedures } from '@/lib/data/procedures.data'

// Select signature procedures for home page
const signatureProcedures = procedures.filter((proc) =>
    [
        'brazilian-butt-lift-bbl-miami',
        'mommy-makeover-miami',
        'breast-augmentation-miami',
        'liposuction-miami',
    ].includes(proc.slug)
)

export const Procedures = () => {
    // We use a separate ref for the horizontal scroll container
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    return (
        <SectionContainer
            id='procedures'
            variant='default'
            className='overflow-hidden bg-stone-900 text-white'
            paddingY='py-24'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                <div className='mb-16 flex flex-col items-end justify-between md:flex-row'>
                    <div className='max-w-xl'>
                        <span className='text-gold-400 mb-4 block text-sm font-bold tracking-widest uppercase'>
                            Expertise
                        </span>
                        <h2 className='mb-6 font-serif text-4xl text-white md:text-5xl lg:text-6xl'>
                            Signature Procedures
                        </h2>
                        <p className='text-xl font-light text-stone-400'>
                            Tailored surgical plans for your body, your
                            lifestyle, and your definition of confidence.
                        </p>
                    </div>
                    <Link
                        href='/procedures'
                        className='hover:text-gold-400 hover:border-gold-400 hidden items-center gap-2 border-b border-stone-600 pb-2 text-sm tracking-widest uppercase transition-all md:flex'
                    >
                        View All Procedures <ArrowRight className='h-4 w-4' />
                    </Link>
                </div>
            </ContentWrapper>

            {/* Horizontal Scroll Area */}
            <div
                ref={scrollContainerRef}
                className='scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pr-12 pb-12 pl-6 md:gap-8 md:pl-12'
            >
                {signatureProcedures.map((procedure, idx) => (
                    <SignatureProcedureCard
                        key={procedure.slug}
                        procedure={procedure}
                        index={idx}
                        containerRef={
                            scrollContainerRef as React.RefObject<HTMLDivElement>
                        }
                    />
                ))}
            </div>
        </SectionContainer>
    )
}
