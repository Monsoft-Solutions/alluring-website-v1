/**
 * Event Step Component
 *
 * Optional step for selecting a life event the user is preparing for.
 *
 * @module components/quiz/steps/event-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import type { LifeEvent } from '../lib/quiz-types'
import { QUIZ_QUESTIONS, LIFE_EVENT_OPTIONS } from '../lib/quiz-questions.data'
import { OptionCard, OptionCardGrid } from '../ui/option-card.component'
import { Heart, Palmtree, Users, Sparkles } from 'lucide-react'

export interface EventStepProps {
    /** Currently selected event */
    readonly value: LifeEvent | null
    /** Change handler */
    readonly onChange: (value: LifeEvent) => void
    /** Additional class names */
    readonly className?: string
}

/**
 * EventStep - Life event selection
 */
export function EventStep({ value, onChange, className }: EventStepProps) {
    const content = QUIZ_QUESTIONS.event

    // Icons for each option
    const icons: Record<LifeEvent, React.ReactNode> = {
        wedding: <Heart className='h-6 w-6' />,
        vacation: <Palmtree className='h-6 w-6' />,
        reunion: <Users className='h-6 w-6' />,
        'just-for-me': <Sparkles className='h-6 w-6' />,
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
                <OptionCardGrid columns={2}>
                    {LIFE_EVENT_OPTIONS.map((option, index) => (
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
                                size='md'
                            />
                        </motion.div>
                    ))}
                </OptionCardGrid>
            </motion.div>

            {/* Optional note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className='text-center'
            >
                <p className='text-sm text-stone-500'>
                    This helps us understand your timeline. You can skip if you
                    prefer.
                </p>
            </motion.div>
        </motion.div>
    )
}
