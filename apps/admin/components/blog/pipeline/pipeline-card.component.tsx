'use client'

import { useState } from 'react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { AlertCircle, Loader2, Tag } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'

import type { PipelinePostItem } from '@/lib/types/pipeline.type'
import type { BlogPostPriority } from '@/lib/types/blog/blog-action.type'
import {
    useUpdatePipelineStatus,
    useUpdatePostPriority,
    useDuplicatePipelinePost,
    useDeletePipelinePost,
    useRetryProcessing,
} from '@/hooks/use-pipeline.hook'
import { PRIORITY_CONFIG, STAGE_ORDER } from '@/lib/constants/pipeline.constant'
import { PipelineCardThumbnail } from './pipeline-card-thumbnail.component'
import { PipelineCardQuickActions } from './pipeline-card-quick-actions.component'
import { PipelineCardInfo } from './pipeline-card-info.component'
import { PipelineCardDeleteDialog } from './pipeline-card-delete-dialog.component'
import {
    IdeaApprovalActions,
    IdeaGateBadge,
} from './idea-approval-actions.component'

type PipelineCardProps = {
    post: PipelinePostItem
    onDragStart?: (e: React.DragEvent) => void
    onClick?: () => void
}

/**
 * Card component for a single post in the pipeline Kanban
 * Features: hover quick actions, status navigation, priority toggle, duplicate, delete
 */
export function PipelineCard({
    post,
    onDragStart,
    onClick,
}: PipelineCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const updateStatusMutation = useUpdatePipelineStatus()
    const updatePriorityMutation = useUpdatePostPriority()
    const duplicateMutation = useDuplicatePipelinePost()
    const deleteMutation = useDeletePipelinePost()
    const retryMutation = useRetryProcessing()

    const isProcessing = post.pipelineProcessingStatus === 'processing'
    const hasError = post.pipelineProcessingStatus === 'error'
    const canRetry = isProcessing || hasError
    const priorityConfig = PRIORITY_CONFIG[post.priority]
    const currentStageIndex = STAGE_ORDER.indexOf(post.status)

    // Calculate word count from pipeline state if available
    const wordCount = post.pipelineState?.generationPhase?.initialWordCount

    const handleClick = (e: React.MouseEvent) => {
        // Don't open dialog if the event was from dragging or menu is open
        if (e.defaultPrevented || isMenuOpen) return
        onClick?.()
    }

    const handlePrevStage = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentStageIndex > 0 && !isProcessing) {
            const prevStatus = STAGE_ORDER[currentStageIndex - 1]
            if (prevStatus) {
                updateStatusMutation.mutate({ id: post.id, status: prevStatus })
            }
        }
    }

    const handleNextStage = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (currentStageIndex < STAGE_ORDER.length - 1 && !isProcessing) {
            const nextStatus = STAGE_ORDER[currentStageIndex + 1]
            if (nextStatus) {
                updateStatusMutation.mutate({ id: post.id, status: nextStatus })
            }
        }
    }

    const handlePriorityChange = (priority: BlogPostPriority) => {
        updatePriorityMutation.mutate({
            id: post.id,
            priority,
        })
    }

    const handleDuplicate = () => {
        duplicateMutation.mutate(post.id)
    }

    const handleDelete = () => {
        deleteMutation.mutate(post.id)
        setShowDeleteDialog(false)
    }

    const handleRetry = () => {
        retryMutation.mutate(post.id)
    }

    const canGoPrev = currentStageIndex > 0 && !isProcessing
    const canGoNext =
        currentStageIndex < STAGE_ORDER.length - 1 && !isProcessing
    const isPublished = post.status === 'published'

    return (
        <>
            <Card
                className={`group relative cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    isProcessing
                        ? 'cursor-wait border-amber-300 bg-amber-50/50'
                        : hasError
                          ? 'border-red-300 bg-red-50/50'
                          : ''
                }`}
                draggable={!isProcessing}
                onDragStart={onDragStart}
                onClick={handleClick}
            >
                <CardContent className='p-3'>
                    {/* Featured Image Thumbnail + Content */}
                    <div className='flex gap-3'>
                        <PipelineCardThumbnail
                            title={post.title}
                            imageUrl={post.featuredImageUrl}
                        />

                        {/* Content */}
                        <div className='min-w-0 flex-1'>
                            {/* Header with title and status */}
                            <div className='mb-1 flex items-start justify-between gap-2'>
                                <h4 className='line-clamp-2 text-sm leading-tight font-medium'>
                                    {post.title}
                                </h4>
                                <div className='flex shrink-0 items-center gap-1'>
                                    {isProcessing && (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Loader2 className='h-4 w-4 animate-spin text-amber-500' />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Processing...
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                    {hasError && (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <AlertCircle className='h-4 w-4 text-red-500' />
                                            </TooltipTrigger>
                                            <TooltipContent className='max-w-xs'>
                                                {post.processingError ||
                                                    'Processing error'}
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>

                            {/* Inline metadata badges */}
                            <div className='flex flex-wrap items-center gap-1.5'>
                                <Badge
                                    variant='outline'
                                    className={`px-1.5 py-0 text-[10px] ${priorityConfig.class}`}
                                >
                                    {priorityConfig.label}
                                </Badge>

                                {post.primaryKeyword && (
                                    <Badge
                                        variant='outline'
                                        className='flex max-w-[80px] items-center gap-0.5 truncate px-1.5 py-0 text-[10px]'
                                    >
                                        <Tag className='h-2.5 w-2.5' />
                                        <span className='truncate'>
                                            {post.primaryKeyword}
                                        </span>
                                    </Badge>
                                )}

                                {post.status === 'ideation' && (
                                    <IdeaGateBadge post={post} />
                                )}

                                {post.status === 'ideation' &&
                                    post.ideaApproval === 'pending' && (
                                        <Badge className='bg-amber-100 px-1.5 py-0 text-[10px] text-amber-800 hover:bg-amber-100'>
                                            Awaiting approval
                                        </Badge>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Info row */}
                    <PipelineCardInfo
                        authorName={post.authorName}
                        wordCount={wordCount}
                        contentType={post.planningData?.contentType}
                    />

                    {/* Approve/Reject for pending autopilot ideas */}
                    <IdeaApprovalActions post={post} />

                    {/* Quick Actions Bar - appears on hover */}
                    <PipelineCardQuickActions
                        post={post}
                        currentStageIndex={currentStageIndex}
                        canGoPrev={canGoPrev}
                        canGoNext={canGoNext}
                        isProcessing={isProcessing}
                        isMenuOpen={isMenuOpen}
                        setIsMenuOpen={setIsMenuOpen}
                        onPrevStage={handlePrevStage}
                        onNextStage={handleNextStage}
                        onPriorityChange={handlePriorityChange}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        onRetry={handleRetry}
                        isDuplicatePending={duplicateMutation.isPending}
                        isRetryPending={retryMutation.isPending}
                        canRetry={canRetry}
                        isPublished={isPublished}
                    />
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <PipelineCardDeleteDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
                postTitle={post.title}
            />
        </>
    )
}
