'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import {
    Loader2,
    Save,
    Send,
    Archive,
    Sparkles,
    Brain,
    Search,
    Users,
    CheckCircle2,
    AlertCircle,
    Wand2,
} from 'lucide-react'
import Image from 'next/image'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Badge } from '@workspace/ui/components/badge'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import type { GalleryMediaAIAnalysis } from '@workspace/shared/schemas/gallery'

import { MediaUpload } from '../shared/media-upload.component'
import {
    createGalleryMedia,
    updateGalleryMedia,
    type GalleryMediaFormData,
} from '@/lib/actions/gallery.action'
import {
    analyzeGalleryMediaImage,
    saveGalleryMediaAnalysis,
    generateSEOContentFromAnalysis,
    generateVisitorContentFromAnalysis,
    generateGalleryMediaSEOContent,
    generateGalleryMediaVisitorContent,
    suggestGroupsForMedia,
    suggestGroupsFromAnalysis,
} from '@/lib/actions/gallery-ai.action'
import { getProcedureNameBySlug } from '@/lib/constants/procedure.constant'

type GalleryGroup = {
    id: string
    name: string
    slug: string
}

type MediaFormProps = {
    groups: GalleryGroup[]
    initialData?: GalleryMediaFormData & {
        id: string
        groupIds: string[]
        aiAnalysis?: GalleryMediaAIAnalysis | null
    }
    mode: 'create' | 'edit'
}

