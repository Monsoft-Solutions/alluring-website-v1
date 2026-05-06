/**
 * DrKarlinskyHero
 *
 * Lead-conversion hero for Dr. Victoria Karlinsky's landing page.
 *
 * Layout: portrait + authority on the left, ConsultationForm on the right.
 * Mobile stacks form-first (above the fold) with portrait moving below the
 * headline so the call-to-action stays one tap away.
 */
import {
    Award,
    BadgeCheck,
    Languages,
    MapPin,
    Quote,
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
                                Now booking consultations
                            </span>
                        </span>
                    </div>

                    {/* Headline */}
                    <h1
                        id='dr-karlinsky-hero-heading'
                        className='animate-fade-in-up animate-delay-100 mb-5 font-serif text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl xl:text-7xl'
                    >
                        Meet{' '}
                        <span className='text-gold-300 italic'>
                            {surgeon.name}
                        </span>
                        <span className='mt-2 block text-2xl font-light text-stone-300 sm:text-3xl lg:text-4xl'>
                            The Miami surgeon trusted with your most personal
                            transformation.
                        </span>
                    </h1>

                    {/* Subhead / promise */}
                    <p className='animate-fade-in-up animate-delay-150 mb-8 max-w-xl text-lg leading-relaxed text-stone-300 lg:text-xl'>
                        Triple board-certified. Fellowship-trained. Known for
                        results that look unmistakably <em>like you</em> — never
                        overdone. Book a complimentary consultation with Dr.{' '}
                        {firstName} and start a plan that actually fits your
                        body, your life, and your budget.
                    </p>

                    {/* Portrait + Quote (split inside the left column) */}
                    <div className='animate-fade-in-up animate-delay-200 mb-8 grid gap-6 sm:grid-cols-5'>
                        <div className='relative sm:col-span-2'>
                            <div className='ring-gold-500/20 group relative aspect-[3/4] w-full overflow-hidden rounded-2xl ring-1 sm:rounded-3xl'>
                                <Image
                                    src={surgeon.images.featured}
                                    alt={`${surgeon.name}, ${surgeon.title}`}
                                    fill
                                    sizes='(min-width: 1024px) 280px, (min-width: 640px) 38vw, 100vw'
                                    className='object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]'
                                    priority
                                />
                                <div className='absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent' />
                                <div className='absolute right-3 bottom-3 left-3'>
                                    <div className='border-gold-500/30 inline-flex items-center gap-1.5 rounded-full border bg-stone-950/70 px-2.5 py-1 backdrop-blur-md'>
                                        <BadgeCheck className='text-gold-400 h-3 w-3' />
                                        <span className='text-[10px] font-medium tracking-wide text-white uppercase'>
                                            Medical Director
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative gold corner */}
                            <div className='border-gold-500 absolute -top-2 -left-2 hidden h-10 w-10 rounded-tl-2xl border-t-2 border-l-2 sm:block' />
                            <div className='border-gold-500 absolute -right-2 -bottom-2 hidden h-10 w-10 rounded-br-2xl border-r-2 border-b-2 sm:block' />
                        </div>

                        {surgeon.quote && (
                            <figure className='relative flex flex-col justify-center sm:col-span-3'>
                                <Quote className='text-gold-500/50 mb-3 h-8 w-8' />
                                <blockquote className='font-serif text-xl leading-snug text-stone-100 italic md:text-2xl'>
                                    &ldquo;{surgeon.quote}&rdquo;
                                </blockquote>
                                <figcaption className='mt-4 flex items-center gap-3'>
                                    <span className='from-gold-500 to-gold-300 inline-block h-px w-10 bg-gradient-to-r' />
                                    <span className='text-gold-400 text-xs font-semibold tracking-[0.2em] uppercase'>
                                        — Dr. {firstName}
                                    </span>
                                </figcaption>
                            </figure>
                        )}
                    </div>

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

                {/* RIGHT — Sticky form */}
                <div className='animate-fade-in-up animate-delay-200 lg:col-span-5'>
                    <div className='lg:sticky lg:top-32'>
                        <div
                            id={HERO_FORM_ID}
                            className='ring-gold-500/10 relative rounded-2xl bg-white p-6 shadow-2xl ring-1 shadow-stone-950/40 sm:rounded-3xl md:p-8'
                        >
                            {/* Gold tag */}
                            <div className='from-gold-500 to-gold-400 absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 shadow-lg'>
                                <span className='text-[10px] font-bold tracking-[0.18em] text-stone-950 uppercase'>
                                    Free · No Obligation
                                </span>
                            </div>

                            <ConsultationForm
                                title={`Book With Dr. ${firstName}`}
                                subtitle='Complimentary consult • 24-hour response • 100% confidential'
                                source={CONTACT_SOURCES.DR_KARLINSKY_LANDING}
                                analyticsFormName='dr_karlinsky_hero_form'
                                enableAnalytics
                                redirectOnSuccess='/thank-you'
                                showPreferredContactTime
                            />
                        </div>

                        {/* Below-form micro-trust */}
                        <p className='mt-4 text-center text-xs text-stone-400'>
                            Your information is private. We&apos;ll never spam,
                            sell, or share your data.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
