/**
 * ProcedureLandingHero
 *
 * Conversion-first hero for procedure-specific ad landing pages,
 * styled as an editorial atelier spread:
 *   - chapter-marker hairline above an oversized Playfair display
 *   - italic accent word, refined letter-spacing
 *   - data-sheet price anchor (FROM / FINANCING) with a gold underline
 *   - hero photograph framed with thin gold corner brackets
 *   - reservation-card form on the right (gold corner ornaments, hairline
 *     border, atmospheric inner shadow) — mobile hoists the card above
 *     the photograph so the highest-intent action lives in the first fold
 *   - trust ribbon under the submit button uses gold hairline dividers
 */
import {
    BadgeCheck,
    Languages,
    ShieldCheck,
    Sparkles,
    Star,
} from 'lucide-react'
import Image from 'next/image'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { siteConfig } from '@/lib/data/site-config'
import {
    CONTACT_SOURCES,
    getProcedureFormValue,
} from '@/lib/types/forms/contact-form.type'
import type { Procedure } from '@/lib/types/procedure.type'

const HERO_FORM_ID = 'hero-form'

/**
 * Single-letter "noise" grain encoded as an inline SVG data-URI. Used as
 * a low-opacity background overlay on dark sections so they don't read
 * as flat black — the eye reads texture as quality.
 */
const GRAIN_DATA_URI =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.92 0 0 0 0 0.78 0 0 0 0 0.42 0 0 0 0.07 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

export type ProcedureLandingHeroProps = {
    readonly id?: string
    readonly procedure: Procedure
}

/**
 * Splits the procedure title into a "leading" and "accent" half so the
 * accent half can be rendered in italicized gold without forcing copy
 * teams to author HTML inside the data file.
 */
function splitTitle(title: string): {
    readonly leading: string
    readonly accent: string
} {
    const tokens = title.trim().split(/\s+/)
    if (tokens.length <= 1) {
        return { leading: title, accent: '' }
    }
    const accent = tokens[tokens.length - 1] ?? ''
    const leading = tokens.slice(0, -1).join(' ')
    return { leading, accent }
}

