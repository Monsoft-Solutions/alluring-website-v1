'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

import { Sparkles } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'

import { PostFormBasicInfo } from './post-form-basic-info.component'
import { PostFormActions } from './post-form-actions.component'
import { PostFormSettings } from './post-form-settings.component'
import { PostFormSEO } from './post-form-seo.component'
import { PostFormKeywords } from './post-form-keywords.component'
import { PostFormFAQs } from './post-form-faqs.component'
import { FeaturedImageDialog } from './featured-image-dialog.component'
import { GeneratedImagesGallery } from './generated-images-gallery.component'
import { AnalysisPanel } from './analysis-panel.component'
import {
    createBlogPost,
    updateBlogPost,
    type BlogPostFormData,
} from '@/lib/actions/blog.action'

type Author = {
    id: string
    name: string
}

type PostFormProps = {
    authors: Author[]
    initialData?: BlogPostFormData & { id: string }
    mode: 'create' | 'edit'
}

export function PostForm({ authors, initialData, mode }: PostFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [galleryRefresh, setGalleryRefresh] = useState(0)
    const [featuredImageDialogOpen, setFeaturedImageDialogOpen] =
        useState(false)

    const [formData, setFormData] = useState<BlogPostFormData>({
        title: initialData?.title ?? '',
        slug: initialData?.slug ?? '',
        content: initialData?.content ?? '',
        metaDescription: initialData?.metaDescription ?? '',
        metaTitle: initialData?.metaTitle ?? '',
        metaKeywords: initialData?.metaKeywords ?? '',
        primaryKeyword: initialData?.primaryKeyword ?? null,
        secondaryKeywords: initialData?.secondaryKeywords ?? null,
        excerpt: initialData?.excerpt ?? '',
        authorId: initialData?.authorId ?? '',
        status: initialData?.status ?? 'draft',
        aiSummary: initialData?.aiSummary ?? null,
        featuredImageUrl: initialData?.featuredImageUrl ?? '',
        featuredImageId: initialData?.featuredImageId ?? null,
        readingTime: initialData?.readingTime ?? null,
        faqs: initialData?.faqs ?? null,
    })

    const handleChange = (
        field: keyof BlogPostFormData,
        value: string | number | null
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError(null)
    }

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleTitleChange = (title: string) => {
        handleChange('title', title)
        if (mode === 'create' && !formData.slug) {
            handleChange('slug', generateSlug(title))
        }
    }

    const calculateReadingTime = (content: string) => {
        const text = content.replace(/<[^>]*>/g, '')
        const words = text.split(/\s+/).length
        return Math.ceil(words / 200) // 200 words per minute
    }

    const handleContentChange = (content: string) => {
        handleChange('content', content)
        handleChange('readingTime', calculateReadingTime(content))
    }

    const handleImagesGenerated = () => {
        setGalleryRefresh((prev) => prev + 1)
    }

    const handleSummaryChange = (summary: string) => {
        handleChange('aiSummary', summary)
    }

    const handleSelectGeneratedImage = (imageId: string, imageUrl: string) => {
        handleChange('featuredImageId', imageId)
        handleChange('featuredImageUrl', imageUrl)
    }

    const handleFaqsChange = (
        faqs: Array<{ question: string; answer: string }> | null
    ) => {
        setFormData((prev) => ({ ...prev, faqs }))
    }

    const getSuccessMessage = (
        isCreate: boolean,
        status?: 'draft' | 'readyToPublish' | 'published'
    ) => {
        if (isCreate) return 'Post created'
        if (status === 'published') return 'Post published'
        if (status === 'readyToPublish') return 'Post marked ready to publish'
        return 'Post saved'
    }

    const handleSave = (status?: 'draft' | 'readyToPublish' | 'published') => {
        const dataToSave = {
            ...formData,
            status: status ?? formData.status,
        }

        startTransition(async () => {
            try {
                if (mode === 'create') {
                    const result = await createBlogPost(dataToSave)
                    if (result.success && result.id) {
                        toast.success(getSuccessMessage(true, status))
                        router.push(`/blog/posts/${result.id}/edit`)
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to create post')
                    }
                } else if (initialData?.id) {
                    const result = await updateBlogPost(
                        initialData.id,
                        dataToSave
                    )
                    if (result.success) {
                        toast.success(getSuccessMessage(false, status))
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to update post')
                    }
                }
            } catch {
                setError('An unexpected error occurred')
            }
        })
    }

    return (
        <div className='grid gap-6 lg:grid-cols-3'>
            {/* Main Editor */}
            <div className='space-y-6 lg:col-span-2'>
                {error && (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800'>
                        {error}
                    </div>
                )}

                <PostFormBasicInfo
                    title={formData.title}
                    slug={formData.slug}
                    content={formData.content}
                    readingTime={formData.readingTime ?? null}
                    blogPostId={initialData?.id}
                    onTitleChange={handleTitleChange}
                    onSlugChange={(slug) => handleChange('slug', slug)}
                    onContentChange={handleContentChange}
                />

                {/* Featured Image Generation */}
                {initialData?.id ? (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2 text-lg'>
                                    <Sparkles className='h-5 w-5' />
                                    AI Image Generation
                                </CardTitle>
                                <CardDescription>
                                    Generate featured images using AI with
                                    customizable options
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    type='button'
                                    onClick={() =>
                                        setFeaturedImageDialogOpen(true)
                                    }
                                    className='w-full'
                                    size='lg'
                                >
                                    <Sparkles className='mr-2 h-5 w-5' />
                                    Generate Featured Image
                                </Button>
                            </CardContent>
                        </Card>

                        <FeaturedImageDialog
                            open={featuredImageDialogOpen}
                            onOpenChange={setFeaturedImageDialogOpen}
                            blogPostId={initialData.id}
                            initialSummary={formData.aiSummary}
                            onImagesGenerated={handleImagesGenerated}
                            onSummaryChange={handleSummaryChange}
                        />
                    </>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-lg'>
                                <Sparkles className='h-5 w-5' />
                                AI Image Generation
                            </CardTitle>
                            <CardDescription>
                                Save the post first to enable AI image
                                generation
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {initialData?.id && (
                    <GeneratedImagesGallery
                        blogPostId={initialData.id}
                        currentFeaturedImageUrl={formData.featuredImageUrl}
                        onSelectImage={handleSelectGeneratedImage}
                        refreshTrigger={galleryRefresh}
                    />
                )}

                {initialData?.id && (
                    <AnalysisPanel blogPostId={initialData.id} />
                )}

                {initialData?.id && (
                    <PostFormFAQs
                        blogPostId={initialData.id}
                        content={formData.content}
                        primaryKeyword={formData.primaryKeyword ?? null}
                        faqs={formData.faqs ?? null}
                        onFaqsChange={handleFaqsChange}
                    />
                )}
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
                <PostFormActions
                    mode={mode}
                    status={formData.status}
                    isPending={isPending}
                    onSave={handleSave}
                />

                <PostFormSettings
                    authors={authors}
                    authorId={formData.authorId ?? null}
                    status={formData.status}
                    featuredImageUrl={formData.featuredImageUrl ?? null}
                    onAuthorChange={(authorId) =>
                        handleChange('authorId', authorId)
                    }
                    onStatusChange={(status) => handleChange('status', status)}
                    onFeaturedImageChange={(url) =>
                        handleChange('featuredImageUrl', url)
                    }
                />

                <PostFormKeywords
                    primaryKeyword={formData.primaryKeyword ?? null}
                    secondaryKeywords={formData.secondaryKeywords ?? null}
                    onPrimaryKeywordChange={(value) =>
                        handleChange('primaryKeyword', value)
                    }
                    onSecondaryKeywordsChange={(value) =>
                        setFormData((prev) => ({
                            ...prev,
                            secondaryKeywords: value,
                        }))
                    }
                />

                <PostFormSEO
                    title={formData.title}
                    metaTitle={formData.metaTitle ?? null}
                    metaDescription={formData.metaDescription}
                    metaKeywords={formData.metaKeywords ?? null}
                    excerpt={formData.excerpt ?? null}
                    onMetaTitleChange={(value) =>
                        handleChange('metaTitle', value)
                    }
                    onMetaDescriptionChange={(value) =>
                        handleChange('metaDescription', value)
                    }
                    onMetaKeywordsChange={(value) =>
                        handleChange('metaKeywords', value)
                    }
                    onExcerptChange={(value) => handleChange('excerpt', value)}
                />
            </div>
        </div>
    )
}
