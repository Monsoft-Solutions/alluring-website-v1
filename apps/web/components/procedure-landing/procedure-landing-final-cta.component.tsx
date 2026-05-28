/**
 * ProcedureLandingFinalCTA
 *
 * Editorial closing spread for the landing page. Mirrors the cover-page
 * (hero) treatment so the funnel ends with the same visual cadence it
 * began with — gold hairline rule above an oversized italic Playfair,
 * thin gold underline, and a single refined CTA. Avoids the generic
 * "trust box" pattern in favor of an editorial colophon.
 */
'use client'

import { ArrowRight } from 'lucide-react'

import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'
import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { siteConfig } from '@/lib/data/site-config'

const GRAIN_DATA_URI =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.92 0 0 0 0 0.78 0 0 0 0 0.42 0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

export type ProcedureLandingFinalCTAProps = {
    readonly id?: string
    readonly procedureTitle: string
    readonly formAnchor?: string
}

export function ProcedureLandingFinalCTA({
    id = 'final-cta',
    procedureTitle,
    formAnchor = '#hero-form',
}: ProcedureLandingFinalCTAProps) {
    const { trackCTA } = useAnalyticsEvent()
    const cleanTitle = procedureTitle.replace(/\s*Miami\s*$/i, '')
    const rating = siteConfig.trustStats?.rating
    const patients = siteConfig.trustStats?.patients
    const years = siteConfig.trustStats?.years

    return (
        <SectionContainer
            id={id}
            variant='default'
            className='relative overflow-hidden bg-stone-950'
            paddingY='py-20 lg:py-28'
        >
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0'
            >
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_30%,_rgba(212,175,55,0.18),_transparent_70%)]' />
                <div
                    className='absolute inset-0 opacity-[0.35] mix-blend-overlay'
                    style={{ backgroundImage: GRAIN_DATA_URI }}
                />
                <div className='absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-amber-200/35 to-transparent' />
            </div>

            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='relative z-10'
            >
                <div className='mx-auto max-w-3xl text-center'>
                    {/* Chapter marker — final number signals editorial closure */}
                    <div className='mb-10 flex items-center justify-center gap-4'>
                        <span
                            aria-hidden='true'
                            className='h-px w-16 bg-gradient-to-l from-amber-300/50 to-transparent'
                        />
                        <span className='font-serif text-[11px] tracking-[0.4em] text-amber-200/80 uppercase'>
                            Fin — Your Move
                        </span>
                        <span
                            aria-hidden='true'
                            className='h-px w-16 bg-gradient-to-r from-amber-300/50 to-transparent'
                        />
                    </div>

                    {/* Editorial display headline */}
                    <h2 className='font-serif text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl'>
                        Let&apos;s plan{' '}
                        <span className='text-amber-200 italic'>yours.</span>
                    </h2>

                    {/* Thin gold underline */}
                    <div
                        aria-hidden='true'
                        className='mx-auto mt-7 mb-7 h-px w-16 bg-amber-300'
                    />

                    <p className='mx-auto mb-10 max-w-lg font-serif text-base text-stone-300 italic md:text-lg'>
                        A free quote for your {cleanTitle}. An honest plan.
                        Texted to you in under 24 hours.
                    </p>

                    <a
                        href={formAnchor}
                        onClick={() =>
                            trackCTA('landing_cta_final', {
                                cta_position: 'landing_final_cta',
                                lp_template_version: 'v2',
                            })
                        }
                        className='group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 px-10 py-4 text-sm font-bold tracking-[0.22em] text-stone-950 uppercase shadow-[0_18px_45px_-12px_rgba(212,175,55,0.55)] transition-all hover:from-amber-400 hover:to-amber-300 hover:shadow-[0_22px_55px_-10px_rgba(212,175,55,0.65)] active:scale-[0.98]'
                    >
                        Send My Free Quote
                        <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                    </a>

                    {/* Colophon — editorial credits at the very bottom */}
                    <ul className='mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] tracking-[0.24em] text-stone-400 uppercase'>
                        {rating && (
                            <li className='inline-flex items-center gap-2'>
                                <span className='font-serif text-base leading-none tracking-tight text-amber-200 tabular-nums'>
                                    {rating}
                                </span>
                                Google rating
                            </li>
                        )}
                        {patients && (
                            <>
                                <li
                                    aria-hidden='true'
                                    className='h-3 w-px bg-amber-200/30'
                                />
                                <li className='inline-flex items-center gap-2'>
                                    <span className='font-serif text-base leading-none tracking-tight text-amber-200 tabular-nums'>
                                        {patients}
                                    </span>
                                    Patients
                                </li>
                            </>
                        )}
                        {years && (
                            <>
                                <li
                                    aria-hidden='true'
                                    className='h-3 w-px bg-amber-200/30'
                                />
                                <li className='inline-flex items-center gap-2'>
                                    <span className='font-serif text-base leading-none tracking-tight text-amber-200 tabular-nums'>
                                        {years}
                                    </span>
                                    Years
                                </li>
                            </>
                        )}
                        <li
                            aria-hidden='true'
                            className='h-3 w-px bg-amber-200/30'
                        />
                        <li>Board-Certified</li>
                        <li
                            aria-hidden='true'
                            className='h-3 w-px bg-amber-200/30'
                        />
                        <li>Hablamos Español</li>
                    </ul>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
