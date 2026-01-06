'use client'

import Link from 'next/link'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import {
    AlertCircle,
    Loader2,
    User,
    Tag,
    Clock,
    FileText,
    ArrowUpRight,
} from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { Button } from '@workspace/ui/components/button'

import type { PipelinePostItem } from '@/lib/queries/pipeline.query'

/**
 * Priority configuration
 */
const PRIORITY_CONFIG = {
    low: { label: 'Low', class: 'bg-stone-100 text-stone-600' },
    medium: { label: 'Medium', class: 'bg-blue-100 text-blue-600' },
    high: { label: 'High', class: 'bg-amber-100 text-amber-600' },
    urgent: { label: 'Urgent', class: 'bg-red-100 text-red-600' },
} as const

type PipelineCardProps = {
    post: PipelinePostItem
    onDragStart?: (e: React.DragEvent) => void
}

/**
 * Card component for a single post in the pipeline Kanban
 */
export function PipelineCard({ post, onDragStart }: PipelineCardProps) {
    const isProcessing = post.pipelineProcessingStatus === 'processing'
    const hasError = post.pipelineProcessingStatus === 'error'
    const priorityConfig = PRIORITY_CONFIG[post.priority]

    // Calculate word count from pipeline state if available
    const wordCount = post.pipelineState?.generationPhase?.initialWordCount

    return (
        <Card
            className={`group cursor-grab transition-shadow hover:shadow-md ${
                isProcessing
                    ? 'cursor-wait border-amber-300 bg-amber-50/50'
                    : hasError
                      ? 'border-red-300 bg-red-50/50'
                      : ''
            }`}
            draggable={!isProcessing}
            onDragStart={onDragStart}
        >
            <CardContent className='p-3'>
                {/* Header with status indicator */}
                <div className='mb-2 flex items-start justify-between gap-2'>
                    <h4 className='line-clamp-2 text-sm leading-tight font-medium'>
                        {post.title}
                    </h4>
                    {isProcessing && (
                        <Tooltip>
                            <TooltipTrigger>
                                <Loader2 className='h-4 w-4 flex-shrink-0 animate-spin text-amber-500' />
                            </TooltipTrigger>
                            <TooltipContent>Processing...</TooltipContent>
                        </Tooltip>
                    )}
                    {hasError && (
                        <Tooltip>
                            <TooltipTrigger>
                                <AlertCircle className='h-4 w-4 flex-shrink-0 text-red-500' />
                            </TooltipTrigger>
                            <TooltipContent className='max-w-xs'>
                                {post.processingError || 'Processing error'}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Metadata */}
                <div className='mb-3 flex flex-wrap items-center gap-2'>
                    <Badge variant='outline' className={priorityConfig.class}>
                        {priorityConfig.label}
                    </Badge>

                    {post.primaryKeyword && (
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge
                                    variant='outline'
                                    className='flex max-w-[120px] items-center gap-1 truncate'
                                >
                                    <Tag className='h-3 w-3' />
                                    <span className='truncate'>
                                        {post.primaryKeyword}
                                    </span>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                {post.primaryKeyword}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Info row */}
                <div className='text-muted-foreground flex items-center justify-between text-xs'>
                    <div className='flex items-center gap-3'>
                        {post.authorName && (
                            <span className='flex items-center gap-1'>
                                <User className='h-3 w-3' />
                                {post.authorName}
                            </span>
                        )}

                        {wordCount && (
                            <span className='flex items-center gap-1'>
                                <FileText className='h-3 w-3' />
                                {wordCount.toLocaleString()} words
                            </span>
                        )}
                    </div>

                    {post.slug && (
                        <Link href={`/blog/posts/${post.id}/edit`}>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 px-2 opacity-0 transition-opacity group-hover:opacity-100'
                            >
                                <ArrowUpRight className='h-3 w-3' />
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Content type from planning data */}
                {post.planningData?.contentType && (
                    <div className='mt-2 border-t pt-2'>
                        <span className='text-muted-foreground text-xs'>
                            {post.planningData.contentType.replace(/_/g, ' ')}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
