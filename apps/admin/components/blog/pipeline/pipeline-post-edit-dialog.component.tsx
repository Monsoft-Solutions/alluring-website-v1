'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'
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
    Search,
    Image as ImageIcon,
    ListChecks,
    ExternalLink,
    ArrowUpRight,
    Plus,
    Trash2,
    Sparkles,
} from 'lucide-react'

import type {
    PipelinePostItem,
    PipelineStatus,
} from '@/lib/queries/pipeline.query'
import type { PlanningData } from '@workspace/db/types'
import type { BlogPostPriority } from '@/lib/actions/blog.action'
import type { FaqItem } from '@workspace/shared/schemas/blog'
import {
    useUpdatePipelinePost,
    usePipelinePostDetail,
} from '@/hooks/use-pipeline.hook'
import { CONTENT_TYPE_LABELS } from '@/lib/constants/blog-ideas.constant'
import { PostEditor } from '../editor.component'
import { GeneratedImagesGallery } from '../generated-images-gallery.component'
import { FeaturedImageDialog } from '../featured-image-dialog.component'

/**
 * Priority configuration
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
 * Status options
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
        label: 'Metadata',
        className: 'bg-violet-100 text-violet-700',
    },
    { value: 'draft', label: 'Draft', className: 'bg-sky-100 text-sky-700' },
    {
        value: 'ready_to_publish',
        label: 'Ready',
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

const CONTENT_TYPE_OPTIONS = Object.entries(CONTENT_TYPE_LABELS).map(
    ([value, label]) => ({ value, label })
)

type PipelinePostEditDialogProps = {
    post: PipelinePostItem | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * Airtable-inspired edit dialog with tabbed interface
 */
