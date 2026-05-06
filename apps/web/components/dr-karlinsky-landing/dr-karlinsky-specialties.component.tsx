/**
 * DrKarlinskySpecialties
 *
 * 8-card specialty grid mapped to real procedure pages. Each card invites
 * deeper research (link to procedure detail) AND offers a fast-path back to
 * the hero form for visitors ready to book without reading more.
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
        title: 'Brazilian Butt Lift (BBL)',
        tagline: 'Sculpted curves with safety-first technique.',
    },
    {
        title: 'Mommy Makeover',
        tagline: 'Reclaim your pre-pregnancy silhouette.',
    },
    {
        title: 'Tummy Tuck (Abdominoplasty)',
        tagline: 'A flatter, firmer midsection.',
    },
    {
        title: 'Liposuction & Lipo 360',
        tagline: 'Full-body contouring with precision.',
    },
    {
        title: 'Breast Augmentation & Lift',
        tagline: 'Natural shape, balanced proportions.',
    },
    {
        title: 'Breast Reduction',
        tagline: 'Comfort and confidence restored.',
    },
    {
        title: 'Facelift',
        tagline: 'Refreshed, rested — never overdone.',
    },
    {
        title: 'Blepharoplasty (Eyelid)',
        tagline: 'Brighter, more open eyes.',
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
                        Procedures Performed by Dr. Karlinsky
                    </p>
                    <h2 className='font-serif text-3xl leading-tight text-stone-900 md:text-4xl lg:text-5xl'>
                        Eight signature procedures.{' '}
                        <span className='text-gold-600 italic'>
                            One uncompromising standard.
                        </span>
                    </h2>
                    <p className='mt-4 text-base leading-relaxed text-stone-600 lg:text-lg'>
                        Each plan is built around <em>your</em> anatomy and
                        goals. Not sure which procedure fits? Dr. Karlinsky will
                        walk you through every option in your free consult.
                    </p>
                </div>

                <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5'>
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
                <div className='mt-12 flex flex-col items-center gap-3 text-center'>
                    <p className='text-stone-600'>
                        Considering more than one? Dr. Karlinsky often combines
                        procedures safely in a single session.
                    </p>
                    <Link
                        href={formAnchor}
                        className='text-gold-700 hover:text-gold-800 hover:decoration-gold-500 inline-flex items-center gap-2 font-medium underline decoration-stone-300 underline-offset-4 transition-colors'
                    >
                        Discuss your combination
                        <span aria-hidden='true'>↑</span>
                    </Link>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
