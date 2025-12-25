'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { TrendingUp } from 'lucide-react'

import type { TopicSuggestion } from '@workspace/ai/functions'
import {
    GscKeywordSelector,
    type SelectedKeywords,
} from './gsc-keyword-selector.component'
import { GeneratedIdeasPanel } from './generated-ideas-panel.component'

type GscIdeasGeneratorDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type GenerateTopicsResponse = {
    success: boolean
    topics?: TopicSuggestion[]
    error?: string
}

/**
 * GSC Ideas Generator Dialog
 *
 * Full-screen dialog with side-by-side layout for generating
 * blog ideas from Google Search Console keywords.
 */
export function GscIdeasGeneratorDialog({
    open,
    onOpenChange,
}: GscIdeasGeneratorDialogProps) {
    const [selectedKeywords, setSelectedKeywords] = useState<SelectedKeywords>({
        primary: null,
        secondary: [],
    })
    const [ideas, setIdeas] = useState<TopicSuggestion[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [hasGenerated, setHasGenerated] = useState(false)

    // Generate ideas from selected keywords
    const handleGenerate = useCallback(async () => {
        if (
            !selectedKeywords.primary &&
            selectedKeywords.secondary.length === 0
        ) {
            toast.error('Please select at least one keyword')
            return
        }

        setIsGenerating(true)
        setHasGenerated(true)

        try {
            const response = await fetch('/api/blog/generate-topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selectedKeywords,
                    additionalContext:
                        'Generate ideas based on the provided Google Search Console keywords. These are real search queries that users are searching for.',
                }),
            })

            const data = (await response.json()) as GenerateTopicsResponse

            if (data.success && data.topics) {
                setIdeas(data.topics)
            } else {
                toast.error(data.error || 'Failed to generate ideas')
                setIdeas([])
            }
        } catch {
            toast.error('Failed to connect to AI service')
            setIdeas([])
        } finally {
            setIsGenerating(false)
        }
    }, [selectedKeywords])

    // Reset state when dialog closes
    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                setSelectedKeywords({ primary: null, secondary: [] })
                setIdeas([])
                setHasGenerated(false)
            }
            onOpenChange(isOpen)
        },
        [onOpenChange]
    )

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className='flex h-[85vh] max-h-[900px] w-[95vw] max-w-6xl flex-col p-0'
                size='xl'
            >
                <DialogHeader className='border-b px-6 py-4'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-orange-100'>
                            <TrendingUp className='h-5 w-5 text-amber-600' />
                        </div>
                        <div>
                            <DialogTitle className='text-lg'>
                                Ideas from Search Data
                            </DialogTitle>
                            <DialogDescription>
                                Select keywords from Google Search Console and
                                generate AI-powered blog ideas
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className='flex flex-1 overflow-hidden'>
                    {/* Left Panel - Keyword Selector */}
                    <div className='flex w-[45%] flex-col border-r p-4'>
                        <GscKeywordSelector
                            selectedKeywords={selectedKeywords}
                            onSelectionChange={setSelectedKeywords}
                        />
                    </div>

                    {/* Right Panel - Generated Ideas */}
                    <div className='flex w-[55%] flex-col p-4'>
                        <GeneratedIdeasPanel
                            selectedKeywords={selectedKeywords}
                            ideas={ideas}
                            isGenerating={isGenerating}
                            onGenerate={handleGenerate}
                            hasGenerated={hasGenerated}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
