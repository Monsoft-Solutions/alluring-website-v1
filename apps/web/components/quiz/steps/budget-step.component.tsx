/**
 * Budget Step Component
 *
 * Step for selecting monthly payment comfort level.
 *
 * @module components/quiz/steps/budget-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import type { BudgetRange } from '../lib/quiz-types'
import { QUIZ_QUESTIONS } from '../lib/quiz-questions.data'
import { BudgetCards } from '../ui/budget-slider.component'
import { CreditCard, Shield } from 'lucide-react'

export interface BudgetStepProps {
    /** Currently selected budget range */
    readonly value: BudgetRange | null
    /** Change handler */
    readonly onChange: (value: BudgetRange) => void
    /** Additional class names */
    readonly className?: string
}

/**
 * BudgetStep - Monthly payment selection
 */
export function BudgetStep({ value, onChange, className }: BudgetStepProps) {
    const content = QUIZ_QUESTIONS.budget

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={cn('space-y-8', className)}
        >
            {/* Header */}
            <div className='text-center'>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='font-serif text-2xl text-stone-900 md:text-3xl'
                >
                    {content.title}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className='mt-2 text-stone-600'
                >
                    {content.subtitle}
                </motion.p>
            </div>

            {/* Budget cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <BudgetCards value={value} onChange={onChange} />
            </motion.div>

            {/* Financing partners */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className='rounded-xl bg-gradient-to-br from-stone-50 to-white p-6'
            >
                <div className='flex items-center justify-center gap-2 text-center'>
                    <CreditCard className='text-gold-500 h-5 w-5' />
                    <p className='text-sm font-medium text-stone-700'>
                        Flexible Financing Available
                    </p>
                </div>
                <div className='mt-4 flex flex-wrap items-center justify-center gap-4'>
                    {/* Partner logos as text (replace with actual logos if available) */}
                    <span className='rounded-full bg-white px-4 py-2 text-xs font-semibold text-stone-600 shadow-sm'>
                        Cherry
                    </span>
                    <span className='rounded-full bg-white px-4 py-2 text-xs font-semibold text-stone-600 shadow-sm'>
                        CareCredit
                    </span>
                    <span className='rounded-full bg-white px-4 py-2 text-xs font-semibold text-stone-600 shadow-sm'>
                        United Credit
                    </span>
                </div>
                <div className='mt-4 flex items-center justify-center gap-2 text-xs text-stone-500'>
                    <Shield className='h-4 w-4' />
                    <span>No impact on credit to check eligibility</span>
                </div>
            </motion.div>

            {/* Coffee comparison (shown when budget selected) */}
            {value && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-gold-50 flex items-center justify-center gap-3 rounded-lg p-4'
                >
                    <span className='text-2xl'>☕</span>
                    <p className='text-sm text-stone-600'>
                        {value === 'low' && (
                            <>
                                That's about{' '}
                                <span className='font-semibold text-stone-800'>
                                    $2-3/day
                                </span>{' '}
                                — less than your daily coffee
                            </>
                        )}
                        {value === 'medium' && (
                            <>
                                That's about{' '}
                                <span className='font-semibold text-stone-800'>
                                    $5/day
                                </span>{' '}
                                — the cost of a fancy latte
                            </>
                        )}
                        {value === 'high' && (
                            <>
                                That's about{' '}
                                <span className='font-semibold text-stone-800'>
                                    $9/day
                                </span>{' '}
                                — an investment in yourself
                            </>
                        )}
                        {value === 'premium' && (
                            <>
                                You're ready for{' '}
                                <span className='font-semibold text-stone-800'>
                                    comprehensive transformation
                                </span>
                            </>
                        )}
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}
