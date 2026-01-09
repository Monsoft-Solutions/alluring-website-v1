'use client'

import { useMemo, useState } from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
    Lightbulb,
    Sparkles,
    Shield,
    FileText,
    ImageIcon,
    Pencil,
    CheckCircle,
    Calendar,
    Newspaper,
    AlertCircle,
    Loader2,
} from 'lucide-react'

import type {
    PostsByStatus,
    PipelinePostItem,
    PipelineStatus,
} from '@/lib/queries/pipeline.query'
import { PipelineCard } from './pipeline-card.component'
import { PipelinePostEditDialog } from './pipeline-post-edit-dialog.component'
import {
    useUpdatePipelineStatus,
    useTriggerPipeline,
} from '@/hooks/use-pipeline.hook'

/**
 * Stage configuration for the Kanban board
 */
const STAGE_CONFIG: Record<
    PipelineStatus,
    {
        label: string
        icon: React.ComponentType<{ className?: string }>
        headerClass: string
        badgeClass: string
        description: string
        autoProcess: boolean
    }
> = {
    ideation: {
        label: 'Ideation',
        icon: Lightbulb,
        headerClass: 'border-stone-200 bg-stone-50',
        badgeClass: 'bg-stone-200 text-stone-700',
        description: 'Plan and research',
        autoProcess: false,
    },
    generate: {
        label: 'Generate',
        icon: Sparkles,
        headerClass: 'border-amber-200 bg-amber-50',
        badgeClass: 'bg-amber-200 text-amber-700',
        description: 'AI content generation',
        autoProcess: true,
    },
    ai_review: {
        label: 'AI Review',
        icon: Shield,
        headerClass: 'border-blue-200 bg-blue-50',
        badgeClass: 'bg-blue-200 text-blue-700',
        description: 'Quality review',
        autoProcess: true,
    },
    generate_metadata: {
        label: 'Metadata',
        icon: FileText,
        headerClass: 'border-purple-200 bg-purple-50',
        badgeClass: 'bg-purple-200 text-purple-700',
        description: 'Extract SEO data',
        autoProcess: true,
    },
    generate_image: {
        label: 'Image',
        icon: ImageIcon,
        headerClass: 'border-pink-200 bg-pink-50',
        badgeClass: 'bg-pink-200 text-pink-700',
        description: 'AI featured image',
        autoProcess: true,
    },
    draft: {
        label: 'Draft',
        icon: Pencil,
        headerClass: 'border-cyan-200 bg-cyan-50',
        badgeClass: 'bg-cyan-200 text-cyan-700',
        description: 'Human review',
        autoProcess: false,
    },
    ready_to_publish: {
        label: 'Ready',
        icon: CheckCircle,
        headerClass: 'border-emerald-200 bg-emerald-50',
        badgeClass: 'bg-emerald-200 text-emerald-700',
        description: 'Approved for publish',
        autoProcess: false,
    },
    scheduled: {
        label: 'Scheduled',
        icon: Calendar,
        headerClass: 'border-orange-200 bg-orange-50',
        badgeClass: 'bg-orange-200 text-orange-700',
        description: 'Publish scheduled',
        autoProcess: false,
    },
    published: {
        label: 'Published',
        icon: Newspaper,
        headerClass: 'border-green-200 bg-green-50',
        badgeClass: 'bg-green-200 text-green-700',
        description: 'Live on site',
        autoProcess: false,
    },
}

const STAGE_ORDER: PipelineStatus[] = [
    'ideation',
    'generate',
    'ai_review',
    'generate_metadata',
    'generate_image',
    'draft',
    'ready_to_publish',
    'scheduled',
    'published',
]

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
        const sourceStatus = e.dataTransfer.getData(
            'sourceStatus'
        ) as PipelineStatus

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
            {STAGE_ORDER.map((status) => {
                const config = STAGE_CONFIG[status]
                const posts = filteredData[status]
                const Icon = config.icon

                // Check if any post in this column is processing
                const hasProcessing = posts.some(
                    (p) => p.pipelineProcessingStatus === 'processing'
                )
                const hasError = posts.some(
                    (p) => p.pipelineProcessingStatus === 'error'
                )

                return (
                    <div
                        key={status}
                        className='w-[280px] flex-shrink-0'
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, status)}
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
                                            onDragStart={(e) =>
                                                handleDragStart(e, post)
                                            }
                                            onClick={() =>
                                                handleCardClick(post)
                                            }
                                        />
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )
            })}

            {/* Edit Dialog */}
            <PipelinePostEditDialog
                post={selectedPost}
                open={isEditDialogOpen}
                onOpenChange={handleEditDialogClose}
            />
        </div>
    )
}
