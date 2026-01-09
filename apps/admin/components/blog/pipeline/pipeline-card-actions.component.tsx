'use client'

import Link from 'next/link'
import {
    MoreHorizontal,
    ExternalLink,
    ArrowUpRight,
    Copy,
    Trash2,
    RotateCcw,
} from 'lucide-react'
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
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'

import type { PipelinePostItem } from '@/lib/types/pipeline.type'
import type { BlogPostPriority } from '@/lib/types/blog/blog-action.type'
import {
    PRIORITY_CONFIG,
    PRIORITY_ORDER,
} from '@/lib/constants/pipeline.constant'

type PipelineCardActionsProps = {
    post: PipelinePostItem
    isMenuOpen: boolean
    setIsMenuOpen: (open: boolean) => void
    onPriorityChange: (priority: BlogPostPriority) => void
    onDuplicate: () => void
    onDelete: () => void
    onRetry: () => void
    isDuplicatePending: boolean
    isRetryPending: boolean
    canRetry: boolean
    isPublished: boolean
}

export function PipelineCardActions({
    post,
    isMenuOpen,
    setIsMenuOpen,
    onPriorityChange,
    onDuplicate,
    onDelete,
    onRetry,
    isDuplicatePending,
    isRetryPending,
    canRetry,
    isPublished,
}: PipelineCardActionsProps) {
    const priorityConfig = PRIORITY_CONFIG[post.priority]

    return (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='h-6 w-6'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className='h-3.5 w-3.5' />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>More actions</TooltipContent>
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
                            onValueChange={(val) =>
                                onPriorityChange(val as BlogPostPriority)
                            }
                        >
                            {PRIORITY_ORDER.map((priority) => (
                                <DropdownMenuRadioItem
                                    key={priority}
                                    value={priority}
                                >
                                    <Badge
                                        variant='outline'
                                        className={`mr-2 ${PRIORITY_CONFIG[priority].class}`}
                                    >
                                        {PRIORITY_CONFIG[priority].label}
                                    </Badge>
                                </DropdownMenuRadioItem>
                            ))}
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
                        <Link href={`/blog/posts/${post.id}/edit`}>
                            <ArrowUpRight className='mr-2 h-4 w-4' />
                            Full Editor
                        </Link>
                    </DropdownMenuItem>
                )}

                {/* Duplicate */}
                <DropdownMenuItem
                    onClick={onDuplicate}
                    disabled={isDuplicatePending}
                >
                    <Copy className='mr-2 h-4 w-4' />
                    Duplicate
                </DropdownMenuItem>

                {/* Retry - only show when stuck or errored */}
                {canRetry && (
                    <DropdownMenuItem
                        onClick={onRetry}
                        disabled={isRetryPending}
                    >
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Retry
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Delete */}
                <DropdownMenuItem
                    onClick={onDelete}
                    className='text-red-600 focus:text-red-600'
                >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
