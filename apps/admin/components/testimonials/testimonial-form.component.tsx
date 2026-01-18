'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Loader2, Save, Send, Archive, Star } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Textarea } from '@workspace/ui/components/textarea'
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
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@workspace/ui/components/tabs'

import { MediaUpload } from '../shared/media-upload.component'
import {
    createTestimonial,
    updateTestimonial,
} from '@/lib/actions/testimonial.action'
import type {
    TestimonialFormData,
    TestimonialDetail,
    InstagramPostSelectItem,
} from '@/lib/types/testimonials/testimonial.type'
import { InstagramPickerDialog } from './instagram-picker-dialog.component'
import { VideoAnalysisPanel } from './video-analysis-panel.component'

// Extended form data for client-side handling
interface TestimonialFormDataExtended extends TestimonialFormData {
    directMediaUrl?: string | null
}

type TestimonialFormProps = {
    initialData?: TestimonialDetail
    instagramPosts?: InstagramPostSelectItem[]
    mode: 'create' | 'edit'
}

export function TestimonialForm({
    initialData,
    instagramPosts = [],
    mode,
}: TestimonialFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const [formData, setFormData] = useState<TestimonialFormData>({
        sourceType: initialData?.sourceType ?? 'manual',
        instagramPostId: initialData?.instagramPostId ?? null,
        mediaId: initialData?.mediaId ?? null,
        thumbnailMediaId: initialData?.thumbnailMediaId ?? null,
        patientName: initialData?.patientName ?? '',
        procedure: initialData?.procedure ?? '',
        procedureSlug: initialData?.procedureSlug ?? null,
        timeframe: initialData?.timeframe ?? '',
        quote: initialData?.quote ?? '',
        longDescription: initialData?.longDescription ?? '',
        rating: initialData?.rating ?? 5,
        isFeatured: initialData?.isFeatured ?? false,
        displayOrder: initialData?.displayOrder ?? 0,
        status: initialData?.status ?? 'draft',
        slug: initialData?.slug ?? '',
        metadata: initialData?.metadata ?? null,
    })

    // Track selected Instagram post details for display
    const [selectedInstagramPost, setSelectedInstagramPost] =
        useState<InstagramPostSelectItem | null>(
            initialData?.instagramPost
                ? {
                      id: initialData.instagramPost.id,
                      instagramId: '',
                      code: '',
                      mediaType: initialData.instagramPost.mediaType,
                      caption: initialData.instagramPost.caption,
                      permalink: initialData.instagramPost.permalink,
                      likeCount: initialData.instagramPost.likeCount,
                      commentCount: initialData.instagramPost.commentCount,
                      thumbnailUrl: null,
                      hasTestimonial: true,
                  }
                : null
        )

    // Track direct upload media URL
    const [directMediaUrl, setDirectMediaUrl] = useState<string | null>(
        initialData?.media?.url ?? null
    )
    const [directMediaType, setDirectMediaType] = useState<'image' | 'video'>(
        initialData?.media?.type ?? 'video'
    )

    const handleChange = (
        field: keyof TestimonialFormData,
        value: string | number | boolean | null
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError(null)
        setSuccess(null)
    }

    const generateSlug = (name: string, procedure: string) => {
        const combined = `${name}-${procedure}`
        return combined
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handlePatientNameChange = (name: string) => {
        handleChange('patientName', name)
        if (mode === 'create' && !formData.slug) {
            handleChange('slug', generateSlug(name, formData.procedure))
        }
    }

    const handleProcedureChange = (procedure: string) => {
        handleChange('procedure', procedure)
        // Auto-generate procedure slug
        const procedureSlug = procedure
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        handleChange('procedureSlug', procedureSlug)
        // Update main slug if creating
        if (mode === 'create' && !formData.slug) {
            handleChange('slug', generateSlug(formData.patientName, procedure))
        }
    }

    const handleSourceTypeChange = (
        sourceType: 'instagram' | 'direct' | 'manual'
    ) => {
        handleChange('sourceType', sourceType)
        // Clear source-specific fields when changing type
        if (sourceType !== 'instagram') {
            handleChange('instagramPostId', null)
            setSelectedInstagramPost(null)
        }
        if (sourceType !== 'direct') {
            handleChange('mediaId', null)
            handleChange('thumbnailMediaId', null)
            setDirectMediaUrl(null)
        }
    }

    const handleInstagramPostSelect = (post: InstagramPostSelectItem) => {
        handleChange('instagramPostId', post.id)
        setSelectedInstagramPost(post)
        // Pre-fill quote from caption if empty
        if (!formData.quote && post.caption) {
            handleChange('quote', post.caption)
        }
    }

    const handleDirectMediaUpload = (url: string | null) => {
        setDirectMediaUrl(url)
    }

    const handleVideoAnalysisValue = (
        field: 'patientName' | 'procedure' | 'quote' | 'longDescription',
        value: string
    ) => {
        if (field === 'patientName') {
            handlePatientNameChange(value)
        } else if (field === 'procedure') {
            handleProcedureChange(value)
        } else {
            handleChange(field, value)
        }
    }

    // Check if testimonial has video media
    const hasVideo =
        (formData.sourceType === 'direct' &&
            directMediaUrl !== null &&
            directMediaType === 'video') ||
        (formData.sourceType === 'instagram' &&
            selectedInstagramPost?.mediaType === 'video')

    const handleSubmit = async (
        targetStatus?: 'draft' | 'published' | 'archived'
    ) => {
        const status = targetStatus ?? formData.status

        startTransition(async () => {
            setError(null)
            setSuccess(null)

            const submitData: TestimonialFormData = {
                ...formData,
                status,
                // Include direct media info for server-side gallery_media creation
                directMediaUrl:
                    formData.sourceType === 'direct' ? directMediaUrl : null,
                directMediaType:
                    formData.sourceType === 'direct' ? directMediaType : null,
            }

            try {
                const result =
                    mode === 'create'
                        ? await createTestimonial(submitData)
                        : await updateTestimonial(initialData!.id, submitData)

                if (result.success) {
                    setSuccess(
                        mode === 'create'
                            ? 'Testimonial created successfully!'
                            : 'Testimonial updated successfully!'
                    )

                    if (mode === 'create' && result.id) {
                        router.push(`/testimonials/${result.id}/edit`)
                    } else {
                        router.refresh()
                    }
                } else {
                    setError(result.error ?? 'An error occurred')
                }
            } catch {
                setError('An unexpected error occurred')
            }
        })
    }

    const commonProcedures = [
        'Brazilian Butt Lift',
        'Tummy Tuck',
        'Breast Augmentation',
        'Mommy Makeover',
        'Liposuction',
        'Facelift',
        'Rhinoplasty',
        'Body Contouring',
    ]

    return (
        <div className='space-y-6'>
            {/* Status Messages */}
            {error && (
                <div className='rounded-md bg-red-50 p-4'>
                    <p className='text-sm text-red-600'>{error}</p>
                </div>
            )}
            {success && (
                <div className='rounded-md bg-green-50 p-4'>
                    <p className='text-sm text-green-600'>{success}</p>
                </div>
            )}

            <div className='grid gap-6 lg:grid-cols-3'>
                {/* Main Content */}
                <div className='space-y-6 lg:col-span-2'>
                    {/* Source Type */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Source Type</CardTitle>
                            <CardDescription>
                                Choose how you want to add this testimonial
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs
                                value={formData.sourceType}
                                onValueChange={(v) =>
                                    handleSourceTypeChange(
                                        v as 'instagram' | 'direct' | 'manual'
                                    )
                                }
                            >
                                <TabsList className='grid w-full grid-cols-3'>
                                    <TabsTrigger value='instagram'>
                                        Instagram
                                    </TabsTrigger>
                                    <TabsTrigger value='direct'>
                                        Direct Upload
                                    </TabsTrigger>
                                    <TabsTrigger value='manual'>
                                        Manual Entry
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value='instagram' className='pt-4'>
                                    <div className='space-y-4'>
                                        <p className='text-muted-foreground text-sm'>
                                            Select an Instagram post with video
                                            content to use as a testimonial.
                                        </p>
                                        <InstagramPickerDialog
                                            posts={instagramPosts}
                                            selectedPost={selectedInstagramPost}
                                            onSelect={handleInstagramPostSelect}
                                        />
                                        {selectedInstagramPost && (
                                            <div className='rounded-lg border bg-stone-50 p-4'>
                                                <div className='flex items-start gap-4'>
                                                    {selectedInstagramPost.thumbnailUrl && (
                                                        <div className='relative h-20 w-20 overflow-hidden rounded'>
                                                            <Image
                                                                src={
                                                                    selectedInstagramPost.thumbnailUrl
                                                                }
                                                                alt='Selected post'
                                                                fill
                                                                className='object-cover'
                                                            />
                                                        </div>
                                                    )}
                                                    <div className='flex-1'>
                                                        <p className='line-clamp-2 text-sm'>
                                                            {
                                                                selectedInstagramPost.caption
                                                            }
                                                        </p>
                                                        <div className='mt-2 flex gap-4 text-xs text-stone-500'>
                                                            <span>
                                                                {selectedInstagramPost.likeCount ??
                                                                    0}{' '}
                                                                likes
                                                            </span>
                                                            <span>
                                                                {selectedInstagramPost.commentCount ??
                                                                    0}{' '}
                                                                comments
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value='direct' className='pt-4'>
                                    <div className='space-y-4'>
                                        <p className='text-muted-foreground text-sm'>
                                            Upload a video directly for this
                                            testimonial.
                                        </p>
                                        <div className='space-y-2'>
                                            <Label>Media Type</Label>
                                            <Select
                                                value={directMediaType}
                                                onValueChange={(v) =>
                                                    setDirectMediaType(
                                                        v as 'image' | 'video'
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='video'>
                                                        Video
                                                    </SelectItem>
                                                    <SelectItem value='image'>
                                                        Image
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <MediaUpload
                                            value={directMediaUrl}
                                            onChange={handleDirectMediaUpload}
                                            isVideo={
                                                directMediaType === 'video'
                                            }
                                            accept={
                                                directMediaType === 'video'
                                                    ? 'video/*'
                                                    : 'image/*'
                                            }
                                            maxSize={
                                                directMediaType === 'video'
                                                    ? 100 * 1024 * 1024
                                                    : 10 * 1024 * 1024
                                            }
                                            folder='testimonials'
                                            placeholder={
                                                directMediaType === 'video'
                                                    ? 'Drop video here or click to upload'
                                                    : 'Drop image here or click to upload'
                                            }
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value='manual' className='pt-4'>
                                    <p className='text-muted-foreground text-sm'>
                                        Add a text-only testimonial without
                                        media attachment.
                                    </p>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Video Analysis Panel - Only show in edit mode with video */}
                    {mode === 'edit' && initialData && (
                        <VideoAnalysisPanel
                            testimonialId={initialData.id}
                            hasVideo={hasVideo}
                            existingAnalysis={
                                initialData.metadata?.videoAnalysis ?? null
                            }
                            onUseValue={handleVideoAnalysisValue}
                        />
                    )}

                    {/* Patient Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                            <CardDescription>
                                Details about the patient and their testimonial
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid gap-4 sm:grid-cols-2'>
                                <div className='space-y-2'>
                                    <Label htmlFor='patientName'>
                                        Patient Name *
                                    </Label>
                                    <Input
                                        id='patientName'
                                        value={formData.patientName}
                                        onChange={(e) =>
                                            handlePatientNameChange(
                                                e.target.value
                                            )
                                        }
                                        placeholder='e.g., Maria S.'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='procedure'>
                                        Procedure *
                                    </Label>
                                    <Select
                                        value={formData.procedure}
                                        onValueChange={handleProcedureChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select procedure' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {commonProcedures.map((proc) => (
                                                <SelectItem
                                                    key={proc}
                                                    value={proc}
                                                >
                                                    {proc}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='timeframe'>Timeframe</Label>
                                <Input
                                    id='timeframe'
                                    value={formData.timeframe ?? ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'timeframe',
                                            e.target.value
                                        )
                                    }
                                    placeholder='e.g., 3 months post-op'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='quote'>
                                    Testimonial Quote *
                                </Label>
                                <Textarea
                                    id='quote'
                                    value={formData.quote}
                                    onChange={(e) =>
                                        handleChange('quote', e.target.value)
                                    }
                                    placeholder="The patient's testimonial..."
                                    rows={5}
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='longDescription'>
                                    Long Description
                                </Label>
                                <Textarea
                                    id='longDescription'
                                    value={formData.longDescription ?? ''}
                                    onChange={(e) =>
                                        handleChange(
                                            'longDescription',
                                            e.target.value
                                        )
                                    }
                                    placeholder='Extended marketing description for the testimonial...'
                                    rows={6}
                                />
                                <p className='text-muted-foreground text-xs'>
                                    Optional detailed description for the
                                    testimonial page. Can be AI-generated from
                                    video analysis.
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <Label>Rating</Label>
                                <div className='flex items-center gap-1'>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type='button'
                                            onClick={() =>
                                                handleChange('rating', star)
                                            }
                                            className='p-1 transition-transform hover:scale-110'
                                        >
                                            <Star
                                                className={`h-6 w-6 ${
                                                    star <= formData.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-stone-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className='ml-2 text-sm text-stone-500'>
                                        {formData.rating} / 5
                                    </span>
                                </div>
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
                                onClick={() => handleSubmit('draft')}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <Save className='mr-2 h-4 w-4' />
                                )}
                                Save as Draft
                            </Button>
                            <Button
                                className='w-full'
                                variant='secondary'
                                onClick={() => handleSubmit('published')}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <Send className='mr-2 h-4 w-4' />
                                )}
                                Publish
                            </Button>
                            {mode === 'edit' && (
                                <Button
                                    className='w-full'
                                    variant='outline'
                                    onClick={() => handleSubmit('archived')}
                                    disabled={isPending}
                                >
                                    <Archive className='mr-2 h-4 w-4' />
                                    Archive
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='slug'>URL Slug *</Label>
                                <Input
                                    id='slug'
                                    value={formData.slug}
                                    onChange={(e) =>
                                        handleChange('slug', e.target.value)
                                    }
                                    placeholder='testimonial-url-slug'
                                />
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='isFeatured'
                                    checked={formData.isFeatured}
                                    onCheckedChange={(checked) =>
                                        handleChange(
                                            'isFeatured',
                                            checked === true
                                        )
                                    }
                                />
                                <Label
                                    htmlFor='isFeatured'
                                    className='text-sm font-normal'
                                >
                                    Featured testimonial (shows on homepage)
                                </Label>
                            </div>

                            {formData.isFeatured && (
                                <div className='space-y-2'>
                                    <Label htmlFor='displayOrder'>
                                        Display Order
                                    </Label>
                                    <Input
                                        id='displayOrder'
                                        type='number'
                                        value={formData.displayOrder ?? 0}
                                        onChange={(e) =>
                                            handleChange(
                                                'displayOrder',
                                                parseInt(e.target.value, 10) ||
                                                    0
                                            )
                                        }
                                        min={0}
                                    />
                                    <p className='text-xs text-stone-500'>
                                        Lower numbers appear first in featured
                                        section
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Current Status */}
                    {mode === 'edit' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-2'>
                                    <Label>Current Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(v) =>
                                            handleChange(
                                                'status',
                                                v as
                                                    | 'draft'
                                                    | 'published'
                                                    | 'archived'
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='draft'>
                                                Draft
                                            </SelectItem>
                                            <SelectItem value='published'>
                                                Published
                                            </SelectItem>
                                            <SelectItem value='archived'>
                                                Archived
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
