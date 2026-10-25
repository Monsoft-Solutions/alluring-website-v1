import { cn } from '@workspace/ui/lib/utils'

import { sourceAnchorId } from '@/components/procedures/sections/sources-list.component'

import { BmiAnswerSection } from './bmi-answer-section.component'
import { BMI_ANCHORS, bmiContainer, bmiLink } from './bmi-page.constant'

/** 4′10″ to 6′0″, an inch at a time. */
const HEIGHTS_IN = Array.from({ length: 15 }, (_, index) => 58 + index)

/** The CDC's U.S. formula, solved for weight: lb = BMI × in² ÷ 703. */
const poundsAt = (bmi: number, inches: number) => (bmi * inches * inches) / 703

const feetAndInches = (inches: number) =>
    `${Math.floor(inches / 12)}′${inches % 12}″`

/**
 * "How much should you weigh?" For each height, the CDC's healthy-weight
 * range, the most you can weigh and stay under BMI 30 (the line for most
 * procedures) and at BMI 35 (breast reduction). Computed here at build
 * time; the table is data, so the copy sweep skips it.
 */
export function BmiWeightChart() {
    return (
        <div className='bmi-defer bg-stone-100'>
            <BmiAnswerSection
                id={BMI_ANCHORS.weightChart}
                eyebrow='Height and weight chart'
                question={
                    <>
                        How much should you weigh before <em>surgery</em>?
                    </>
                }
                answer={
                    <>
                        It depends on your height. The chart shows, for each
                        height, the most you can weigh and stay under BMI 30,
                        the line for most procedures here, and at BMI 35, the
                        line for breast reduction. Find your height, compare
                        your weight, and the calculator above shows exactly how
                        far you are.
                    </>
                }
                className={cn(bmiContainer, 'py-16 md:py-24')}
            >
                <p
                    data-copy-check='data'
                    className='mt-10 text-[0.875rem] font-semibold text-stone-600'
                >
                    Weights in pounds
                </p>
                <div className='mt-3 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white'>
                    <table
                        data-copy-check='data'
                        className='bmi-num w-full border-collapse text-left text-[0.9375rem] md:text-base'
                    >
                        <caption className='sr-only'>
                            Weight in pounds by height: the healthy-weight range
                            and the most you can weigh to stay under BMI 30 and
                            at BMI 35
                        </caption>
                        <thead className='bg-stone-900 text-stone-50'>
                            <tr>
                                <th
                                    scope='col'
                                    className='px-3 py-3.5 font-semibold sm:px-5'
                                >
                                    Height
                                </th>
                                <th
                                    scope='col'
                                    className='px-3 py-3.5 font-semibold sm:px-5'
                                >
                                    Healthy weight
                                    <span className='block text-[0.75rem] font-normal text-stone-400'>
                                        BMI 18.5–24.9
                                    </span>
                                </th>
                                <th
                                    scope='col'
                                    className='text-gold-300 px-3 py-3.5 font-semibold sm:px-5'
                                >
                                    Under BMI 30
                                    <span className='block text-[0.75rem] font-normal text-stone-400'>
                                        Most procedures
                                    </span>
                                </th>
                                <th
                                    scope='col'
                                    className='px-3 py-3.5 font-semibold sm:px-5'
                                >
                                    BMI 35 or under
                                    <span className='block text-[0.75rem] font-normal text-stone-400'>
                                        Breast reduction
                                    </span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {HEIGHTS_IN.map((inches) => (
                                <tr
                                    key={inches}
                                    className='border-t border-stone-200 even:bg-stone-50'
                                >
                                    <th
                                        scope='row'
                                        className='px-3 py-2.5 font-semibold text-stone-900 sm:px-5'
                                    >
                                        {feetAndInches(inches)}
                                    </th>
                                    <td className='px-3 py-2.5 text-stone-700 sm:px-5'>
                                        {Math.ceil(poundsAt(18.5, inches))}–
                                        {Math.floor(poundsAt(24.9, inches))}
                                    </td>
                                    <td className='px-3 py-2.5 font-semibold text-stone-900 sm:px-5'>
                                        {Math.floor(poundsAt(29.9, inches))}
                                    </td>
                                    <td className='px-3 py-2.5 text-stone-700 sm:px-5'>
                                        {Math.floor(poundsAt(35, inches))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p
                    data-copy-check='data'
                    className='mt-5 max-w-[46rem] text-[0.875rem] leading-[1.6] text-stone-600'
                >
                    Weights computed with the{' '}
                    <a
                        href={`#${sourceAnchorId('cdc-bmi-formula')}`}
                        className={bmiLink}
                    >
                        CDC&apos;s BMI formula
                    </a>
                    , rounded down so each stays inside its range. In kilograms?
                    Switch the calculator to cm · kg.{' '}
                    <a href={`#${BMI_ANCHORS.calculator}`} className={bmiLink}>
                        Back to the calculator
                    </a>
                </p>
            </BmiAnswerSection>
        </div>
    )
}
