import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'

import {
    HOME_CHAT_ID,
    HOME_SECTION_IDS,
    homeContainer,
    homeHeading,
    homePrimaryButton,
} from './home-page.constant'

/**
 * The trip, as the practice runs it. Four in five of the home page's leads
 * have an out-of-state phone number, and home visitors from outside Florida
 * converted at 4.0% against Florida's 1.7% (180 days to 2026-09-23), so this
 * sits in the middle of the page, not at its foot.
 *
 * Clinical only (CLAUDE.md): the practice confirms dates and says how many
 * nights to stay. It does not book flights, lodging, transport or recovery
 * houses, and the section says so plainly. No competitor states the nights.
 */
const STEPS = [
    {
        title: 'Video consultation from home',
        body: 'Meet by video from anywhere in the U.S., ask everything, and get your price in writing before you plan a trip.',
    },
    {
        title: 'Your dates, in writing',
        body: 'Surgery, pre-op and follow-up dates confirmed in writing, so you book travel around a real schedule.',
    },
    {
        title: 'Pre-op in Miami',
        body: 'You’re seen in person before surgery. For a BBL, Florida law requires the surgeon to examine you no later than the day before.',
    },
    {
        title: 'Surgery day',
        body: 'Lipo 360 and BBL are same-day procedures: you go home, or back to where you’re staying, the same day.',
    },
    {
        title: 'Follow-up, then home',
        body: `For a BBL, plan on ${bblFigure('stay-in-miami-7-10-days')} in Miami so you can be seen at follow-up and cleared before you fly. We tell you the number for your procedure before you buy a ticket.`,
    },
] as const

/** An example of the written schedule, clearly labelled as one. */
const EXAMPLE_SCHEDULE = [
    { label: 'Video consultation', when: 'From home' },
    { label: 'Pre-op visit', when: 'Day before surgery' },
    { label: 'Surgery', when: 'Day 0' },
    { label: 'Follow-up', when: 'Before you fly' },
    { label: 'Cleared to fly home', when: 'By your surgeon' },
] as const

export function HomeFlyIn() {
    return (
        <section
            id={HOME_SECTION_IDS.flyIn}
            aria-labelledby='fly-in-title'
            className='hp-scene hp-defer relative overflow-hidden bg-stone-950 py-16 text-stone-100 md:py-28'
        >
            <div
                aria-hidden='true'
                className='pointer-events-none absolute -top-48 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(212,175,55,0.14),transparent)]'
            />
            <div
                className={cn(
                    homeContainer,
                    'relative grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20'
                )}
            >
                <div>
                    <p className='text-gold-300 text-[0.75rem] font-bold tracking-[0.2em] uppercase'>
                        Coming from another state
                    </p>
                    <h2
                        id='fly-in-title'
                        className={cn(homeHeading, 'mt-4 text-stone-50')}
                    >
                        Fly in. Heal.{' '}
                        <em className='text-gold-300 italic'>Fly home.</em>
                    </h2>
                    <p className='mt-5 max-w-[34rem] text-lg leading-relaxed text-stone-300'>
                        Most people who write to us don’t live in Florida.
                        Here’s how it works when you fly in, from the first
                        video call to the day you’re cleared to fly home.
                    </p>

                    <ol className='mt-10 grid gap-6'>
                        {STEPS.map((step, index) => (
                            <li key={step.title} className='hp-step flex gap-5'>
                                <span
                                    className='hp-step-marker border-gold-400/70 text-gold-300 grid size-10 shrink-0 place-items-center rounded-full border font-serif text-lg'
                                    aria-hidden='true'
                                >
                                    {index + 1}
                                </span>
                                <span className='pt-1.5'>
                                    <strong className='block text-lg text-stone-50'>
                                        {step.title}
                                    </strong>
                                    <span className='mt-1 block leading-relaxed text-stone-400'>
                                        {step.body}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>

                <aside
                    aria-label='Example of a written schedule'
                    className='lg:sticky lg:top-32 lg:self-start'
                >
                    <div className='rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl md:p-8'>
                        <div className='flex items-center justify-between'>
                            <p className='text-sm font-bold text-stone-50'>
                                Your schedule
                            </p>
                            <span className='rounded-full border border-white/15 px-2.5 py-1 text-[0.6875rem] tracking-[0.14em] text-stone-400 uppercase'>
                                Example
                            </span>
                        </div>
                        <ol className='mt-6 grid gap-3'>
                            {EXAMPLE_SCHEDULE.map((row) => (
                                <li
                                    key={row.label}
                                    className='flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3.5'
                                >
                                    <span className='font-bold text-stone-100'>
                                        {row.label}
                                    </span>
                                    <span className='text-gold-300 text-sm'>
                                        {row.when}
                                    </span>
                                </li>
                            ))}
                        </ol>
                        <p className='mt-6 text-sm leading-relaxed text-stone-400'>
                            Yours comes in writing, with real dates, after your
                            consultation. We don’t book flights, hotels,
                            transport or recovery houses; you arrange your stay,
                            and we give you the medical plan you can’t plan
                            without.
                        </p>
                        <div className='mt-6 flex flex-wrap items-center gap-x-5 gap-y-3'>
                            <a
                                href={`#${HOME_CHAT_ID}`}
                                data-cta='home_fly_in_consult'
                                className={homePrimaryButton}
                            >
                                Start with a video consult
                            </a>
                            <Link
                                href='/fly-in-consultation'
                                className='decoration-gold-400 text-sm font-bold text-stone-100 underline underline-offset-4'
                            >
                                How fly-in surgery works
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    )
}
