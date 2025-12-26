'use client'

import { useMemo } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Inbox, Search, CheckCircle2, Play, Newspaper } from 'lucide-react'

import type { IdeasByStage, BlogIdeaListItem } from '@/lib/queries/ideas.query'
import { IdeaCard } from './idea-card.component'
import { useUpdateIdeaStage } from '@/hooks/use-ideas.hook'

type StageKey = keyof IdeasByStage

const STAGE_CONFIG: Record<
    StageKey,
    {
        label: string
        icon: React.ComponentType<{ className?: string }>
        headerClass: string
        badgeClass: string
    }
> = {
    backlog: {
        label: 'Backlog',
        icon: Inbox,
        headerClass: 'border-stone-200 bg-stone-50',
        badgeClass: 'bg-stone-200 text-stone-700',
    },
    researching: {
        label: 'Researching',
        icon: Search,
        headerClass: 'border-blue-200 bg-blue-50',
        badgeClass: 'bg-blue-200 text-blue-700',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle2,
        headerClass: 'border-emerald-200 bg-emerald-50',
        badgeClass: 'bg-emerald-200 text-emerald-700',
    },
    in_progress: {
        label: 'In Progress',
        icon: Play,
        headerClass: 'border-amber-200 bg-amber-50',
        badgeClass: 'bg-amber-200 text-amber-700',
    },
    published: {
        label: 'Published',
        icon: Newspaper,
        headerClass: 'border-purple-200 bg-purple-50',
        badgeClass: 'bg-purple-200 text-purple-700',
    },
}

const STAGE_ORDER: StageKey[] = [
    'backlog',
    'researching',
    'approved',
    'in_progress',
    'published',
]

type IdeaKanbanBoardProps = {
    data: IdeasByStage
    searchQuery?: string
}

/**
 * Kanban board component for managing ideas through pipeline stages
 */
export function IdeaKanbanBoard({
    data,
    searchQuery = '',
}: IdeaKanbanBoardProps) {
    const updateStageMutation = useUpdateIdeaStage()

    // Filter ideas based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data

        const query = searchQuery.toLowerCase()
        const filtered: IdeasByStage = {
            backlog: [],
            researching: [],
            approved: [],
            in_progress: [],
            published: [],
        }

        for (const stage of STAGE_ORDER) {
            filtered[stage] = data[stage].filter(
                (idea) =>
                    idea.title.toLowerCase().includes(query) ||
                    idea.topic?.toLowerCase().includes(query) ||
                    idea.primaryKeyword?.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [data, searchQuery])

    const handleDragStart = (e: React.DragEvent, idea: BlogIdeaListItem) => {
        e.dataTransfer.setData('ideaId', idea.id)
        e.dataTransfer.setData('sourceStage', idea.stage)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e: React.DragEvent, targetStage: StageKey) => {
        e.preventDefault()
        const ideaId = e.dataTransfer.getData('ideaId')
        const sourceStage = e.dataTransfer.getData('sourceStage')

        if (sourceStage !== targetStage && ideaId) {
            updateStageMutation.mutate({ id: ideaId, stage: targetStage })
        }
    }

    return (
        <div className='flex gap-4 overflow-x-auto pb-4'>
            {STAGE_ORDER.map((stage) => {
                const config = STAGE_CONFIG[stage]
                const ideas = filteredData[stage]
                const Icon = config.icon

                return (
                    <div
                        key={stage}
                        className='w-[300px] flex-shrink-0'
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, stage)}
                    >
                        <Card className={`border-2 ${config.headerClass}`}>
                            <CardHeader className='py-3'>
                                <div className='flex items-center justify-between'>
                                    <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                                        <Icon className='h-4 w-4' />
                                        {config.label}
                                    </CardTitle>
                                    <Badge
                                        variant='secondary'
                                        className={config.badgeClass}
                                    >
                                        {ideas.length}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className='space-y-3 p-3 pt-0'>
                                {ideas.length === 0 ? (
                                    <div className='flex flex-col items-center justify-center py-8 text-center'>
                                        <div className='text-muted-foreground mb-2 rounded-full bg-white p-3'>
                                            <Icon className='h-5 w-5' />
                                        </div>
                                        <p className='text-muted-foreground text-sm'>
                                            No ideas in{' '}
                                            {config.label.toLowerCase()}
                                        </p>
                                    </div>
                                ) : (
                                    ideas.map((idea) => (
                                        <IdeaCard
                                            key={idea.id}
                                            idea={idea}
                                            onDragStart={(e) =>
                                                handleDragStart(e, idea)
                                            }
                                        />
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )
            })}
        </div>
    )
}
