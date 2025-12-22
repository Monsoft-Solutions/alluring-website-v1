'use client'

import { useState } from 'react'
import {
    Lightbulb,
    Search,
    Sparkles,
    Plus,
    LayoutGrid,
    List,
    AlertCircle,
    RefreshCw,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'

import { useIdeasKanban, useIdeasStats } from '@/hooks/use-ideas.hook'
import { STAGE_CONFIG } from '@/lib/constants/blog-ideas.constant'
import { IdeaKanbanBoard } from './idea-kanban-board.component'
import { IdeaFormDialog } from './idea-form-dialog.component'
import { IdeationWizardDialog } from './ideation-wizard-dialog.component'
import { SeoRadarWidget } from './seo-radar-widget.component'
import { IdeasPipelineSkeleton } from './ideas-pipeline-skeleton.component'

type ViewMode = 'kanban' | 'list'

/**
 * Main client component for the ideas pipeline
 */
export function IdeasPipelineClient() {
    const [viewMode, setViewMode] = useState<ViewMode>('kanban')
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isWizardOpen, setIsWizardOpen] = useState(false)

    const { data: stats, isLoading: statsLoading } = useIdeasStats()
    const { data: kanbanData, isLoading, error, refetch } = useIdeasKanban()

    if (isLoading || statsLoading) {
        return <IdeasPipelineSkeleton />
    }

    if (error) {
        return (
            <div className='flex flex-col items-center justify-center py-12'>
                <AlertCircle className='mb-4 h-12 w-12 text-red-500' />
                <h3 className='mb-2 text-lg font-medium'>
                    Failed to load ideas
                </h3>
                <p className='text-muted-foreground mb-4 text-sm'>
                    There was an error loading your ideas. Please try again.
                </p>
                <Button variant='outline' onClick={() => refetch()}>
                    <RefreshCw className='mr-2 h-4 w-4' />
                    Retry
                </Button>
            </div>
        )
    }

    const totalIdeas = stats?.total ?? 0

    return (
        <div className='space-y-6'>
            {/* Stats Bar */}
            <div className='flex flex-wrap items-center gap-3'>
                {Object.entries(STAGE_CONFIG).map(([stage, config]) => {
                    const count = stats?.[stage as keyof typeof stats] ?? 0
                    return (
                        <div
                            key={stage}
                            className='flex items-center gap-2 rounded-lg border bg-white px-3 py-2'
                        >
                            <span className='text-muted-foreground text-sm'>
                                {config.label}
                            </span>
                            <Badge variant='secondary' className={config.class}>
                                {typeof count === 'number' ? count : 0}
                            </Badge>
                        </div>
                    )
                })}
                <div className='ml-auto flex items-center gap-2 rounded-lg border bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2'>
                    <Lightbulb className='h-4 w-4 text-amber-600' />
                    <span className='text-sm font-medium text-amber-700'>
                        {totalIdeas} Total Ideas
                    </span>
                </div>
            </div>

            {/* Action Bar */}
            <div className='flex flex-wrap items-center justify-between gap-4'>
                {/* Search */}
                <div className='relative w-full max-w-sm'>
                    <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                    <Input
                        placeholder='Search ideas...'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-9'
                    />
                </div>

                {/* Actions */}
                <div className='flex items-center gap-2'>
                    {/* View Toggle */}
                    <div className='flex items-center rounded-lg border bg-white p-1'>
                        <Button
                            variant={
                                viewMode === 'kanban' ? 'secondary' : 'ghost'
                            }
                            size='sm'
                            onClick={() => setViewMode('kanban')}
                            className='h-8 px-3'
                        >
                            <LayoutGrid className='mr-1.5 h-4 w-4' />
                            Board
                        </Button>
                        <Button
                            variant={
                                viewMode === 'list' ? 'secondary' : 'ghost'
                            }
                            size='sm'
                            onClick={() => setViewMode('list')}
                            className='h-8 px-3'
                        >
                            <List className='mr-1.5 h-4 w-4' />
                            List
                        </Button>
                    </div>

                    {/* Generate Ideas Button */}
                    <Button
                        variant='outline'
                        className='gap-2'
                        onClick={() => setIsWizardOpen(true)}
                    >
                        <Sparkles className='h-4 w-4' />
                        Generate Ideas
                    </Button>

                    {/* New Idea Button */}
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className='mr-2 h-4 w-4' />
                        New Idea
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className='flex gap-6'>
                {/* Main Content */}
                <div className='flex-1 overflow-hidden'>
                    {viewMode === 'kanban' && kanbanData && (
                        <IdeaKanbanBoard
                            data={kanbanData}
                            searchQuery={searchQuery}
                        />
                    )}

                    {viewMode === 'list' && (
                        <div className='text-muted-foreground flex items-center justify-center py-12 text-sm'>
                            List view coming soon...
                        </div>
                    )}
                </div>

                {/* Sidebar - SEO Radar */}
                <div className='hidden w-[340px] flex-shrink-0 xl:block'>
                    <SeoRadarWidget />
                </div>
            </div>

            {/* Create Dialog */}
            <IdeaFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />

            {/* AI Ideation Wizard */}
            <IdeationWizardDialog
                open={isWizardOpen}
                onOpenChange={setIsWizardOpen}
            />
        </div>
    )
}
