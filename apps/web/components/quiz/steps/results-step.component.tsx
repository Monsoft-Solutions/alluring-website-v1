/**
 * Results Step Component
 *
 * Displays personalized procedure recommendations.
 *
 * @module components/quiz/steps/results-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

// Pre-computed particle animation values (deterministic for consistency)
const PARTICLE_ANIMATIONS = [
    { x: 25, y: -35 },
    { x: -18, y: -42 },
    { x: 22, y: -28 },
    { x: -27, y: -38 },
    { x: 15, y: -45 },
    { x: -20, y: -32 },
]
import type { ProcedureRecommendation } from '../lib/quiz-types'
import {
    QUIZ_QUESTIONS,
    SOCIAL_PROOF_MESSAGES,
} from '../lib/quiz-questions.data'
import { getProcedureDetails } from '../lib/quiz-pricing.data'
import { ProcedureCard } from '../ui/procedure-card.component'

export interface ResultsStepProps {
    /** Procedure recommendations */
    readonly recommendations: readonly ProcedureRecommendation[]
    /** Handler for continuing to package builder */
    readonly onContinue: () => void
    /** Additional class names */
    readonly className?: string
}

/**
 * ResultsStep - Display personalized recommendations
 */
export function ResultsStep({
    recommendations,
    onContinue,
    className,
}: ResultsStepProps) {
    const content = QUIZ_QUESTIONS.results

    // Get primary recommendation
    const primaryRecommendation = recommendations.find((r) => r.isPrimary)
    const primaryProcedure = primaryRecommendation
        ? getProcedureDetails(primaryRecommendation.procedureId)
        : null

    // Get secondary recommendations
    const secondaryRecommendations = recommendations
        .filter((r) => !r.isPrimary && r.confidence !== 'low')
        .slice(0, 2)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn('space-y-8', className)}
        >
            {/* Success animation */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className='flex justify-center'
            >
                <div className='relative'>
                    <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-lg shadow-green-500/30'>
                        <CheckCircle2 className='h-10 w-10 text-white' />
                    </div>
                    {/* Celebration particles */}
                    {PARTICLE_ANIMATIONS.map((particle, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{
                                scale: [0, 1.5],
                                opacity: [1, 0],
                                x: [0, particle.x],
                                y: [0, particle.y],
                            }}
                            transition={{
                                duration: 0.8,
                                delay: 0.2 + i * 0.1,
                            }}
                            className='bg-gold-400 absolute top-1/2 left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full'
                        />
                    ))}
                </div>
            </motion.div>

            {/* Header */}
            <div className='text-center'>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className='font-serif text-2xl text-stone-900 md:text-3xl'
                >
                    {content.title}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className='mt-2 text-stone-600'
                >
                    {content.subtitle}
                </motion.p>
            </div>

            {/* Primary recommendation */}
            {primaryProcedure && primaryRecommendation && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <ProcedureCard
                        procedure={primaryProcedure}
                        recommendation={primaryRecommendation}
                        isPrimary
                        socialProof={
                            SOCIAL_PROOF_MESSAGES[
                                primaryRecommendation.procedureId
                            ]
                        }
                    />
                </motion.div>
            )}

            {/* Secondary recommendations */}
            {secondaryRecommendations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className='space-y-4'
                >
                    <p className='text-center text-sm font-medium text-stone-500'>
                        Also worth considering
                    </p>
                    <div className='grid gap-4 md:grid-cols-2'>
                        {secondaryRecommendations.map((rec, index) => {
                            const procedure = getProcedureDetails(
                                rec.procedureId
                            )
                            if (!procedure) return null

                            return (
                                <motion.div
                                    key={rec.procedureId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                >
                                    <ProcedureCard
                                        procedure={procedure}
                                        recommendation={rec}
                                    />
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className='text-center'
            >
                <motion.button
                    type='button'
                    onClick={onContinue}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        'inline-flex items-center gap-3 rounded-full px-8 py-4',
                        'from-gold-500 to-gold-400 bg-gradient-to-r text-stone-900',
                        'shadow-gold-500/30 font-semibold shadow-lg',
                        'hover:shadow-gold-500/40 transition-all duration-300 hover:shadow-xl'
                    )}
                >
                    Continue to Book Your Consultation
                    <svg
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M9 5l7 7-7 7'
                        />
                    </svg>
                </motion.button>

                <p className='mt-4 text-sm text-stone-500'>
                    Or explore additional procedures to enhance your results
                </p>
            </motion.div>
        </motion.div>
    )
}
