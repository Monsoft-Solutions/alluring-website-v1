'use client'

import { Label } from '@workspace/ui/components/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import {
    RadioGroup,
    RadioGroupItem,
} from '@workspace/ui/components/radio-group'
import { Textarea } from '@workspace/ui/components/textarea'
import { Button } from '@workspace/ui/components/button'
import { Loader2, Sparkles } from 'lucide-react'

import {
    AUDIENCES,
    CONTENT_TYPES,
    PROCEDURES,
} from '@/lib/constants/blog-ideas.constant'

type WizardState = {
    procedureFocus: string
    contentType: string
    targetAudience: string
    additionalContext: string
}

type Step1ContextProps = {
    state: WizardState
    updateState: (updates: Partial<WizardState>) => void
    onNext: () => void
    isLoading: boolean
}

export function Step1Context({
    state,
    updateState,
    onNext,
    isLoading,
}: Step1ContextProps) {
    return (
        <div className='space-y-6'>
            <div className='space-y-4'>
                <div className='space-y-2'>
                    <Label>Procedure Focus</Label>
                    <Select
                        value={state.procedureFocus}
                        onValueChange={(v) =>
                            updateState({ procedureFocus: v })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder='Select a procedure' />
                        </SelectTrigger>
                        <SelectContent>
                            {PROCEDURES.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='space-y-2'>
                    <Label>Content Type</Label>
                    <RadioGroup
                        value={state.contentType}
                        onValueChange={(v: string) =>
                            updateState({ contentType: v })
                        }
                        className='grid grid-cols-2 gap-2'
                    >
                        {CONTENT_TYPES.map((ct) => (
                            <div key={ct.value}>
                                <RadioGroupItem
                                    value={ct.value}
                                    id={ct.value}
                                    className='peer sr-only'
                                />
                                <Label
                                    htmlFor={ct.value}
                                    className='peer-data-[state=checked]:border-gold-500 peer-data-[state=checked]:bg-gold-50 flex cursor-pointer items-center justify-center rounded-lg border-2 border-stone-200 p-3 text-sm transition-colors hover:bg-stone-50'
                                >
                                    {ct.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className='space-y-2'>
                    <Label>Target Audience</Label>
                    <RadioGroup
                        value={state.targetAudience}
                        onValueChange={(v: string) =>
                            updateState({ targetAudience: v })
                        }
                        className='grid grid-cols-2 gap-2'
                    >
                        {AUDIENCES.map((a) => (
                            <div key={a.value}>
                                <RadioGroupItem
                                    value={a.value}
                                    id={a.value}
                                    className='peer sr-only'
                                />
                                <Label
                                    htmlFor={a.value}
                                    className='peer-data-[state=checked]:border-gold-500 peer-data-[state=checked]:bg-gold-50 flex cursor-pointer items-center justify-center rounded-lg border-2 border-stone-200 p-3 text-sm transition-colors hover:bg-stone-50'
                                >
                                    {a.label}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                <div className='space-y-2'>
                    <Label>Additional Context (optional)</Label>
                    <Textarea
                        placeholder="Any specific angles, questions, or topics you'd like to explore..."
                        value={state.additionalContext}
                        onChange={(e) =>
                            updateState({ additionalContext: e.target.value })
                        }
                        rows={2}
                    />
                </div>
            </div>

            <Button onClick={onNext} disabled={isLoading} className='w-full'>
                {isLoading ? (
                    <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Generating Topics...
                    </>
                ) : (
                    <>
                        <Sparkles className='mr-2 h-4 w-4' />
                        Generate Topic Ideas
                    </>
                )}
            </Button>
        </div>
    )
}
