/**
 * DrKarlinskySpecialties
 *
 * Six top-of-mind procedures for IG-bio-link traffic. Trimmed from
 * eight to keep the grid one-screen-tall on mobile and to bias toward
 * the procedures Dr. K's IG audience actually asks about.
 */
import { ArrowDownRight } from 'lucide-react'
import Link from 'next/link'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'

type SpecialtyCard = {
    readonly title: string
    readonly tagline: string
}

const SPECIALTIES: readonly SpecialtyCard[] = [
    {
        title: 'Brazilian Butt Lift',
        tagline: 'Sculpted curves, safety first.',
    },
    {
        title: 'Mommy Makeover',
        tagline: 'Pre-pregnancy silhouette, restored.',
    },
    {
        title: 'Tummy Tuck',
        tagline: 'A flatter, firmer midsection.',
    },
    {
        title: 'Lipo 360',
        tagline: 'Full-body contouring, precise.',
    },
    {
        title: 'Breast Augmentation & Lift',
        tagline: 'Natural shape. Balanced proportions.',
    },
    {
        title: 'Facelift',
        tagline: 'Refreshed — never overdone.',
    },
] as const

export type DrKarlinskySpecialtiesProps = {
    readonly id?: string
    readonly formAnchor?: string
}

export function DrKarlinskySpecialties({
    id = 'specialties',
    formAnchor = '#hero-form',
}: DrKarlinskySpecialtiesProps) {
    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-white'
            paddingY='py-20 lg:py-28'
        >
            <ContentWrapper
                size='xl'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='mx-auto mb-14 max-w-3xl text-center lg:mb-16'>
                    <p className='text-gold-600 mb-3 text-xs font-bold tracking-[0.22em] uppercase'>
                        What Dr. Karlinsky Does
                    </p>
                    <h2 className='font-serif text-3xl leading-tight text-stone-900 md:text-4xl lg:text-5xl'>
                        What women fly into Miami{' '}
                        <span className='text-gold-600 italic'>for.</span>
                    </h2>
                    <p className='mt-4 text-base leading-relaxed text-stone-600 lg:text-lg'>
                        Tap any procedure and we&apos;ll start the conversation.
                    </p>
                </div>

                <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5'>
                    {SPECIALTIES.map((specialty, index) => (
                        <li key={specialty.title}>
                            <Link
                                href={formAnchor}
                                className='hover:ring-gold-300 group relative flex h-full flex-col justify-between overflow-hidden rounded-xl bg-stone-50 p-5 ring-1 ring-stone-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-stone-300/50'
                            >
                                {/* Number plate */}
                                <span
                                    aria-hidden='true'
                                    className='text-gold-500/30 group-hover:text-gold-500/60 font-serif text-3xl font-light tabular-nums transition-colors'
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </span>

                                <div className='mt-6'>
                                    <h3 className='font-serif text-lg leading-snug text-stone-900 md:text-xl'>
                                        {specialty.title}
                                    </h3>
                                    <p className='mt-1.5 text-sm leading-relaxed text-stone-500'>
                                        {specialty.tagline}
                                    </p>
                                </div>

                                <div className='mt-5 flex items-center justify-between border-t border-stone-200/70 pt-4'>
                                    <span className='text-gold-600 group-hover:text-gold-700 text-xs font-semibold tracking-wide uppercase transition-colors'>
                                        Ask Dr. Karlinsky
                                    </span>
                                    <ArrowDownRight className='text-gold-500 group-hover:text-gold-700 h-4 w-4 transition-all group-hover:translate-x-0.5 group-hover:translate-y-0.5' />
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Bottom redirect to form */}
                <div className='mt-12 flex flex-col items-center gap-2 text-center'>
                    <p className='text-stone-600'>
                        Combining two? Dr. Karlinsky does that, safely, all the
                        time.
                    </p>
                    <Link
                        href={formAnchor}
                        className='text-gold-700 hover:text-gold-800 hover:decoration-gold-500 inline-flex items-center gap-2 font-medium underline decoration-stone-300 underline-offset-4 transition-colors'
                    >
                        Discuss yours
                        <span aria-hidden='true'>↑</span>
                    </Link>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
