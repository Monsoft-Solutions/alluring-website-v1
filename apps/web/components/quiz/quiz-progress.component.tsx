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

/**
 * Segmented progress variant
 */
export interface SegmentedProgressProps {
    /** Current step number (1-indexed) */
    readonly currentStep: number
    /** Total number of steps */
    readonly totalSteps: number
    /** Additional class names */
    readonly className?: string
}

export function SegmentedProgress({
    currentStep,
    totalSteps,
    className,
}: SegmentedProgressProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            {Array.from({ length: totalSteps }, (_, i) => {
                const stepNumber = i + 1
                const isCompleted = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep

                return (
                    <div
                        key={i}
                        className='flex flex-1 flex-col items-center gap-2'
                    >
                        {/* Segment bar */}
                        <div className='relative h-1 w-full overflow-hidden rounded-full bg-stone-200'>
                            <motion.div
                                className='from-gold-400 to-gold-500 absolute top-0 left-0 h-full rounded-full bg-gradient-to-r'
                                initial={{ width: 0 }}
                                animate={{
                                    width: isCompleted
                                        ? '100%'
                                        : isCurrent
                                          ? '50%'
                                          : '0%',
                                }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

/**
 * Circular progress variant for compact display
 */
export interface CircularProgressProps {
    /** Current step number (1-indexed) */
    readonly currentStep: number
    /** Total number of steps */
    readonly totalSteps: number
    /** Size of the circle */
    readonly size?: 'sm' | 'md' | 'lg'
    /** Additional class names */
    readonly className?: string
}

export function CircularProgress({
    currentStep,
    totalSteps,
    size = 'md',
    className,
}: CircularProgressProps) {
    const progress = Math.min((currentStep / totalSteps) * 100, 100)

    const sizes = {
        sm: { outer: 40, inner: 32, stroke: 4 },
        md: { outer: 56, inner: 44, stroke: 6 },
        lg: { outer: 72, inner: 56, stroke: 8 },
    }

    const { outer, stroke } = sizes[size]
    const radius = (outer - stroke) / 2
    const circumference = 2 * Math.PI * radius

    return (
        <div className={cn('relative inline-flex', className)}>
            <svg width={outer} height={outer} className='rotate-[-90deg]'>
                {/* Background circle */}
                <circle
                    cx={outer / 2}
                    cy={outer / 2}
                    r={radius}
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={stroke}
                    className='text-stone-200'
                />
                {/* Progress circle */}
                <motion.circle
                    cx={outer / 2}
                    cy={outer / 2}
                    r={radius}
                    fill='none'
                    stroke='url(#progressGradient)'
                    strokeWidth={stroke}
                    strokeLinecap='round'
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{
                        strokeDashoffset:
                            circumference - (progress / 100) * circumference,
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                {/* Gradient definition */}
                <defs>
                    <linearGradient
                        id='progressGradient'
                        x1='0%'
                        y1='0%'
                        x2='100%'
                        y2='0%'
                    >
                        <stop offset='0%' stopColor='#d4af37' />
                        <stop offset='100%' stopColor='#f4d03f' />
                    </linearGradient>
                </defs>
            </svg>
            {/* Center text */}
            <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-xs font-semibold text-stone-700'>
                    {currentStep}/{totalSteps}
                </span>
            </div>
        </div>
    )
}
