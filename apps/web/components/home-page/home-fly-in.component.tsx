import Link from 'next/link'
import { cn } from '@workspace/ui/lib/utils'

import { bblFigure } from '@/lib/data/procedures/facts/bbl.facts'

import { HomeEyebrow } from './home-eyebrow.component'
import {
    HOME_CHAT_ID,
    HOME_SECTION_IDS,
    HOME_SECTION_INDEX,
    homeContainer,
    homeHeading,
    homeLead,
    homeLink,
    homePrimaryButtonOnDark,
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
            className='hp-dark hp-grain hp-scene hp-defer relative overflow-hidden py-16 md:py-28'
        >
            <div
                aria-hidden='true'
                className='pointer-events-none absolute -top-56 left-1/2 size-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(230,203,159,0.13),transparent)]'
            />
            <div
                className={cn(
                    homeContainer,
                    'relative grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20'
                )}
            >
                <div>
                    <HomeEyebrow index={HOME_SECTION_INDEX.flyIn}>
                        Coming from another state
                    </HomeEyebrow>
                    <h2 id='fly-in-title' className={cn(homeHeading, 'mt-5')}>
                        Fly in. Heal. <em>Fly home.</em>
                    </h2>
                    <p
                        className={cn(
                            homeLead,
                            'mt-6 max-w-[34rem] text-[var(--hp-fg-2)]'
                        )}
                    >
                        Most people who write to us don’t live in Florida.
                        Here’s how it works when you fly in, from the first
                        video call to the day you’re cleared to fly home.
                    </p>

                    <ol className='mt-12 grid gap-7'>
                        {STEPS.map((step, index) => (
                            <li key={step.title} className='hp-step flex gap-5'>
                                <span
                                    className='hp-step-marker hp-display grid size-12 shrink-0 place-items-center rounded-full border border-[rgba(230,203,159,0.55)] text-lg text-[var(--hp-champagne)] italic'
                                    aria-hidden='true'
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className='pt-2.5'>
                                    <strong className='block text-lg font-semibold text-[var(--hp-fg)]'>
                                        {step.title}
                                    </strong>
                                    <span className='mt-1.5 block leading-relaxed text-[var(--hp-fg-3)]'>
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
                    <div className='rounded-[0.875rem] border border-[var(--hp-rule)] bg-white/[0.035] p-6 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-8'>
                        <div className='flex items-center justify-between'>
                            <p className='hp-display hp-display--small text-[1.625rem] text-[var(--hp-fg)]'>
                                Your <em>schedule</em>
                            </p>
                            <span className='rounded-full border border-[var(--hp-rule)] px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.16em] text-[var(--hp-fg-3)] uppercase'>
                                Example
                            </span>
                        </div>
                        <ol className='mt-6 border-t border-[var(--hp-rule)]'>
                            {EXAMPLE_SCHEDULE.map((row) => (
                                <li
                                    key={row.label}
                                    className='flex items-baseline justify-between gap-4 border-b border-[var(--hp-rule)] py-3.5'
                                >
                                    <span className='font-semibold text-[var(--hp-fg)]'>
                                        {row.label}
                                    </span>
                                    <span className='text-right text-sm text-[var(--hp-champagne)]'>
                                        {row.when}
                                    </span>
                                </li>
                            ))}
                        </ol>
                        <p className='mt-6 text-sm leading-relaxed text-[var(--hp-fg-3)]'>
                            Yours comes in writing, with real dates, after your
                            consultation. We don’t book flights, hotels,
                            transport or recovery houses; you arrange your stay,
                            and we give you the medical plan you can’t plan
                            without.
                        </p>
                        <div className='mt-7 flex flex-wrap items-center gap-x-5 gap-y-4'>
                            <a
                                href={`#${HOME_CHAT_ID}`}
                                data-cta='home_fly_in_consult'
                                className={homePrimaryButtonOnDark}
                            >
                                Start with a video consult
                            </a>
                            <Link
                                href='/fly-in-consultation'
                                className={cn(homeLink, 'text-sm')}
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
