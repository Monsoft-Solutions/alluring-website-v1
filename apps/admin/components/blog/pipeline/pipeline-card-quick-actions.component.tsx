'use client'

import { Button } from '@workspace/ui/components/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PipelineStatus } from '@/lib/types/blog/blog-action.type'
import type { PipelinePostItem } from '@/lib/types/pipeline.type'
import type { BlogPostPriority } from '@/lib/types/blog/blog-action.type'
import { STAGE_LABELS, STAGE_ORDER } from '@/lib/constants/pipeline.constant'
import { PipelineCardActions } from './pipeline-card-actions.component'

type PipelineCardQuickActionsProps = {
    post: PipelinePostItem
    currentStageIndex: number
    canGoPrev: boolean
    canGoNext: boolean
    isProcessing: boolean
    isMenuOpen: boolean
    setIsMenuOpen: (open: boolean) => void
    onPrevStage: (e: React.MouseEvent) => void
    onNextStage: (e: React.MouseEvent) => void
    onPriorityChange: (priority: BlogPostPriority) => void
    onDuplicate: () => void
    onDelete: () => void
    onRetry: () => void
    isDuplicatePending: boolean
    isRetryPending: boolean
    canRetry: boolean
    isPublished: boolean
}

export function PipelineCardQuickActions({
    post,
    currentStageIndex,
    canGoPrev,
    canGoNext,
    isMenuOpen,
    setIsMenuOpen,
    onPrevStage,
    onNextStage,
    onPriorityChange,
    onDuplicate,
    onDelete,
    onRetry,
    isDuplicatePending,
    isRetryPending,
    canRetry,
    isPublished,
}: PipelineCardQuickActionsProps) {
    return (
        <div className='absolute right-0 -bottom-1 left-0 flex translate-y-full items-center justify-center gap-1 opacity-0 transition-all group-hover:bottom-0 group-hover:translate-y-1/2 group-hover:opacity-100'>
            <div className='flex items-center gap-1 rounded-full border bg-white px-2 py-1 shadow-lg'>
                {/* Previous Stage */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            disabled={!canGoPrev}
                            onClick={onPrevStage}
                        >
                            <ChevronLeft className='h-3.5 w-3.5' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {canGoPrev
                            ? `Move to ${STAGE_LABELS[STAGE_ORDER[currentStageIndex - 1] as PipelineStatus]}`
                            : 'First stage'}
                    </TooltipContent>
                </Tooltip>

                {/* Next Stage */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            disabled={!canGoNext}
                            onClick={onNextStage}
                        >
                            <ChevronRight className='h-3.5 w-3.5' />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {canGoNext
                            ? `Move to ${STAGE_LABELS[STAGE_ORDER[currentStageIndex + 1] as PipelineStatus]}`
                            : 'Last stage'}
                    </TooltipContent>
                </Tooltip>

                <div className='h-4 w-px bg-stone-200' />

                {/* More Actions Menu */}
                <PipelineCardActions
                    post={post}
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                    onPriorityChange={onPriorityChange}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onRetry={onRetry}
                    isDuplicatePending={isDuplicatePending}
                    isRetryPending={isRetryPending}
                    canRetry={canRetry}
                    isPublished={isPublished}
                />
            </div>
        </div>
    )
}
