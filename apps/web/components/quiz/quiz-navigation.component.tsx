/**
 * Quiz Navigation Component
 *
 * Back/Next navigation buttons for the quiz.
 *
 * @module components/quiz/quiz-navigation
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export interface QuizNavigationProps {
    /** Whether to show the back button */
    readonly showBack?: boolean
    /** Whether to show the next button */
    readonly showNext?: boolean
    /** Back button click handler */
    readonly onBack?: () => void
    /** Next button click handler */
    readonly onNext?: () => void
    /** Whether the next button is disabled */
    readonly nextDisabled?: boolean
    /** Custom next button text */
    readonly nextText?: string
    /** Custom back button text */
    readonly backText?: string
    /** Additional class names */
    readonly className?: string
}

/**
 * QuizNavigation - Quiz navigation buttons
 */
export function QuizNavigation({
    showBack = true,
    showNext = true,
    onBack,
    onNext,
    nextDisabled = false,
    nextText = 'Continue',
    backText = 'Back',
    className,
}: QuizNavigationProps) {
    return (
        <div
            className={cn(
                'flex items-center',
                showBack && showNext ? 'justify-between' : 'justify-center',
                className
            )}
        >
            {/* Back button */}
            {showBack && (
                <motion.button
                    type='button'
                    onClick={onBack}
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        'flex items-center gap-2 rounded-lg px-4 py-2',
                        'text-stone-600 transition-colors hover:text-stone-900',
                        'focus:ring-gold-400 focus:ring-2 focus:ring-offset-2 focus:outline-none'
                    )}
                >
                    <ArrowLeft className='h-4 w-4' />
                    <span className='text-sm font-medium'>{backText}</span>
                </motion.button>
            )}

            {/* Next button */}
            {showNext && (
                <motion.button
                    type='button'
                    onClick={onNext}
                    disabled={nextDisabled}
                    whileHover={{ scale: nextDisabled ? 1 : 1.02 }}
                    whileTap={{ scale: nextDisabled ? 1 : 0.98 }}
                    className={cn(
                        'flex items-center gap-2 rounded-xl px-6 py-3',
                        'from-gold-500 to-gold-400 bg-gradient-to-r',
                        'font-semibold text-stone-900',
                        'shadow-gold-500/20 shadow-md',
                        'transition-all duration-300',
                        'hover:shadow-gold-500/30 hover:shadow-lg',
                        'focus:ring-gold-400 focus:ring-2 focus:ring-offset-2 focus:outline-none',
                        nextDisabled && 'cursor-not-allowed opacity-50'
                    )}
                >
                    <span>{nextText}</span>
                    <ArrowRight className='h-4 w-4' />
                </motion.button>
            )}
        </div>
    )
}

/**
 * Minimal navigation variant
 */
export interface MinimalNavigationProps {
    readonly onBack?: () => void
    readonly showBack?: boolean
    readonly className?: string
}

export function MinimalNavigation({
    onBack,
    showBack = true,
    className,
}: MinimalNavigationProps) {
    if (!showBack) return null

    return (
        <motion.button
            type='button'
            onClick={onBack}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                'flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-700',
                className
            )}
        >
            <ArrowLeft className='h-4 w-4' />
            Back
        </motion.button>
    )
}
