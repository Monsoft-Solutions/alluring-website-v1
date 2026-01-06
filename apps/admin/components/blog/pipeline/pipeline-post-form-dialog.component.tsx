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
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Badge } from '@workspace/ui/components/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible'
import { ChevronDown, Sparkles, X } from 'lucide-react'

import type { TopicSuggestion } from '@workspace/ai/functions'
import {
    SEARCH_INTENTS,
    type SearchIntent,
} from '@/lib/constants/blog-ideas.constant'
import { GscKeywordPicker } from '@/components/blog/ideas/gsc-keyword-picker.component'
import { GeneratedIdeasPanel } from '@/components/blog/ideas/generated-ideas-panel.component'
import { getProcedureOptions } from '@/lib/data/procedure-context.data'
import { fetchApi, buildUrl, ApiError } from '@/lib/utils/api-client.util'

type PipelinePostFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

type ContextHints = {
    procedureSlug: string
    searchIntent: SearchIntent
    targetAudience: string
    uniqueAngle: string
}

type SelectedKeywords = {
    primary: string | null
    secondary: string[]
}

type GenerateTopicsResponse = {
    success: boolean
    topics?: TopicSuggestion[]
    error?: string
}

const initialContextHints: ContextHints = {
    procedureSlug: '',
    searchIntent: 'mixed',
    targetAudience: '',
    uniqueAngle: '',
}

const procedureOptions = getProcedureOptions()

/**
 * Dialog for generating blog ideas and adding them to the content pipeline
 *
 * Side-by-side layout with:
 * - Left panel: Keyword selection + procedure picker + advanced options
 * - Right panel: AI-generated ideas with one-click add to pipeline
 */
