/**
 * Budget Step Component
 *
 * Step for choosing how big a change the visitor has in mind. Financing is
 * named, with no payment figure (claims canon D6).
 *
 * @module components/quiz/steps/budget-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import { CreditCard, Shield } from 'lucide-react'
import { FINANCING_PARTNERS } from '@/lib/data/site-config'
import type { BudgetRange } from '../lib/quiz-types'
import { QUIZ_QUESTIONS } from '../lib/quiz-questions.data'
import { BudgetCards } from '../ui/budget-slider.component'

export interface BudgetStepProps {
    /** Currently selected budget range */
    readonly value: BudgetRange | null
    /** Change handler */
    readonly onChange: (value: BudgetRange) => void
    /** Additional class names */
    readonly className?: string
}

/**
 * BudgetStep - Scope of change selection
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
                        Financing available for qualified applicants
                    </p>
                </div>
                <div className='mt-4 flex flex-wrap items-center justify-center gap-4'>
                    {FINANCING_PARTNERS.map((partner) => (
                        <span
                            key={partner}
                            className='rounded-full bg-white px-4 py-2 text-xs font-semibold text-stone-600 shadow-sm'
                        >
                            {partner}
                        </span>
                    ))}
                </div>
                <div className='mt-4 flex items-center justify-center gap-2 text-xs text-stone-500'>
                    <Shield className='h-4 w-4' />
                    <span>Approval and terms are set by the lender</span>
                </div>
            </motion.div>
        </motion.div>
    )
}
