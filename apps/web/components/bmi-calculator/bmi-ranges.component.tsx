import { cn } from '@workspace/ui/lib/utils'

import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'
import { BMI_PROCEDURES, bmiRangeLabel } from '@/lib/data/bmi/bmi.facts'

import { BmiAnswerSection } from './bmi-answer-section.component'
import {
    BMI_ANCHORS,
    bmiBody,
    bmiContainer,
    bmiLink,
} from './bmi-page.constant'

/** Where each procedure's range comes from, as the table names it. */
const RANGE_BASIS: Record<(typeof BMI_PROCEDURES)[number]['id'], string> = {
    bbl: 'Risk across cosmetic surgery; no BBL-specific cutoff published',
    liposuction: 'ASPS candidate guidance and liposuction risk studies',
    'tummy-tuck': 'Tummy tuck risk studies and Aesthetic Society surgeons',
    'mommy-makeover': 'Tummy tuck and combined-procedure studies',
    'breast-augmentation':
        'Risk across cosmetic surgery and an augmentation study',
    'breast-lift': 'Risk across cosmetic surgery; no lift-specific study found',
    'breast-reduction': 'The ASPS breast reduction guideline',
}

/**
 * Major complications by BMI across cosmetic surgery (Gupta 2016, the
 * `complications-by-bmi` fact). The bar is the rate against the highest
 * band's; the figure beside it is the text and never moves.
 */
const RISK_BANDS = [
    { band: 'BMI 18.5 to 24.9', rate: 1.6 },
    { band: 'BMI 25 to 29.9', rate: 2.3 },
    { band: 'BMI 30 to 39.9', rate: 3.1 },
    { band: 'BMI 40 or more', rate: 4.2 },
] as const

/**
 * "What BMI do you need for plastic surgery?" The page's answer in one
 * table, the evidence it rests on in one chart, and the practice's stance.
 */
export function BmiRanges() {
    return (
        <div className='bg-stone-50'>
            <BmiAnswerSection
                id={BMI_ANCHORS.ranges}
                eyebrow='The short answer'
                question={
                    <>
                        What BMI do you need for plastic <em>surgery</em>?
                    </>
                }
                answer={
                    <>
                        For most body and breast procedures, the published
                        evidence points to a BMI under 30, and BMI 35 or under
                        for breast reduction. No society sets a hard cutoff:
                        risk rises step by step with BMI, so your surgeon
                        decides case by case. We encourage you to reach your
                        procedure&apos;s range before surgery.
                    </>
                }
                className={cn(bmiContainer, 'py-16 md:py-24')}
            >
                <div className='mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14'>
                    <div>
                        <table className='w-full border-collapse text-left'>
                            <caption className='sr-only'>
                                Recommended BMI range by procedure
                            </caption>
                            <thead>
                                <tr className='border-b border-stone-900 text-[0.8125rem] tracking-[0.08em] text-stone-600 uppercase'>
                                    <th
                                        scope='col'
                                        className='py-3 pr-4 font-semibold'
                                    >
                                        Procedure
                                    </th>
                                    <th
                                        scope='col'
                                        className='py-3 pr-4 font-semibold'
                                    >
                                        Recommended
                                    </th>
                                    <th
                                        scope='col'
                                        className='hidden py-3 font-semibold sm:table-cell'
                                    >
                                        Based on
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {BMI_PROCEDURES.map((procedure) => (
                                    <tr
                                        key={procedure.id}
                                        className='border-b border-stone-200 align-top'
                                    >
                                        <th
                                            scope='row'
                                            className='py-4 pr-4 font-normal'
                                        >
                                            <a
                                                href={`#${procedure.id}`}
                                                className={cn(
                                                    bmiLink,
                                                    'text-[1.0625rem] font-semibold'
                                                )}
                                            >
                                                {procedure.name}
                                            </a>
                                        </th>
                                        <td className='bmi-num py-4 pr-4 font-serif text-[1.25rem] whitespace-nowrap text-stone-900'>
                                            {bmiRangeLabel(procedure)}
                                        </td>
                                        <td className='hidden py-4 text-[0.9375rem] leading-[1.5] text-stone-600 sm:table-cell'>
                                            {RANGE_BASIS[procedure.id]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p
                            className={cn(
                                bmiBody,
                                'mt-6 text-base md:text-[1.0625rem]'
                            )}
                        >
                            No society publishes a hard BMI cutoff for these
                            procedures. So for each one we took the line where
                            the published evidence turns, and we encourage you
                            to reach it before surgery. It isn&apos;t a gate:
                            tell us your number and your goals, and we&apos;ll
                            tell you exactly what applies to you.
                        </p>
                    </div>

                    <figure className='rounded-[1.5rem] border border-stone-200 bg-white p-6 md:p-8'>
                        <figcaption>
                            <p className='font-serif text-[1.375rem] leading-[1.25] text-stone-900'>
                                Complications rise with BMI
                            </p>
                            <p className='mt-2 text-[0.9375rem] leading-[1.55] text-stone-600'>
                                Major complications in 127,961 patients having
                                cosmetic surgery, by BMI (
                                <a
                                    href={`#${sourceAnchorId('gupta-2016')}`}
                                    className={bmiLink}
                                >
                                    Gupta and colleagues, Aesthetic Surgery
                                    Journal, 2016
                                </a>
                                ).
                            </p>
                        </figcaption>
                        <ul className='mt-6 flex flex-col gap-4'>
                            {RISK_BANDS.map(({ band, rate }) => (
                                <li key={band}>
                                    <p className='flex items-baseline justify-between gap-3 text-[0.9375rem] text-stone-800'>
                                        <span className='bmi-num'>{band}:</span>{' '}
                                        <span className='bmi-num font-semibold'>
                                            {rate}% had a major complication
                                        </span>
                                    </p>
                                    <div
                                        aria-hidden='true'
                                        className='mt-1.5 h-2.5 overflow-hidden rounded-full bg-stone-100'
                                    >
                                        <div
                                            className='bmi-bar-fill bg-gold-500 h-full rounded-full'
                                            style={{
                                                width: `${(rate / 4.2) * 100}%`,
                                            }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <p className='mt-6 text-[0.875rem] leading-[1.55] text-stone-600'>
                            A major complication meant an emergency room visit,
                            a hospital stay or another operation within 30 days
                            of surgery. In the same study, infections and blood
                            clots were about twice as common in patients with a
                            BMI of 25 or more.
                        </p>
                    </figure>
                </div>
            </BmiAnswerSection>
        </div>
    )
}
