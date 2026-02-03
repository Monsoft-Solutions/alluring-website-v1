/**
 * Package Builder Step Component
 *
 * Allows users to build a custom procedure package.
 *
 * @module components/quiz/steps/package-builder-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import type { ProcedureId, ProcedureRecommendation } from '../lib/quiz-types'
import { QUIZ_QUESTIONS } from '../lib/quiz-questions.data'
import { getProcedureDetails } from '../lib/quiz-pricing.data'
import { getComplementaryProcedures } from '../lib/quiz-logic'
import {
    MiniProcedureCard,
    PackageSummary,
} from '../ui/procedure-card.component'

export interface PackageBuilderStepProps {
    /** Primary recommendation */
    readonly primaryRecommendation: ProcedureRecommendation | undefined
    /** All recommendations */
    readonly recommendations: readonly ProcedureRecommendation[]
    /** Selected procedures for package */
    readonly selectedProcedures: readonly ProcedureId[]
    /** Toggle procedure selection */
    readonly onToggleProcedure: (procedureId: ProcedureId) => void
    /** Handler for continuing to booking */
    readonly onContinue: () => void
    /** Handler for skipping to booking */
    readonly onSkip: () => void
    /** Additional class names */
    readonly className?: string
}

/**
 * PackageBuilderStep - Build custom procedure package
 */
export function PackageBuilderStep({
    primaryRecommendation,
    recommendations,
    selectedProcedures,
    onToggleProcedure,
    onContinue,
    onSkip,
    className,
}: PackageBuilderStepProps) {
    const content = QUIZ_QUESTIONS.packageBuilder

    // Get complementary procedures for the primary recommendation
    const complementaryIds = primaryRecommendation
        ? getComplementaryProcedures(primaryRecommendation.procedureId)
        : []

    // Get all recommended procedure IDs (excluding primary)
    const recommendedIds = recommendations
        .filter((r) => !r.isPrimary)
        .map((r) => r.procedureId)

    // Combine and dedupe
    const additionalProcedures = [
        ...new Set([...complementaryIds, ...recommendedIds]),
    ]

    // Get procedure details
    const additionalProcedureDetails = additionalProcedures
        .map((id) => getProcedureDetails(id))
        .filter(Boolean)

    const selectedDetails = selectedProcedures
        .map((id) => getProcedureDetails(id))
        .filter(Boolean)

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

            <div className='grid gap-8 lg:grid-cols-5'>
                {/* Procedure selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className='space-y-4 lg:col-span-3'
                >
                    {/* Primary procedure (always included) */}
                    {primaryRecommendation && (
                        <div>
                            <p className='text-gold-600 mb-3 text-xs font-semibold tracking-wider uppercase'>
                                Your Primary Procedure
                            </p>
                            {getProcedureDetails(
                                primaryRecommendation.procedureId
                            ) && (
                                <MiniProcedureCard
                                    procedure={
                                        getProcedureDetails(
                                            primaryRecommendation.procedureId
                                        )!
                                    }
                                    isSelected={selectedProcedures.includes(
                                        primaryRecommendation.procedureId
                                    )}
                                    onToggle={() =>
                                        onToggleProcedure(
                                            primaryRecommendation.procedureId
                                        )
                                    }
                                />
                            )}
                        </div>
                    )}

                    {/* Complementary procedures */}
                    {additionalProcedureDetails.length > 0 && (
                        <div>
                            <p className='mb-3 text-xs font-semibold tracking-wider text-stone-500 uppercase'>
                                Add Complementary Procedures
                            </p>
                            <div className='space-y-3'>
                                {additionalProcedureDetails.map(
                                    (procedure, index) => (
                                        <motion.div
                                            key={procedure!.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.3 + index * 0.1,
                                            }}
                                        >
                                            <MiniProcedureCard
                                                procedure={procedure!}
                                                isSelected={selectedProcedures.includes(
                                                    procedure!.id
                                                )}
                                                onToggle={() =>
                                                    onToggleProcedure(
                                                        procedure!.id
                                                    )
                                                }
                                            />
                                        </motion.div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Combination tip */}
                    {selectedProcedures.length === 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className='bg-gold-50 rounded-lg p-4 text-center'
                        >
                            <p className='text-sm text-stone-700'>
                                <span className='font-medium'>Pro tip:</span>{' '}
                                Combining procedures in one surgery means one
                                recovery period and often costs less than
                                separate surgeries.
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Package summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className='lg:col-span-2'
                >
                    <div className='sticky top-24'>
                        <PackageSummary procedures={selectedDetails as any[]} />

                        {/* Action buttons */}
                        <div className='mt-6 space-y-3'>
                            <motion.button
                                type='button'
                                onClick={onContinue}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    'w-full rounded-xl px-6 py-4',
                                    'from-gold-500 to-gold-400 bg-gradient-to-r',
                                    'font-semibold text-stone-900',
                                    'shadow-gold-500/30 shadow-lg',
                                    'transition-all duration-300',
                                    'hover:shadow-gold-500/40 hover:shadow-xl'
                                )}
                            >
                                Book My Consultation
                            </motion.button>

                            <button
                                type='button'
                                onClick={onSkip}
                                className='w-full py-2 text-sm text-stone-500 transition-colors hover:text-stone-700'
                            >
                                Skip and book with just my primary procedure
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}
