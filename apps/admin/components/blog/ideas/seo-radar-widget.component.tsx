'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    Radar,
    Sparkles,
    Plus,
    Target,
    TrendingUp,
    Loader2,
    RefreshCw,
} from 'lucide-react'

import { useCreateIdea } from '@/hooks/use-ideas.hook'
import type { TopicSuggestion } from '@workspace/ai/functions'
import { OpportunityCard } from './opportunity-card.component'

const KEYWORD_GAPS = [
    {
        keyword: 'bbl recovery week by week',
        volume: 'High',
        competition: 'Medium',
        opportunity: 85,
        suggestedTitle: 'BBL Recovery Timeline: Week-by-Week Guide',
        contentType: 'guide',
    },
    {
        keyword: 'mommy makeover cost miami',
        volume: 'High',
        competition: 'Low',
        opportunity: 92,
        suggestedTitle: 'Mommy Makeover Cost in Miami: 2025 Complete Guide',
        contentType: 'guide',
    },
    {
        keyword: 'tummy tuck vs liposuction',
        volume: 'Medium',
        competition: 'Low',
        opportunity: 78,
        suggestedTitle: 'Tummy Tuck vs Liposuction: Which Is Right for You?',
        contentType: 'comparison',
    },
    {
        keyword: 'breast augmentation financing options',
        volume: 'Medium',
        competition: 'Low',
        opportunity: 75,
        suggestedTitle:
            'How to Finance Your Breast Augmentation: Options Guide',
        contentType: 'guide',
    },
    {
        keyword: 'bbl before and after real patients',
        volume: 'High',
        competition: 'High',
        opportunity: 65,
        suggestedTitle: 'BBL Before & After: Real Patient Transformations',
        contentType: 'case_study',
    },
] as const

/**
 * SEO Opportunity Radar Widget
 * Shows keyword gaps and high-opportunity content suggestions
 */
export function SeoRadarWidget() {
    const createIdea = useCreateIdea()
    const [isGenerating, setIsGenerating] = useState(false)
    const [aiSuggestions, setAiSuggestions] = useState<TopicSuggestion[]>([])
    const [showAiSuggestions, setShowAiSuggestions] = useState(false)

    const handleGenerateAISuggestions = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch('/api/blog/generate-topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    additionalContext:
                        'Focus on high-opportunity keywords with low competition. Prioritize topics that would be easy to rank for in Miami plastic surgery niche.',
                }),
            })

            const data = await response.json()

            if (data.success && data.topics) {
                setAiSuggestions(data.topics)
                setShowAiSuggestions(true)
            } else {
                toast.error(data.error || 'Failed to generate suggestions')
            }
        } catch {
            toast.error('Failed to connect to AI service')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleAddToBacklog = async (
        title: string,
        keyword: string,
        contentType: string
    ) => {
        const result = await createIdea.mutateAsync({
            title,
            primaryKeyword: keyword,
            contentType: contentType as 'guide' | 'comparison' | 'case_study',
            priority: 'high',
            stage: 'backlog',
        })

        if (result.success) {
            toast.success('Added to backlog!')
        } else {
            toast.error(result.error || 'Failed to add idea')
        }
    }

    return (
        <Card>
            <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100'>
                            <Radar className='h-4 w-4 text-violet-600' />
                        </div>
                        <div>
                            <CardTitle className='text-base'>
                                SEO Opportunity Radar
                            </CardTitle>
                            <CardDescription className='text-xs'>
                                High-opportunity content gaps
                            </CardDescription>
                        </div>
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleGenerateAISuggestions}
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <Loader2 className='mr-1.5 h-3 w-3 animate-spin' />
                        ) : (
                            <Sparkles className='mr-1.5 h-3 w-3' />
                        )}
                        AI Suggest
                    </Button>
                </div>
            </CardHeader>
            <CardContent className='space-y-3'>
                {showAiSuggestions && aiSuggestions.length > 0 ? (
                    <>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className='text-xs font-medium text-violet-600'>
                                AI-Generated Suggestions
                            </span>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 text-xs'
                                onClick={() => setShowAiSuggestions(false)}
                            >
                                Show Defaults
                            </Button>
                        </div>
                        {aiSuggestions.slice(0, 5).map((suggestion, idx) => (
                            <OpportunityCard
                                key={idx}
                                keyword={suggestion.primaryKeyword}
                                title={suggestion.title}
                                opportunity={85 - idx * 5}
                                contentType={
                                    suggestion.suggestedContentType || 'guide'
                                }
                                onAdd={() =>
                                    handleAddToBacklog(
                                        suggestion.title,
                                        suggestion.primaryKeyword,
                                        suggestion.suggestedContentType ||
                                            'guide'
                                    )
                                }
                                isAdding={createIdea.isPending}
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {KEYWORD_GAPS.slice(0, 5).map((gap, idx) => (
                            <OpportunityCard
                                key={idx}
                                keyword={gap.keyword}
                                title={gap.suggestedTitle}
                                opportunity={gap.opportunity}
                                volume={gap.volume}
                                competition={gap.competition}
                                contentType={gap.contentType}
                                onAdd={() =>
                                    handleAddToBacklog(
                                        gap.suggestedTitle,
                                        gap.keyword,
                                        gap.contentType
                                    )
                                }
                                isAdding={createIdea.isPending}
                            />
                        ))}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

/**
 * Skeleton loader for the widget
 */
export function SeoRadarWidgetSkeleton() {
    return (
        <Card>
            <CardHeader className='pb-3'>
                <div className='flex items-center gap-2'>
                    <Skeleton className='h-8 w-8 rounded-lg' />
                    <div>
                        <Skeleton className='mb-1 h-4 w-32' />
                        <Skeleton className='h-3 w-40' />
                    </div>
                </div>
            </CardHeader>
            <CardContent className='space-y-3'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className='h-20 w-full rounded-lg' />
                ))}
            </CardContent>
        </Card>
    )
}
