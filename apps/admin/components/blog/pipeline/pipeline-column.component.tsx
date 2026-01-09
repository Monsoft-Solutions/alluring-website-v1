'use client'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { PipelinePostItem } from '@/lib/types/pipeline.type'
import type { PipelineStatus } from '@/lib/types/blog/blog-action.type'
import type { STAGE_CONFIG } from '@/lib/constants/pipeline.constant'
import { PipelineCard } from './pipeline-card.component'

type PipelineColumnProps = {
    status: PipelineStatus
    config: (typeof STAGE_CONFIG)[PipelineStatus]
    posts: PipelinePostItem[]
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent, status: PipelineStatus) => void
    onDragStart: (e: React.DragEvent, post: PipelinePostItem) => void
    onCardClick: (post: PipelinePostItem) => void
}

export function PipelineColumn({
    status,
    config,
    posts,
    onDragOver,
    onDrop,
    onDragStart,
    onCardClick,
}: PipelineColumnProps) {
    const Icon = config.icon

    // Check if any post in this column is processing
    const hasProcessing = posts.some(
        (p) => p.pipelineProcessingStatus === 'processing'
    )
    const hasError = posts.some((p) => p.pipelineProcessingStatus === 'error')

    return (
        <div
            className='w-[280px] flex-shrink-0'
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            <Card className={`border-2 ${config.headerClass}`}>
                <CardHeader className='py-3'>
                    <div className='flex items-center justify-between'>
                        <CardTitle className='flex items-center gap-2 text-sm font-medium'>
                            {hasProcessing ? (
                                <Loader2 className='h-4 w-4 animate-spin text-amber-500' />
                            ) : hasError ? (
                                <AlertCircle className='h-4 w-4 text-red-500' />
                            ) : (
                                <Icon className='h-4 w-4' />
                            )}
                            {config.label}
                        </CardTitle>
                        <Badge
                            variant='secondary'
                            className={config.badgeClass}
                        >
                            {posts.length}
                        </Badge>
                    </div>
                    <p className='text-muted-foreground text-xs'>
                        {config.description}
                    </p>
                </CardHeader>
                <CardContent className='max-h-[calc(100vh-280px)] space-y-3 overflow-y-auto p-3 pt-0'>
                    {posts.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-8 text-center'>
                            <div className='text-muted-foreground mb-2 rounded-full bg-white p-3'>
                                <Icon className='h-5 w-5' />
                            </div>
                            <p className='text-muted-foreground text-sm'>
                                No posts
                            </p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PipelineCard
                                key={post.id}
                                post={post}
                                onDragStart={(e) => onDragStart(e, post)}
                                onClick={() => onCardClick(post)}
                            />
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
