'use client'

/**
 * Breast implant size calculator: band, cup today and the cup wanted in, an
 * estimated cc range per breast out (`implant-size.logic.ts`), with the
 * consultation one tap below the result.
 *
 * The choices are native radio buttons styled as chips, so the server-rendered
 * form is usable before hydration and reads correctly to a screen reader. The
 * result updates as soon as all three are picked; no submit step on a phone.
 *
 * `calculator_use` goes to GA4 once per distinct set of answers, after the
 * reader has paused on it, with bucketed values only (`calculatorEventParams`).
 *
 * The CTA is a plain link to the consultation thread with `data-consult-*`
 * attributes, which the thread reads to answer its first question
 * (`use-consult-flow.hook.ts`). Pass the thread's `#id` as `consultHref`.
 *
 * Reusable: nothing here knows about the blog. It renders on the light
 * (`stone-50`) band and brings its own dark result panel.
 *
 * @module components/calculators/implant-size/implant-size-calculator
 */
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { trackEvent } from '@/lib/analytics/analytics.client'

import {
    BAND_SIZES,
    type BandSize,
    CURRENT_CUPS,
    type CupSize,
    DESIRED_CUPS,
} from './implant-size.facts'
import {
    calculatorEventParams,
    cupIndex,
    estimateImplantSize,
} from './implant-size.logic'

/** How long the answers must stay put before `calculator_use` is sent. */
const TRACK_DELAY_MS = 1200

const KING_2017_URL = 'https://pubmed.ncbi.nlm.nih.gov/28445356/'

const CUP_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six'] as const

type ImplantSizeCalculatorProps = {
    /** The consultation thread's anchor, e.g. "#post-consult". */
    consultHref: string
    /** The thread's value for breast augmentation (`site-chat-copy.ts`). */
    consultProcedure?: string
    /** `data-consult-entry`: where the funnel says the lead came from. */
    consultEntry?: string
    /** The section's id, for `aria-labelledby` and in-page links. */
    id?: string
    className?: string
}

