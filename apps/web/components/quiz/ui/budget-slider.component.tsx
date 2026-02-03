/**
 * Budget Slider Component
 *
 * Custom range slider for selecting monthly payment comfort level.
 * Includes visual feedback and financing preview.
 *
 * @module components/quiz/ui/budget-slider
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import type { BudgetRange } from '../lib/quiz-types'
import { BUDGET_RANGE_OPTIONS } from '../lib/quiz-questions.data'

export interface BudgetSliderProps {
    /** Currently selected budget range */
    readonly value: BudgetRange | null
    /** Change handler */
    readonly onChange: (value: BudgetRange) => void
    /** Additional class names */
    readonly className?: string
}

/**
 * BudgetSlider - Visual budget range selector
 */
export function BudgetSlider({
    value,
    onChange,
    className,
}: BudgetSliderProps) {
    const options = BUDGET_RANGE_OPTIONS

    return (
        <div className={cn('space-y-8', className)}>
            {/* Visual slider track */}
            <div className='relative px-4'>
                {/* Track background */}
                <div className='relative h-2 rounded-full bg-stone-200'>
                    {/* Filled portion */}
                    <motion.div
                        className='from-gold-400 to-gold-500 absolute top-0 left-0 h-full rounded-full bg-gradient-to-r'
                        initial={{ width: '0%' }}
                        animate={{
                            width: value
                                ? `${((options.findIndex((o) => o.value === value) + 1) / options.length) * 100}%`
                                : '0%',
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                        }}
                    />

                    {/* Step markers */}
                    <div className='absolute top-1/2 right-0 left-0 flex -translate-y-1/2 justify-between'>
                        {options.map((option, index) => {
                            const isSelected =
                                value &&
                                options.findIndex((o) => o.value === value) >=
                                    index
                            const isCurrent = value === option.value

                            return (
                                <button
                                    key={option.value}
                                    type='button'
                                    onClick={() => onChange(option.value)}
                                    className={cn(
                                        'relative h-6 w-6 rounded-full transition-all duration-300',
                                        'focus:ring-gold-400 focus:ring-2 focus:ring-offset-2 focus:outline-none',
                                        isSelected
                                            ? 'bg-gold-500 shadow-gold-500/30 shadow-lg'
                                            : 'bg-stone-300 hover:bg-stone-400',
                                        isCurrent && 'scale-125'
                                    )}
                                    aria-label={`Select ${option.label}`}
                                >
                                    {isCurrent && (
                                        <motion.div
                                            layoutId='budget-indicator'
                                            className='border-gold-300 absolute inset-0 rounded-full border-4'
                                            transition={{
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Labels below track */}
                <div className='mt-6 flex justify-between'>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type='button'
                            onClick={() => onChange(option.value)}
                            className={cn(
                                'text-center transition-colors',
                                value === option.value
                                    ? 'text-gold-600'
                                    : 'text-stone-500 hover:text-stone-700'
                            )}
                        >
                            <span
                                className={cn(
                                    'block text-sm font-semibold',
                                    value === option.value && 'text-gold-600'
                                )}
                            >
                                {option.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected range details */}
            {value && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='rounded-xl bg-gradient-to-br from-stone-50 to-white p-6 text-center shadow-sm'
                >
                    <p className='text-stone-600'>
                        {options.find((o) => o.value === value)?.description}
                    </p>
                    <p className='mt-2 text-sm text-stone-500'>
                        Financing available through Cherry, CareCredit & United
                        Credit
                    </p>
                </motion.div>
            )}
        </div>
    )
}

/**
 * Alternative card-based budget selector
 */
export interface BudgetCardsProps {
    readonly value: BudgetRange | null
    readonly onChange: (value: BudgetRange) => void
    readonly className?: string
}

export function BudgetCards({ value, onChange, className }: BudgetCardsProps) {
    const options = BUDGET_RANGE_OPTIONS

    return (
        <div className={cn('grid grid-cols-2 gap-4', className)}>
            {options.map((option) => {
                const isSelected = value === option.value

                return (
                    <motion.button
                        key={option.value}
                        type='button'
                        onClick={() => onChange(option.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            'relative overflow-hidden rounded-xl p-5 text-center transition-all duration-300',
                            'border-2',
                            isSelected
                                ? 'border-gold-500 from-gold-50 shadow-gold-500/20 bg-gradient-to-br to-white shadow-lg'
                                : 'border-stone-200 bg-white/80 hover:border-stone-300 hover:bg-white'
                        )}
                    >
                        {/* Selected indicator */}
                        {isSelected && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className='bg-gold-500 absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full text-white'
                            >
                                <svg
                                    className='h-3 w-3'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                    strokeWidth={3}
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M5 13l4 4L19 7'
                                    />
                                </svg>
                            </motion.div>
                        )}

                        {/* Amount */}
                        <span
                            className={cn(
                                'block text-xl font-bold',
                                isSelected ? 'text-gold-600' : 'text-stone-700'
                            )}
                        >
                            {option.label}
                        </span>

                        {/* Description */}
                        <span
                            className={cn(
                                'mt-1 block text-xs',
                                isSelected ? 'text-stone-600' : 'text-stone-500'
                            )}
                        >
                            {option.description}
                        </span>
                    </motion.button>
                )
            })}
        </div>
    )
}

/**
 * Coffee comparison display
 */
export interface CoffeeComparisonProps {
    readonly monthlyPayment: number
    readonly className?: string
}

export function CoffeeComparison({
    monthlyPayment,
    className,
}: CoffeeComparisonProps) {
    const dailyAmount = (monthlyPayment / 30).toFixed(2)

    return (
        <div
            className={cn(
                'flex items-center justify-center gap-3 rounded-lg bg-stone-50 p-4',
                className
            )}
        >
            <span className='text-2xl'>☕</span>
            <p className='text-sm text-stone-600'>
                That's less than{' '}
                <span className='font-semibold text-stone-800'>
                    ${dailyAmount}
                </span>{' '}
                per day — about the cost of a coffee
            </p>
        </div>
    )
}
