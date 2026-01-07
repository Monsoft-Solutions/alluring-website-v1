'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    AlertCircle,
    Loader2,
    User,
    Tag,
    FileText,
    ArrowUpRight,
    Copy,
    Trash2,
    ExternalLink,
    MoreHorizontal,
    ChevronRight,
    ChevronLeft,
    ImageIcon,
    RotateCcw,
} from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@workspace/ui/components/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'

import type {
    PipelinePostItem,
    PipelineStatus,
} from '@/lib/queries/pipeline.query'
import type { BlogPostPriority } from '@/lib/actions/blog.action'
import {
    useUpdatePipelineStatus,
    useUpdatePostPriority,
    useDuplicatePipelinePost,
    useDeletePipelinePost,
    useRetryProcessing,
} from '@/hooks/use-pipeline.hook'

/**
 * Priority configuration
 */
const PRIORITY_CONFIG: Record<
    BlogPostPriority,
    { label: string; class: string }
> = {
    low: { label: 'Low', class: 'bg-stone-100 text-stone-600' },
    medium: { label: 'Medium', class: 'bg-blue-100 text-blue-600' },
    high: { label: 'High', class: 'bg-amber-100 text-amber-600' },
    urgent: { label: 'Urgent', class: 'bg-red-100 text-red-600' },
}

const PRIORITY_ORDER: BlogPostPriority[] = ['low', 'medium', 'high', 'urgent']

/**
 * Stage order for next/prev navigation
 */
const STAGE_ORDER: PipelineStatus[] = [
    'ideation',
    'generate',
    'ai_review',
    'generate_metadata',
    'draft',
    'ready_to_publish',
    'scheduled',
    'published',
]

const STAGE_LABELS: Record<PipelineStatus, string> = {
    ideation: 'Ideation',
    generate: 'Generate',
    ai_review: 'AI Review',
    generate_metadata: 'Metadata',
    draft: 'Draft',
    ready_to_publish: 'Ready',
    scheduled: 'Scheduled',
    published: 'Published',
}

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

    const handlePriorityChange = (priority: string) => {
        updatePriorityMutation.mutate({
            id: post.id,
            priority: priority as BlogPostPriority,
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
                        {/* Featured Image */}
                        {post.featuredImageUrl ? (
                            <div className='relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-stone-100'>
                                <Image
                                    src={post.featuredImageUrl}
                                    alt={post.title}
                                    fill
                                    className='object-cover'
                                    sizes='56px'
                                />
                            </div>
                        ) : (
                            <div className='flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-stone-100'>
                                <ImageIcon className='h-5 w-5 text-stone-400' />
                            </div>
                        )}

                        {/* Content */}
                        <div className='min-w-0 flex-1'>
                            {/* Header with title and status */}
                            <div className='mb-1 flex items-start justify-between gap-2'>
                                <h4 className='line-clamp-2 text-sm leading-tight font-medium'>
                                    {post.title}
                                </h4>
                                <div className='flex flex-shrink-0 items-center gap-1'>
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
                            </div>
                        </div>
                    </div>

                    {/* Info row */}
                    <div className='text-muted-foreground mt-2 flex items-center gap-3 text-xs'>
                        {post.authorName && (
                            <span className='flex items-center gap-1'>
                                <User className='h-3 w-3' />
                                {post.authorName}
                            </span>
                        )}

                        {wordCount && (
                            <span className='flex items-center gap-1'>
                                <FileText className='h-3 w-3' />
                                {wordCount.toLocaleString()}
                            </span>
                        )}

                        {post.planningData?.contentType && (
                            <span className='truncate'>
                                {post.planningData.contentType.replace(
                                    /_/g,
                                    ' '
                                )}
                            </span>
                        )}
                    </div>

                    {/* Quick Actions Bar - appears on hover */}
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
                                        onClick={handlePrevStage}
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
                                        onClick={handleNextStage}
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
                            <DropdownMenu
                                open={isMenuOpen}
                                onOpenChange={setIsMenuOpen}
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                className='h-6 w-6'
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <MoreHorizontal className='h-3.5 w-3.5' />
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        More actions
                                    </TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent
                                    align='center'
                                    className='w-48'
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Priority submenu */}
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Badge
                                                variant='outline'
                                                className={`mr-2 ${priorityConfig.class}`}
                                            >
                                                {priorityConfig.label}
                                            </Badge>
                                            Priority
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuRadioGroup
                                                value={post.priority}
                                                onValueChange={
                                                    handlePriorityChange
                                                }
                                            >
                                                {PRIORITY_ORDER.map(
                                                    (priority) => (
                                                        <DropdownMenuRadioItem
                                                            key={priority}
                                                            value={priority}
                                                        >
                                                            <Badge
                                                                variant='outline'
                                                                className={`mr-2 ${PRIORITY_CONFIG[priority].class}`}
                                                            >
                                                                {
                                                                    PRIORITY_CONFIG[
                                                                        priority
                                                                    ].label
                                                                }
                                                            </Badge>
                                                        </DropdownMenuRadioItem>
                                                    )
                                                )}
                                            </DropdownMenuRadioGroup>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuSub>

                                    <DropdownMenuSeparator />

                                    {/* View Live (if published) */}
                                    {isPublished && post.slug && (
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                            >
                                                <ExternalLink className='mr-2 h-4 w-4' />
                                                View Live
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    {/* Open Full Editor */}
                                    {post.slug && (
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={`/blog/posts/${post.id}/edit`}
                                            >
                                                <ArrowUpRight className='mr-2 h-4 w-4' />
                                                Full Editor
                                            </Link>
                                        </DropdownMenuItem>
                                    )}

                                    {/* Duplicate */}
                                    <DropdownMenuItem
                                        onClick={handleDuplicate}
                                        disabled={duplicateMutation.isPending}
                                    >
                                        <Copy className='mr-2 h-4 w-4' />
                                        Duplicate
                                    </DropdownMenuItem>

                                    {/* Retry - only show when stuck or errored */}
                                    {canRetry && (
                                        <DropdownMenuItem
                                            onClick={handleRetry}
                                            disabled={retryMutation.isPending}
                                        >
                                            <RotateCcw className='mr-2 h-4 w-4' />
                                            Retry
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />

                                    {/* Delete */}
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setShowDeleteDialog(true)
                                        }
                                        className='text-red-600 focus:text-red-600'
                                    >
                                        <Trash2 className='mr-2 h-4 w-4' />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{post.title}"? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className='bg-red-600 hover:bg-red-700'
                        >
                            {deleteMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Trash2 className='mr-2 h-4 w-4' />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
