'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Badge } from '@workspace/ui/components/badge'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import {
    Loader2,
    Save,
    X,
    FileText,
    AlertCircle,
    Search,
    Image as ImageIcon,
    ListChecks,
    ExternalLink,
    ArrowUpRight,
    Lightbulb,
    Activity,
} from 'lucide-react'

import type { PipelinePostItem } from '@/lib/types/pipeline.type'
import type { PipelineStatus } from '@/lib/types/blog/blog-action.type'
import type { PlanningData } from '@workspace/db/types'
import type { BlogPostPriority } from '@/lib/types/blog/blog-action.type'
import type { FaqItem } from '@workspace/shared/schemas/blog'

// Consolidated form state to avoid cascading renders in useEffect
type FormState = {
    title: string
    slug: string
    status: PipelineStatus
    priority: BlogPostPriority
    authorId: string | null
    content: string
    primaryKeyword: string
    secondaryKeywords: string[]
    metaTitle: string
    metaDescription: string
    metaKeywords: string
    excerpt: string
    featuredImageId: string | null
    featuredImageUrl: string | null
    aiSummary: string
    planningData: PlanningData
    faqs: FaqItem[]
}

const initialFormState: FormState = {
    title: '',
    slug: '',
    status: 'ideation',
    priority: 'medium',
    authorId: null,
    content: '',
    primaryKeyword: '',
    secondaryKeywords: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    excerpt: '',
    featuredImageId: null,
    featuredImageUrl: null,
    aiSummary: '',
    planningData: {},
    faqs: [],
}
import {
    useUpdatePipelinePost,
    usePipelinePostDetail,
} from '@/hooks/use-pipeline.hook'
import { FeaturedImageDialog } from '../featured-image-dialog.component'

// Tab components
import { ContentTab } from './tabs/content-tab.component'
import { DetailsTab } from './tabs/details-tab.component'
import { SeoTab } from './tabs/seo-tab.component'
import { MediaTab } from './tabs/media-tab.component'
import { PlanningTab } from './tabs/planning-tab.component'
import { PipelineTab } from './tabs/pipeline-tab.component'

