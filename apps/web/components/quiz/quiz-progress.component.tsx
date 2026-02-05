/**
 * Quiz Progress Component
 *
 * Elegant progress indicator for the quiz flow.
 *
 * @module components/quiz/quiz-progress
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'

export interface QuizProgressProps {
    /** Current step number (1-indexed) */
    readonly currentStep: number
    /** Total number of steps */
    readonly totalSteps: number
    /** Additional class names */
    readonly className?: string
}

/**
 * QuizProgress - Visual progress indicator
 */
export function QuizProgress({
    currentStep,
    totalSteps,
    className,
}: QuizProgressProps) {
    const progress = Math.min((currentStep / totalSteps) * 100, 100)

    return (
        <div className={cn('w-full', className)}>
            {/* Progress bar */}
            <div className='relative h-1.5 overflow-hidden rounded-full bg-stone-200'>
                <motion.div
                    className='from-gold-400 to-gold-500 absolute top-0 left-0 h-full rounded-full bg-gradient-to-r'
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>

            {/* Step indicator */}
            <div className='mt-2 flex items-center justify-between text-xs text-stone-500'>
                <span>
                    Step {currentStep} of {totalSteps}
                </span>
                <span>{Math.round(progress)}% complete</span>
            </div>
        </div>
    )
}
