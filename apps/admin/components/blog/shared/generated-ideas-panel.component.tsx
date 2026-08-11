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
    ShieldCheck,
    ShieldAlert,
    RefreshCw,
    Search,
} from 'lucide-react'

import { useCreatePipelinePost } from '@/hooks/use-pipeline.hook'
import type { TopicSuggestion, GscTopicSeed } from '@workspace/ai/functions'
import type { TopicVerdict } from '@workspace/shared/seo'
import { CONTENT_TYPE_LABELS } from '@/lib/constants/blog-content.constant'

type SelectedKeywords = {
    primary: string | null
    secondary: string[]
}

/** Topic suggestion decorated with its ideation-gate verdict */
export type GatedTopicSuggestion = TopicSuggestion & {
    gate?: TopicVerdict
}

type GeneratedIdeasPanelProps = {
    selectedKeywords: SelectedKeywords
    ideas: GatedTopicSuggestion[]
    /** Seeds used in Search Console mode — keyed back via idea.sourceQuery */
    gscSeeds?: GscTopicSeed[]
    isGenerating: boolean
    onGenerate: () => void
    /** Generate headlessly from live Search Console demand */
    onGenerateFromGsc?: () => void
    hasGenerated: boolean
}

/** "1.2k impressions · CTR 0.8% · position 14" sourcing line */
function SeedMetrics({ seed }: { seed: GscTopicSeed }) {
    const impressions =
        seed.impressions >= 1000
            ? `${(seed.impressions / 1000).toFixed(1)}k`
            : String(seed.impressions)
    const label =
        seed.source === 'gap'
            ? 'no owning page'
            : seed.source === 'decay'
              ? 'position dropping'
              : 'low CTR'
    return (
        <p className='mt-2 flex items-center gap-1.5 text-xs text-stone-500'>
            <Search className='h-3 w-3 shrink-0' />
            <span>
                &ldquo;{seed.query}&rdquo; — {impressions} impressions · CTR{' '}
                {(seed.ctr * 100).toFixed(1)}% · position{' '}
                {seed.position.toFixed(0)} · {label}
            </span>
        </p>
    )
}

/** Verdict badge + reason line for an idea card */
function GateVerdictBadge({ gate }: { gate: TopicVerdict }) {
    if (gate.verdict === 'new') {
        return (
            <Badge className='gap-1 border-green-200 bg-green-50 text-green-700'>
                <ShieldCheck className='h-3 w-3' />
                New topic
            </Badge>
        )
    }
    if (gate.verdict === 'refresh') {
        return (
            <Badge className='gap-1 border-amber-200 bg-amber-50 text-amber-700'>
                <RefreshCw className='h-3 w-3' />
                Refresh {gate.owningUrl}
            </Badge>
        )
    }
    return (
        <Badge className='gap-1 border-red-200 bg-red-50 text-red-700'>
            <ShieldAlert className='h-3 w-3' />
            Rejected{gate.owningUrl ? ` — owned by ${gate.owningUrl}` : ''}
        </Badge>
    )
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
    gscSeeds,
    isGenerating,
    onGenerate,
    onGenerateFromGsc,
    hasGenerated,
}: GeneratedIdeasPanelProps) {
    const createPipelinePost = useCreatePipelinePost()
    const [addedIds, setAddedIds] = useState<Set<number>>(new Set())

    const seedsByQuery = new Map(
        (gscSeeds ?? []).map((seed) => [seed.query, seed])
    )

    const hasSelectedKeywords =
        selectedKeywords.primary !== null ||
        selectedKeywords.secondary.length > 0

    const handleAddToPipeline = async (
        idea: GatedTopicSuggestion,
        index: number
    ) => {
        try {
            const result = await createPipelinePost.mutateAsync({
                title: idea.title,
                primaryKeyword:
                    selectedKeywords.primary || idea.primaryKeyword || null,
                secondaryKeywords:
                    selectedKeywords.secondary.length > 0
                        ? selectedKeywords.secondary
                        : null,
                priority: 'medium',
                planningData: {
                    topic: idea.description,
                    uniqueAngle: idea.uniqueAngle || undefined,
                    contentType: idea.suggestedContentType || undefined,
                    targetAudience: idea.targetAudience || undefined,
                    painPoints: idea.painPoints || undefined,
                    estimatedWordCount: idea.estimatedWordCount ?? undefined,
                },
            })

            if (result.success) {
                setAddedIds((prev) => new Set([...prev, index]))
                toast.success('Post added to pipeline!')
            } else {
                toast.error(result.error || 'Failed to add post')
            }
        } catch (error) {
            console.error('Error adding post to pipeline:', error)
            toast.error(
                error instanceof Error ? error.message : 'Failed to add post'
            )
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
                <div className='flex items-center gap-2'>
                    {onGenerateFromGsc && (
                        <Button
                            variant='outline'
                            onClick={onGenerateFromGsc}
                            disabled={isGenerating}
                            className='gap-2'
                        >
                            <Search className='h-4 w-4' />
                            From Search Console
                        </Button>
                    )}
                    <Button
                        onClick={onGenerate}
                        disabled={!hasSelectedKeywords || isGenerating}
                        className='gap-2'
                    >
                        <Sparkles className='h-4 w-4' />
                        {isGenerating ? 'Generating...' : 'Generate Ideas'}
                    </Button>
                </div>
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
                            left, then click &quot;Generate Ideas&quot; — or use
                            &quot;From Search Console&quot; to propose topics
                            straight from live demand data (opportunities, gaps
                            and dropping rankings).
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
                            const isBlocked =
                                idea.gate !== undefined &&
                                idea.gate.verdict !== 'new'
                            const seed = idea.sourceQuery
                                ? seedsByQuery.get(idea.sourceQuery)
                                : undefined

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
                                                    isBlocked ||
                                                    createPipelinePost.isPending
                                                }
                                                onClick={() =>
                                                    handleAddToPipeline(
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
                                            {idea.gate && (
                                                <GateVerdictBadge
                                                    gate={idea.gate}
                                                />
                                            )}
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
                                        {seed && <SeedMetrics seed={seed} />}
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
                                        {idea.gate &&
                                            idea.gate.verdict !== 'new' && (
                                                <p className='mt-2 text-xs text-red-600/80'>
                                                    {idea.gate.reason}
                                                </p>
                                            )}
                                        {idea.gate?.warnings.map((warning) => (
                                            <p
                                                key={warning}
                                                className='mt-1 text-xs text-amber-600/90'
                                            >
                                                {warning}
                                            </p>
                                        ))}
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
