'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Sparkles, Check } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

import { useCreatePipelinePost } from '@/hooks/use-pipeline.hook'
import type {
    TopicSuggestion,
    GenerateBlogOutlineResult,
} from '@workspace/ai/functions'
import { Step1Context } from './ideation-step-context.component'
import { Step2Topics } from './ideation-step-topics.component'
import { Step3Refine } from './ideation-step-refine.component'
import { Step4Outline } from './ideation-step-outline.component'
import { Step5Save } from './ideation-step-save.component'

type Step = 1 | 2 | 3 | 4 | 5

type WizardState = {
    procedureFocus: string
    contentType: string
    targetAudience: string
    additionalContext: string
    topics: TopicSuggestion[]
    selectedTopic: TopicSuggestion | null
    refinedTitle: string
    refinedKeyword: string
    refinedAngle: string
    outline: GenerateBlogOutlineResult | null
}

type IdeationWizardDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type GenerateTopicsResponse = {
    success: boolean
    topics?: TopicSuggestion[]
    error?: string
}

type GenerateOutlineResponse = GenerateBlogOutlineResult & {
    success: boolean
    error?: string
}

/**
 * Multi-step AI ideation wizard for generating blog ideas
 */
export function IdeationWizardDialog({
    open,
    onOpenChange,
}: IdeationWizardDialogProps) {
    const createPipelinePost = useCreatePipelinePost()

    const [step, setStep] = useState<Step>(1)
    const [isGenerating, setIsGenerating] = useState(false)
    const [state, setState] = useState<WizardState>({
        procedureFocus: '',
        contentType: '',
        targetAudience: '',
        additionalContext: '',
        topics: [],
        selectedTopic: null,
        refinedTitle: '',
        refinedKeyword: '',
        refinedAngle: '',
        outline: null,
    })

    const updateState = (updates: Partial<WizardState>) => {
        setState((prev) => ({ ...prev, ...updates }))
    }

    const handleGenerateTopics = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch('/api/blog/generate-topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    procedureFocus: state.procedureFocus,
                    contentType: state.contentType,
                    targetAudience: state.targetAudience,
                    additionalContext: state.additionalContext,
                }),
            })

            const data = (await response.json()) as GenerateTopicsResponse

            if (data.success && data.topics) {
                updateState({ topics: data.topics })
                setStep(2)
            } else {
                toast.error(data.error || 'Failed to generate topics')
            }
        } catch {
            toast.error('Failed to connect to AI service')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSelectTopic = (topic: TopicSuggestion) => {
        updateState({
            selectedTopic: topic,
            refinedTitle: topic.title,
            refinedKeyword: topic.primaryKeyword,
            refinedAngle: topic.uniqueAngle,
        })
        setStep(3)
    }

    const handleGenerateOutline = async () => {
        if (!state.selectedTopic) return

        setIsGenerating(true)
        try {
            const response = await fetch('/api/blog/generate-outline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: state.refinedTitle,
                    topic: state.selectedTopic.description,
                    primaryKeyword: state.refinedKeyword,
                    contentType: state.contentType || 'guide',
                    targetAudience: state.targetAudience,
                    uniqueAngle: state.refinedAngle,
                }),
            })

            const data = (await response.json()) as GenerateOutlineResponse

            if (data.success) {
                updateState({ outline: data })
                setStep(4)
            } else {
                toast.error(data.error || 'Failed to generate outline')
            }
        } catch {
            toast.error('Failed to connect to AI service')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveIdea = async () => {
        if (!state.selectedTopic) return

        // Build outline sections for planningData
        const outlineSections = state.outline
            ? (
                  state.outline as {
                      sections: Array<{
                          id: string
                          title: string
                          description: string
                      }>
                  }
              ).sections?.map((s) => ({
                  id: s.id,
                  title: s.title,
                  description: s.description,
              }))
            : undefined

        const result = await createPipelinePost.mutateAsync({
            title: state.refinedTitle,
            primaryKeyword: state.refinedKeyword,
            priority: 'medium',
            planningData: {
                topic: state.selectedTopic.description,
                uniqueAngle: state.refinedAngle || undefined,
                contentType:
                    state.contentType ||
                    state.selectedTopic.suggestedContentType ||
                    undefined,
                targetAudience: state.targetAudience || undefined,
                outline: outlineSections,
            },
        })

        if (result.success) {
            toast.success('Post added to pipeline!')
            onOpenChange(false)
            resetWizard()
        } else {
            toast.error(result.error || 'Failed to add post to pipeline')
        }
    }

    const resetWizard = () => {
        setStep(1)
        setState({
            procedureFocus: '',
            contentType: '',
            targetAudience: '',
            additionalContext: '',
            topics: [],
            selectedTopic: null,
            refinedTitle: '',
            refinedKeyword: '',
            refinedAngle: '',
            outline: null,
        })
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) resetWizard()
                onOpenChange(isOpen)
            }}
        >
            <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <Sparkles className='h-5 w-5 text-amber-500' />
                        AI Ideation Wizard
                    </DialogTitle>
                    <DialogDescription>
                        Let AI help you brainstorm blog post ideas
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Steps */}
                <div className='mb-6 flex items-center justify-center gap-2'>
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                                step >= s
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-stone-100 text-stone-400'
                            )}
                        >
                            {step > s ? <Check className='h-4 w-4' /> : s}
                        </div>
                    ))}
                </div>

                {/* Step 1: Context Setting */}
                {step === 1 && (
                    <Step1Context
                        state={state}
                        updateState={updateState}
                        onNext={handleGenerateTopics}
                        isLoading={isGenerating}
                    />
                )}

                {/* Step 2: Topic Selection */}
                {step === 2 && (
                    <Step2Topics
                        topics={state.topics}
                        onSelect={handleSelectTopic}
                        onBack={() => setStep(1)}
                        onRegenerate={handleGenerateTopics}
                        isLoading={isGenerating}
                    />
                )}

                {/* Step 3: Refinement */}
                {step === 3 && (
                    <Step3Refine
                        state={state}
                        updateState={updateState}
                        onNext={handleGenerateOutline}
                        onBack={() => setStep(2)}
                        isLoading={isGenerating}
                    />
                )}

                {/* Step 4: Outline Review */}
                {step === 4 && (
                    <Step4Outline
                        outline={state.outline}
                        onNext={() => setStep(5)}
                        onBack={() => setStep(3)}
                    />
                )}

                {/* Step 5: Save */}
                {step === 5 && (
                    <Step5Save
                        state={state}
                        onSave={handleSaveIdea}
                        onBack={() => setStep(4)}
                        isLoading={createPipelinePost.isPending}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
