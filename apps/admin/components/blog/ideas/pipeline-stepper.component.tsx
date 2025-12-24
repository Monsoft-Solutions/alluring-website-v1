'use client'

import {
    Check,
    Loader2,
    Search,
    BookOpen,
    Shield,
    Wand2,
    FileText,
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import type { DialogStep } from '@/lib/types/blog/pipeline.type'

type PipelineStepperProps = {
    currentStep: DialogStep
    progress: number
}

type StepConfig = {
    id: string
    label: string
    shortLabel: string
    icon: React.ComponentType<{ className?: string }>
    matchSteps: DialogStep[]
}

const STEPS: StepConfig[] = [
    {
        id: 'research',
        label: 'Research',
        shortLabel: 'Research',
        icon: Search,
        matchSteps: ['research'],
    },
    {
        id: 'generate',
        label: 'Generate',
        shortLabel: 'Generate',
        icon: BookOpen,
        matchSteps: ['content-generation', 'link-integration'],
    },
    {
        id: 'review',
        label: 'Review',
        shortLabel: 'Review',
        icon: Shield,
        matchSteps: [
            'review-internal-links',
            'review-external-links',
            'review-writing-quality',
            'review-ai-slop',
        ],
    },
    {
        id: 'revise',
        label: 'Revise',
        shortLabel: 'Revise',
        icon: Wand2,
        matchSteps: ['orchestration'],
    },
    {
        id: 'save',
        label: 'Save',
        shortLabel: 'Save',
        icon: FileText,
        matchSteps: ['saving', 'complete'],
    },
]

function getStepStatus(
    step: StepConfig,
    currentStep: DialogStep,
    progress: number
): 'pending' | 'active' | 'complete' {
    const stepIndex = STEPS.findIndex((s) => s.id === step.id)
    const currentStepIndex = STEPS.findIndex((s) =>
        s.matchSteps.includes(currentStep)
    )

    if (currentStep === 'complete' && step.id === 'save') {
        return 'complete'
    }

    if (currentStepIndex === -1) {
        return 'pending'
    }

    if (stepIndex < currentStepIndex) {
        return 'complete'
    }

    if (stepIndex === currentStepIndex) {
        return 'active'
    }

    return 'pending'
}

/**
 * Compact horizontal pipeline stepper showing all 5 phases
 * with connected progress line and animated active state.
 */
export function PipelineStepper({
    currentStep,
    progress,
}: PipelineStepperProps) {
    return (
        <div className='relative'>
            {/* Progress line background */}
            <div className='absolute top-4 right-8 left-8 h-0.5 bg-stone-200' />

            {/* Progress line fill */}
            <div
                className='absolute top-4 left-8 h-0.5 bg-amber-500 transition-all duration-500'
                style={{
                    width: `calc(${Math.min(progress, 100)}% - 4rem)`,
                }}
            />

            {/* Steps */}
            <div className='relative flex justify-between'>
                {STEPS.map((step) => {
                    const status = getStepStatus(step, currentStep, progress)
                    const Icon = step.icon

                    return (
                        <div
                            key={step.id}
                            className='flex flex-col items-center gap-1'
                        >
                            {/* Step circle */}
                            <div
                                className={cn(
                                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300',
                                    status === 'complete' &&
                                        'border-green-500 bg-green-500',
                                    status === 'active' &&
                                        'border-amber-500 bg-amber-50',
                                    status === 'pending' &&
                                        'border-stone-200 bg-white'
                                )}
                            >
                                {status === 'complete' ? (
                                    <Check className='h-4 w-4 text-white' />
                                ) : status === 'active' ? (
                                    <Loader2 className='h-4 w-4 animate-spin text-amber-600' />
                                ) : (
                                    <Icon className='h-4 w-4 text-stone-400' />
                                )}
                            </div>

                            {/* Step label */}
                            <span
                                className={cn(
                                    'text-xs font-medium transition-colors',
                                    status === 'complete' && 'text-green-600',
                                    status === 'active' && 'text-amber-600',
                                    status === 'pending' && 'text-stone-400'
                                )}
                            >
                                {step.shortLabel}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
