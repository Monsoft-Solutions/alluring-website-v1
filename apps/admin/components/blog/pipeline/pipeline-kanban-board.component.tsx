'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'

import type { PostsByStatus, PipelinePostItem } from '@/lib/types/pipeline.type'
import type { PipelineStatus } from '@/lib/types/blog/blog-action.type'
import { isPipelineStatus } from '@/lib/types/pipeline.type'
import { PipelinePostEditDialog } from './pipeline-post-edit-dialog.component'
import { PipelineColumn } from './pipeline-column.component'
import {
    useUpdatePipelineStatus,
    useTriggerPipeline,
} from '@/hooks/use-pipeline.hook'
import { STAGE_CONFIG, STAGE_ORDER } from '@/lib/constants/pipeline.constant'

type PipelineKanbanBoardProps = {
    data: PostsByStatus
    searchQuery?: string
    isLoading?: boolean
}

/**
 * Kanban board for the blog content pipeline
 */
export function PipelineKanbanBoard({
    data,
    searchQuery = '',
    isLoading = false,
}: PipelineKanbanBoardProps) {
    const updateStatusMutation = useUpdatePipelineStatus()
    const triggerPipelineMutation = useTriggerPipeline()

    // Selected post for edit dialog
    const [selectedPost, setSelectedPost] = useState<PipelinePostItem | null>(
        null
    )
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const handleCardClick = (post: PipelinePostItem) => {
        setSelectedPost(post)
        setIsEditDialogOpen(true)
    }

    const handleEditDialogClose = (open: boolean) => {
        setIsEditDialogOpen(open)
        if (!open) {
            setSelectedPost(null)
        }
    }

    // Filter posts based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data

        const query = searchQuery.toLowerCase()
        const filtered: PostsByStatus = {
            ideation: [],
            generate: [],
            ai_review: [],
            generate_metadata: [],
            generate_image: [],
            draft: [],
            ready_to_publish: [],
            scheduled: [],
            published: [],
        }

        for (const status of STAGE_ORDER) {
            filtered[status] = data[status].filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    post.primaryKeyword?.toLowerCase().includes(query) ||
                    post.planningData?.topic?.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [data, searchQuery])

    const handleDragStart = (e: React.DragEvent, post: PipelinePostItem) => {
        // Don't allow dragging if processing
        if (post.pipelineProcessingStatus === 'processing') {
            e.preventDefault()
            return
        }
        e.dataTransfer.setData('postId', post.id)
        e.dataTransfer.setData('sourceStatus', post.status)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = async (
        e: React.DragEvent,
        targetStatus: PipelineStatus
    ) => {
        e.preventDefault()
        const postId = e.dataTransfer.getData('postId')
        const rawSourceStatus = e.dataTransfer.getData('sourceStatus')

        if (!isPipelineStatus(rawSourceStatus)) return
        const sourceStatus = rawSourceStatus

        if (sourceStatus !== targetStatus && postId) {
            // Update the status
            await updateStatusMutation.mutateAsync({
                id: postId,
                status: targetStatus,
            })

            // If the target is an auto-process stage, trigger the pipeline
            const config = STAGE_CONFIG[targetStatus]
            if (
                config.autoProcess &&
                (targetStatus === 'generate' ||
                    targetStatus === 'ai_review' ||
                    targetStatus === 'generate_metadata' ||
                    targetStatus === 'generate_image')
            ) {
                triggerPipelineMutation.mutate({
                    id: postId,
                    status: targetStatus,
                })
            }
        }
    }

    if (isLoading) {
        return (
            <div className='flex gap-4 overflow-x-auto pb-4'>
                {STAGE_ORDER.slice(0, 5).map((status) => (
                    <div key={status} className='w-[280px] flex-shrink-0'>
                        <Card>
                            <CardHeader className='py-3'>
                                <Skeleton className='h-5 w-24' />
                            </CardHeader>
                            <CardContent className='space-y-3 p-3 pt-0'>
                                <Skeleton className='h-20 w-full' />
                                <Skeleton className='h-20 w-full' />
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className='flex gap-4 overflow-x-auto pb-4'>
            {STAGE_ORDER.map((status) => (
                <PipelineColumn
                    key={status}
                    status={status}
                    config={STAGE_CONFIG[status]}
                    posts={filteredData[status]}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                    onCardClick={handleCardClick}
                />
            ))}

            {/* Edit Dialog */}
            <PipelinePostEditDialog
                post={selectedPost}
                open={isEditDialogOpen}
                onOpenChange={handleEditDialogClose}
            />
        </div>
    )
}
