'use client'

import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Loader2,
    Sparkles,
    ChevronLeft,
    Target,
    FileText,
    Star,
} from 'lucide-react'

import type { TopicSuggestion } from '@workspace/ai/functions'

type Step2TopicsProps = {
    topics: TopicSuggestion[]
    onSelect: (topic: TopicSuggestion) => void
    onBack: () => void
    onRegenerate: () => void
    isLoading: boolean
}

export function Step2Topics({
    topics,
    onSelect,
    onBack,
    onRegenerate,
    isLoading,
}: Step2TopicsProps) {
    return (
        <div className='space-y-4'>
            <p className='text-muted-foreground text-sm'>
                Select a topic to continue, or regenerate for new ideas.
            </p>

            <div className='max-h-[400px] space-y-3 overflow-y-auto'>
                {topics.map((topic, idx) => (
                    <Card
                        key={idx}
                        className='cursor-pointer transition-shadow hover:shadow-md'
                        onClick={() => onSelect(topic)}
                    >
                        <CardContent className='p-4'>
                            <div className='mb-2 flex items-start justify-between'>
                                <h4 className='font-medium'>{topic.title}</h4>
                                <Badge
                                    variant='outline'
                                    className='ml-2 shrink-0'
                                >
                                    {topic.searchIntent}
                                </Badge>
                            </div>
                            <p className='text-muted-foreground mb-3 text-sm'>
                                {topic.description}
                            </p>
                            <div className='flex flex-wrap items-center gap-2'>
                                <Badge variant='secondary' className='text-xs'>
                                    <Target className='mr-1 h-3 w-3' />
                                    {topic.primaryKeyword}
                                </Badge>
                                {topic.suggestedContentType && (
                                    <Badge
                                        variant='outline'
                                        className='text-xs'
                                    >
                                        <FileText className='mr-1 h-3 w-3' />
                                        {topic.suggestedContentType}
                                    </Badge>
                                )}
                            </div>
                            <p className='text-muted-foreground mt-2 text-xs'>
                                <Star className='mr-1 inline h-3 w-3' />
                                {topic.uniqueAngle}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className='flex gap-2'>
                <Button variant='outline' onClick={onBack}>
                    <ChevronLeft className='mr-2 h-4 w-4' />
                    Back
                </Button>
                <Button
                    variant='outline'
                    onClick={onRegenerate}
                    disabled={isLoading}
                    className='flex-1'
                >
                    {isLoading ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                        <Sparkles className='mr-2 h-4 w-4' />
                    )}
                    Regenerate
                </Button>
            </div>
        </div>
    )
}
