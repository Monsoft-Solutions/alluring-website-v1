/**
 * BMI Result Display Component
 *
 * Displays the calculated BMI result with:
 * - Large BMI number
 * - Color-coded category badge
 * - Visual gauge showing position on BMI scale
 * - Contextual recommendation
 * - CTA button to book consultation
 */
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'

import {
    bmiCategories,
    type BmiCategory,
} from '@/lib/data/webpages/bmi-calculator.data'

type BmiResultDisplayProps = {
    readonly bmi: number | null
    readonly className?: string
}

/**
 * Get the BMI category based on the calculated BMI value
 */
function getBmiCategory(bmi: number): BmiCategory {
    for (const category of bmiCategories) {
        if (category.maxBmi === null) {
            // Last category (no upper limit)
            if (bmi >= category.minBmi) {
                return category
            }
        } else if (bmi >= category.minBmi && bmi < category.maxBmi) {
            return category
        }
    }
    // Default to normal if something goes wrong
    return bmiCategories[1]!
}

/**
 * Calculate the position on the BMI gauge (0-100%)
 * BMI scale shown: 15 to 40
 */
function getGaugePosition(bmi: number): number {
    const minBmi = 15
    const maxBmi = 40
    const clampedBmi = Math.max(minBmi, Math.min(maxBmi, bmi))
    return ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 100
}

export function BmiResultDisplay({ bmi, className }: BmiResultDisplayProps) {
    if (bmi === null) {
        return (
            <div
                className={cn(
                    'rounded-xl border border-stone-200 bg-white/80 p-8 text-center backdrop-blur-xl',
                    className
                )}
            >
                <div className='mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-stone-100'>
                    <span className='font-serif text-3xl text-stone-400'>
                        ?
                    </span>
                </div>
                <p className='text-stone-500'>
                    Enter your height and weight to calculate your BMI
                </p>
            </div>
        )
    }

    const category = getBmiCategory(bmi)
    const gaugePosition = getGaugePosition(bmi)

    return (
        <div
            className={cn(
                'overflow-hidden rounded-xl border border-stone-200 bg-white/80 backdrop-blur-xl',
                className
            )}
        >
            {/* Result Header */}
            <div className='bg-stone-900 p-6 text-center'>
                <p className='mb-2 text-xs font-bold tracking-widest text-stone-400 uppercase'>
                    Your BMI
                </p>
                <div
                    className={cn(
                        'font-serif text-6xl font-bold',
                        'text-white'
                    )}
                >
                    {bmi.toFixed(1)}
                </div>
                <span
                    className={cn(
                        'mt-3 inline-flex rounded-full px-4 py-1 text-sm font-semibold',
                        category.bgColor,
                        category.color
                    )}
                >
                    {category.label}
                </span>
            </div>

            {/* BMI Gauge */}
            <div className='px-6 pt-6'>
                <div className='relative h-4 w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-400 via-amber-400 via-emerald-400 via-orange-400 to-red-400'>
                    {/* Position indicator */}
                    <div
                        className='absolute top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white shadow-lg ring-2 ring-stone-900 transition-all duration-500'
                        style={{ left: `calc(${gaugePosition}% - 2px)` }}
                    />
                </div>
                {/* Gauge labels */}
                <div className='mt-2 flex justify-between text-xs text-stone-500'>
                    <span>15</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>35</span>
                    <span>40</span>
                </div>
            </div>

            {/* Category Info */}
            <div className='p-6'>
                <p className='mb-4 text-sm leading-relaxed text-stone-600'>
                    {category.description}
                </p>

                <div className='mb-6 rounded-lg border border-stone-100 bg-stone-50 p-4'>
                    <h4 className='mb-2 text-xs font-bold tracking-wide text-stone-400 uppercase'>
                        Surgery Candidacy
                    </h4>
                    <p className='text-sm leading-relaxed font-medium text-stone-700'>
                        {category.surgeryRecommendation}
                    </p>
                </div>

                {/* CTA */}
                <Button
                    asChild
                    className='bg-gold-500 hover:bg-gold-600 group w-full border-none py-5 text-sm font-bold tracking-wide text-white uppercase shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30'
                >
                    <Link href='/contact-us'>
                        Book Your Consultation
                        <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </Link>
                </Button>
            </div>
        </div>
    )
}
