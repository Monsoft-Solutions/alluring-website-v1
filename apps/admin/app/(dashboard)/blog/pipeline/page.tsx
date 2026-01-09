'use client'

import { useState } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

import {
    PipelineKanbanBoard,
    PipelinePostFormDialog,
} from '@/components/blog/pipeline'
import { usePipelineKanban, usePipelineStats } from '@/hooks/use-pipeline.hook'

/**
 * Blog Content Pipeline Page
 *
 * Kanban board for managing blog posts through the content generation pipeline.
 */
export default function PipelinePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const { data, isLoading, refetch, isRefetching } = usePipelineKanban()
    const { data: stats } = usePipelineStats()

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div>
                    <h1 className='text-3xl font-bold tracking-tight'>
                        Content Pipeline
                    </h1>
                    <p className='text-muted-foreground'>
                        Manage blog posts through the AI content generation
                        pipeline
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => refetch()}
                        disabled={isRefetching}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>
                    <Button
                        size='sm'
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus className='mr-2 h-4 w-4' />
                        New Post
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className='grid gap-4 md:grid-cols-4'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>In Pipeline</CardDescription>
                        <CardTitle className='text-2xl'>
                            {stats
                                ? stats.ideation +
                                  stats.generate +
                                  stats.ai_review +
                                  stats.generate_metadata
                                : '-'}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>Drafts</CardDescription>
                        <CardTitle className='text-2xl'>
                            {stats ? stats.draft : '-'}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>Ready to Publish</CardDescription>
                        <CardTitle className='text-2xl'>
                            {stats ? stats.ready_to_publish : '-'}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>Processing</CardDescription>
                        <CardTitle className='text-2xl'>
                            {stats ? (
                                <span
                                    className={
                                        stats.processing > 0
                                            ? 'text-amber-600'
                                            : ''
                                    }
                                >
                                    {stats.processing}
                                </span>
                            ) : (
                                '-'
                            )}
                            {stats && stats.error > 0 && (
                                <span className='ml-2 text-sm text-red-600'>
                                    ({stats.error} errors)
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Search */}
            <div className='relative max-w-md'>
                <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                <Input
                    placeholder='Search posts...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                />
            </div>

            {/* Kanban Board */}
            {isLoading ? (
                <div className='flex gap-4 overflow-x-auto pb-4'>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className='w-[280px] flex-shrink-0'>
                            <Card>
                                <CardHeader className='py-3'>
                                    <Skeleton className='h-5 w-24' />
                                </CardHeader>
                                <CardContent className='space-y-3 p-3 pt-0'>
                                    <Skeleton className='h-24 w-full' />
                                    <Skeleton className='h-24 w-full' />
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            ) : data ? (
                <PipelineKanbanBoard data={data} searchQuery={searchQuery} />
            ) : (
                <Card>
                    <CardContent className='flex items-center justify-center py-12'>
                        <p className='text-muted-foreground'>
                            No pipeline data available
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Create Post Dialog */}
            <PipelinePostFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    )
}