export function ProcedureLandingHero({
    id = 'hero',
    procedure,
}: ProcedureLandingHeroProps) {
    const headline = procedure.outcomeHeadline ?? procedure.title
    const { leading, accent } = splitTitle(headline)
    const heroImage =
        procedure.contentImages?.find((img) => img.section === 'hero')?.src ??
        procedure.image

    const procedureFormValue = getProcedureFormValue(procedure.slug)
    const rating = siteConfig.trustStats?.rating
    const patients = siteConfig.trustStats?.patients

    return (
        <section
            id={id}
            aria-labelledby='procedure-landing-hero-heading'
            className='relative w-full overflow-hidden bg-stone-950 pt-12 pb-16 sm:pt-16 lg:min-h-[calc(100vh-72px)] lg:pt-24 lg:pb-28'
        >
            {/* Atmospheric depth: two layered radial glows + film grain */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0'
            >
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_85%_-5%,_rgba(212,175,55,0.22),_transparent_70%)]' />
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_-5%_110%,_rgba(180,148,31,0.12),_transparent_65%)]' />
                <div
                    className='absolute inset-0 opacity-[0.35] mix-blend-overlay'
                    style={{ backgroundImage: GRAIN_DATA_URI }}
                />
                {/* Hairline gold vignette at top — signals editorial chapter break */}
                <div className='absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent' />
            </div>

            <div className='relative z-10 mx-auto grid w-full max-w-7xl gap-y-12 px-6 md:px-10 lg:grid-cols-12 lg:gap-x-14'>
                {/* BLOCK A — Editorial pitch (chapter marker, headline, price anchor, dek) */}
                <div className='animate-fade-in-up lg:col-span-7 lg:col-start-1 lg:row-start-1'>
                    {/* Chapter marker: gold hairline rule + label */}
                    <div className='mb-8 flex items-center gap-4'>
                        <span className='font-serif text-xs tracking-[0.32em] text-amber-200/80 uppercase'>
                            №01 — Miami Atelier
                        </span>
                        <span
                            aria-hidden='true'
                            className='h-px flex-1 bg-gradient-to-r from-amber-200/40 to-transparent'
                        />
                        <span className='inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.24em] text-stone-400 uppercase'>
                            <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300' />
                            Booking this month
                        </span>
                    </div>

                    {/* Headline — display serif with italic accent and tight leading */}
                    <h1
                        id='procedure-landing-hero-heading'
                        className='animate-fade-in-up animate-delay-100 mb-7 font-serif text-[2.5rem] leading-[0.98] tracking-[-0.01em] text-white sm:text-[3.25rem] lg:text-[4.5rem] xl:text-[5rem]'
                    >
                        {leading}
                        {accent && (
                            <>
                                <br />
                                <span className='font-serif text-amber-200 italic [font-feature-settings:"liga","dlig","swsh"]'>
                                    {accent}
                                </span>
                            </>
                        )}
                    </h1>

                    {/* Subtitle / dek — italic serif for editorial cadence */}
                    <p className='animate-fade-in-up animate-delay-150 mb-9 max-w-xl font-serif text-lg leading-relaxed text-stone-300/95 italic sm:text-xl'>
                        {procedure.heroSubtitle ?? procedure.shortDescription}
                    </p>

                    {/* Editorial data sheet — FROM / FINANCING */}
                    {(procedure.priceFrom || procedure.weeklyPaymentFrom) && (
                        <dl className='animate-fade-in-up animate-delay-200 mb-10 grid max-w-md grid-cols-[auto_1px_auto] items-end gap-x-6 gap-y-1 border-y border-amber-200/15 py-5'>
                            {procedure.priceFrom && (
                                <>
                                    <div className='flex flex-col items-start'>
                                        <dt className='font-sans text-[10px] tracking-[0.28em] text-amber-200/70 uppercase'>
                                            From
                                        </dt>
                                        <dd className='font-serif text-3xl leading-none text-white tabular-nums'>
                                            {procedure.priceFrom}
                                        </dd>
                                    </div>
                                </>
                            )}
                            {procedure.priceFrom &&
                                procedure.weeklyPaymentFrom && (
                                    <span
                                        aria-hidden='true'
                                        className='self-stretch bg-amber-200/15'
                                    />
                                )}
                            {procedure.weeklyPaymentFrom && (
                                <div className='flex flex-col items-start'>
                                    <dt className='font-sans text-[10px] tracking-[0.28em] text-amber-200/70 uppercase'>
                                        Or weekly
                                    </dt>
                                    <dd className='font-serif text-2xl leading-none text-white/95 tabular-nums'>
                                        {procedure.weeklyPaymentFrom
                                            .replace(/^\$/, '$')
                                            .replace(
                                                /\s*with approved credit/i,
                                                ''
                                            )}
                                    </dd>
                                </div>
                            )}
                            <p className='col-span-3 mt-1 text-[11px] tracking-wide text-stone-500'>
                                Subject to credit approval · Cherry, CareCredit,
                                United Credit
                            </p>
                        </dl>
                    )}

                    {procedure.microProof && (
                        <p className='animate-fade-in-up animate-delay-250 max-w-xl text-sm text-stone-400 italic'>
                            — {procedure.microProof}
                        </p>
                    )}
                </div>

                {/* BLOCK B — Reservation-card form (right column, mobile-first stacking) */}
                <div className='animate-fade-in-up animate-delay-200 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1'>
                    <div className='lg:sticky lg:top-32'>
                        <div
                            id={HERO_FORM_ID}
                            className='relative isolate rounded-[28px] border border-amber-200/20 bg-stone-900/90 p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:p-9'
                        >
                            {/* Inner gold hairline frame — gives the card a "card stock" feel */}
                            <div
                                aria-hidden='true'
                                className='pointer-events-none absolute inset-3 rounded-[22px] border border-amber-200/10'
                            />

                            {/* Decorative gold corner brackets (NE + SW) */}
                            <span
                                aria-hidden='true'
                                className='absolute top-5 right-5 h-5 w-5 border-t-2 border-r-2 border-amber-300/70'
                            />
                            <span
                                aria-hidden='true'
                                className='absolute bottom-5 left-5 h-5 w-5 border-b-2 border-l-2 border-amber-300/70'
                            />

                            {/* Reservation-card header — editorial label,
                                gold hairline, the form's own title. */}
                            <div className='mb-7 text-center'>
                                <p className='font-serif text-[11px] tracking-[0.4em] text-amber-200/80 uppercase'>
                                    Reservation Card
                                </p>
                                <div
                                    aria-hidden='true'
                                    className='mx-auto mt-3 mb-5 h-px w-12 bg-amber-200/40'
                                />
                                <h2 className='font-serif text-2xl leading-tight text-white sm:text-[28px]'>
                                    Your{' '}
                                    {procedure.title.replace(
                                        /\s*Miami\s*$/i,
                                        ''
                                    )}{' '}
                                    <span className='text-amber-200 italic'>
                                        plan
                                    </span>
                                </h2>
                                <p className='mt-2 font-serif text-sm text-stone-400 italic'>
                                    Texted to you in under 24 hours · No
                                    pressure
                                </p>
                            </div>

                            {procedure.urgencyNote && (
                                <p className='mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/5 px-3 py-1 text-[11px] font-medium tracking-wider text-amber-200 uppercase'>
                                    <Sparkles className='h-3 w-3 text-amber-300' />
                                    {procedure.urgencyNote}
                                </p>
                            )}

                            <ConsultationForm
                                title=''
                                subtitle=''
                                source={CONTACT_SOURCES.LANDING_PAGE}
                                analyticsFormName={`procedure_landing_${procedure.slug}_hero`}
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                defaultProcedure={procedureFormValue}
                                compact
                                showProcedureBadge={false}
                                submitText='Send My Free Quote'
                                footerNote={
                                    procedure.postSubmitPromise ??
                                    'Private · Encrypted · Never sold.'
                                }
                            />

                            {/* Trust ribbon — editorial credits with gold hairlines */}
                            <ul className='mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-amber-200/15 pt-5 text-[11px] text-stone-300'>
                                {rating && (
                                    <li className='inline-flex items-center gap-1.5'>
                                        <Star className='h-3 w-3 fill-amber-300 text-amber-300' />
                                        <span className='font-serif text-base leading-none tracking-tight text-white tabular-nums'>
                                            {rating}
                                        </span>
                                        <span className='tracking-[0.12em] text-stone-400 uppercase'>
                                            Google
                                        </span>
                                    </li>
                                )}
                                {patients && (
                                    <>
                                        <li
                                            aria-hidden='true'
                                            className='h-3 w-px bg-amber-200/20'
                                        />
                                        <li className='inline-flex items-center gap-1.5'>
                                            <BadgeCheck className='h-3 w-3 text-amber-300' />
                                            <span className='font-serif text-base leading-none text-white tabular-nums'>
                                                {patients}
                                            </span>
                                            <span className='tracking-[0.12em] text-stone-400 uppercase'>
                                                Patients
                                            </span>
                                        </li>
                                    </>
                                )}
                                <li
                                    aria-hidden='true'
                                    className='h-3 w-px bg-amber-200/20'
                                />
                                <li className='inline-flex items-center gap-1.5'>
                                    <ShieldCheck className='h-3 w-3 text-amber-300' />
                                    <span className='tracking-[0.12em] text-stone-300 uppercase'>
                                        Board-Certified
                                    </span>
                                </li>
                                <li
                                    aria-hidden='true'
                                    className='h-3 w-px bg-amber-200/20'
                                />
                                <li className='inline-flex items-center gap-1.5'>
                                    <Languages className='h-3 w-3 text-amber-300' />
                                    <span className='tracking-[0.12em] text-stone-300 uppercase'>
                                        Hablamos Español
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* BLOCK C — Hero photograph + supporting facts. Mobile renders
                    below the form; desktop sits beneath the editorial pitch. */}
                <div className='lg:col-span-7 lg:col-start-1 lg:row-start-2'>
                    {heroImage && (
                        <figure className='animate-fade-in-up animate-delay-200 group relative mx-auto max-w-xl'>
                            {/* Gold corner brackets framing the photograph */}
                            <span
                                aria-hidden='true'
                                className='absolute -top-2 -left-2 z-10 h-8 w-8 border-t-2 border-l-2 border-amber-300/70'
                            />
                            <span
                                aria-hidden='true'
                                className='absolute -right-2 -bottom-2 z-10 h-8 w-8 border-r-2 border-b-2 border-amber-300/70'
                            />

                            <div className='relative aspect-[4/5] w-full overflow-hidden rounded-sm sm:aspect-[16/11]'>
                                <Image
                                    src={heroImage}
                                    alt={`${procedure.title} — real patient experience`}
                                    fill
                                    sizes='(min-width: 1024px) 540px, (min-width: 640px) 70vw, 100vw'
                                    className='object-cover grayscale-[0.08] transition-transform duration-1000 group-hover:scale-[1.03]'
                                    priority
                                />
                                {/* Editorial caption bar */}
                                <div className='absolute right-0 bottom-0 left-0 flex items-end justify-between gap-3 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent px-4 py-3 sm:px-6 sm:py-4'>
                                    <figcaption className='font-serif text-[11px] tracking-[0.28em] text-amber-100/90 uppercase'>
                                        Real patient · Real surgeon
                                    </figcaption>
                                    <span
                                        aria-hidden='true'
                                        className='h-px flex-1 bg-amber-200/30'
                                    />
                                    <span className='font-serif text-[11px] tracking-[0.28em] text-stone-300 uppercase'>
                                        Miami, FL
                                    </span>
                                </div>
                            </div>
                        </figure>
                    )}

                    {/* Spec-sheet quick facts (recovery, anesthesia, results)
                        rendered as a compact editorial inset. */}
                    {procedure.quickStats && (
                        <dl className='mt-10 grid grid-cols-3 gap-x-6 border-t border-amber-200/15 pt-6 text-stone-300'>
                            {procedure.quickStats.recovery && (
                                <div>
                                    <dt className='font-sans text-[10px] tracking-[0.26em] text-amber-200/70 uppercase'>
                                        Recovery
                                    </dt>
                                    <dd className='mt-1 font-serif text-[15px] leading-tight text-stone-100'>
                                        {procedure.quickStats.recovery}
                                    </dd>
                                </div>
                            )}
                            {procedure.quickStats.anesthesia && (
                                <div className='border-l border-amber-200/15 pl-6'>
                                    <dt className='font-sans text-[10px] tracking-[0.26em] text-amber-200/70 uppercase'>
                                        Anesthesia
                                    </dt>
                                    <dd className='mt-1 font-serif text-[15px] leading-tight text-stone-100'>
                                        {procedure.quickStats.anesthesia}
                                    </dd>
                                </div>
                            )}
                            {procedure.quickStats.results && (
                                <div className='border-l border-amber-200/15 pl-6'>
                                    <dt className='font-sans text-[10px] tracking-[0.26em] text-amber-200/70 uppercase'>
                                        Results
                                    </dt>
                                    <dd className='mt-1 font-serif text-[15px] leading-tight text-stone-100'>
                                        {procedure.quickStats.results}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    )}
                </div>
            </div>

            {/* Bottom hairline — closes the chapter visually before the next section */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-amber-200/25 to-transparent'
            />
        </section>
    )
}
