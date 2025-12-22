'use client'

import { Button } from '@workspace/ui/components/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import type { GenerateBlogOutlineResult } from '@workspace/ai/functions'

type Step4OutlineProps = {
    outline: GenerateBlogOutlineResult | null
    onNext: () => void
    onBack: () => void
}

export function Step4Outline({ outline, onNext, onBack }: Step4OutlineProps) {
    const data = outline

    return (
        <div className='space-y-6'>
            <p className='text-muted-foreground text-sm'>
                Review the generated outline. You can edit it later.
            </p>

            <div className='max-h-[400px] space-y-4 overflow-y-auto rounded-lg border bg-stone-50 p-4'>
                {data?.tldr && (
                    <div>
                        <h4 className='mb-2 text-sm font-medium'>TL;DR</h4>
                        <ul className='list-inside list-disc space-y-1 text-sm'>
                            {data.tldr.map((point, i) => (
                                <li key={i}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {data?.sections && (
                    <div>
                        <h4 className='mb-2 text-sm font-medium'>Sections</h4>
                        <ol className='list-inside list-decimal space-y-2 text-sm'>
                            {data.sections.map((section, i) => (
                                <li key={i}>
                                    <span className='font-medium'>
                                        {section.title}
                                    </span>
                                    <p className='text-muted-foreground ml-5 text-xs'>
                                        {section.description}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {data?.totalEstimatedWords && (
                    <p className='text-muted-foreground text-xs'>
                        Estimated: ~{data.totalEstimatedWords} words
                    </p>
                )}
            </div>

            <div className='flex gap-2'>
                <Button variant='outline' onClick={onBack}>
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>
                <Button onClick={onNext} className='flex-1'>
                    Continue
                    <ChevronRight className='ml-2 h-4 w-4' />
                </Button>
            </div>
        </div>
    )
}
