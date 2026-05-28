/**
 * ProcedureLandingMidCTA
 *
 * Mid-page conversion punch styled as a magazine pull quote. Large
 * italic Playfair, gold quotation marks framing the message, hairline
 * gold rule below, and a single refined CTA. The dark background mirrors
 * the hero so the chapter visually picks up where the cover spread left
 * off.
 */
'use client'

import { ArrowRight } from 'lucide-react'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'

/**
 * Inline SVG noise — same recipe as the hero, used to keep the dark
 * section feeling like a textured magazine spread rather than flat ink.
 */
const GRAIN_DATA_URI =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.92 0 0 0 0 0.78 0 0 0 0 0.42 0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

export type ProcedureLandingMidCTAProps = {
    readonly id?: string
    readonly procedureTitle: string
    readonly formAnchor?: string
}

export function ProcedureLandingMidCTA({
    id = 'mid-cta',
    procedureTitle,
    formAnchor = '#hero-form',
}: ProcedureLandingMidCTAProps) {
    const cleanTitle = procedureTitle.replace(/\s*Miami\s*$/i, '')
    const { trackCTA } = useAnalyticsEvent()

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-950'
            paddingY='py-20 lg:py-28'
        >
            {/* Atmospheric layers */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0'
            >
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,_rgba(212,175,55,0.18),_transparent_70%)]' />
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_50%_100%,_rgba(212,175,55,0.10),_transparent_70%)]' />
                <div
                    className='absolute inset-0 opacity-[0.35] mix-blend-overlay'
                    style={{ backgroundImage: GRAIN_DATA_URI }}
                />
                <div className='absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent' />
                <div className='absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='mx-auto max-w-3xl text-center'>
                    {/* Chapter marker */}
                    <div className='mb-10 flex items-center justify-center gap-4'>
                        <span
                            aria-hidden='true'
                            className='h-px w-12 bg-gradient-to-l from-amber-300/40 to-transparent'
                        />
                        <span className='font-serif text-[11px] tracking-[0.4em] text-amber-200/80 uppercase'>
                            №04 — A Note
                        </span>
                        <span
                            aria-hidden='true'
                            className='h-px w-12 bg-gradient-to-r from-amber-300/40 to-transparent'
                        />
                    </div>

                    {/* Pull-quote treatment */}
                    <span
                        aria-hidden='true'
                        className='block font-serif text-7xl leading-none text-amber-200/40 select-none md:text-8xl'
                    >
                        &ldquo;
                    </span>

                    <h2 className='-mt-4 font-serif text-3xl leading-[1.15] text-white italic md:text-4xl lg:text-[2.75rem]'>
                        A personalized{' '}
                        <span className='not-italic'>{cleanTitle}</span> plan,
                        texted to you in under 24 hours.
                    </h2>

                    <span
                        aria-hidden='true'
                        className='block text-right font-serif text-7xl leading-none text-amber-200/40 select-none md:text-8xl'
                    >
                        &rdquo;
                    </span>

                    {/* Author byline */}
                    <p className='-mt-6 mb-10 font-serif text-sm text-stone-400 italic'>
                        — Tell us a little about you. We&apos;ll send back a
                        quote, financing options, and a few times that work for
                        your consult.
                    </p>

                    {/* Gold hairline divider */}
                    <div
                        aria-hidden='true'
                        className='mx-auto mb-10 h-px w-24 bg-gradient-to-r from-transparent via-amber-300 to-transparent'
                    />

                    {/* CTA */}
                    <a
                        href={formAnchor}
                        onClick={() =>
                            trackCTA('landing_cta_mid', {
                                cta_position: 'landing_mid_cta',
                                lp_template_version: 'v2',
                            })
                        }
                        className='group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-9 py-3.5 text-sm font-bold tracking-[0.22em] text-stone-950 uppercase shadow-[0_15px_35px_-10px_rgba(212,175,55,0.45)] transition-all hover:from-amber-400 hover:to-amber-300 hover:shadow-[0_18px_40px_-8px_rgba(212,175,55,0.55)] active:scale-[0.98]'
                    >
                        Send My Free Quote
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                    </a>

                    <p className='mt-6 text-[11px] tracking-[0.24em] text-stone-500 uppercase'>
                        Free · Private · No pressure
                    </p>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