export function PipelinePostFormDialog({
    open,
    onOpenChange,
}: PipelinePostFormDialogProps) {
    // Form state
    const [primaryKeyword, setPrimaryKeyword] = useState('')
    const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([])
    const [contextHints, setContextHints] =
        useState<ContextHints>(initialContextHints)
    const [advancedOpen, setAdvancedOpen] = useState(false)

    // Generation state
    const [ideas, setIdeas] = useState<TopicSuggestion[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [hasGenerated, setHasGenerated] = useState(false)

    // Build selectedKeywords object for GeneratedIdeasPanel
    const selectedKeywords: SelectedKeywords = {
        primary: primaryKeyword || null,
        secondary: secondaryKeywords,
    }

    const handleContextChange = (field: keyof ContextHints, value: string) => {
        setContextHints((prev) => ({ ...prev, [field]: value }))
    }

    const handleRemoveSecondaryKeyword = (keyword: string) => {
        setSecondaryKeywords((prev) => prev.filter((k) => k !== keyword))
    }

    const resetForm = useCallback(() => {
        setPrimaryKeyword('')
        setSecondaryKeywords([])
        setContextHints(initialContextHints)
        setAdvancedOpen(false)
        setIdeas([])
        setHasGenerated(false)
    }, [])

    // Generate ideas from selected keywords and context
    const handleGenerate = useCallback(async () => {
        if (!primaryKeyword && secondaryKeywords.length === 0) {
            toast.error('Please enter a keyword or select from Search Console')
            return
        }

        setIsGenerating(true)
        setHasGenerated(true)

        try {
            const data = await fetchApi<GenerateTopicsResponse>(
                buildUrl('/api/blog/generate-topics'),
                {
                    method: 'POST',
                    body: {
                        selectedKeywords: {
                            primary: primaryKeyword || null,
                            secondary: secondaryKeywords,
                        },
                        contextHints: {
                            procedureSlug:
                                contextHints.procedureSlug || undefined,
                            searchIntent:
                                contextHints.searchIntent || undefined,
                            targetAudience:
                                contextHints.targetAudience || undefined,
                            uniqueAngle: contextHints.uniqueAngle || undefined,
                        },
                    },
                }
            )

            if (data.success && data.topics) {
                setIdeas(data.topics)
            } else {
                toast.error(data.error || 'Failed to generate ideas')
                setIdeas([])
            }
        } catch (error) {
            if (error instanceof ApiError) {
                toast.error(error.message || 'Failed to generate ideas')
            } else {
                toast.error('Failed to connect to AI service')
            }
            setIdeas([])
        } finally {
            setIsGenerating(false)
        }
    }, [primaryKeyword, secondaryKeywords, contextHints])

    // Reset state when dialog closes
    const handleOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                resetForm()
            }
            onOpenChange(isOpen)
        },
        [onOpenChange, resetForm]
    )

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className='flex h-[85vh] max-h-[900px] w-[95vw] max-w-6xl flex-col p-0'
                size='xl'
            >
                <DialogHeader className='border-b px-6 py-4'>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-100 to-purple-100'>
                            <Sparkles className='h-5 w-5 text-violet-600' />
                        </div>
                        <div>
                            <DialogTitle className='text-lg'>
                                Generate Blog Ideas
                            </DialogTitle>
                            <DialogDescription>
                                Enter keywords and context to generate
                                AI-powered blog post ideas
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className='flex flex-1 overflow-hidden'>
                    {/* Left Panel - Input Form */}
                    <div className='flex w-[45%] flex-col overflow-y-auto border-r p-4'>
                        <div className='space-y-4'>
                            {/* Primary Keyword */}
                            <div className='space-y-2'>
                                <Label htmlFor='primaryKeyword'>
                                    Primary Keyword{' '}
                                    <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    id='primaryKeyword'
                                    placeholder='e.g., bbl recovery'
                                    value={primaryKeyword}
                                    onChange={(e) =>
                                        setPrimaryKeyword(e.target.value)
                                    }
                                    autoFocus
                                />
                            </div>

                            {/* GSC Keyword Picker */}
                            <GscKeywordPicker
                                primaryKeyword={primaryKeyword}
                                secondaryKeywords={secondaryKeywords}
                                onPrimaryChange={setPrimaryKeyword}
                                onSecondaryChange={setSecondaryKeywords}
                            />

                            {/* Secondary Keywords */}
                            {secondaryKeywords.length > 0 && (
                                <div className='space-y-2'>
                                    <Label>Secondary Keywords</Label>
                                    <div className='flex flex-wrap gap-2'>
                                        {secondaryKeywords.map((keyword) => (
                                            <Badge
                                                key={keyword}
                                                variant='secondary'
                                                className='gap-1 pr-1'
                                            >
                                                {keyword}
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        handleRemoveSecondaryKeyword(
                                                            keyword
                                                        )
                                                    }
                                                    className='hover:bg-muted rounded p-0.5'
                                                    aria-label={`Remove ${keyword}`}
                                                >
                                                    <X className='h-3 w-3' />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Procedure Selector */}
                            <div className='space-y-2'>
                                <Label>Procedure Focus</Label>
                                <Select
                                    value={contextHints.procedureSlug}
                                    onValueChange={(value) =>
                                        handleContextChange(
                                            'procedureSlug',
                                            value
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select a procedure (optional)' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {procedureOptions.map((procedure) => (
                                            <SelectItem
                                                key={procedure.value}
                                                value={procedure.value}
                                            >
                                                {procedure.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className='text-muted-foreground text-xs'>
                                    Selecting a procedure adds relevant context
                                    like pain points and keywords to the AI
                                </p>
                            </div>

                            {/* Advanced Options - Collapsible */}
                            <Collapsible
                                open={advancedOpen}
                                onOpenChange={setAdvancedOpen}
                            >
                                <CollapsibleTrigger asChild>
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        className='flex w-full items-center justify-between p-0 hover:bg-transparent'
                                    >
                                        <span className='text-sm font-medium'>
                                            Advanced Options
                                        </span>
                                        <ChevronDown
                                            className={`h-4 w-4 transition-transform ${
                                                advancedOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className='mt-3 space-y-4'>
                                    {/* Search Intent */}
                                    <div className='space-y-2'>
                                        <Label>Search Intent</Label>
                                        <Select
                                            value={contextHints.searchIntent}
                                            onValueChange={(value) =>
                                                handleContextChange(
                                                    'searchIntent',
                                                    value as SearchIntent
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SEARCH_INTENTS.map(
                                                    (intent) => (
                                                        <SelectItem
                                                            key={intent.value}
                                                            value={intent.value}
                                                        >
                                                            <div className='flex flex-col'>
                                                                <span>
                                                                    {
                                                                        intent.label
                                                                    }
                                                                </span>
                                                                <span className='text-muted-foreground text-xs'>
                                                                    {
                                                                        intent.description
                                                                    }
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Target Audience */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='targetAudience'>
                                            Target Audience
                                        </Label>
                                        <Input
                                            id='targetAudience'
                                            placeholder='e.g., Women 25-45 considering BBL surgery'
                                            value={contextHints.targetAudience}
                                            onChange={(e) =>
                                                handleContextChange(
                                                    'targetAudience',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Unique Angle */}
                                    <div className='space-y-2'>
                                        <Label htmlFor='uniqueAngle'>
                                            Unique Angle
                                        </Label>
                                        <Textarea
                                            id='uniqueAngle'
                                            placeholder='e.g., First-person perspective from a nurse who has helped 500+ patients recover'
                                            value={contextHints.uniqueAngle}
                                            onChange={(e) =>
                                                handleContextChange(
                                                    'uniqueAngle',
                                                    e.target.value
                                                )
                                            }
                                            rows={2}
                                        />
                                        <p className='text-muted-foreground text-xs'>
                                            What makes this content different
                                            from competitors?
                                        </p>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
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