type PipelinePostEditDialogProps = {
    post: PipelinePostItem | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

/**
 * Airtable-inspired edit dialog with tabbed interface
 * Uses extracted tab components for maintainability
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

    // Consolidated form state (single setState to avoid cascading renders)
    const [formState, setFormState] = useState<FormState>(initialFormState)

    // UI-specific state (kept separate as they're not part of form data sync)
    const [secondaryInput, setSecondaryInput] = useState('')
    const [galleryRefresh, setGalleryRefresh] = useState(0)
    const [featuredImageDialogOpen, setFeaturedImageDialogOpen] =
        useState(false)
    const [isDirty, setIsDirty] = useState(false)

    // Destructure form state for easier access
    const {
        title,
        slug,
        status,
        priority,
        authorId,
        content,
        primaryKeyword,
        secondaryKeywords,
        metaTitle,
        metaDescription,
        metaKeywords,
        excerpt,
        featuredImageId,
        featuredImageUrl,
        aiSummary,
        planningData,
        faqs,
    } = formState

    // Field setters (wrappers around setFormState for child components)
    const setTitle = useCallback(
        (value: string) => setFormState((prev) => ({ ...prev, title: value })),
        []
    )
    const setSlug = useCallback(
        (value: string) => setFormState((prev) => ({ ...prev, slug: value })),
        []
    )
    const setStatus = useCallback(
        (value: PipelineStatus) =>
            setFormState((prev) => ({ ...prev, status: value })),
        []
    )
    const setPriority = useCallback(
        (value: BlogPostPriority) =>
            setFormState((prev) => ({ ...prev, priority: value })),
        []
    )
    const setContent = useCallback(
        (value: string) =>
            setFormState((prev) => ({ ...prev, content: value })),
        []
    )
    const setPrimaryKeyword = useCallback(
        (value: string) =>
            setFormState((prev) => ({ ...prev, primaryKeyword: value })),
        []
    )
    const setMetaTitle = useCallback(
        (value: string) =>
            setFormState((prev) => ({ ...prev, metaTitle: value })),
        []
    )
    const setMetaDescription = useCallback(
        (value: string) =>
            setFormState((prev) => ({ ...prev, metaDescription: value })),
        []
    )
    const setMetaKeywords = useCallback(
        (value: string) =>
            setFormState((prev) => ({ ...prev, metaKeywords: value })),
        []
    )
    const setExcerpt = useCallback(
        (value: string) =>
            setFormState((prev) => ({ ...prev, excerpt: value })),
        []
    )
    const setFeaturedImageId = useCallback(
        (value: string | null) =>
            setFormState((prev) => ({ ...prev, featuredImageId: value })),
        []
    )
    const setFeaturedImageUrl = useCallback(
        (value: string | null) =>
            setFormState((prev) => ({ ...prev, featuredImageUrl: value })),
        []
    )

    // Initialize form when post detail is loaded
    // Note: This effect intentionally sets state to sync form with fetched data.
    // We've consolidated 18+ individual setState calls into a single setFormState call
    // to minimize re-renders. This is a valid pattern for form initialization.
    useEffect(() => {
        if (postDetail) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Valid form initialization from fetched data
            setFormState({
                title: postDetail.title,
                slug: postDetail.slug || '',
                status: postDetail.status,
                priority: postDetail.priority,
                authorId: postDetail.authorId,
                content: postDetail.content || '',
                primaryKeyword: postDetail.primaryKeyword || '',
                secondaryKeywords: postDetail.secondaryKeywords || [],
                metaTitle: postDetail.metaTitle || '',
                metaDescription: postDetail.metaDescription || '',
                metaKeywords: postDetail.metaKeywords || '',
                excerpt: postDetail.excerpt || '',
                featuredImageId: postDetail.featuredImageId,
                featuredImageUrl: postDetail.featuredImageUrl,
                aiSummary: postDetail.aiSummary || '',
                planningData: postDetail.planningData || {},
                faqs: postDetail.faqs || [],
            })
            setIsDirty(false)
        } else if (post && !postDetail) {
            // Use basic post data while loading
            setFormState((prev) => ({
                ...prev,
                title: post.title,
                status: post.status,
                priority: post.priority,
                primaryKeyword: post.primaryKeyword || '',
                planningData: post.planningData || {},
            }))
            setIsDirty(false)
        }
    }, [post, postDetail])

    // Mark as dirty on any change
    const markDirty = useCallback(() => setIsDirty(true), [])

    // Planning handlers
    const handlePlanningChange = useCallback(
        (field: keyof PlanningData, value: string) => {
            setFormState((prev) => ({
                ...prev,
                planningData: {
                    ...prev.planningData,
                    [field]: value || undefined,
                },
            }))
            markDirty()
        },
        [markDirty]
    )

    // Secondary keywords handlers
    const handleAddSecondaryKeyword = useCallback(() => {
        const keyword = secondaryInput.trim()
        if (!keyword || secondaryKeywords.includes(keyword)) return
        setFormState((prev) => ({
            ...prev,
            secondaryKeywords: [...prev.secondaryKeywords, keyword],
        }))
        setSecondaryInput('')
        markDirty()
    }, [secondaryInput, secondaryKeywords, markDirty])

    const handleRemoveSecondaryKeyword = useCallback(
        (keyword: string) => {
            setFormState((prev) => ({
                ...prev,
                secondaryKeywords: prev.secondaryKeywords.filter(
                    (k) => k !== keyword
                ),
            }))
            markDirty()
        },
        [markDirty]
    )

    // FAQ handlers
    const handleAddFaq = useCallback(() => {
        setFormState((prev) => ({
            ...prev,
            faqs: [...prev.faqs, { question: '', answer: '' }],
        }))
        markDirty()
    }, [markDirty])

    const handleRemoveFaq = useCallback(
        (index: number) => {
            setFormState((prev) => ({
                ...prev,
                faqs: prev.faqs.filter((_, i) => i !== index),
            }))
            markDirty()
        },
        [markDirty]
    )

    const handleUpdateFaq = useCallback(
        (index: number, field: 'question' | 'answer', value: string) => {
            setFormState((prev) => {
                const updated = [...prev.faqs]
                if (updated[index]) {
                    updated[index] = { ...updated[index], [field]: value }
                }
                return { ...prev, faqs: updated }
            })
            markDirty()
        },
        [markDirty]
    )

    // Image handlers
    const handleSelectGeneratedImage = useCallback(
        (imageId: string, imageUrl: string) => {
            setFormState((prev) => ({
                ...prev,
                featuredImageId: imageId,
                featuredImageUrl: imageUrl,
            }))
            markDirty()
        },
        [markDirty]
    )

    const handleImagesGenerated = useCallback(() => {
        setGalleryRefresh((prev) => prev + 1)
    }, [])

    const handleSummaryChange = useCallback(
        (summary: string) => {
            setFormState((prev) => ({
                ...prev,
                aiSummary: summary,
            }))
            markDirty()
        },
        [markDirty]
    )

    // Save handler
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
                void handleSave()
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

    return (
        <>
            <Dialog open={open} onOpenChange={handleCloseAttempt}>
                <DialogContent
                    className='flex h-[90vh] max-h-[950px] w-[95vw] max-w-6xl flex-col gap-0 overflow-hidden p-0'
                    showCloseButton={false}
                    size='xl'
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
                                <TabsTrigger
                                    value='pipeline'
                                    className='rounded-none data-[state=active]:border-b-2 data-[state=active]:border-stone-900'
                                >
                                    <Activity className='mr-2 h-4 w-4' />
                                    Pipeline
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className='flex-1 overflow-hidden'>
                            <ContentTab
                                title={title}
                                setTitle={setTitle}
                                content={content}
                                setContent={setContent}
                                isLoadingDetail={isLoadingDetail}
                                markDirty={markDirty}
                                blogPostId={post?.id}
                            />

                            <DetailsTab
                                slug={slug}
                                setSlug={setSlug}
                                status={status}
                                setStatus={setStatus}
                                priority={priority}
                                setPriority={setPriority}
                                primaryKeyword={primaryKeyword}
                                setPrimaryKeyword={setPrimaryKeyword}
                                secondaryKeywords={secondaryKeywords}
                                secondaryInput={secondaryInput}
                                setSecondaryInput={setSecondaryInput}
                                handleAddSecondaryKeyword={
                                    handleAddSecondaryKeyword
                                }
                                handleRemoveSecondaryKeyword={
                                    handleRemoveSecondaryKeyword
                                }
                                isProcessing={isProcessing}
                                hasError={hasError}
                                processingError={post?.processingError ?? null}
                                markDirty={markDirty}
                            />

                            <SeoTab
                                title={title}
                                metaTitle={metaTitle}
                                setMetaTitle={setMetaTitle}
                                metaDescription={metaDescription}
                                setMetaDescription={setMetaDescription}
                                metaKeywords={metaKeywords}
                                setMetaKeywords={setMetaKeywords}
                                excerpt={excerpt}
                                setExcerpt={setExcerpt}
                                markDirty={markDirty}
                            />

                            <MediaTab
                                featuredImageUrl={featuredImageUrl}
                                setFeaturedImageId={setFeaturedImageId}
                                setFeaturedImageUrl={setFeaturedImageUrl}
                                handleSelectGeneratedImage={
                                    handleSelectGeneratedImage
                                }
                                galleryRefresh={galleryRefresh}
                                setFeaturedImageDialogOpen={
                                    setFeaturedImageDialogOpen
                                }
                                markDirty={markDirty}
                                blogPostId={post?.id}
                                imageQa={
                                    (
                                        postDetail?.pipelineState ??
                                        post?.pipelineState
                                    )?.imageGenerationPhase
                                }
                            />

                            <PlanningTab
                                planningData={planningData}
                                handlePlanningChange={handlePlanningChange}
                                faqs={faqs}
                                handleAddFaq={handleAddFaq}
                                handleRemoveFaq={handleRemoveFaq}
                                handleUpdateFaq={handleUpdateFaq}
                            />

                            <PipelineTab
                                pipelineState={
                                    postDetail?.pipelineState ??
                                    post?.pipelineState
                                }
                                phaseTraceUrls={postDetail?.phaseTraceUrls}
                                isLoadingDetail={isLoadingDetail}
                            />
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
