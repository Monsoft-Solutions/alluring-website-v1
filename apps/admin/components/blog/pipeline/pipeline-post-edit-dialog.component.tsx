'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Badge } from '@workspace/ui/components/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import {
    Loader2,
    Save,
    X,
    Tag,
    Target,
    FileText,
    Users,
    Lightbulb,
    AlertCircle,
} from 'lucide-react'

import type {
    PipelinePostItem,
    PipelineStatus,
} from '@/lib/queries/pipeline.query'
import type { PlanningData } from '@workspace/db/types'
import type { BlogPostPriority } from '@/lib/actions/blog.action'
import {
    useUpdatePipelinePost,
    usePipelinePostDetail,
} from '@/hooks/use-pipeline.hook'
import { CONTENT_TYPE_LABELS } from '@/lib/constants/blog-ideas.constant'
import { PostEditor } from '../editor.component'

/**
 * Priority configuration with Airtable-style colors
 */
const PRIORITY_OPTIONS: Array<{
    value: BlogPostPriority
    label: string
    className: string
}> = [
    { value: 'low', label: 'Low', className: 'bg-stone-100 text-stone-700' },
    {
        value: 'medium',
        label: 'Medium',
        className: 'bg-blue-100 text-blue-700',
    },
    { value: 'high', label: 'High', className: 'bg-amber-100 text-amber-700' },
    { value: 'urgent', label: 'Urgent', className: 'bg-red-100 text-red-600' },
]

/**
 * Status options for the pipeline
 */
const STATUS_OPTIONS: Array<{
    value: PipelineStatus
    label: string
    className: string
}> = [
    {
        value: 'ideation',
        label: 'Ideation',
        className: 'bg-stone-100 text-stone-700',
    },
    {
        value: 'generate',
        label: 'Generate',
        className: 'bg-amber-100 text-amber-700',
    },
    {
        value: 'ai_review',
        label: 'AI Review',
        className: 'bg-blue-100 text-blue-700',
    },
    {
        value: 'generate_metadata',
        label: 'Extract Metadata',
        className: 'bg-violet-100 text-violet-700',
    },
    { value: 'draft', label: 'Draft', className: 'bg-sky-100 text-sky-700' },
    {
        value: 'ready_to_publish',
        label: 'Ready to Publish',
        className: 'bg-emerald-100 text-emerald-700',
    },
    {
        value: 'scheduled',
        label: 'Scheduled',
        className: 'bg-orange-100 text-orange-700',
    },
    {
        value: 'published',
        label: 'Published',
        className: 'bg-purple-100 text-purple-700',
    },
]

/**
 * Content type options
 */
const CONTENT_TYPE_OPTIONS = Object.entries(CONTENT_TYPE_LABELS).map(
    ([value, label]) => ({ value, label })
)

