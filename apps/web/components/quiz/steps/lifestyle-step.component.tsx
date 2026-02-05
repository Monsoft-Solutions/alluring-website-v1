/**
 * Lifestyle Step Component
 *
 * Step for selecting recovery time availability.
 *
 * @module components/quiz/steps/lifestyle-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import type { RecoveryTime } from '../lib/quiz-types'
import {
    QUIZ_QUESTIONS,
    RECOVERY_TIME_OPTIONS,
} from '../lib/quiz-questions.data'
import { OptionCard, OptionCardGrid } from '../ui/option-card.component'
import { Calendar, Briefcase, Plane } from 'lucide-react'

export interface LifestyleStepProps {
    /** Currently selected recovery time */
    readonly value: RecoveryTime | null
    /** Change handler */
    readonly onChange: (value: RecoveryTime) => void
    /** Additional class names */
    readonly className?: string
}

/**
 * LifestyleStep - Recovery time selection
 */
export function LifestyleStep({
    value,
    onChange,
    className,
}: LifestyleStepProps) {
    const content = QUIZ_QUESTIONS.lifestyle

    // Icons for each option
    const icons: Record<RecoveryTime, React.ReactNode> = {
        '1-week': <Briefcase className='h-6 w-6' />,
        '2-weeks': <Calendar className='h-6 w-6' />,
        '3-plus-weeks': <Plane className='h-6 w-6' />,
    }

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

            {/* Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <OptionCardGrid columns={1}>
                    {RECOVERY_TIME_OPTIONS.map((option, index) => (
                        <motion.div
                            key={option.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <OptionCard
                                value={option.value}
                                label={option.label}
                                description={option.description}
                                isSelected={value === option.value}
                                onClick={() => onChange(option.value)}
                                icon={icons[option.value]}
                                size='lg'
                            />
                        </motion.div>
                    ))}
                </OptionCardGrid>
            </motion.div>

            {/* Info note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='rounded-lg bg-stone-50 p-4 text-center'
            >
                <p className='text-sm text-stone-600'>
                    Recovery times vary by procedure. We&apos;ll recommend
                    options that fit your availability.
                </p>
            </motion.div>
        </motion.div>
    )
}
