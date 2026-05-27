/**
 * ProcedureLandingHero
 *
 * Conversion-first hero for procedure-specific ad landing pages.
 *
 * Layout: procedure pitch on the left (eyebrow → headline → promise →
 * stat chips → reassurance pills + image collage), compact lead form on
 * the right (sticky on desktop). Mobile stacks form-first so the call
 * to action is the first interaction available.
 *
 * The procedure title, hero image, and quickStats are pulled from the
 * Procedure data record so every variant is tailored without forking
 * the layout.
 */
import {
    BadgeCheck,
    CalendarCheck,
    Clock,
    Languages,
    MapPin,
    ShieldCheck,
    Sparkles,
    Stethoscope,
} from 'lucide-react'
import Image from 'next/image'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import {
    CONTACT_SOURCES,
    getProcedureFormValue,
} from '@/lib/types/forms/contact-form.type'
import type { Procedure } from '@/lib/types/procedure.type'

const HERO_FORM_ID = 'hero-form'

const TRUST_PILLS = [
    { icon: BadgeCheck, label: 'Board-Certified Surgeons' },
    { icon: ShieldCheck, label: 'Accredited Surgical Suite' },
    { icon: CalendarCheck, label: '24-hr Response' },
    { icon: Languages, label: 'Hablamos Español' },
] as const

export type ProcedureLandingHeroProps = {
    readonly id?: string
    readonly procedure: Procedure
}

