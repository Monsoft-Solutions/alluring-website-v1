'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    Sparkles,
    Plus,
    Check,
    FileText,
    Target,
    AlertCircle,
    Users,
} from 'lucide-react'

import { useCreateIdea } from '@/hooks/use-ideas.hook'
import type { TopicSuggestion } from '@workspace/ai/functions'
import type { SelectedKeywords } from './gsc-keyword-selector.component'

type GeneratedIdeasPanelProps = {
    selectedKeywords: SelectedKeywords
    ideas: TopicSuggestion[]
    isGenerating: boolean
    onGenerate: () => void
    hasGenerated: boolean
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
    tutorial: 'Tutorial',
    guide: 'Guide',
    how_to: 'How-To',
    case_study: 'Case Study',
    comparison: 'Comparison',
    faq: 'FAQ',
    listicle: 'Listicle',
    announcement: 'Announcement',
    thought_leadership: 'Thought Leadership',
}

/**
 * Generated Ideas Panel
 *
 * Right panel component that displays AI-generated blog ideas
 * based on selected keywords. Allows one-click add to backlog.
 */
export function GeneratedIdeasPanel({
    selectedKeywords,
    ideas,
    isGenerating,
    onGenerate,
    hasGenerated,
}: GeneratedIdeasPanelProps) {
    const createIdea = useCreateIdea()
    const [addedIds, setAddedIds] = useState<Set<number>>(new Set())

    const hasSelectedKeywords =
        selectedKeywords.primary !== null ||
        selectedKeywords.secondary.length > 0

    const handleAddToBacklog = async (idea: TopicSuggestion, index: number) => {
        const result = await createIdea.mutateAsync({
            title: idea.title,
            topic: idea.description,
            primaryKeyword:
                selectedKeywords.primary || idea.primaryKeyword || null,
            secondaryKeywords:
                selectedKeywords.secondary.length > 0
                    ? selectedKeywords.secondary
                    : null,
            contentType: idea.suggestedContentType ?? null,
            uniqueAngle: idea.uniqueAngle || null,
            targetAudience: idea.targetAudience || null,
            painPoints: idea.painPoints || null,
            estimatedWordCount: idea.estimatedWordCount ?? null,
            priority: 'medium',
            stage: 'backlog',
        })

        if (result.success) {
            setAddedIds((prev) => new Set([...prev, index]))
            toast.success('Idea added to backlog!')
        } else {
            toast.error(result.error || 'Failed to add idea')
        }
    }

    return (
        <div className='flex h-full flex-col'>
            <div className='mb-4 flex items-center justify-between'>
                <div>
                    <h3 className='mb-1 text-sm font-medium'>
                        Generated Ideas
                    </h3>
                    <p className='text-muted-foreground text-xs'>
                        AI-powered blog post suggestions based on your keywords
                    </p>
                </div>
                <Button
                    onClick={onGenerate}
                    disabled={!hasSelectedKeywords || isGenerating}
                    className='gap-2'
                >
                    <Sparkles className='h-4 w-4' />
                    {isGenerating ? 'Generating...' : 'Generate Ideas'}
                </Button>
            </div>

            <div className='flex-1 overflow-y-auto'>
                {!hasSelectedKeywords && !hasGenerated ? (
                    <div className='flex h-full flex-col items-center justify-center text-center'>
                        <Target className='text-muted-foreground mb-4 h-12 w-12' />
                        <h4 className='mb-2 font-medium'>
                            Select Keywords First
                        </h4>
                        <p className='text-muted-foreground max-w-sm text-sm'>
                            Choose keywords from the Search Console data on the
                            left, then click &quot;Generate Ideas&quot; to get
                            AI-powered blog post suggestions.
                        </p>
                    </div>
                ) : isGenerating ? (
                    <div className='space-y-4'>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader className='pb-3'>
                                    <Skeleton className='mb-2 h-5 w-3/4' />
                                    <Skeleton className='h-4 w-full' />
                                    <Skeleton className='h-4 w-2/3' />
                                </CardHeader>
                                <CardContent>
                                    <div className='flex items-center gap-2'>
                                        <Skeleton className='h-5 w-16' />
                                        <Skeleton className='h-5 w-20' />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : ideas.length > 0 ? (
                    <div className='space-y-4'>
                        {ideas.map((idea, index) => {
                            const isAdded = addedIds.has(index)

                            return (
                                <Card
                                    key={index}
                                    className={
                                        isAdded
                                            ? 'border-green-200 bg-green-50/50'
                                            : ''
                                    }
                                >
                                    <CardHeader className='pb-3'>
                                        <div className='flex items-start justify-between gap-3'>
                                            <div className='flex-1'>
                                                <CardTitle className='text-base leading-tight'>
                                                    {idea.title}
                                                </CardTitle>
                                                <CardDescription className='mt-1.5'>
                                                    {idea.description}
                                                </CardDescription>
                                            </div>
                                            <Button
                                                size='sm'
                                                variant={
                                                    isAdded
                                                        ? 'outline'
                                                        : 'default'
                                                }
                                                disabled={
                                                    isAdded ||
                                                    createIdea.isPending
                                                }
                                                onClick={() =>
                                                    handleAddToBacklog(
                                                        idea,
                                                        index
                                                    )
                                                }
                                                className={
                                                    isAdded
                                                        ? 'border-green-500 text-green-600'
                                                        : ''
                                                }
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check className='mr-1.5 h-4 w-4' />
                                                        Added
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className='mr-1.5 h-4 w-4' />
                                                        Add
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className='pt-0'>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            <Badge
                                                variant='outline'
                                                className='gap-1'
                                            >
                                                <Target className='h-3 w-3' />
                                                {idea.primaryKeyword}
                                            </Badge>
                                            {idea.suggestedContentType && (
                                                <Badge variant='secondary'>
                                                    <FileText className='mr-1 h-3 w-3' />
                                                    {CONTENT_TYPE_LABELS[
                                                        idea
                                                            .suggestedContentType
                                                    ] ||
                                                        idea.suggestedContentType}
                                                </Badge>
                                            )}
                                            {idea.searchIntent && (
                                                <Badge
                                                    variant='outline'
                                                    className='text-muted-foreground'
                                                >
                                                    {idea.searchIntent}
                                                </Badge>
                                            )}
                                        </div>
                                        {idea.targetAudience && (
                                            <p className='mt-3 flex items-start gap-1.5 text-xs text-stone-600'>
                                                <Users className='mt-0.5 h-3 w-3 shrink-0' />
                                                <span>
                                                    {idea.targetAudience}
                                                </span>
                                            </p>
                                        )}
                                        {idea.uniqueAngle && (
                                            <p className='text-muted-foreground mt-2 text-xs'>
                                                <span className='font-medium'>
                                                    Unique angle:
                                                </span>{' '}
                                                {idea.uniqueAngle}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                ) : hasGenerated ? (
                    <div className='flex h-full flex-col items-center justify-center text-center'>
                        <AlertCircle className='text-muted-foreground mb-4 h-12 w-12' />
                        <h4 className='mb-2 font-medium'>No Ideas Generated</h4>
                        <p className='text-muted-foreground max-w-sm text-sm'>
                            The AI couldn&apos;t generate ideas for these
                            keywords. Try selecting different keywords or adding
                            more context.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    )
}