export function ImplantSizeCalculator({
    consultHref,
    consultProcedure = 'breast-augmentation',
    consultEntry = 'calculator',
    id = 'implant-size-calculator',
    className,
}: ImplantSizeCalculatorProps) {
    const [band, setBand] = useState<BandSize | null>(null)
    const [currentCup, setCurrentCup] = useState<CupSize | null>(null)
    const [desiredCup, setDesiredCup] = useState<CupSize | null>(null)

    const input =
        band && currentCup && desiredCup
            ? { band, currentCup, desiredCup }
            : null
    const estimate = input ? estimateImplantSize(input) : null

    // One event per distinct set of answers, once the reader stops changing them.
    const tracked = useRef(new Set<string>())
    const eventKey = input
        ? `${input.band}${input.currentCup}-${input.desiredCup}`
        : null
    useEffect(() => {
        if (!input || !estimate || !eventKey) return
        if (tracked.current.has(eventKey)) return
        const timer = window.setTimeout(() => {
            tracked.current.add(eventKey)
            trackEvent('calculator_use', calculatorEventParams(input, estimate))
        }, TRACK_DELAY_MS)
        return () => window.clearTimeout(timer)
        // eventKey stands for input and estimate, which are rebuilt each render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventKey])

    const chooseCurrent = (cup: CupSize) => {
        setCurrentCup(cup)
        // A wish that is no longer an increase is cleared, not kept invalid.
        if (desiredCup && cupIndex(desiredCup) <= cupIndex(cup)) {
            setDesiredCup(null)
        }
    }

    const titleId = `${id}-title`

    return (
        <section
            id={id}
            aria-labelledby={titleId}
            className={cn(
                'rounded-[1.5rem] border border-stone-200 bg-white/70 p-5 sm:p-7 md:p-8',
                className
            )}
        >
            <p className='text-gold-700 text-xs font-semibold tracking-[0.18em] uppercase'>
                Free sizing tool
            </p>
            <h2
                id={titleId}
                className='mt-3 font-serif text-[1.875rem] leading-[1.1] font-normal tracking-[-0.01em] text-balance text-stone-900 md:text-[2.25rem]'
            >
                Breast implant size <em className='italic'>calculator</em>
            </h2>
            <p className='mt-3 max-w-[34rem] text-[1rem] leading-[1.6] text-pretty text-stone-700 md:text-[1.0625rem]'>
                Pick your band, the cup you wear today and the cup you would
                like. You get an estimated implant volume, per breast, for that
                many cup sizes.
            </p>

            <div className='mt-6 grid gap-5'>
                <ChipGroup
                    legend='Band size'
                    hint='The number on your bra, e.g. the 34 in 34B'
                    columns='grid-cols-7'
                >
                    {BAND_SIZES.map((value) => (
                        <Chip
                            key={value}
                            name={`${id}-band`}
                            value={String(value)}
                            checked={band === value}
                            onChange={() => setBand(value)}
                        >
                            {value}
                        </Chip>
                    ))}
                </ChipGroup>

                <ChipGroup legend='Your cup today' columns='grid-cols-6'>
                    {CURRENT_CUPS.map((cup) => (
                        <Chip
                            key={cup}
                            name={`${id}-current`}
                            value={cup}
                            checked={currentCup === cup}
                            onChange={() => chooseCurrent(cup)}
                        >
                            {cup}
                        </Chip>
                    ))}
                </ChipGroup>

                <ChipGroup
                    legend='The cup you would like'
                    columns='grid-cols-6'
                >
                    {DESIRED_CUPS.map((cup) => (
                        <Chip
                            key={cup}
                            name={`${id}-desired`}
                            value={cup}
                            checked={desiredCup === cup}
                            disabled={
                                currentCup !== null &&
                                cupIndex(cup) <= cupIndex(currentCup)
                            }
                            onChange={() => setDesiredCup(cup)}
                        >
                            {cup}
                        </Chip>
                    ))}
                </ChipGroup>
            </div>

            <div
                aria-live='polite'
                className='mt-7 rounded-t-[7rem] rounded-b-[1.25rem] bg-stone-900 px-5 pt-12 pb-7 text-center text-stone-50 sm:px-8'
            >
                {estimate && input ? (
                    <>
                        <p className='text-gold-300 text-xs font-semibold tracking-[0.18em] uppercase'>
                            Estimated range, per breast
                        </p>
                        <p className='mt-3 font-serif text-[2.75rem] leading-none font-normal tracking-[-0.02em] tabular-nums md:text-[3.5rem]'>
                            {estimate.lowCc}–{estimate.highCc}
                            <span className='text-gold-300 ml-2 text-[1.5rem] italic md:text-[1.75rem]'>
                                cc
                            </span>
                        </p>
                        <p className='mx-auto mt-4 max-w-[28rem] text-[0.9375rem] leading-[1.55] text-stone-300'>
                            From a {input.band}
                            {input.currentCup} toward a {input.band}
                            {input.desiredCup}:{' '}
                            {CUP_WORDS[estimate.cupsAdded] ??
                                estimate.cupsAdded}{' '}
                            cup size{estimate.cupsAdded > 1 ? 's' : ''}.
                            {estimate.beyondStudy &&
                                ' That is more cup sizes than the research measured, so read this range as rough.'}
                        </p>
                    </>
                ) : (
                    <>
                        <p className='text-gold-300 text-xs font-semibold tracking-[0.18em] uppercase'>
                            Your estimate
                        </p>
                        <p
                            aria-hidden='true'
                            className='mt-3 font-serif text-[2.75rem] leading-none text-stone-500 md:text-[3.5rem]'
                        >
                            — cc
                        </p>
                        <p className='mx-auto mt-4 max-w-[26rem] text-[0.9375rem] leading-[1.55] text-stone-300'>
                            Your range appears here once you pick your band and
                            both cups.
                        </p>
                    </>
                )}

                <a
                    href={consultHref}
                    data-consult-procedure={consultProcedure}
                    data-consult-entry={consultEntry}
                    data-cta='calculator_consult'
                    className='bg-gold-300 hover:bg-gold-200 mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[0.9375rem] font-semibold whitespace-nowrap text-stone-950 transition-colors'
                >
                    Start my free sizing consult{' '}
                    <span aria-hidden='true'>→</span>
                </a>
            </div>

            <div className='mt-5 grid gap-3 text-[0.875rem] leading-[1.6] text-stone-600'>
                <p>
                    <strong className='font-semibold text-stone-800'>
                        This is an estimate, not a recommendation.
                    </strong>{' '}
                    Cup letters are not the same from brand to brand, and the
                    same volume looks different on different chests. The final
                    size is chosen with your surgeon at your consultation, from
                    your chest width, your own tissue and skin, and the look you
                    want.
                </p>
                <p>
                    How it works: in a{' '}
                    <a
                        href={KING_2017_URL}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='decoration-gold-500 text-stone-800 underline underline-offset-[0.25em] hover:decoration-current'
                    >
                        2017 study in{' '}
                        <em>Plastic and Reconstructive Surgery</em>
                    </a>
                    , one cup size took about 130 cc on narrower bands and 150
                    cc on wider ones. The range is that figure times the cup
                    sizes you add, give or take 15 cc per cup.
                </p>
            </div>
        </section>
    )
}

function ChipGroup({
    legend,
    hint,
    columns,
    children,
}: {
    legend: string
    hint?: string
    columns: string
    children: ReactNode
}) {
    const hintId = useId()
    return (
        <fieldset aria-describedby={hint ? hintId : undefined}>
            <legend className='text-[0.9375rem] font-semibold text-stone-900'>
                {legend}
            </legend>
            {hint && (
                <p
                    id={hintId}
                    className='mt-0.5 text-[0.8125rem] text-stone-600'
                >
                    {hint}
                </p>
            )}
            <div className={cn('mt-2.5 grid gap-1.5', columns)}>{children}</div>
        </fieldset>
    )
}

function Chip({
    name,
    value,
    checked,
    disabled,
    onChange,
    children,
}: {
    name: string
    value: string
    checked: boolean
    disabled?: boolean
    onChange: () => void
    children: ReactNode
}) {
    return (
        <label className='relative block'>
            <input
                type='radio'
                name={name}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                className='peer sr-only'
            />
            <span
                className={cn(
                    'flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-stone-300 bg-stone-50 px-1 text-[0.9375rem] font-semibold text-stone-800 tabular-nums transition-colors select-none',
                    'hover:border-stone-500',
                    'peer-checked:border-stone-900 peer-checked:bg-stone-900 peer-checked:text-stone-50',
                    'peer-focus-visible:outline-gold-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
                    'peer-disabled:cursor-not-allowed peer-disabled:border-stone-200 peer-disabled:bg-transparent peer-disabled:text-stone-400'
                )}
            >
                {children}
            </span>
        </label>
    )
}
