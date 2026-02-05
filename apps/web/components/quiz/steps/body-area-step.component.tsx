/**
 * Body Area Step Component
 *
 * Step for selecting which body areas the user wants to improve.
 * Uses card-based selection for mobile-friendly interaction.
 *
 * @module components/quiz/steps/body-area-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import type { BodyArea } from '../lib/quiz-types'
import { QUIZ_QUESTIONS } from '../lib/quiz-questions.data'
import { BodyAreaCards } from '../ui/body-silhouette.component'

export interface BodyAreaStepProps {
    /** Currently selected body areas */
    readonly selectedAreas: readonly BodyArea[]
    /** Toggle area selection */
    readonly onToggleArea: (area: BodyArea) => void
    /** Additional class names */
    readonly className?: string
}

/**
 * BodyAreaStep - Body area selection step
 */
export function BodyAreaStep({
    selectedAreas,
    onToggleArea,
    className,
}: BodyAreaStepProps) {
    const content = QUIZ_QUESTIONS.bodyArea

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

            {/* Selection cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <BodyAreaCards
                    selectedAreas={selectedAreas}
                    onToggleArea={onToggleArea}
                />
            </motion.div>

            {/* Selection feedback */}
            {selectedAreas.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-center'
                >
                    <p className='text-sm text-stone-500'>
                        {selectedAreas.length === 1
                            ? '1 area selected'
                            : `${selectedAreas.length} areas selected`}{' '}
                        — you can select more or continue
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}
