/**
 * Concerns Step Component
 *
 * Dynamic step for selecting concerns based on body area.
 * Renders appropriate options for face, breast, or body.
 *
 * @module components/quiz/steps/concerns-step
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { motion } from 'framer-motion'
import type {
    BodyArea,
    BodyConcern,
    BreastConcern,
    Concern,
    FaceConcern,
} from '../lib/quiz-types'
import {
    BODY_CONCERN_OPTIONS,
    BREAST_CONCERN_OPTIONS,
    FACE_CONCERN_OPTIONS,
    QUIZ_QUESTIONS,
} from '../lib/quiz-questions.data'
import { OptionCard, OptionCardGrid } from '../ui/option-card.component'

export interface ConcernsStepProps {
    /** Which body area this step is for */
    readonly bodyArea: BodyArea
    /** Currently selected concerns */
    readonly selectedConcerns: readonly Concern[]
    /** Toggle concern selection */
    readonly onToggleConcern: (concern: Concern) => void
    /** Additional class names */
    readonly className?: string
}

/**
 * ConcernsStep - Dynamic concern selection based on body area
 */
export function ConcernsStep({
    bodyArea,
    selectedConcerns,
    onToggleConcern,
    className,
}: ConcernsStepProps) {
    // Get content and options based on body area
    const getContent = () => {
        switch (bodyArea) {
            case 'face':
                return {
                    ...QUIZ_QUESTIONS.faceConcerns,
                    options: FACE_CONCERN_OPTIONS,
                }
            case 'breast':
                return {
                    ...QUIZ_QUESTIONS.breastConcerns,
                    options: BREAST_CONCERN_OPTIONS,
                }
            case 'body':
                return {
                    ...QUIZ_QUESTIONS.bodyConcerns,
                    options: BODY_CONCERN_OPTIONS,
                }
            default:
                return {
                    title: 'What Are Your Concerns?',
                    subtitle: 'Select all that apply',
                    options: [],
                }
        }
    }

    const content = getContent()

    // Check if multi-select is allowed
    const isMultiSelect = bodyArea !== 'face' // Face is single select

    // Handle selection
    const handleSelect = (value: string) => {
        const concern = value as Concern
        if (isMultiSelect) {
            onToggleConcern(concern)
        } else {
            // Single select - replace selection
            if (!selectedConcerns.includes(concern)) {
                // Clear previous selections for this category and add new
                onToggleConcern(concern)
            }
        }
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
                    {content.options.map((option, index) => (
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
                                isSelected={selectedConcerns.includes(
                                    option.value as Concern
                                )}
                                onClick={() => handleSelect(option.value)}
                                size='md'
                            />
                        </motion.div>
                    ))}
                </OptionCardGrid>
            </motion.div>

            {/* Selection guidance */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className='text-center'
            >
                <p className='text-sm text-stone-500'>
                    {isMultiSelect
                        ? 'Select all that apply'
                        : 'Select your primary concern'}
                </p>
            </motion.div>
        </motion.div>
    )
}

/**
 * Wrapper components for specific body areas
 * (Can be used if simpler typing is preferred)
 */

export interface FaceConcernsStepProps {
    readonly selectedConcerns: readonly FaceConcern[]
    readonly onSelectConcern: (concern: FaceConcern) => void
    readonly className?: string
}

export function FaceConcernsStep({
    selectedConcerns,
    onSelectConcern,
    className,
}: FaceConcernsStepProps) {
    return (
        <ConcernsStep
            bodyArea='face'
            selectedConcerns={selectedConcerns}
            onToggleConcern={(c) => onSelectConcern(c as FaceConcern)}
            className={className}
        />
    )
}

export interface BreastConcernsStepProps {
    readonly selectedConcerns: readonly BreastConcern[]
    readonly onSelectConcern: (concern: BreastConcern) => void
    readonly className?: string
}

export function BreastConcernsStep({
    selectedConcerns,
    onSelectConcern,
    className,
}: BreastConcernsStepProps) {
    return (
        <ConcernsStep
            bodyArea='breast'
            selectedConcerns={selectedConcerns}
            onToggleConcern={(c) => onSelectConcern(c as BreastConcern)}
            className={className}
        />
    )
}

export interface BodyConcernsStepProps {
    readonly selectedConcerns: readonly BodyConcern[]
    readonly onSelectConcern: (concern: BodyConcern) => void
    readonly className?: string
}

export function BodyConcernsStep({
    selectedConcerns,
    onSelectConcern,
    className,
}: BodyConcernsStepProps) {
    return (
        <ConcernsStep
            bodyArea='body'
            selectedConcerns={selectedConcerns}
            onToggleConcern={(c) => onSelectConcern(c as BodyConcern)}
            className={className}
        />
    )
}
