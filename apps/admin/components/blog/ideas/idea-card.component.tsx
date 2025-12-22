'use client'

import { useState } from 'react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    FileText,
    Sparkles,
    GripVertical,
    Target,
    User,
} from 'lucide-react'

import type { BlogIdeaListItem } from '@/lib/queries/ideas.query'
import {
    PRIORITY_CONFIG,
    CONTENT_TYPE_LABELS,
} from '@/lib/constants/blog-ideas.constant'
import { IdeaDetailDrawer } from './idea-detail-drawer.component'

type IdeaCardProps = {
    idea: BlogIdeaListItem
    onDragStart: (e: React.DragEvent) => void
}

/**
 * Card component for a single idea in the Kanban board
 */
export function IdeaCard({ idea, onDragStart }: IdeaCardProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [shouldAutoOpenGenerateDraft, setShouldAutoOpenGenerateDraft] =
        useState(false)

    const priorityConfig = PRIORITY_CONFIG[idea.priority]
    const contentTypeLabel = idea.contentType
        ? CONTENT_TYPE_LABELS[idea.contentType]
        : null

    const handleGenerateDraft = () => {
        setShouldAutoOpenGenerateDraft(true)
        setIsDrawerOpen(true)
    }

    const handleDrawerOpenChange = (open: boolean) => {
        setIsDrawerOpen(open)
        if (!open) {
            // Reset the auto-open flag when drawer closes
            setShouldAutoOpenGenerateDraft(false)
        }
    }

    return (
        <>
            <Card
                className='group cursor-grab bg-white transition-shadow hover:shadow-md active:cursor-grabbing'
                draggable
                onDragStart={onDragStart}
            >
                <CardContent className='p-3'>
                    {/* Drag handle + Actions */}
                    <div className='mb-2 flex items-start justify-between'>
                        <div className='text-muted-foreground flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                            <GripVertical className='h-4 w-4' />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100'
                                >
                                    <MoreHorizontal className='h-4 w-4' />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                    onClick={() => setIsDrawerOpen(true)}
                                >
                                    <Pencil className='mr-2 h-4 w-4' />
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleGenerateDraft}>
                                    <FileText className='mr-2 h-4 w-4' />
                                    Generate Draft
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className='text-red-600'>
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Title */}
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className='mb-1 text-left text-sm leading-tight font-medium hover:text-blue-600'
                    >
                        {idea.title}
                    </button>

                    {/* Topic/Keyword */}
                    {idea.primaryKeyword && (
                        <div className='text-muted-foreground mb-3 flex items-center gap-1 text-xs'>
                            <Target className='h-3 w-3' />
                            <span className='truncate'>
                                {idea.primaryKeyword}
                            </span>
                        </div>
                    )}

                    {/* Tags */}
                    <div className='flex flex-wrap items-center gap-1.5'>
                        {/* Priority */}
                        <Badge
                            variant='secondary'
                            className={`text-xs ${priorityConfig.class}`}
                        >
                            {priorityConfig.label}
                        </Badge>

                        {/* Content Type */}
                        {contentTypeLabel && (
                            <Badge variant='outline' className='text-xs'>
                                {contentTypeLabel}
                            </Badge>
                        )}

                        {/* AI Score */}
                        {idea.aiGeneratedScore !== null && (
                            <Badge
                                variant='secondary'
                                className='bg-violet-100 text-xs text-violet-700'
                            >
                                <Sparkles className='mr-1 h-3 w-3' />
                                {idea.aiGeneratedScore}
                            </Badge>
                        )}
                    </div>

                    {/* Assigned Author */}
                    {idea.assignedAuthorName && (
                        <div className='mt-3 flex items-center gap-1.5 border-t pt-2'>
                            <div className='flex h-5 w-5 items-center justify-center rounded-full bg-stone-200'>
                                <User className='h-3 w-3 text-stone-600' />
                            </div>
                            <span className='text-muted-foreground truncate text-xs'>
                                {idea.assignedAuthorName}
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail Drawer */}
            <IdeaDetailDrawer
                ideaId={idea.id}
                open={isDrawerOpen}
                onOpenChange={handleDrawerOpenChange}
                autoOpenGenerateDraft={shouldAutoOpenGenerateDraft}
            />
        </>
    )
}
