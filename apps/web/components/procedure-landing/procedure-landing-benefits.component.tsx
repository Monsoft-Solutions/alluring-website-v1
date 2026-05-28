/**
 * ProcedureLandingBenefits
 *
 * SSR-first benefits grid for landing pages. Uses CSS-only animation
 * (no Framer Motion) so the section renders crawlable on first paint —
 * critical for paid-traffic LPs where bounce risk peaks above the fold.
 *
 * Each card pulls a contextual icon from the benefit title so editors
 * never need to author iconName fields, and a soft gold corner glow
 * adds dimensional luxury without obscuring copy.
 */
import {
    CheckCircle2,
    Heart,
    ShieldCheck,
    Sparkles,
    Stars,
    type LucideIcon,
} from 'lucide-react'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import type { ProcedureBenefit } from '@/lib/types/procedure.type'

function getIconForBenefit(title: string): LucideIcon {
    const t = title.toLowerCase()
    if (t.includes('natural') || t.includes('beauty')) return Sparkles
    if (t.includes('safe') || t.includes('scar') || t.includes('care'))
        return ShieldCheck
    if (
        t.includes('confidence') ||
        t.includes('personal') ||
        t.includes('comfort') ||
        t.includes('restoration')
    )
        return Heart
    if (t.includes('result') || t.includes('balanced')) return Stars
    return CheckCircle2
}

export type ProcedureLandingBenefitsProps = {
    readonly id?: string
    readonly benefits: readonly ProcedureBenefit[]
    readonly formAnchor?: string
}

export function ProcedureLandingBenefits({
    id = 'benefits',
    benefits,
    formAnchor = '#hero-form',
}: ProcedureLandingBenefitsProps) {
    if (benefits.length === 0) return null

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-white'
            paddingY='py-20 lg:py-28'
        >
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0'
            >
                <div className='absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.10),_transparent_60%)]' />
            </div>

            <ContentWrapper
                size='xl'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='mx-auto mb-14 max-w-3xl text-center lg:mb-16'>
                    <p className='text-gold-600 mb-3 text-xs font-bold tracking-[0.22em] uppercase'>
                        Why women choose this
                    </p>
                    <h2 className='font-serif text-3xl leading-tight text-stone-900 md:text-4xl lg:text-5xl'>
                        The change that feels like{' '}
                        <span className='text-gold-600 italic'>you again.</span>
                    </h2>
                    <p className='mt-4 text-base leading-relaxed text-stone-600 lg:text-lg'>
                        What our patients tell us they actually got back.
                    </p>
                </div>

                <ul className='grid gap-5 sm:grid-cols-2 lg:grid-cols-2 lg:gap-6'>
                    {benefits.map((benefit, index) => {
                        const Icon = getIconForBenefit(benefit.title)
                        return (
                            <li
                                key={benefit.title}
                                className='group hover:border-gold-300/80 relative overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-stone-300/40 lg:p-8'
                            >
                                <span
                                    aria-hidden='true'
                                    className='from-gold-300/30 absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100'
                                />
                                <div className='relative flex items-start gap-4'>
                                    <span className='border-gold-500/30 bg-gold-500/10 group-hover:bg-gold-500/15 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors'>
                                        <Icon className='text-gold-600 h-5 w-5' />
                                    </span>
                                    <div className='min-w-0 flex-1'>
                                        <div className='mb-2 flex items-center gap-3'>
                                            <span
                                                aria-hidden='true'
                                                className='text-gold-500/40 font-serif text-xs font-light tabular-nums'
                                            >
                                                {String(index + 1).padStart(
                                                    2,
                                                    '0'
                                                )}
                                            </span>
                                            <h3 className='font-serif text-xl leading-snug text-stone-900 md:text-2xl'>
                                                {benefit.title}
                                            </h3>
                                        </div>
                                        <p className='text-sm leading-relaxed text-stone-600 lg:text-base'>
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>

                <div className='mt-12 flex flex-col items-center gap-2 text-center'>
                    <p className='text-stone-600'>
                        Want to know what your plan looks like?
                    </p>
                    <a
                        href={formAnchor}
                        className='text-gold-700 hover:text-gold-800 hover:decoration-gold-500 inline-flex items-center gap-2 font-medium underline decoration-stone-300 underline-offset-4 transition-colors'
                    >
                        Get your free quote
                        <span aria-hidden='true'>↑</span>
                    </a>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
