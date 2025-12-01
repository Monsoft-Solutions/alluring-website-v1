/**
 * Feedback Step Indicator Component
 *
 * Progress indicator for the multi-step beta feedback form.
 * Shows current step, completed steps, and remaining steps.
 *
 * @module components/feedback/feedback-step-indicator
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { Check } from 'lucide-react'

import { FEEDBACK_STEP_INFO } from '@/lib/types/forms/beta-feedback.type'

type FeedbackStepIndicatorProps = {
    readonly currentStep: number
    readonly totalSteps: number
}

export function FeedbackStepIndicator({
    currentStep,
    totalSteps,
}: FeedbackStepIndicatorProps) {
    return (
        <div className='mb-8'>
            {/* Progress bar */}
            <div className='relative mb-4'>
                <div className='bg-border h-2 overflow-hidden rounded-full'>
                    <div
                        className='bg-primary h-full rounded-full transition-all duration-500 ease-out'
                        style={{
                            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                        }}
                    />
                </div>
            </div>

            {/* Step indicators - mobile: show current only */}
            <div className='flex items-center justify-between md:hidden'>
                <span className='text-muted-foreground text-sm'>
                    Step {currentStep} of {totalSteps}
                </span>
                <span className='text-foreground text-sm font-medium'>
                    {FEEDBACK_STEP_INFO[currentStep - 1]?.title}
                </span>
            </div>

            {/* Step indicators - desktop: show all */}
            <div className='hidden gap-2 md:flex'>
                {FEEDBACK_STEP_INFO.slice(0, totalSteps).map((step, index) => {
                    const stepNumber = index + 1
                    const isCompleted = stepNumber < currentStep
                    const isCurrent = stepNumber === currentStep
                    const isPending = stepNumber > currentStep

                    return (
                        <div
                            key={step.number}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-2'
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300',
                                    isCompleted &&
                                        'bg-primary text-primary-foreground',
                                    isCurrent &&
                                        'bg-primary text-primary-foreground ring-primary/30 ring-4',
                                    isPending &&
                                        'bg-muted text-muted-foreground'
                                )}
                            >
                                {isCompleted ? (
                                    <Check className='h-4 w-4' />
                                ) : (
                                    stepNumber
                                )}
                            </div>
                            <span
                                className={cn(
                                    'text-center text-xs transition-colors',
                                    isCurrent
                                        ? 'text-foreground font-medium'
                                        : 'text-muted-foreground'
                                )}
                            >
                                {step.title}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
