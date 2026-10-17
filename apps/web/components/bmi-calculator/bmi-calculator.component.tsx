'use client'

/**
 * The BMI calculator (#346): height and weight in, the BMI out, then where
 * that BMI stands against the recommended range for each procedure, with
 * that procedure's page and the consultation one tap away.
 *
 * The page's only client component. It server-renders complete: the form,
 * the empty reading and every procedure row with its range are in the HTML,
 * and the rows fill in as the reader types (no submit step on a phone).
 * Everything that varies with the input is marked `data-copy-check="data"`.
 *
 * Analytics:
 * - `calculator_use` once per distinct BMI band and unit, after the reader
 *   pauses (`calculatorEventParams`: the band only, never the measurements);
 * - `bmi_unit_toggle` when the unit system changes, as before;
 * - `cta_click` through the site's delegated tracker (`data-cta`), with
 *   `cta_location: calculator` from `data-cta-location` on the card.
 *
 * Procedure links answer the consultation thread's first question on the
 * way (`data-consult-procedure`), as the home page's chips do.
 *
 * @module components/bmi-calculator/bmi-calculator
 */
import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'

import { trackEvent } from '@/lib/analytics/analytics.client'

import {
    type CalculatorInput,
    type CalculatorProcedure,
    type Measurements,
    type ProcedureStanding,
    type UnitSystem,
    bmiCategory,
    bmiOf,
    calculatorEventParams,
    formatWeight,
    nameInSentence,
    procedureStanding,
    scalePosition,
    targetBmi,
    toMeasurements,
    weeksAtCdcPace,
} from './bmi.logic'

/** How long the reading must stay put before `calculator_use` is sent. */
const TRACK_DELAY_MS = 1200

const SCALE_TICKS = [18.5, 25, 30, 35, 40] as const

type BmiCalculatorProps = {
    procedures: readonly CalculatorProcedure[]
    /** The consultation thread's anchor, e.g. "#consult". */
    consultHref: `#${string}`
    /** The "getting to your range" section's anchor. */
    gettingThereHref: `#${string}`
}

