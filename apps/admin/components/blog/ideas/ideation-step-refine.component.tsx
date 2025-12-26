'use client'

import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Button } from '@workspace/ui/components/button'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

type WizardState = {
    refinedTitle: string
    refinedKeyword: string
    refinedAngle: string
}

type Step3RefineProps = {
    state: WizardState
    updateState: (updates: Partial<WizardState>) => void
    onNext: () => void
    onBack: () => void
    isLoading: boolean
}

export function Step3Refine({
    state,
    updateState,
    onNext,
    onBack,
    isLoading,
}: Step3RefineProps) {
    return (
        <div className='space-y-6'>
            <p className='text-muted-foreground text-sm'>
                Refine the selected topic before generating an outline.
            </p>

            <div className='space-y-4'>
                <div className='space-y-2'>
                    <Label htmlFor='title'>Title</Label>
                    <Input
                        id='title'
                        value={state.refinedTitle}
                        onChange={(e) =>
                            updateState({ refinedTitle: e.target.value })
                        }
                    />
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='keyword'>Primary Keyword</Label>
                    <Input
                        id='keyword'
                        value={state.refinedKeyword}
                        onChange={(e) =>
                            updateState({ refinedKeyword: e.target.value })
                        }
                    />
                </div>

                <div className='space-y-2'>
                    <Label htmlFor='angle'>Unique Angle</Label>
                    <Textarea
                        id='angle'
                        value={state.refinedAngle}
                        onChange={(e) =>
                            updateState({ refinedAngle: e.target.value })
                        }
                        rows={2}
                    />
                </div>
            </div>

            <div className='flex gap-2'>
                <Button variant='outline' onClick={onBack}>
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={isLoading || !state.refinedTitle}
                    className='flex-1'
                >
                    {isLoading ? (
                        <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Generating Outline...
                        </>
                    ) : (
                        <>
                            Generate Outline
                            <ChevronRight className='ml-2 h-4 w-4' />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