/**
 * Splits the procedure title into a "leading" and "accent" half so the
 * accent half can be rendered in italicized gold without forcing copy
 * teams to author HTML inside the data file.
 *
 * "Breast Augmentation Miami" → leading="Breast Augmentation", accent="Miami"
 * "Mommy Makeover Miami"     → leading="Mommy Makeover", accent="Miami"
 * "Liposuction Miami"        → leading="Liposuction", accent="Miami"
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
    const { leading, accent } = splitTitle(procedure.title)
    const heroImage =
        procedure.contentImages?.find((img) => img.section === 'hero')?.src ??
        procedure.image

    const procedureFormValue = getProcedureFormValue(procedure.slug)

    const statChips = [
        procedure.quickStats?.recovery
            ? {
                  icon: Clock,
                  label: 'Recovery',
                  value: procedure.quickStats.recovery,
              }
            : null,
        procedure.quickStats?.anesthesia
            ? {
                  icon: Stethoscope,
                  label: 'Anesthesia',
                  value: procedure.quickStats.anesthesia,
              }
            : null,
        procedure.quickStats?.results
            ? {
                  icon: Sparkles,
                  label: 'Results',
                  value: procedure.quickStats.results,
              }
            : null,
    ].filter((chip): chip is NonNullable<typeof chip> => chip !== null)

    return (
        <section
            id={id}
            aria-labelledby='procedure-landing-hero-heading'
            className='relative w-full overflow-hidden bg-stone-950 pt-10 pb-16 sm:pt-14 lg:min-h-[calc(100vh-72px)] lg:pt-20 lg:pb-24'
        >
            {/* Ambient gradient + gold orbs */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.18),_transparent_60%)]' />
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(212,175,55,0.08),_transparent_55%)]' />
                <div className='bg-gold-500/10 absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full blur-3xl' />
                <div className='bg-gold-400/5 absolute right-0 bottom-0 h-[420px] w-[420px] translate-x-1/3 rounded-full blur-3xl' />
                <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] bg-[size:48px_48px]' />
            </div>

            <div className='relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 md:px-10 lg:grid-cols-12 lg:gap-12'>
                {/* LEFT — Procedure pitch */}
                <div className='animate-fade-in-up lg:col-span-7'>
                    <div className='mb-6 inline-flex flex-wrap items-center gap-3'>
                        <span className='border-gold-500/30 bg-gold-500/10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                            <MapPin className='text-gold-400 h-3.5 w-3.5' />
                            <span className='text-gold-300 text-xs font-medium tracking-wide uppercase'>
                                Miami, FL
                            </span>
                        </span>
                        <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm'>
                            <span className='bg-gold-400 h-1.5 w-1.5 animate-pulse rounded-full' />
                            <span className='text-xs font-medium tracking-wide text-stone-300 uppercase'>
                                Booking this month
                            </span>
                        </span>
                    </div>

                    <h1
                        id='procedure-landing-hero-heading'
                        className='animate-fade-in-up animate-delay-100 mb-5 font-serif text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-7xl'
                    >
                        {leading}{' '}
                        {accent && (
                            <span className='text-gold-300 italic'>
                                {accent}
                            </span>
                        )}
                        <span className='mt-3 block font-sans text-base font-light tracking-wide text-stone-400 uppercase sm:text-lg'>
                            Luxury results · honest pricing
                        </span>
                    </h1>

                    <p className='animate-fade-in-up animate-delay-150 mb-8 max-w-xl text-lg leading-relaxed text-stone-300 lg:text-xl'>
                        {procedure.heroSubtitle ?? procedure.shortDescription}
                    </p>

                    {/* Hero image collage */}
                    {heroImage && (
                        <div className='animate-fade-in-up animate-delay-200 mb-8 max-w-md'>
                            <div className='ring-gold-500/20 group relative aspect-[16/10] w-full overflow-hidden rounded-2xl ring-1 sm:rounded-3xl'>
                                <Image
                                    src={heroImage}
                                    alt={`${procedure.title} — real patient experience`}
                                    fill
                                    sizes='(min-width: 1024px) 440px, (min-width: 640px) 60vw, 100vw'
                                    className='object-cover transition-transform duration-700 group-hover:scale-[1.04]'
                                    priority
                                />
                                <div className='absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent' />
                                <div className='absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2'>
                                    <div className='border-gold-500/30 inline-flex items-center gap-1.5 rounded-full border bg-stone-950/70 px-2.5 py-1 backdrop-blur-md'>
                                        <BadgeCheck className='text-gold-400 h-3 w-3' />
                                        <span className='text-[10px] font-medium tracking-wide text-white uppercase'>
                                            Real results · Real patients
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stat chips — pulled from quickStats */}
                    {statChips.length > 0 && (
                        <ul className='animate-fade-in-up animate-delay-250 mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
                            {statChips.map((chip) => (
                                <li
                                    key={chip.label}
                                    className='border-gold-500/15 from-gold-500/5 group hover:border-gold-400/30 flex items-center gap-3 rounded-xl border bg-gradient-to-br to-transparent p-3 backdrop-blur-sm transition-colors'
                                >
                                    <span className='border-gold-500/30 bg-gold-500/15 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border'>
                                        <chip.icon className='text-gold-300 h-4 w-4' />
                                    </span>
                                    <div className='min-w-0'>
                                        <p className='text-[10px] font-bold tracking-[0.16em] text-stone-400 uppercase'>
                                            {chip.label}
                                        </p>
                                        <p className='truncate text-sm font-medium text-white'>
                                            {chip.value}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Trust pills */}
                    <ul className='animate-fade-in-up animate-delay-300 flex flex-wrap gap-2.5'>
                        {TRUST_PILLS.map((pill) => (
                            <li
                                key={pill.label}
                                className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10'
                            >
                                <pill.icon className='text-gold-400 h-3.5 w-3.5' />
                                <span className='text-xs font-medium text-stone-200'>
                                    {pill.label}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* RIGHT — Sticky compact lead form */}
                <div className='animate-fade-in-up animate-delay-200 lg:col-span-5'>
                    <div className='lg:sticky lg:top-32'>
                        <div
                            id={HERO_FORM_ID}
                            className='ring-gold-500/20 relative rounded-2xl border border-white/10 bg-stone-900/80 p-6 shadow-2xl ring-1 shadow-stone-950/60 backdrop-blur-xl sm:rounded-3xl md:p-8'
                        >
                            <div className='from-gold-500 to-gold-400 absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 shadow-lg'>
                                <span className='text-[10px] font-bold tracking-[0.18em] text-stone-950 uppercase'>
                                    Free quote · 24-hr response
                                </span>
                            </div>

                            <ConsultationForm
                                title={`Get your ${procedure.title.replace(/\s*Miami\s*$/i, '')} plan`}
                                subtitle="We'll text you within 24 hours."
                                source={CONTACT_SOURCES.LANDING_PAGE}
                                analyticsFormName={`procedure_landing_${procedure.slug}_hero`}
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                defaultProcedure={procedureFormValue}
                                compact
                                submitText='Send My Free Quote'
                                footerNote="We'll never spam, sell, or share your data."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
