/**
 * DrKarlinskyHero
 *
 * Lead-conversion hero for warm Instagram-bio-link traffic. The visitor
 * already follows Dr. Karlinsky on IG — we don't introduce her, we
 * acknowledge her work and pivot to "let's plan yours."
 *
 * Layout: portrait + authority on the left, compact ConsultationForm on
 * the right (3 fields + consent). Mobile stacks form-first so the call
 * to action stays one tap away.
 */
import {
    Award,
    BadgeCheck,
    ExternalLink,
    Languages,
    MapPin,
    ShieldCheck,
} from 'lucide-react'
import Image from 'next/image'

import { ConsultationForm } from '@/components/shared/forms/consultation-form.component'
import { surgeons } from '@/lib/data/surgeons/surgeons-data'
import { CONTACT_SOURCES } from '@/lib/types/forms/contact-form.type'

const HERO_FORM_ID = 'hero-form'

const TRUST_PILLS = [
    { icon: BadgeCheck, label: 'Triple Board-Certified' },
    { icon: ShieldCheck, label: 'FACS Fellow' },
    { icon: Award, label: 'Fellowship Director' },
    { icon: Languages, label: 'Hablamos Español' },
] as const

export type DrKarlinskyHeroProps = {
    readonly id?: string
}

export function DrKarlinskyHero({ id = 'hero' }: DrKarlinskyHeroProps) {
    const surgeon = surgeons[0]
    if (!surgeon) {
        return null
    }

    const firstName = surgeon.name.replace(/^Dr\.\s+/, '').split(' ')[0]
    const healthgradesUrl = surgeon.externalProfiles?.healthgrades
    const realselfUrl = surgeon.externalProfiles?.realself

    return (
        <section
            id={id}
            aria-labelledby='dr-karlinsky-hero-heading'
            className='relative w-full overflow-hidden bg-stone-950 pt-10 pb-16 sm:pt-14 lg:min-h-[calc(100vh-72px)] lg:pt-20 lg:pb-24'
        >
            {/* Ambient gradient + gold orbs */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.18),_transparent_60%)]' />
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(212,175,55,0.08),_transparent_55%)]' />
                <div className='bg-gold-500/10 absolute -top-1/4 -left-1/4 h-[600px] w-[600px] rounded-full blur-3xl' />
                <div className='bg-gold-400/5 absolute right-0 bottom-0 h-[420px] w-[420px] translate-x-1/3 rounded-full blur-3xl' />
                {/* Hairline grid for tactile depth */}
                <div className='absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] bg-[size:48px_48px]' />
            </div>

            <div className='relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-6 md:px-10 lg:grid-cols-12 lg:gap-12'>
                {/* LEFT — Authority + portrait */}
                <div className='animate-fade-in-up lg:col-span-7'>
                    {/* Locale + practice line */}
                    <div className='mb-6 inline-flex flex-wrap items-center gap-3'>
                        <span className='border-gold-500/30 bg-gold-500/10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
                            <MapPin className='text-gold-400 h-3.5 w-3.5' />
                            <span className='text-gold-300 text-xs font-medium tracking-wide uppercase'>
                                Miami, FL
                            </span>
                        </span>
                        <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-sm'>
                            <span className='bg-gold-400 h-1.5 w-1.5 rounded-full' />
                            <span className='text-xs font-medium tracking-wide text-stone-300 uppercase'>
                                Booking this month
                            </span>
                        </span>
                    </div>

                    {/* Headline — IG-warm voice */}
                    <h1
                        id='dr-karlinsky-hero-heading'
                        className='animate-fade-in-up animate-delay-100 mb-5 font-serif text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-7xl'
                    >
                        You followed{' '}
                        <span className='text-gold-300 italic'>her work.</span>
                        <span className='mt-2 block text-3xl font-light text-stone-200 sm:text-4xl lg:text-5xl'>
                            Now let&apos;s plan yours.
                        </span>
                    </h1>

                    {/* Subhead / promise — tight, benefit-led */}
                    <p className='animate-fade-in-up animate-delay-150 mb-8 max-w-xl text-lg leading-relaxed text-stone-300 lg:text-xl'>
                        Triple board-certified Miami surgeon. Booking
                        complimentary consults this month — virtual or
                        in-person. Honest plan. No pressure.
                    </p>

                    {/* Portrait — slimmer footprint, mobile-friendly */}
                    <div className='animate-fade-in-up animate-delay-200 mb-8 max-w-sm'>
                        <div className='ring-gold-500/20 group relative aspect-[4/5] w-full overflow-hidden rounded-2xl ring-1 sm:rounded-3xl'>
                            <Image
                                src={surgeon.images.featured}
                                alt={`${surgeon.name}, ${surgeon.title}`}
                                fill
                                sizes='(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw'
                                className='object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]'
                                priority
                            />
                            <div className='absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent' />
                            <div className='absolute right-3 bottom-3 left-3 flex items-end justify-between gap-2'>
                                <div className='border-gold-500/30 inline-flex items-center gap-1.5 rounded-full border bg-stone-950/70 px-2.5 py-1 backdrop-blur-md'>
                                    <BadgeCheck className='text-gold-400 h-3 w-3' />
                                    <span className='text-[10px] font-medium tracking-wide text-white uppercase'>
                                        Dr. {firstName} · Medical Director
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust pills */}
                    <ul className='animate-fade-in-up animate-delay-300 mb-4 flex flex-wrap gap-2.5'>
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

                    {/* Verification microlinks (replaces full credentials wall) */}
                    {(healthgradesUrl || realselfUrl) && (
                        <p className='animate-fade-in-up animate-delay-300 text-xs text-stone-400'>
                            Verified on{' '}
                            {healthgradesUrl && (
                                <a
                                    href={healthgradesUrl}
                                    target='_blank'
                                    rel='noopener noreferrer nofollow'
                                    className='text-gold-300 hover:text-gold-200 inline-flex items-center gap-0.5 underline underline-offset-2'
                                >
                                    Healthgrades
                                    <ExternalLink className='h-3 w-3' />
                                </a>
                            )}
                            {healthgradesUrl && realselfUrl && (
                                <span className='text-stone-500'> · </span>
                            )}
                            {realselfUrl && (
                                <a
                                    href={realselfUrl}
                                    target='_blank'
                                    rel='noopener noreferrer nofollow'
                                    className='text-gold-300 hover:text-gold-200 inline-flex items-center gap-0.5 underline underline-offset-2'
                                >
                                    RealSelf
                                    <ExternalLink className='h-3 w-3' />
                                </a>
                            )}
                        </p>
                    )}
                </div>

                {/* RIGHT — Sticky compact form */}
                <div className='animate-fade-in-up animate-delay-200 lg:col-span-5'>
                    <div className='lg:sticky lg:top-32'>
                        <div
                            id={HERO_FORM_ID}
                            className='ring-gold-500/20 relative rounded-2xl border border-white/10 bg-stone-900/80 p-6 shadow-2xl ring-1 shadow-stone-950/60 backdrop-blur-xl sm:rounded-3xl md:p-8'
                        >
                            {/* Gold tag */}
                            <div className='from-gold-500 to-gold-400 absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 shadow-lg'>
                                <span className='text-[10px] font-bold tracking-[0.18em] text-stone-950 uppercase'>
                                    Free · 24-hr response
                                </span>
                            </div>

                            <ConsultationForm
                                title='Tell us a little about you'
                                subtitle="We'll text you within 24 hours."
                                source={CONTACT_SOURCES.DR_KARLINSKY_LANDING}
                                analyticsFormName='dr_karlinsky_hero_form'
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                compact
                                submitText='Book My Consult'
                                footerNote="We'll never spam, sell, or share your data."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
