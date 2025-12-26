'use client'

import { Button } from '@workspace/ui/components/button'
import { Loader2, Check, ChevronLeft } from 'lucide-react'

type WizardState = {
    refinedTitle: string
    refinedKeyword: string
    refinedAngle: string
    contentType: string
}

type Step5SaveProps = {
    state: WizardState
    onSave: () => void
    onBack: () => void
    isLoading: boolean
}

export function Step5Save({
    state,
    onSave,
    onBack,
    isLoading,
}: Step5SaveProps) {
    return (
        <div className='space-y-6'>
            <div className='rounded-lg border bg-stone-50 p-4'>
                <h4 className='mb-3 font-medium'>{state.refinedTitle}</h4>
                <div className='space-y-2 text-sm'>
                    <p>
                        <span className='text-muted-foreground'>Keyword:</span>{' '}
                        {state.refinedKeyword}
                    </p>
                    <p>
                        <span className='text-muted-foreground'>Angle:</span>{' '}
                        {state.refinedAngle}
                    </p>
                    <p>
                        <span className='text-muted-foreground'>Type:</span>{' '}
                        {state.contentType || 'Guide'}
                    </p>
                </div>
            </div>

            <p className='text-muted-foreground text-sm'>
                Your idea will be saved to the Backlog. You can generate the
                full content later.
            </p>

            <div className='flex gap-2'>
                <Button variant='outline' onClick={onBack}>
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>
                <Button
                    onClick={onSave}
                    disabled={isLoading}
                    className='flex-1'
                >
                    {isLoading ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                        <Check className='mr-2 h-4 w-4' />
                    )}
                    Save to Pipeline
                </Button>
            </div>
        </div>
    )
}