type PipelinePostEditDialogProps = {
    post: PipelinePostItem | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * Airtable-inspired field row component
 */
function FieldRow({
    label,
    icon: Icon,
    children,
}: {
    label: string
    icon?: React.ComponentType<{ className?: string }>
    children: React.ReactNode
}) {
    return (
        <div className='group border-b border-stone-100 py-3 transition-colors hover:bg-stone-50/50'>
            <Label className='mb-1.5 flex items-center gap-1.5 text-xs font-medium text-stone-500'>
                {Icon && <Icon className='h-3.5 w-3.5' />}
                {label}
            </Label>
            <div className='text-sm'>{children}</div>
        </div>
    )
}

/**
 * Airtable-inspired edit dialog for pipeline posts
 * Two-column layout: Left for metadata, Right for content editor
 */
export function PipelinePostEditDialog({
    post,
    open,
    onOpenChange,
}: PipelinePostEditDialogProps) {
    const updateMutation = useUpdatePipelinePost()

    // Fetch full post details including content
    const { data: postDetail, isLoading: isLoadingDetail } =
        usePipelinePostDetail(open ? (post?.id ?? null) : null)

    // Form state
    const [title, setTitle] = useState('')
    const [status, setStatus] = useState<PipelineStatus>('ideation')
    const [priority, setPriority] = useState<BlogPostPriority>('medium')
    const [primaryKeyword, setPrimaryKeyword] = useState('')
    const [content, setContent] = useState('')
    const [planningData, setPlanningData] = useState<PlanningData>({})

    // Initialize form when post detail is loaded
    useEffect(() => {
        if (postDetail) {
            setTitle(postDetail.title)
            setStatus(postDetail.status)
            setPriority(postDetail.priority)
            setPrimaryKeyword(postDetail.primaryKeyword || '')
            setContent(postDetail.content || '')
            setPlanningData(postDetail.planningData || {})
        } else if (post && !postDetail) {
            // Use basic post data while loading full detail
            setTitle(post.title)
            setStatus(post.status)
            setPriority(post.priority)
            setPrimaryKeyword(post.primaryKeyword || '')
            setPlanningData(post.planningData || {})
        }
    }, [post, postDetail])

    const handlePlanningChange = useCallback(
        (field: keyof PlanningData, value: string) => {
            setPlanningData((prev) => ({
                ...prev,
                [field]: value || undefined,
            }))
        },
        []
    )

    const handleSave = useCallback(async () => {
        if (!post) return

        if (!title.trim()) {
            toast.error('Title is required')
            return
        }

        try {
            const result = await updateMutation.mutateAsync({
                id: post.id,
                data: {
                    title: title.trim(),
                    status,
                    priority,
                    primaryKeyword: primaryKeyword || null,
                    content: content || null,
                    planningData:
                        Object.keys(planningData).length > 0
                            ? planningData
                            : null,
                },
            })

            if (result.success) {
                toast.success('Post updated successfully')
                onOpenChange(false)
            } else {
                toast.error(result.error || 'Failed to update post')
            }
        } catch {
            toast.error('Failed to update post')
        }
    }, [
        post,
        title,
        status,
        priority,
        primaryKeyword,
        content,
        planningData,
        updateMutation,
        onOpenChange,
    ])

    const isProcessing = post?.pipelineProcessingStatus === 'processing'
    const hasError = post?.pipelineProcessingStatus === 'error'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className='flex h-[85vh] max-h-[900px] w-[95vw] max-w-5xl flex-col gap-0 overflow-hidden p-0'
                size='xl'
                showCloseButton={false}
            >
                {/* Header */}
                <DialogHeader className='flex-shrink-0 border-b bg-stone-50/50 px-6 py-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-stone-100 to-stone-200'>
                                <FileText className='h-5 w-5 text-stone-600' />
                            </div>
                            <div>
                                <DialogTitle className='text-lg'>
                                    Edit Post
                                </DialogTitle>
                                <DialogDescription className='text-xs'>
                                    {post?.slug
                                        ? `/blog/${post.slug}`
                                        : 'New post'}
                                </DialogDescription>
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            {isProcessing && (
                                <Badge
                                    variant='outline'
                                    className='gap-1 border-amber-300 bg-amber-50 text-amber-700'
                                >
                                    <Loader2 className='h-3 w-3 animate-spin' />
                                    Processing
                                </Badge>
                            )}
                            {hasError && (
                                <Badge
                                    variant='outline'
                                    className='gap-1 border-red-300 bg-red-50 text-red-700'
                                >
                                    <AlertCircle className='h-3 w-3' />
                                    Error
                                </Badge>
                            )}
                            <Button
                                variant='ghost'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => onOpenChange(false)}
                            >
                                <X className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Two-column content */}
                <div className='flex flex-1 overflow-hidden'>
                    {/* Left Column - Metadata */}
                    <ScrollArea className='w-[40%] border-r'>
                        <div className='space-y-0 p-4'>
                            {/* Title */}
                            <FieldRow label='Title'>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder='Enter post title'
                                    className='border-0 bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0'
                                />
                            </FieldRow>

                            {/* Status */}
                            <FieldRow label='Status'>
                                <Select
                                    value={status}
                                    onValueChange={(v) =>
                                        setStatus(v as PipelineStatus)
                                    }
                                    disabled={isProcessing}
                                >
                                    <SelectTrigger className='h-8 w-full border-0 bg-transparent p-0 shadow-none focus:ring-0'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                <Badge
                                                    variant='secondary'
                                                    className={option.className}
                                                >
                                                    {option.label}
                                                </Badge>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldRow>

                            {/* Priority */}
                            <FieldRow label='Priority'>
                                <Select
                                    value={priority}
                                    onValueChange={(v) =>
                                        setPriority(v as BlogPostPriority)
                                    }
                                >
                                    <SelectTrigger className='h-8 w-full border-0 bg-transparent p-0 shadow-none focus:ring-0'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                <Badge
                                                    variant='secondary'
                                                    className={option.className}
                                                >
                                                    {option.label}
                                                </Badge>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldRow>

                            {/* Primary Keyword */}
                            <FieldRow label='Primary Keyword' icon={Tag}>
                                <Input
                                    value={primaryKeyword}
                                    onChange={(e) =>
                                        setPrimaryKeyword(e.target.value)
                                    }
                                    placeholder='e.g., bbl surgery miami'
                                    className='border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0'
                                />
                            </FieldRow>

                            {/* Divider for Planning Data */}
                            <div className='py-3'>
                                <p className='text-xs font-semibold tracking-wider text-stone-400 uppercase'>
                                    Planning Data
                                </p>
                            </div>

                            {/* Topic */}
                            <FieldRow label='Topic' icon={Target}>
                                <Input
                                    value={planningData.topic || ''}
                                    onChange={(e) =>
                                        handlePlanningChange(
                                            'topic',
                                            e.target.value
                                        )
                                    }
                                    placeholder='Main topic or theme'
                                    className='border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0'
                                />
                            </FieldRow>

                            {/* Content Type */}
                            <FieldRow label='Content Type' icon={FileText}>
                                <Select
                                    value={planningData.contentType || ''}
                                    onValueChange={(v) =>
                                        handlePlanningChange('contentType', v)
                                    }
                                >
                                    <SelectTrigger className='h-8 w-full border-0 bg-transparent p-0 shadow-none focus:ring-0'>
                                        <SelectValue placeholder='Select content type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CONTENT_TYPE_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FieldRow>

                            {/* Target Audience */}
                            <FieldRow label='Target Audience' icon={Users}>
                                <Textarea
                                    value={planningData.targetAudience || ''}
                                    onChange={(e) =>
                                        handlePlanningChange(
                                            'targetAudience',
                                            e.target.value
                                        )
                                    }
                                    placeholder='Who is this content for?'
                                    rows={2}
                                    className='resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0'
                                />
                            </FieldRow>

                            {/* Unique Angle */}
                            <FieldRow label='Unique Angle' icon={Lightbulb}>
                                <Textarea
                                    value={planningData.uniqueAngle || ''}
                                    onChange={(e) =>
                                        handlePlanningChange(
                                            'uniqueAngle',
                                            e.target.value
                                        )
                                    }
                                    placeholder='What makes this different?'
                                    rows={2}
                                    className='resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0'
                                />
                            </FieldRow>

                            {/* Error message if any */}
                            {hasError && post?.processingError && (
                                <div className='mt-4 rounded-lg border border-red-200 bg-red-50 p-3'>
                                    <p className='text-xs font-medium text-red-800'>
                                        Processing Error
                                    </p>
                                    <p className='mt-1 text-xs text-red-700'>
                                        {post.processingError}
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Right Column - Content Editor */}
                    <div className='flex w-[60%] flex-col'>
                        <div className='flex items-center justify-between border-b bg-stone-50/30 px-4 py-2'>
                            <p className='text-xs font-semibold tracking-wider text-stone-400 uppercase'>
                                Content
                            </p>
                            {isLoadingDetail && (
                                <div className='flex items-center gap-1 text-xs text-stone-400'>
                                    <Loader2 className='h-3 w-3 animate-spin' />
                                    Loading...
                                </div>
                            )}
                        </div>
                        <div className='flex-1 overflow-auto p-4'>
                            {isLoadingDetail ? (
                                <div className='flex h-full items-center justify-center'>
                                    <div className='flex flex-col items-center gap-2 text-stone-400'>
                                        <Loader2 className='h-6 w-6 animate-spin' />
                                        <p className='text-sm'>
                                            Loading content...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <PostEditor
                                    content={content}
                                    onChange={setContent}
                                    placeholder='Start writing your post content...'
                                    blogPostId={post?.id}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='flex flex-shrink-0 items-center justify-between border-t bg-stone-50/50 px-6 py-4'>
                    <div className='text-xs text-stone-500'>
                        {post?.updatedAt && (
                            <span>
                                Last updated:{' '}
                                {new Date(post.updatedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={updateMutation.isPending || isProcessing}
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className='mr-2 h-4 w-4' />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
