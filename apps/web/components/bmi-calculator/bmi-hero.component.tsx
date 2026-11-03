import { cn } from '@workspace/ui/lib/utils'

import { BMI_PROCEDURES } from '@/lib/data/bmi/bmi.facts'

import { BmiCalculator } from './bmi-calculator.component'
import {
    BMI_ANCHORS,
    BMI_CHAT_ID,
    bmiContainer,
    bmiEyebrow,
} from './bmi-page.constant'

/** What the calculator needs from each procedure: nothing else ships. */
const calculatorProcedures = BMI_PROCEDURES.map(
    ({ id, name, href, chat, limit, bound }) => ({
        id,
        name,
        href,
        chat,
        limit,
        bound,
    })
)

const PROMISES = [
    {
        title: 'A range for each procedure',
        body: 'Seven procedures, each against its own recommended range.',
    },
    {
        title: 'From published research',
        body: 'ASPS, The Aesthetic Society and peer-reviewed studies, all listed.',
    },
    {
        title: 'A way there if you need one',
        body: 'Above your range? The weight to reach it, and how we help.',
    },
] as const

/**
 * The first screen: the question, the practice's stance in one line, and
 * the calculator beside it, so the tool is the first thing a visitor can use.
 *
 * A cocoa band with film grain; two outlined arches rise behind the copy
 * once on load (decoration only). The H1 and every word stay put.
 */
export function BmiHero() {
    return (
        <section
            aria-labelledby='bmi-title'
            className='bmi-dark bmi-grain relative isolate overflow-hidden bg-stone-900 pt-28 pb-14 text-stone-50 md:pt-36 md:pb-20'
        >
            <div aria-hidden='true' className='bmi-hero-arches -z-10' />
            <div
                aria-hidden='true'
                className='pointer-events-none absolute -top-40 -left-32 -z-10 size-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(228_201_157/0.16),transparent)]'
            />

            <div
                className={cn(
                    bmiContainer,
                    'grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,33rem)] lg:gap-16'
                )}
            >
                <div className='lg:pt-10'>
                    <p className={cn(bmiEyebrow, 'text-gold-300')}>
                        BMI calculator for plastic surgery
                    </p>
                    <h1
                        id='bmi-title'
                        className='bmi-display mt-5 font-serif text-[2.75rem] leading-[0.98] font-normal tracking-[-0.02em] text-balance md:text-[4rem] lg:text-[4.5rem]'
                    >
                        BMI for plastic surgery, procedure by <em>procedure</em>
                    </h1>
                    <p className='mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.65] text-pretty text-stone-300 md:text-[1.1875rem]'>
                        Enter your height and weight to see your BMI next to the
                        recommended range for a BBL, lipo 360, tummy tuck, mommy
                        makeover and breast surgery. We encourage you to reach
                        that range before surgery, and we&apos;ll tell you
                        exactly what applies to your procedure.
                    </p>

                    <ul className='mt-9 hidden max-w-[34rem] border-t border-[rgb(228_201_157/0.18)] md:block'>
                        {PROMISES.map((promise) => (
                            <li
                                key={promise.title}
                                className='border-b border-[rgb(228_201_157/0.18)] py-4'
                            >
                                <strong className='block font-semibold text-stone-50'>
                                    {promise.title}
                                </strong>
                                <span className='mt-0.5 block text-[0.9375rem] leading-relaxed text-stone-400'>
                                    {promise.body}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <p className='mt-7 hidden text-[0.9375rem] text-stone-400 md:block'>
                        How we chose the ranges:{' '}
                        <a
                            href={`#${BMI_ANCHORS.ranges}`}
                            className='decoration-gold-300 text-stone-50 underline decoration-1 underline-offset-4 hover:decoration-stone-50'
                        >
                            see the evidence
                        </a>
                    </p>
                </div>

                <div id={BMI_ANCHORS.calculator}>
                    <BmiCalculator
                        procedures={calculatorProcedures}
                        consultHref={`#${BMI_CHAT_ID}`}
                        gettingThereHref={`#${BMI_ANCHORS.gettingThere}`}
                    />
                </div>
            </div>
        </section>
    )
}