export function MediaForm({ groups, initialData, mode }: MediaFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // AI Analysis state
    const [aiAnalysis, setAiAnalysis] = useState<GalleryMediaAIAnalysis | null>(
        initialData?.aiAnalysis ?? null
    )
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isGeneratingSEO, setIsGeneratingSEO] = useState(false)
    const [isGeneratingVisitor, setIsGeneratingVisitor] = useState(false)
    const [isAssigningGroups, setIsAssigningGroups] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)

    const [formData, setFormData] = useState<GalleryMediaFormData>({
        type: initialData?.type ?? 'image',
        url: initialData?.url ?? '',
        thumbnailUrl: initialData?.thumbnailUrl ?? null,
        title: initialData?.title ?? '',
        description: initialData?.description ?? '',
        alt: initialData?.alt ?? '',
        seoTitle: initialData?.seoTitle ?? '',
        seoDescription: initialData?.seoDescription ?? '',
        slug: initialData?.slug ?? '',
        width: initialData?.width ?? null,
        height: initialData?.height ?? null,
        duration: initialData?.duration ?? null,
        fileSize: initialData?.fileSize ?? null,
        mimeType: initialData?.mimeType ?? null,
        originalFilename: initialData?.originalFilename ?? null,
        blurDataUrl: initialData?.blurDataUrl ?? null,
        isFeatured: initialData?.isFeatured ?? false,
        isBeforeAfter: initialData?.isBeforeAfter ?? false,
        displayOrder: initialData?.displayOrder ?? 0,
        status: initialData?.status ?? 'draft',
        groupIds: initialData?.groupIds ?? [],
    })

    const handleChange = (
        field: keyof GalleryMediaFormData,
        value: string | number | boolean | string[] | null
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError(null)
        setSuccess(null)
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
        // Auto-fill alt text if empty
        if (!formData.alt) {
            handleChange('alt', title)
        }
    }

    const handleMediaUpload = async (url: string | null) => {
        handleChange('url', url ?? '')

        // Auto-analyze image on upload (only for images)
        if (url && formData.type === 'image') {
            await handleAnalyzeImage(url)
        }
    }

    // AI Analysis handlers
    const handleAnalyzeImage = useCallback(
        async (imageUrl?: string) => {
            const urlToAnalyze = imageUrl ?? formData.url
            if (!urlToAnalyze) {
                setAiError('No image URL available')
                return
            }

            setIsAnalyzing(true)
            setAiError(null)

            try {
                const result = await analyzeGalleryMediaImage(
                    urlToAnalyze,
                    mode === 'edit' ? initialData?.id : undefined
                )

                if (result.success && result.analysis) {
                    setAiAnalysis(result.analysis)

                    // Auto-set isBeforeAfter if detected
                    if (result.analysis.isBeforeAfter) {
                        handleChange('isBeforeAfter', true)
                    }
                } else {
                    setAiError(result.error ?? 'Failed to analyze image')
                }
            } catch {
                setAiError('An unexpected error occurred during analysis')
            } finally {
                setIsAnalyzing(false)
            }
        },
        [formData.url, mode, initialData?.id]
    )

    const handleGenerateSEOContent = useCallback(async () => {
        if (!aiAnalysis) {
            setAiError('Please analyze the image first')
            return
        }

        setIsGeneratingSEO(true)
        setAiError(null)

        try {
            // Use the stored analysis if we have a mediaId, otherwise use in-memory analysis
            const result =
                mode === 'edit' && initialData?.id
                    ? await generateGalleryMediaSEOContent(
                          initialData.id,
                          formData.title
                      )
                    : await generateSEOContentFromAnalysis(
                          aiAnalysis,
                          formData.title
                      )

            if (result.success && result.content) {
                handleChange('seoTitle', result.content.seoTitle)
                handleChange('seoDescription', result.content.seoDescription)
                // Only update slug if it's empty or in create mode
                if (!formData.slug || mode === 'create') {
                    handleChange('slug', result.content.slug)
                }
                setSuccess('SEO content generated successfully')
            } else {
                setAiError(result.error ?? 'Failed to generate SEO content')
            }
        } catch {
            setAiError('An unexpected error occurred')
        } finally {
            setIsGeneratingSEO(false)
        }
    }, [aiAnalysis, mode, initialData?.id, formData.title, formData.slug])

    const handleGenerateVisitorContent = useCallback(async () => {
        if (!aiAnalysis) {
            setAiError('Please analyze the image first')
            return
        }

        setIsGeneratingVisitor(true)
        setAiError(null)

        try {
            // Use the stored analysis if we have a mediaId, otherwise use in-memory analysis
            const result =
                mode === 'edit' && initialData?.id
                    ? await generateGalleryMediaVisitorContent(
                          initialData.id,
                          formData.title
                      )
                    : await generateVisitorContentFromAnalysis(
                          aiAnalysis,
                          formData.title
                      )

            if (result.success && result.content) {
                handleChange('title', result.content.title)
                handleChange('description', result.content.description)
                handleChange('alt', result.content.alt)
                // Also update slug if empty
                if (!formData.slug || mode === 'create') {
                    handleChange('slug', generateSlug(result.content.title))
                }
                setSuccess('Visitor content generated successfully')
            } else {
                setAiError(result.error ?? 'Failed to generate visitor content')
            }
        } catch {
            setAiError('An unexpected error occurred')
        } finally {
            setIsGeneratingVisitor(false)
        }
    }, [aiAnalysis, mode, initialData?.id, formData.title, formData.slug])

    const handleGroupToggle = (groupId: string, checked: boolean) => {
        if (checked) {
            handleChange('groupIds', [...(formData.groupIds ?? []), groupId])
        } else {
            handleChange(
                'groupIds',
                (formData.groupIds ?? []).filter((id) => id !== groupId)
            )
        }
    }

    const handleAutoAssignGroups = useCallback(async () => {
        if (!aiAnalysis) {
            setAiError('Please analyze the image first')
            return
        }

        setIsAssigningGroups(true)
        setAiError(null)

        try {
            // Use the stored analysis if we have a mediaId, otherwise use in-memory analysis
            const result =
                mode === 'edit' && initialData?.id
                    ? await suggestGroupsForMedia(initialData.id)
                    : await suggestGroupsFromAnalysis(aiAnalysis)

            if (result.success && result.suggestedGroupIds) {
                // Merge suggested groups with existing selections
                const existingGroupIds = formData.groupIds ?? []
                const mergedGroupIds = [
                    ...new Set([
                        ...existingGroupIds,
                        ...result.suggestedGroupIds,
                    ]),
                ]
                handleChange('groupIds', mergedGroupIds)
                setSuccess(
                    `Assigned ${result.suggestedGroupIds.length} group${result.suggestedGroupIds.length === 1 ? '' : 's'} based on AI analysis`
                )
            } else {
                setAiError(result.error ?? 'Failed to suggest groups')
            }
        } catch {
            setAiError('An unexpected error occurred')
        } finally {
            setIsAssigningGroups(false)
        }
    }, [aiAnalysis, mode, initialData?.id, formData.groupIds])

    const handleSave = async (status?: 'draft' | 'published' | 'archived') => {
        const dataToSave = {
            ...formData,
            status: status ?? formData.status,
        }

        startTransition(async () => {
            try {
                if (mode === 'create') {
                    const result = await createGalleryMedia(dataToSave)
                    if (result.success && result.id) {
                        // Save AI analysis if we have it
                        if (aiAnalysis) {
                            await saveGalleryMediaAnalysis(
                                result.id,
                                aiAnalysis
                            )
                        }
                        router.push(`/gallery/media/${result.id}/edit`)
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to create media')
                    }
                } else if (initialData?.id) {
                    const result = await updateGalleryMedia(
                        initialData.id,
                        dataToSave
                    )
                    if (result.success) {
                        setSuccess('Media updated successfully')
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to update media')
                    }
                }
            } catch {
                setError('An unexpected error occurred')
            }
        })
    }

    return (
        <div className='grid gap-6 lg:grid-cols-3'>
            {/* Main Content */}
            <div className='space-y-6 lg:col-span-2'>
                {error && (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800'>
                        {error}
                    </div>
                )}

                {success && (
                    <div className='rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800'>
                        {success}
                    </div>
                )}

                {aiError && (
                    <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800'>
                        <div className='flex items-center gap-2'>
                            <AlertCircle className='h-4 w-4' />
                            <span>{aiError}</span>
                        </div>
                    </div>
                )}

                {/* Media Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Media File</CardTitle>
                        <CardDescription>
                            Upload an image or video file
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>Media Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value: 'image' | 'video') =>
                                    handleChange('type', value)
                                }
                                disabled={mode === 'edit'}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='image'>Image</SelectItem>
                                    <SelectItem value='video'>Video</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {mode === 'create' ? (
                            <div className='space-y-2'>
                                <Label>
                                    {formData.type === 'image'
                                        ? 'Upload Image'
                                        : 'Upload Video'}
                                </Label>
                                <MediaUpload
                                    value={formData.url || null}
                                    onChange={handleMediaUpload}
                                    accept={
                                        formData.type === 'image'
                                            ? 'image/*'
                                            : 'video/*'
                                    }
                                    maxSize={
                                        formData.type === 'image'
                                            ? 5 * 1024 * 1024
                                            : 50 * 1024 * 1024
                                    }
                                    folder='gallery'
                                    isVideo={formData.type === 'video'}
                                    placeholder={
                                        formData.type === 'image'
                                            ? 'Drop image here or click to upload'
                                            : 'Drop video here or click to upload'
                                    }
                                />
                            </div>
                        ) : (
                            <div className='space-y-2'>
                                <Label>Current Media</Label>
                                {formData.type === 'image' && formData.url && (
                                    <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                                        <Image
                                            src={formData.url}
                                            alt={formData.alt || formData.title}
                                            fill
                                            className='object-contain'
                                            sizes='(max-width: 768px) 100vw, 600px'
                                        />
                                    </div>
                                )}
                                {formData.type === 'video' && formData.url && (
                                    <video
                                        src={formData.url}
                                        controls
                                        className='w-full rounded-lg'
                                    />
                                )}
                                <p className='text-muted-foreground truncate text-xs'>
                                    {formData.url}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Basic Info */}
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                        <div>
                            <CardTitle>Details</CardTitle>
                            <CardDescription>
                                Basic information about this media
                            </CardDescription>
                        </div>
                        {formData.type === 'image' && (
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleGenerateVisitorContent}
                                disabled={
                                    !aiAnalysis ||
                                    isGeneratingVisitor ||
                                    isAnalyzing
                                }
                            >
                                {isGeneratingVisitor ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <Users className='mr-2 h-4 w-4' />
                                )}
                                Generate for Visitors
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='title'>Title</Label>
                            <Input
                                id='title'
                                value={formData.title}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
                                placeholder='Enter media title'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='slug'>URL Slug</Label>
                            <div className='flex items-center gap-2'>
                                <span className='text-muted-foreground text-sm'>
                                    /gallery/
                                </span>
                                <Input
                                    id='slug'
                                    value={formData.slug}
                                    onChange={(e) =>
                                        handleChange('slug', e.target.value)
                                    }
                                    placeholder='media-url-slug'
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='description'>Description</Label>
                            <Textarea
                                id='description'
                                value={formData.description ?? ''}
                                onChange={(e) =>
                                    handleChange('description', e.target.value)
                                }
                                placeholder='Detailed description of this media'
                                rows={4}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='alt'>Alt Text</Label>
                            <Input
                                id='alt'
                                value={formData.alt ?? ''}
                                onChange={(e) =>
                                    handleChange('alt', e.target.value)
                                }
                                placeholder='Accessible description for screen readers'
                            />
                            <p className='text-muted-foreground text-xs'>
                                Important for accessibility and SEO
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* SEO */}
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                        <div>
                            <CardTitle>SEO</CardTitle>
                            <CardDescription>
                                Search engine optimization settings
                            </CardDescription>
                        </div>
                        {formData.type === 'image' && (
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleGenerateSEOContent}
                                disabled={
                                    !aiAnalysis ||
                                    isGeneratingSEO ||
                                    isAnalyzing
                                }
                            >
                                {isGeneratingSEO ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <Search className='mr-2 h-4 w-4' />
                                )}
                                Generate for SEO
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='seoTitle'>SEO Title</Label>
                            <Input
                                id='seoTitle'
                                value={formData.seoTitle ?? ''}
                                onChange={(e) =>
                                    handleChange('seoTitle', e.target.value)
                                }
                                placeholder='Page title for search results'
                                maxLength={60}
                            />
                            <p className='text-muted-foreground text-xs'>
                                {(formData.seoTitle ?? '').length}/60 characters
                            </p>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='seoDescription'>
                                SEO Description
                            </Label>
                            <Textarea
                                id='seoDescription'
                                value={formData.seoDescription ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        'seoDescription',
                                        e.target.value
                                    )
                                }
                                placeholder='Brief description for search results'
                                rows={3}
                                maxLength={160}
                            />
                            <p className='text-muted-foreground text-xs'>
                                {(formData.seoDescription ?? '').length}/160
                                characters
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <Button
                            className='w-full'
                            onClick={() => handleSave()}
                            disabled={isPending || !formData.url}
                        >
                            {isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Save className='mr-2 h-4 w-4' />
                            )}
                            Save {mode === 'create' ? 'Draft' : 'Changes'}
                        </Button>
                        {mode === 'edit' && formData.status !== 'published' && (
                            <Button
                                variant='default'
                                className='w-full bg-green-600 hover:bg-green-700'
                                onClick={() => handleSave('published')}
                                disabled={isPending}
                            >
                                <Send className='mr-2 h-4 w-4' />
                                Publish
                            </Button>
                        )}
                        {mode === 'edit' && formData.status !== 'archived' && (
                            <Button
                                variant='outline'
                                className='w-full'
                                onClick={() => handleSave('archived')}
                                disabled={isPending}
                            >
                                <Archive className='mr-2 h-4 w-4' />
                                Archive
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* AI Analysis */}
                {formData.type === 'image' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Brain className='h-5 w-5' />
                                AI Analysis
                            </CardTitle>
                            <CardDescription>
                                Vision-powered image analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {isAnalyzing ? (
                                <div className='flex flex-col items-center gap-3 py-4'>
                                    <Loader2 className='h-8 w-8 animate-spin text-stone-500' />
                                    <p className='text-sm text-stone-500'>
                                        Analyzing image...
                                    </p>
                                </div>
                            ) : aiAnalysis ? (
                                <div className='space-y-3'>
                                    <div className='flex items-center gap-2 text-green-600'>
                                        <CheckCircle2 className='h-4 w-4' />
                                        <span className='text-sm font-medium'>
                                            Analysis Complete
                                        </span>
                                    </div>

                                    {aiAnalysis.detectedProcedure && (
                                        <div className='space-y-1'>
                                            <p className='text-xs font-medium text-stone-500'>
                                                Detected Procedure
                                            </p>
                                            <Badge variant='secondary'>
                                                {getProcedureNameBySlug(
                                                    aiAnalysis.detectedProcedure
                                                ) ??
                                                    aiAnalysis.detectedProcedure}
                                            </Badge>
                                            {aiAnalysis.procedureConfidence && (
                                                <p className='text-xs text-stone-400'>
                                                    Confidence:{' '}
                                                    {Math.round(
                                                        aiAnalysis.procedureConfidence *
                                                            100
                                                    )}
                                                    %
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {aiAnalysis.isBeforeAfter && (
                                        <div className='space-y-1'>
                                            <p className='text-xs font-medium text-stone-500'>
                                                Before/After
                                            </p>
                                            <Badge variant='outline'>
                                                {aiAnalysis.beforeAfterType ??
                                                    'Detected'}
                                            </Badge>
                                        </div>
                                    )}

                                    {aiAnalysis.bodyArea && (
                                        <div className='space-y-1'>
                                            <p className='text-xs font-medium text-stone-500'>
                                                Body Area
                                            </p>
                                            <p className='text-sm capitalize'>
                                                {aiAnalysis.bodyArea}
                                            </p>
                                        </div>
                                    )}

                                    <div className='space-y-1'>
                                        <p className='text-xs font-medium text-stone-500'>
                                            Image Quality
                                        </p>
                                        <Badge
                                            variant={
                                                aiAnalysis.imageQuality ===
                                                'high'
                                                    ? 'default'
                                                    : aiAnalysis.imageQuality ===
                                                        'medium'
                                                      ? 'secondary'
                                                      : 'destructive'
                                            }
                                        >
                                            {aiAnalysis.imageQuality}
                                        </Badge>
                                    </div>

                                    <p className='text-xs text-stone-400'>
                                        Analyzed:{' '}
                                        {new Date(
                                            aiAnalysis.analyzedAt
                                        ).toLocaleString()}
                                    </p>

                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='w-full'
                                        onClick={() => handleAnalyzeImage()}
                                        disabled={isAnalyzing || !formData.url}
                                    >
                                        <Sparkles className='mr-2 h-4 w-4' />
                                        Re-analyze
                                    </Button>
                                </div>
                            ) : (
                                <div className='space-y-3'>
                                    <p className='text-sm text-stone-500'>
                                        {formData.url
                                            ? 'Click to analyze the image with AI'
                                            : 'Upload an image to enable AI analysis'}
                                    </p>
                                    <Button
                                        type='button'
                                        variant='default'
                                        size='sm'
                                        className='w-full'
                                        onClick={() => handleAnalyzeImage()}
                                        disabled={isAnalyzing || !formData.url}
                                    >
                                        <Sparkles className='mr-2 h-4 w-4' />
                                        Analyze Image
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(
                                    value: 'draft' | 'published' | 'archived'
                                ) => handleChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='draft'>Draft</SelectItem>
                                    <SelectItem value='published'>
                                        Published
                                    </SelectItem>
                                    <SelectItem value='archived'>
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='displayOrder'>Display Order</Label>
                            <Input
                                id='displayOrder'
                                type='number'
                                value={formData.displayOrder ?? 0}
                                onChange={(e) =>
                                    handleChange(
                                        'displayOrder',
                                        parseInt(e.target.value, 10) || 0
                                    )
                                }
                            />
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id='isFeatured'
                                checked={formData.isFeatured}
                                onCheckedChange={(checked) =>
                                    handleChange('isFeatured', !!checked)
                                }
                            />
                            <Label
                                htmlFor='isFeatured'
                                className='text-sm font-normal'
                            >
                                Featured media
                            </Label>
                        </div>

                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id='isBeforeAfter'
                                checked={formData.isBeforeAfter}
                                onCheckedChange={(checked) =>
                                    handleChange('isBeforeAfter', !!checked)
                                }
                            />
                            <Label
                                htmlFor='isBeforeAfter'
                                className='text-sm font-normal'
                            >
                                Before/After image
                            </Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Groups */}
                {groups.length > 0 && (
                    <Card>
                        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                            <div>
                                <CardTitle>Groups</CardTitle>
                                <CardDescription>
                                    Assign to gallery groups
                                </CardDescription>
                            </div>
                            {formData.type === 'image' && (
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='icon'
                                    onClick={handleAutoAssignGroups}
                                    disabled={
                                        !aiAnalysis ||
                                        isAssigningGroups ||
                                        isAnalyzing
                                    }
                                    title='Auto-assign groups with AI'
                                >
                                    {isAssigningGroups ? (
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                    ) : (
                                        <Wand2 className='h-4 w-4' />
                                    )}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-2'>
                                {groups.map((group) => (
                                    <div
                                        key={group.id}
                                        className='flex items-center space-x-2'
                                    >
                                        <Checkbox
                                            id={`group-${group.id}`}
                                            checked={(
                                                formData.groupIds ?? []
                                            ).includes(group.id)}
                                            onCheckedChange={(checked) =>
                                                handleGroupToggle(
                                                    group.id,
                                                    !!checked
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor={`group-${group.id}`}
                                            className='text-sm font-normal'
                                        >
                                            {group.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