export function PipelinePostEditDialog({
    post,
    open,
    onOpenChange,
}: PipelinePostEditDialogProps) {
    const updateMutation = useUpdatePipelinePost()

    // Fetch full post details
    const { data: postDetail, isLoading: isLoadingDetail } =
        usePipelinePostDetail(open ? (post?.id ?? null) : null)

    // Form state
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [status, setStatus] = useState<PipelineStatus>('ideation')
    const [priority, setPriority] = useState<BlogPostPriority>('medium')
    const [authorId, setAuthorId] = useState<string | null>(null)
    const [content, setContent] = useState('')
    // Keywords
    const [primaryKeyword, setPrimaryKeyword] = useState('')
    const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([])
    const [secondaryInput, setSecondaryInput] = useState('')
    // SEO
    const [metaTitle, setMetaTitle] = useState('')
    const [metaDescription, setMetaDescription] = useState('')
    const [metaKeywords, setMetaKeywords] = useState('')
    const [excerpt, setExcerpt] = useState('')
    // Media
    const [featuredImageId, setFeaturedImageId] = useState<string | null>(null)
    const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(
        null
    )
    const [aiSummary, setAiSummary] = useState('')
    const [galleryRefresh, setGalleryRefresh] = useState(0)
    const [featuredImageDialogOpen, setFeaturedImageDialogOpen] =
        useState(false)
    // Planning
    const [planningData, setPlanningData] = useState<PlanningData>({})
    // FAQs
    const [faqs, setFaqs] = useState<FaqItem[]>([])
    // Dirty state for unsaved changes warning
    const [isDirty, setIsDirty] = useState(false)

    // Initialize form when post detail is loaded
    useEffect(() => {
        if (postDetail) {
            setTitle(postDetail.title)
            setSlug(postDetail.slug || '')
            setStatus(postDetail.status)
            setPriority(postDetail.priority)
            setAuthorId(postDetail.authorId)
            setContent(postDetail.content || '')
            setPrimaryKeyword(postDetail.primaryKeyword || '')
            setSecondaryKeywords(postDetail.secondaryKeywords || [])
            setMetaTitle(postDetail.metaTitle || '')
            setMetaDescription(postDetail.metaDescription || '')
            setMetaKeywords(postDetail.metaKeywords || '')
            setExcerpt(postDetail.excerpt || '')
            setFeaturedImageId(postDetail.featuredImageId)
            setFeaturedImageUrl(postDetail.featuredImageUrl)
            setAiSummary(postDetail.aiSummary || '')
            setPlanningData(postDetail.planningData || {})
            setFaqs(postDetail.faqs || [])
            setIsDirty(false)
        } else if (post && !postDetail) {
            // Use basic post data while loading
            setTitle(post.title)
            setStatus(post.status)
            setPriority(post.priority)
            setPrimaryKeyword(post.primaryKeyword || '')
            setPlanningData(post.planningData || {})
            setIsDirty(false)
        }
    }, [post, postDetail])

    // Mark as dirty on any change
    const markDirty = useCallback(() => setIsDirty(true), [])

    const handlePlanningChange = useCallback(
        (field: keyof PlanningData, value: string) => {
            setPlanningData((prev) => ({
                ...prev,
                [field]: value || undefined,
            }))
            markDirty()
        },
        [markDirty]
    )

    // Secondary keywords handlers
    const handleAddSecondaryKeyword = useCallback(() => {
        const keyword = secondaryInput.trim()
        if (!keyword || secondaryKeywords.includes(keyword)) return
        setSecondaryKeywords((prev) => [...prev, keyword])
        setSecondaryInput('')
        markDirty()
    }, [secondaryInput, secondaryKeywords, markDirty])

    const handleRemoveSecondaryKeyword = useCallback(
        (keyword: string) => {
            setSecondaryKeywords((prev) => prev.filter((k) => k !== keyword))
            markDirty()
        },
        [markDirty]
    )

    // FAQ handlers
    const handleAddFaq = useCallback(() => {
        setFaqs((prev) => [...prev, { question: '', answer: '' }])
        markDirty()
    }, [markDirty])

    const handleRemoveFaq = useCallback(
        (index: number) => {
            setFaqs((prev) => prev.filter((_, i) => i !== index))
            markDirty()
        },
        [markDirty]
    )

    const handleUpdateFaq = useCallback(
        (index: number, field: 'question' | 'answer', value: string) => {
            setFaqs((prev) => {
                const updated = [...prev]
                if (updated[index]) {
                    updated[index] = { ...updated[index], [field]: value }
                }
                return updated
            })
            markDirty()
        },
        [markDirty]
    )

    // Image handlers
    const handleSelectGeneratedImage = useCallback(
        (imageId: string, imageUrl: string) => {
            setFeaturedImageId(imageId)
            setFeaturedImageUrl(imageUrl)
            markDirty()
        },
        [markDirty]
    )

    const handleImagesGenerated = useCallback(() => {
        setGalleryRefresh((prev) => prev + 1)
    }, [])

    const handleSummaryChange = useCallback(
        (summary: string) => {
            setAiSummary(summary)
            markDirty()
        },
        [markDirty]
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
                    slug: slug || null,
                    status,
                    priority,
                    authorId: authorId || null,
                    primaryKeyword: primaryKeyword || null,
                    secondaryKeywords:
                        secondaryKeywords.length > 0 ? secondaryKeywords : null,
                    content: content || null,
                    metaTitle: metaTitle || null,
                    metaDescription: metaDescription || null,
                    metaKeywords: metaKeywords || null,
                    excerpt: excerpt || null,
                    featuredImageId: featuredImageId || null,
                    aiSummary: aiSummary || null,
                    planningData:
                        Object.keys(planningData).length > 0
                            ? planningData
                            : null,
                    faqs: faqs.length > 0 ? faqs : null,
                },
            })

            if (result.success) {
                toast.success('Post updated successfully')
                setIsDirty(false)
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
        slug,
        status,
        priority,
        authorId,
        primaryKeyword,
        secondaryKeywords,
        content,
        metaTitle,
        metaDescription,
        metaKeywords,
        excerpt,
        featuredImageId,
        aiSummary,
        planningData,
        faqs,
        updateMutation,
        onOpenChange,
    ])

    // Keyboard shortcut for save
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 's' && open) {
                e.preventDefault()
                handleSave()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, handleSave])

    const handleCloseAttempt = useCallback(
        (newOpen: boolean) => {
            if (!newOpen && isDirty) {
                const confirmed = window.confirm(
                    'You have unsaved changes. Are you sure you want to close?'
                )
                if (!confirmed) return
            }
            onOpenChange(newOpen)
        },
        [isDirty, onOpenChange]
    )

    const isProcessing = post?.pipelineProcessingStatus === 'processing'
    const hasError = post?.pipelineProcessingStatus === 'error'
    const isPublished = status === 'published'

    const priorityConfig = useMemo(
        () => PRIORITY_OPTIONS.find((p) => p.value === priority),
        [priority]
    )
    const statusConfig = useMemo(
        () => STATUS_OPTIONS.find((s) => s.value === status),
        [status]
    )

    return (
        <>
            <Dialog open={open} onOpenChange={handleCloseAttempt}>
                <DialogContent
                    className='flex h-[90vh] max-h-[950px] w-[95vw] max-w-6xl flex-col gap-0 overflow-hidden p-0'
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
                                        {title || 'Edit Post'}
                                    </DialogTitle>
                                    <DialogDescription className='text-xs'>
                                        {slug ? `/blog/${slug}` : 'New post'}
                                        {isDirty && (
                                            <span className='ml-2 text-amber-600'>
                                                • Unsaved changes
                                            </span>
                                        )}
                                    </DialogDescription>
                                </div>
                            </div>
                            <div className='flex items-center gap-2'>
                                {/* Status badges */}
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
                                {/* View Live */}
                                {isPublished && slug && (
                                    <Button variant='outline' size='sm' asChild>
                                        <Link
                                            href={`/blog/${slug}`}
                                            target='_blank'
                                        >
                                            <ExternalLink className='mr-1 h-3 w-3' />
                                            View Live
                                        </Link>
                                    </Button>
                                )}
                                {/* Full Editor */}
                                {post?.id && (
                                    <Button variant='ghost' size='sm' asChild>
                                        <Link
                                            href={`/blog/posts/${post.id}/edit`}
                                        >
                                            <ArrowUpRight className='mr-1 h-3 w-3' />
                                            Full Editor
                                        </Link>
                                    </Button>
                                )}
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => handleCloseAttempt(false)}
                                >
                                    <X className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Tabbed Content */}
                    <Tabs
                        defaultValue='content'
                        className='flex flex-1 flex-col overflow-hidden'
                    >
                        <div className='flex-shrink-0 border-b bg-white px-6'>
                            <TabsList className='h-12 bg-transparent p-0'>
                                <TabsTrigger
                                    value='content'
                                    className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900'
                                >
                                    <FileText className='mr-2 h-4 w-4' />
                                    Content
                                </TabsTrigger>
                                <TabsTrigger
                                    value='details'
                                    className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900'
                                >
                                    <ListChecks className='mr-2 h-4 w-4' />
                                    Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value='seo'
                                    className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900'
                                >
                                    <Search className='mr-2 h-4 w-4' />
                                    SEO
                                </TabsTrigger>
                                <TabsTrigger
                                    value='media'
                                    className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900'
                                >
                                    <ImageIcon className='mr-2 h-4 w-4' />
                                    Media
                                </TabsTrigger>
                                <TabsTrigger
                                    value='planning'
                                    className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900'
                                >
                                    <Lightbulb className='mr-2 h-4 w-4' />
                                    Planning
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className='flex-1 overflow-hidden'>
                            {/* Content Tab */}
                            <TabsContent value='content' className='m-0 h-full'>
                                <div className='flex h-full flex-col'>
                                    <div className='border-b p-4'>
                                        <Label className='text-xs font-medium text-stone-500'>
                                            Title
                                        </Label>
                                        <Input
                                            value={title}
                                            onChange={(e) => {
                                                setTitle(e.target.value)
                                                markDirty()
                                            }}
                                            placeholder='Post title'
                                            className='mt-1 border-0 bg-transparent p-0 text-lg font-semibold shadow-none focus-visible:ring-0'
                                        />
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
                                                onChange={(val) => {
                                                    setContent(val)
                                                    markDirty()
                                                }}
                                                placeholder='Start writing your post content...'
                                                blogPostId={post?.id}
                                            />
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Details Tab */}
                            <TabsContent value='details' className='m-0 h-full'>
                                <ScrollArea className='h-full'>
                                    <div className='grid gap-6 p-6 md:grid-cols-2'>
                                        {/* Left Column */}
                                        <div className='space-y-4'>
                                            {/* Slug */}
                                            <div>
                                                <Label className='text-xs font-medium text-stone-500'>
                                                    Slug
                                                </Label>
                                                <Input
                                                    value={slug}
                                                    onChange={(e) => {
                                                        setSlug(e.target.value)
                                                        markDirty()
                                                    }}
                                                    placeholder='post-url-slug'
                                                    className='mt-1'
                                                />
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <Label className='text-xs font-medium text-stone-500'>
                                                    Status
                                                </Label>
                                                <Select
                                                    value={status}
                                                    onValueChange={(v) => {
                                                        setStatus(
                                                            v as PipelineStatus
                                                        )
                                                        markDirty()
                                                    }}
                                                    disabled={isProcessing}
                                                >
                                                    <SelectTrigger className='mt-1'>
                                                        <SelectValue>
                                                            {statusConfig && (
                                                                <Badge
                                                                    variant='secondary'
                                                                    className={
                                                                        statusConfig.className
                                                                    }
                                                                >
                                                                    {
                                                                        statusConfig.label
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    <Badge
                                                                        variant='secondary'
                                                                        className={
                                                                            option.className
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </Badge>
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Priority */}
                                            <div>
                                                <Label className='text-xs font-medium text-stone-500'>
                                                    Priority
                                                </Label>
                                                <Select
                                                    value={priority}
                                                    onValueChange={(v) => {
                                                        setPriority(
                                                            v as BlogPostPriority
                                                        )
                                                        markDirty()
                                                    }}
                                                >
                                                    <SelectTrigger className='mt-1'>
                                                        <SelectValue>
                                                            {priorityConfig && (
                                                                <Badge
                                                                    variant='secondary'
                                                                    className={
                                                                        priorityConfig.className
                                                                    }
                                                                >
                                                                    {
                                                                        priorityConfig.label
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PRIORITY_OPTIONS.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    <Badge
                                                                        variant='secondary'
                                                                        className={
                                                                            option.className
                                                                        }
                                                                    >
                                                                        {
                                                                            option.label
                                                                        }
                                                                    </Badge>
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Right Column - Keywords */}
                                        <div className='space-y-4'>
                                            {/* Primary Keyword */}
                                            <div>
                                                <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                                                    <Tag className='h-3 w-3' />
                                                    Primary Keyword
                                                </Label>
                                                <Input
                                                    value={primaryKeyword}
                                                    onChange={(e) => {
                                                        setPrimaryKeyword(
                                                            e.target.value
                                                        )
                                                        markDirty()
                                                    }}
                                                    placeholder='main target keyword'
                                                    className='mt-1'
                                                />
                                            </div>

                                            {/* Secondary Keywords */}
                                            <div>
                                                <Label className='text-xs font-medium text-stone-500'>
                                                    Secondary Keywords
                                                </Label>
                                                <div className='mt-1 flex gap-2'>
                                                    <Input
                                                        value={secondaryInput}
                                                        onChange={(e) =>
                                                            setSecondaryInput(
                                                                e.target.value
                                                            )
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (
                                                                e.key ===
                                                                'Enter'
                                                            ) {
                                                                e.preventDefault()
                                                                handleAddSecondaryKeyword()
                                                            }
                                                        }}
                                                        placeholder='supporting keyword'
                                                    />
                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        onClick={
                                                            handleAddSecondaryKeyword
                                                        }
                                                        disabled={
                                                            !secondaryInput.trim()
                                                        }
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                                {secondaryKeywords.length >
                                                    0 && (
                                                    <div className='mt-2 flex flex-wrap gap-2'>
                                                        {secondaryKeywords.map(
                                                            (kw) => (
                                                                <Badge
                                                                    key={kw}
                                                                    variant='secondary'
                                                                    className='gap-1 pr-1'
                                                                >
                                                                    {kw}
                                                                    <button
                                                                        type='button'
                                                                        onClick={() =>
                                                                            handleRemoveSecondaryKeyword(
                                                                                kw
                                                                            )
                                                                        }
                                                                        className='hover:bg-muted ml-1 rounded-sm p-0.5'
                                                                    >
                                                                        <X className='h-3 w-3' />
                                                                    </button>
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Error message */}
                                        {hasError && post?.processingError && (
                                            <div className='col-span-2 rounded-lg border border-red-200 bg-red-50 p-3'>
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
                            </TabsContent>

                            {/* SEO Tab */}
                            <TabsContent value='seo' className='m-0 h-full'>
                                <ScrollArea className='h-full'>
                                    <div className='space-y-6 p-6'>
                                        <div className='grid gap-6 md:grid-cols-2'>
                                            {/* Meta Title */}
                                            <div>
                                                <Label className='text-xs font-medium text-stone-500'>
                                                    Meta Title
                                                </Label>
                                                <Input
                                                    value={metaTitle}
                                                    onChange={(e) => {
                                                        setMetaTitle(
                                                            e.target.value
                                                        )
                                                        markDirty()
                                                    }}
                                                    placeholder='SEO title (defaults to post title)'
                                                    className='mt-1'
                                                />
                                                <p className='mt-1 text-xs text-stone-400'>
                                                    {
                                                        (metaTitle || title)
                                                            .length
                                                    }
                                                    /60 characters
                                                </p>
                                            </div>

                                            {/* Meta Keywords */}
                                            <div>
                                                <Label className='text-xs font-medium text-stone-500'>
                                                    Meta Keywords
                                                </Label>
                                                <Input
                                                    value={metaKeywords}
                                                    onChange={(e) => {
                                                        setMetaKeywords(
                                                            e.target.value
                                                        )
                                                        markDirty()
                                                    }}
                                                    placeholder='keyword1, keyword2, keyword3'
                                                    className='mt-1'
                                                />
                                            </div>
                                        </div>

                                        {/* Meta Description */}
                                        <div>
                                            <Label className='text-xs font-medium text-stone-500'>
                                                Meta Description
                                            </Label>
                                            <Textarea
                                                value={metaDescription}
                                                onChange={(e) => {
                                                    setMetaDescription(
                                                        e.target.value
                                                    )
                                                    markDirty()
                                                }}
                                                placeholder='Brief description for search results'
                                                rows={3}
                                                className='mt-1'
                                            />
                                            <p className='mt-1 text-xs text-stone-400'>
                                                {metaDescription.length}/160
                                                characters
                                            </p>
                                        </div>

                                        {/* Excerpt */}
                                        <div>
                                            <Label className='text-xs font-medium text-stone-500'>
                                                Excerpt
                                            </Label>
                                            <Textarea
                                                value={excerpt}
                                                onChange={(e) => {
                                                    setExcerpt(e.target.value)
                                                    markDirty()
                                                }}
                                                placeholder='Short summary shown in blog listings'
                                                rows={3}
                                                className='mt-1'
                                            />
                                        </div>
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            {/* Media Tab */}
                            <TabsContent value='media' className='m-0 h-full'>
                                <ScrollArea className='h-full'>
                                    <div className='space-y-6 p-6'>
                                        {/* Current Featured Image */}
                                        <div>
                                            <Label className='text-xs font-medium text-stone-500'>
                                                Featured Image
                                            </Label>
                                            <div className='mt-2 flex items-start gap-4'>
                                                {featuredImageUrl ? (
                                                    <div className='relative h-32 w-48 overflow-hidden rounded-lg border bg-stone-100'>
                                                        <Image
                                                            src={
                                                                featuredImageUrl
                                                            }
                                                            alt='Featured image'
                                                            fill
                                                            className='object-cover'
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className='flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-stone-200 bg-stone-50'>
                                                        <div className='text-center'>
                                                            <ImageIcon className='mx-auto h-8 w-8 text-stone-300' />
                                                            <p className='mt-1 text-xs text-stone-400'>
                                                                No image
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className='space-y-2'>
                                                    <Button
                                                        type='button'
                                                        onClick={() =>
                                                            setFeaturedImageDialogOpen(
                                                                true
                                                            )
                                                        }
                                                        disabled={!post?.id}
                                                    >
                                                        <Sparkles className='mr-2 h-4 w-4' />
                                                        Generate Image
                                                    </Button>
                                                    {featuredImageUrl && (
                                                        <Button
                                                            type='button'
                                                            variant='outline'
                                                            onClick={() => {
                                                                setFeaturedImageId(
                                                                    null
                                                                )
                                                                setFeaturedImageUrl(
                                                                    null
                                                                )
                                                                markDirty()
                                                            }}
                                                        >
                                                            <Trash2 className='mr-2 h-4 w-4' />
                                                            Remove
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Generated Images Gallery */}
                                        {post?.id && (
                                            <GeneratedImagesGallery
                                                blogPostId={post.id}
                                                currentFeaturedImageUrl={
                                                    featuredImageUrl
                                                }
                                                onSelectImage={
                                                    handleSelectGeneratedImage
                                                }
                                                refreshTrigger={galleryRefresh}
                                            />
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            {/* Planning Tab */}
                            <TabsContent
                                value='planning'
                                className='m-0 h-full'
                            >
                                <ScrollArea className='h-full'>
                                    <div className='space-y-6 p-6'>
                                        <div className='grid gap-6 md:grid-cols-2'>
                                            {/* Topic */}
                                            <div>
                                                <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                                                    <Target className='h-3 w-3' />
                                                    Topic
                                                </Label>
                                                <Input
                                                    value={
                                                        planningData.topic || ''
                                                    }
                                                    onChange={(e) =>
                                                        handlePlanningChange(
                                                            'topic',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='Main topic or theme'
                                                    className='mt-1'
                                                />
                                            </div>

                                            {/* Content Type */}
                                            <div>
                                                <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                                                    <FileText className='h-3 w-3' />
                                                    Content Type
                                                </Label>
                                                <Select
                                                    value={
                                                        planningData.contentType ||
                                                        ''
                                                    }
                                                    onValueChange={(v) =>
                                                        handlePlanningChange(
                                                            'contentType',
                                                            v
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className='mt-1'>
                                                        <SelectValue placeholder='Select content type' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {CONTENT_TYPE_OPTIONS.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Target Audience */}
                                        <div>
                                            <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                                                <Users className='h-3 w-3' />
                                                Target Audience
                                            </Label>
                                            <Textarea
                                                value={
                                                    planningData.targetAudience ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    handlePlanningChange(
                                                        'targetAudience',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder='Who is this content for?'
                                                rows={2}
                                                className='mt-1'
                                            />
                                        </div>

                                        {/* Unique Angle */}
                                        <div>
                                            <Label className='flex items-center gap-1 text-xs font-medium text-stone-500'>
                                                <Lightbulb className='h-3 w-3' />
                                                Unique Angle
                                            </Label>
                                            <Textarea
                                                value={
                                                    planningData.uniqueAngle ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    handlePlanningChange(
                                                        'uniqueAngle',
                                                        e.target.value
                                                    )
                                                }
                                                placeholder='What makes this different?'
                                                rows={2}
                                                className='mt-1'
                                            />
                                        </div>

                                        {/* FAQs Section */}
                                        <div className='border-t pt-6'>
                                            <div className='mb-4 flex items-center justify-between'>
                                                <Label className='text-sm font-medium'>
                                                    FAQ Schema
                                                </Label>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={handleAddFaq}
                                                >
                                                    <Plus className='mr-1 h-3 w-3' />
                                                    Add FAQ
                                                </Button>
                                            </div>

                                            {faqs.length === 0 ? (
                                                <div className='rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4 text-center'>
                                                    <p className='text-sm text-stone-500'>
                                                        No FAQs yet. Add
                                                        questions for FAQ schema
                                                        markup.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className='space-y-4'>
                                                    {faqs.map((faq, index) => (
                                                        <div
                                                            key={index}
                                                            className='rounded-lg border bg-stone-50 p-4'
                                                        >
                                                            <div className='mb-2 flex items-center justify-between'>
                                                                <span className='text-xs font-medium text-stone-500'>
                                                                    FAQ #
                                                                    {index + 1}
                                                                </span>
                                                                <Button
                                                                    type='button'
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={() =>
                                                                        handleRemoveFaq(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className='h-3 w-3 text-red-500' />
                                                                </Button>
                                                            </div>
                                                            <div className='space-y-2'>
                                                                <Textarea
                                                                    value={
                                                                        faq.question
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateFaq(
                                                                            index,
                                                                            'question',
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder='Question...'
                                                                    rows={1}
                                                                    className='text-sm'
                                                                />
                                                                <Textarea
                                                                    value={
                                                                        faq.answer
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleUpdateFaq(
                                                                            index,
                                                                            'answer',
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    placeholder='Answer...'
                                                                    rows={2}
                                                                    className='text-sm'
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </div>
                    </Tabs>

                    {/* Footer */}
                    <div className='flex flex-shrink-0 items-center justify-between border-t bg-stone-50/50 px-6 py-4'>
                        <div className='text-xs text-stone-500'>
                            {postDetail?.updatedAt && (
                                <span>
                                    Last updated:{' '}
                                    {new Date(
                                        postDetail.updatedAt
                                    ).toLocaleString()}
                                </span>
                            )}
                            <span className='ml-4 text-stone-400'>
                                ⌘S to save
                            </span>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button
                                variant='outline'
                                onClick={() => handleCloseAttempt(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={
                                    updateMutation.isPending || isProcessing
                                }
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

            {/* Featured Image Dialog */}
            {post?.id && (
                <FeaturedImageDialog
                    open={featuredImageDialogOpen}
                    onOpenChange={setFeaturedImageDialogOpen}
                    blogPostId={post.id}
                    initialSummary={aiSummary || null}
                    onImagesGenerated={handleImagesGenerated}
                    onSummaryChange={handleSummaryChange}
                />
            )}
        </>
    )
}