export function BmiCalculator({
    procedures,
    consultHref,
    gettingThereHref,
}: BmiCalculatorProps) {
    const [unit, setUnit] = useState<UnitSystem>('imperial')
    const [feet, setFeet] = useState('')
    const [inches, setInches] = useState('')
    const [pounds, setPounds] = useState('')
    const [centimeters, setCentimeters] = useState('')
    const [kilograms, setKilograms] = useState('')

    const input: CalculatorInput =
        unit === 'imperial'
            ? { unit, feet, inches, pounds }
            : { unit, centimeters, kilograms }
    const measurements = toMeasurements(input)
    const bmi = measurements ? bmiOf(measurements) : null
    const category = bmi === null ? null : bmiCategory(bmi)

    // One event per distinct reading, once the reader stops typing.
    const tracked = useRef(new Set<string>())
    const eventParams = measurements
        ? calculatorEventParams(measurements, unit, procedures)
        : null
    const eventKey = eventParams
        ? `${eventParams.unit_system}:${eventParams.bmi_band}:${eventParams.procedures_in_range}`
        : null
    useEffect(() => {
        if (!eventParams || !eventKey || tracked.current.has(eventKey)) return
        const timer = window.setTimeout(() => {
            tracked.current.add(eventKey)
            trackEvent('calculator_use', eventParams)
        }, TRACK_DELAY_MS)
        return () => window.clearTimeout(timer)
        // eventKey stands for eventParams, which is rebuilt each render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventKey])

    const chooseUnit = (next: UnitSystem) => {
        if (next === unit) return
        trackEvent('bmi_unit_toggle', { from_unit: unit, to_unit: next })
        // Carry the reading across, so switching units never empties it.
        if (measurements) {
            if (next === 'metric') {
                setCentimeters(
                    String(Math.round(measurements.heightCm * 10) / 10)
                )
                setKilograms(
                    String(Math.round(measurements.weightKg * 10) / 10)
                )
            } else {
                const totalInches = Math.round(measurements.heightCm / 2.54)
                setFeet(String(Math.floor(totalInches / 12)))
                setInches(String(totalInches % 12))
                setPounds(
                    String(Math.round(measurements.weightKg / 0.45359237))
                )
            }
        }
        setUnit(next)
    }

    const ids = useId()

    return (
        <div
            data-cta-location='calculator'
            className='overflow-hidden rounded-[1.75rem] bg-stone-50 text-stone-900 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.55)]'
        >
            <form
                aria-label='BMI calculator'
                onSubmit={(event) => event.preventDefault()}
                className='px-5 pt-6 pb-5 sm:px-7 sm:pt-7'
            >
                <div className='flex flex-wrap items-center justify-between gap-3'>
                    <p className='text-[0.75rem] font-semibold tracking-[0.18em] text-stone-600 uppercase'>
                        Your height and weight
                    </p>
                    <div
                        role='group'
                        aria-label='Units'
                        className='inline-flex rounded-full border border-stone-300 bg-white p-1'
                    >
                        {(
                            [
                                ['imperial', 'ft · lbs'],
                                ['metric', 'cm · kg'],
                            ] as const
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                type='button'
                                aria-pressed={unit === value}
                                onClick={() => chooseUnit(value)}
                                className={cn(
                                    'min-h-9 rounded-full px-3.5 text-[0.875rem] font-semibold transition-colors',
                                    unit === value
                                        ? 'bg-stone-900 text-stone-50'
                                        : 'text-stone-600 hover:text-stone-900'
                                )}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]'>
                    {unit === 'imperial' ? (
                        <>
                            <Field
                                id={`${ids}-ft`}
                                label='Feet'
                                suffix='ft'
                                value={feet}
                                onChange={setFeet}
                                placeholder='5'
                                inputMode='numeric'
                            />
                            <Field
                                id={`${ids}-in`}
                                label='Inches'
                                suffix='in'
                                value={inches}
                                onChange={setInches}
                                placeholder='4'
                                inputMode='numeric'
                            />
                            <Field
                                id={`${ids}-lb`}
                                label='Weight'
                                suffix='lbs'
                                value={pounds}
                                onChange={setPounds}
                                placeholder='150'
                                inputMode='decimal'
                                className='col-span-2 sm:col-span-1'
                            />
                        </>
                    ) : (
                        <>
                            <Field
                                id={`${ids}-cm`}
                                label='Height'
                                suffix='cm'
                                value={centimeters}
                                onChange={setCentimeters}
                                placeholder='163'
                                inputMode='decimal'
                            />
                            <Field
                                id={`${ids}-kg`}
                                label='Weight'
                                suffix='kg'
                                value={kilograms}
                                onChange={setKilograms}
                                placeholder='68'
                                inputMode='decimal'
                                className='sm:col-span-2'
                            />
                        </>
                    )}
                </div>
            </form>

            {/* The reading, in the page's arch. */}
            <div
                data-copy-check='data'
                className='bmi-dark bmi-grain mx-3 rounded-t-[999px] rounded-b-[1.25rem] bg-stone-900 px-5 pt-10 pb-6 text-center text-stone-50 sm:mx-5'
            >
                <p
                    aria-live='polite'
                    className='flex flex-col items-center gap-1'
                >
                    <span className='text-gold-300 text-[0.75rem] font-semibold tracking-[0.18em] uppercase'>
                        Your BMI
                    </span>
                    <span className='bmi-num font-serif text-[3.5rem] leading-none font-normal tracking-[-0.02em] md:text-[4.25rem]'>
                        {bmi === null ? '—' : bmi.toFixed(1)}
                    </span>
                    <span className='min-h-6 text-[0.9375rem] text-stone-300'>
                        {category ? category.label : 'Appears as you type'}
                    </span>
                </p>

                <div className='mx-auto mt-5 max-w-[22rem]' aria-hidden='true'>
                    <div className='bmi-scale relative h-2.5 rounded-full'>
                        {bmi !== null && (
                            <span
                                className='bmi-marker absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-stone-50 bg-stone-900 shadow'
                                style={{ left: `${scalePosition(bmi)}%` }}
                            />
                        )}
                    </div>
                    <div className='relative mt-2 h-4 text-[0.6875rem] text-stone-400'>
                        {SCALE_TICKS.map((tick) => (
                            <span
                                key={tick}
                                className='bmi-num absolute -translate-x-1/2'
                                style={{ left: `${scalePosition(tick)}%` }}
                            >
                                {tick}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className='px-5 pt-6 pb-6 sm:px-7'>
                <h2 className='text-[0.75rem] font-semibold tracking-[0.18em] text-stone-600 uppercase'>
                    Your BMI, procedure by procedure
                </h2>
                <ul
                    data-copy-check='data'
                    className='mt-3 divide-y divide-stone-200 border-y border-stone-200'
                >
                    {procedures.map((procedure) => (
                        <ProcedureRow
                            key={procedure.id}
                            procedure={procedure}
                            standing={
                                measurements
                                    ? procedureStanding(measurements, procedure)
                                    : null
                            }
                            unit={unit}
                            consultHref={consultHref}
                        />
                    ))}
                </ul>
                {measurements && (
                    <div data-copy-check='data' className='mt-4'>
                        <NextStep
                            measurements={measurements}
                            procedures={procedures}
                            unit={unit}
                            gettingThereHref={gettingThereHref}
                        />
                    </div>
                )}
                <p className='mt-4 text-[0.875rem] leading-[1.55] text-stone-600'>
                    Ranges come from published research. Your surgeon decides
                    case by case, and we&apos;ll tell you exactly what applies
                    to you.
                </p>
                <a
                    href={consultHref}
                    data-cta='bmi_calculator_consult'
                    className='mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 text-[0.9375rem] font-semibold text-stone-50 transition-colors hover:bg-stone-700 sm:w-auto'
                >
                    Ask what applies to you <span aria-hidden='true'>→</span>
                </a>
            </div>
        </div>
    )
}

function ProcedureRow({
    procedure,
    standing,
    unit,
    consultHref,
}: {
    procedure: CalculatorProcedure
    standing: ProcedureStanding | null
    unit: UnitSystem
    consultHref: `#${string}`
}) {
    const range =
        procedure.bound === 'under'
            ? `under ${procedure.limit}`
            : `${procedure.limit} or under`

    return (
        <li className='grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 py-3.5'>
            <div className='min-w-0'>
                <a
                    href={procedure.href}
                    data-cta='bmi_procedure_page'
                    className='decoration-gold-500 text-[1rem] font-semibold text-stone-900 underline decoration-1 underline-offset-4 hover:decoration-stone-900'
                >
                    {procedure.name}
                </a>
                <span className='bmi-num ml-2 text-[0.875rem] whitespace-nowrap text-stone-500'>
                    BMI {range}
                </span>
            </div>
            <StatusChip standing={standing} />
            {standing && (
                <p className='col-span-2 text-[0.875rem] leading-[1.5] text-stone-700'>
                    <RowDetail
                        procedure={procedure}
                        standing={standing}
                        unit={unit}
                        consultHref={consultHref}
                    />
                </p>
            )}
        </li>
    )
}

function StatusChip({ standing }: { standing: ProcedureStanding | null }) {
    if (!standing) {
        return (
            <span className='rounded-full border border-stone-200 px-2.5 py-0.5 text-[0.8125rem] text-stone-400'>
                —
            </span>
        )
    }
    const chip = {
        in: {
            label: 'In range',
            className: 'border-stone-900 bg-stone-900 text-stone-50',
        },
        above: {
            label: 'Above range',
            className: 'border-gold-500 bg-gold-100 text-stone-900',
        },
        low: {
            label: 'Below 18.5',
            className: 'border-stone-300 bg-white text-stone-700',
        },
    }[standing.status]
    return (
        <span
            className={cn(
                'rounded-full border px-2.5 py-0.5 text-[0.8125rem] font-semibold whitespace-nowrap',
                chip.className
            )}
        >
            {chip.label}
        </span>
    )
}

const rowLink =
    'font-semibold text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-900'

function RowDetail({
    procedure,
    standing,
    unit,
    consultHref,
}: {
    procedure: CalculatorProcedure
    standing: ProcedureStanding
    unit: UnitSystem
    consultHref: `#${string}`
}) {
    const consult = (label: string) => (
        <a
            href={consultHref}
            data-consult-procedure={procedure.chat}
            data-cta='bmi_procedure_consult'
            className={rowLink}
        >
            {label}
        </a>
    )

    if (standing.status === 'in') {
        return (
            <>
                Within the recommended range.{' '}
                {consult(
                    `Let's talk about your ${nameInSentence(procedure.name)}`
                )}
            </>
        )
    }

    if (standing.status === 'low') {
        return <>{consult('Ask what applies to you')}</>
    }

    return (
        <>
            About{' '}
            <strong className='bmi-num font-semibold'>
                {formatWeight(standing.toLoseKg, unit)}
            </strong>{' '}
            to reach BMI {targetBmi(procedure)}.{' '}
            {consult('Ask what applies to you')}
        </>
    )
}

/**
 * Said once under the rows rather than in each: what the gap means in
 * weeks at the CDC's pace, or, under 18.5, what the question becomes.
 */
function NextStep({
    measurements,
    procedures,
    unit,
    gettingThereHref,
}: {
    measurements: Measurements
    procedures: readonly CalculatorProcedure[]
    unit: UnitSystem
    gettingThereHref: `#${string}`
}) {
    const standings = procedures.map((procedure) => ({
        procedure,
        standing: procedureStanding(measurements, procedure),
    }))

    if (standings.some(({ standing }) => standing.status === 'low')) {
        return (
            <p className='rounded-[1rem] bg-stone-100 px-4 py-3.5 text-[0.9375rem] leading-[1.55] text-stone-800'>
                Under 18.5 the question becomes whether there&apos;s enough
                tissue, or fat to move, to work with. Only an exam answers it,
                so ask us what applies to you.
            </p>
        )
    }

    // The widest gap: the general line when it is crossed, else reduction's.
    const widest = standings
        .flatMap(({ procedure, standing }) =>
            standing.status === 'above' ? [{ procedure, standing }] : []
        )
        .sort((a, b) => b.standing.toLoseKg - a.standing.toLoseKg)[0]

    if (!widest) {
        return (
            <p className='rounded-[1rem] bg-stone-100 px-4 py-3.5 text-[0.9375rem] leading-[1.55] text-stone-800'>
                You&apos;re within the recommended range for every procedure
                here. Pick yours and let&apos;s talk about it.
            </p>
        )
    }

    const [fastest, slowest] = weeksAtCdcPace(widest.standing.toLoseKg)
    return (
        <p className='bg-gold-50 border-gold-300 rounded-[1rem] border px-4 py-3.5 text-[0.9375rem] leading-[1.55] text-stone-800'>
            Reaching BMI {targetBmi(widest.procedure)} means about{' '}
            <strong className='bmi-num font-semibold'>
                {formatWeight(widest.standing.toLoseKg, unit)}
            </strong>
            : roughly {fastest}–{slowest} weeks at a steady 1–2 lbs a week. The
            CDC finds weight lost at that pace is more likely to stay off.{' '}
            <a
                href={gettingThereHref}
                data-cta='bmi_how_to_get_there'
                className={rowLink}
            >
                Here&apos;s how to get there
            </a>
            , and we&apos;ll tell you exactly what applies to you.
        </p>
    )
}

function Field({
    id,
    label,
    suffix,
    value,
    onChange,
    placeholder,
    inputMode,
    className,
}: {
    id: string
    label: string
    suffix: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    inputMode: 'numeric' | 'decimal'
    className?: string
}) {
    return (
        <div className={className}>
            <label
                htmlFor={id}
                className='block text-[0.875rem] font-semibold text-stone-800'
            >
                {label}
            </label>
            <div className='relative mt-1.5'>
                <input
                    id={id}
                    type='text'
                    inputMode={inputMode}
                    autoComplete='off'
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                    className='bmi-num focus-visible:border-gold-600 focus-visible:ring-gold-500/30 h-13 w-full rounded-xl border border-stone-300 bg-white pr-12 pl-4 text-[1.125rem] text-stone-900 transition-colors placeholder:text-stone-400 focus-visible:ring-4 focus-visible:outline-none'
                />
                <span
                    aria-hidden='true'
                    className='pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[0.9375rem] text-stone-500'
                >
                    {suffix}
                </span>
            </div>
        </div>
    )
}
