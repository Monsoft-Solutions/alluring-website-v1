'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
    Loader2,
    Save,
    Eye,
    Send,
    Calendar,
    DollarSign,
    Percent,
    Monitor,
} from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Switch } from '@workspace/ui/components/switch'
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

import { PostEditor } from '../blog/editor.component'
import { MediaUpload } from '../shared/media-upload.component'
import {
    createPromotion,
    updatePromotion,
    type PromotionFormData,
} from '@/lib/actions/promotion.action'

type PromotionFormProps = {
    initialData?: PromotionFormData & { id: string }
    mode: 'create' | 'edit'
}

const PROMOTION_TYPES = [
    {
        value: 'discount',
        label: 'Discount',
        description: 'Percentage or fixed amount off',
    },
    { value: 'seasonal', label: 'Seasonal', description: 'Seasonal campaigns' },
    { value: 'bundle', label: 'Bundle', description: 'Package deals' },
    {
        value: 'financing',
        label: 'Financing',
        description: 'Special financing offers',
    },
] as const

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'expired', label: 'Expired' },
] as const

export function PromotionForm({ initialData, mode }: PromotionFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<PromotionFormData>({
        title: initialData?.title ?? '',
        slug: initialData?.slug ?? '',
        description: initialData?.description ?? '',
        excerpt: initialData?.excerpt ?? '',
        status: initialData?.status ?? 'draft',
        type: initialData?.type ?? 'discount',
        discountValue: initialData?.discountValue ?? null,
        discountTypeValue: initialData?.discountTypeValue ?? 'percentage',
        startsAt: initialData?.startsAt ?? null,
        endsAt: initialData?.endsAt ?? null,
        isAutoActivate: initialData?.isAutoActivate ?? true,
        isAutoExpire: initialData?.isAutoExpire ?? true,
        imageUrl: initialData?.imageUrl ?? '',
        imageAlt: initialData?.imageAlt ?? '',
        videoUrl: initialData?.videoUrl ?? '',
        thumbnailUrl: initialData?.thumbnailUrl ?? '',
        linkType: initialData?.linkType ?? 'contact',
        procedureSlug: initialData?.procedureSlug ?? '',
        customUrl: initialData?.customUrl ?? '',
        ctaText: initialData?.ctaText ?? 'Learn More',
        priority: initialData?.priority ?? 0,
        modalDelaySeconds: initialData?.modalDelaySeconds ?? 60,
    })

    const handleChange = <K extends keyof PromotionFormData>(
        field: K,
        value: PromotionFormData[K]
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

    const getSuccessMessage = (
        isCreate: boolean,
        status?: PromotionFormData['status']
    ) => {
        if (isCreate) return 'Promotion created'
        if (status === 'active') return 'Promotion activated'
        if (status === 'scheduled') return 'Promotion scheduled'
        return 'Promotion saved'
    }

    const handleSave = async (status?: PromotionFormData['status']) => {
        const dataToSave = {
            ...formData,
            status: status ?? formData.status,
        }

        startTransition(async () => {
            try {
                if (mode === 'create') {
                    const result = await createPromotion(dataToSave)
                    if (result.success && result.id) {
                        toast.success(getSuccessMessage(true, status))
                        router.push(`/promotions/${result.id}/edit`)
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to create promotion')
                    }
                } else if (initialData?.id) {
                    const result = await updatePromotion(
                        initialData.id,
                        dataToSave
                    )
                    if (result.success) {
                        toast.success(getSuccessMessage(false, status))
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to update promotion')
                    }
                }
            } catch {
                setError('An unexpected error occurred')
            }
        })
    }

    const formatDateForInput = (date: Date | null | undefined): string => {
        if (!date) return ''
        const d = new Date(date)
        return d.toISOString().slice(0, 16)
    }

    const parseDateFromInput = (value: string): Date | null => {
        if (!value) return null
        return new Date(value)
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

                {/* Basic Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Promotion Details</CardTitle>
                        <CardDescription>
                            Basic information about the promotion
                        </CardDescription>
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
                                placeholder='Enter promotion title'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='slug'>URL Slug</Label>
                            <div className='flex items-center gap-2'>
                                <span className='text-muted-foreground text-sm'>
                                    /promotions/
                                </span>
                                <Input
                                    id='slug'
                                    value={formData.slug}
                                    onChange={(e) =>
                                        handleChange('slug', e.target.value)
                                    }
                                    placeholder='promotion-url-slug'
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='excerpt'>Short Description</Label>
                            <Textarea
                                id='excerpt'
                                value={formData.excerpt ?? ''}
                                onChange={(e) =>
                                    handleChange('excerpt', e.target.value)
                                }
                                placeholder='Brief summary for cards and listings'
                                rows={2}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Full Description</Label>
                            <PostEditor
                                content={formData.description}
                                onChange={(content) =>
                                    handleChange('description', content)
                                }
                                placeholder='Write the full promotion details...'
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Media Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Media</CardTitle>
                        <CardDescription>
                            Upload images and videos for the promotion
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-6'>
                        {/* Hero Image */}
                        <div className='space-y-3'>
                            <Label>Hero Image</Label>
                            <MediaUpload
                                value={formData.imageUrl}
                                onChange={(url) =>
                                    handleChange('imageUrl', url ?? '')
                                }
                                accept='image/*'
                                maxSize={5 * 1024 * 1024}
                                folder='promotions/images'
                                placeholder='Drop hero image or click to upload'
                            />
                            <div className='space-y-2'>
                                <Label htmlFor='imageAlt'>Image Alt Text</Label>
                                <Input
                                    id='imageAlt'
                                    value={formData.imageAlt ?? ''}
                                    onChange={(e) =>
                                        handleChange('imageAlt', e.target.value)
                                    }
                                    placeholder='Describe the image for accessibility'
                                />
                            </div>
                        </div>

                        {/* Video (optional) */}
                        <div className='space-y-3'>
                            <Label>Video (optional)</Label>
                            <MediaUpload
                                value={formData.videoUrl}
                                onChange={(url) =>
                                    handleChange('videoUrl', url ?? '')
                                }
                                accept='video/*'
                                maxSize={50 * 1024 * 1024}
                                folder='promotions/videos'
                                placeholder='Drop video or click to upload'
                                isVideo
                            />
                        </div>

                        {/* Video Thumbnail */}
                        <div className='space-y-3'>
                            <Label>Video Thumbnail</Label>
                            <MediaUpload
                                value={formData.thumbnailUrl}
                                onChange={(url) =>
                                    handleChange('thumbnailUrl', url ?? '')
                                }
                                accept='image/*'
                                maxSize={5 * 1024 * 1024}
                                folder='promotions/thumbnails'
                                placeholder='Drop thumbnail image or click to upload'
                            />
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
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Save className='mr-2 h-4 w-4' />
                            )}
                            Save {mode === 'create' ? 'Draft' : 'Changes'}
                        </Button>
                        {mode === 'edit' && formData.status === 'draft' && (
                            <Button
                                variant='outline'
                                className='w-full'
                                onClick={() => handleSave('scheduled')}
                                disabled={isPending}
                            >
                                <Eye className='mr-2 h-4 w-4' />
                                Schedule
                            </Button>
                        )}
                        {mode === 'edit' && formData.status !== 'active' && (
                            <Button
                                variant='default'
                                className='w-full bg-green-600 hover:bg-green-700'
                                onClick={() => handleSave('active')}
                                disabled={isPending}
                            >
                                <Send className='mr-2 h-4 w-4' />
                                Activate Now
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
                            <Label htmlFor='status'>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(
                                    value: PromotionFormData['status']
                                ) => handleChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='type'>Promotion Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(
                                    value: PromotionFormData['type']
                                ) => handleChange('type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROMOTION_TYPES.map((type) => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.type === 'discount' && (
                            <div className='space-y-4 rounded-lg border bg-stone-50 p-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='discountType'>
                                        Discount Type
                                    </Label>
                                    <Select
                                        value={
                                            formData.discountTypeValue ??
                                            'percentage'
                                        }
                                        onValueChange={(
                                            value: 'percentage' | 'fixed_amount'
                                        ) =>
                                            handleChange(
                                                'discountTypeValue',
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='percentage'>
                                                <div className='flex items-center gap-2'>
                                                    <Percent className='h-4 w-4' />
                                                    Percentage Off
                                                </div>
                                            </SelectItem>
                                            <SelectItem value='fixed_amount'>
                                                <div className='flex items-center gap-2'>
                                                    <DollarSign className='h-4 w-4' />
                                                    Fixed Amount Off
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='discountValue'>
                                        {formData.discountTypeValue ===
                                        'percentage'
                                            ? 'Discount Percentage'
                                            : 'Discount Amount ($)'}
                                    </Label>
                                    <div className='relative'>
                                        <Input
                                            id='discountValue'
                                            type='number'
                                            value={formData.discountValue ?? ''}
                                            onChange={(e) =>
                                                handleChange(
                                                    'discountValue',
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : null
                                                )
                                            }
                                            placeholder={
                                                formData.discountTypeValue ===
                                                'percentage'
                                                    ? '20'
                                                    : '500'
                                            }
                                            className='pr-8'
                                        />
                                        <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm'>
                                            {formData.discountTypeValue ===
                                            'percentage'
                                                ? '%'
                                                : '$'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className='space-y-2'>
                            <Label htmlFor='priority'>
                                Priority (higher = more prominent)
                            </Label>
                            <Input
                                id='priority'
                                type='number'
                                value={formData.priority ?? 0}
                                onChange={(e) =>
                                    handleChange(
                                        'priority',
                                        Number(e.target.value)
                                    )
                                }
                                min={0}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Display Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Monitor className='h-4 w-4' />
                            Display Settings
                        </CardTitle>
                        <CardDescription>
                            Control how this promotion appears on the site
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='modalDelaySeconds'>
                                Modal Popup Delay (seconds)
                            </Label>
                            <Input
                                id='modalDelaySeconds'
                                type='number'
                                value={formData.modalDelaySeconds ?? ''}
                                onChange={(e) =>
                                    handleChange(
                                        'modalDelaySeconds',
                                        e.target.value
                                            ? Number(e.target.value)
                                            : null
                                    )
                                }
                                placeholder='60'
                                min={0}
                            />
                            <p className='text-muted-foreground text-xs'>
                                Time in seconds before the promotion modal
                                appears. Leave empty to disable the modal for
                                this promotion.
                            </p>
                        </div>

                        <div className='rounded-lg border bg-blue-50 p-3'>
                            <p className='text-xs text-blue-800'>
                                <strong>Note:</strong> The promotion with the
                                highest priority that has a modal delay set will
                                be displayed site-wide. Banner and homepage
                                section always show the highest priority active
                                promotion.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Scheduling */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4' />
                            Scheduling
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='startsAt'>Start Date & Time</Label>
                            <Input
                                id='startsAt'
                                type='datetime-local'
                                value={formatDateForInput(formData.startsAt)}
                                onChange={(e) =>
                                    handleChange(
                                        'startsAt',
                                        parseDateFromInput(e.target.value)
                                    )
                                }
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='endsAt'>End Date & Time</Label>
                            <Input
                                id='endsAt'
                                type='datetime-local'
                                value={formatDateForInput(formData.endsAt)}
                                onChange={(e) =>
                                    handleChange(
                                        'endsAt',
                                        parseDateFromInput(e.target.value)
                                    )
                                }
                            />
                        </div>

                        <div className='space-y-3 pt-2'>
                            <div className='flex items-center justify-between'>
                                <Label
                                    htmlFor='isAutoActivate'
                                    className='cursor-pointer'
                                >
                                    Auto-activate on start date
                                </Label>
                                <Switch
                                    id='isAutoActivate'
                                    checked={formData.isAutoActivate}
                                    onCheckedChange={(checked) =>
                                        handleChange('isAutoActivate', checked)
                                    }
                                />
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label
                                    htmlFor='isAutoExpire'
                                    className='cursor-pointer'
                                >
                                    Auto-expire on end date
                                </Label>
                                <Switch
                                    id='isAutoExpire'
                                    checked={formData.isAutoExpire}
                                    onCheckedChange={(checked) =>
                                        handleChange('isAutoExpire', checked)
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Call to Action */}
                <Card>
                    <CardHeader>
                        <CardTitle>Call to Action</CardTitle>
                        <CardDescription>
                            Where should users go when they click?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs
                            value={formData.linkType}
                            onValueChange={(value) =>
                                handleChange(
                                    'linkType',
                                    value as PromotionFormData['linkType']
                                )
                            }
                            className='w-full'
                        >
                            <TabsList className='grid w-full grid-cols-3'>
                                <TabsTrigger value='contact'>
                                    Contact
                                </TabsTrigger>
                                <TabsTrigger value='procedure'>
                                    Procedure
                                </TabsTrigger>
                                <TabsTrigger value='custom_url'>
                                    Custom
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value='contact'
                                className='space-y-4 pt-4'
                            >
                                <p className='text-muted-foreground text-sm'>
                                    Users will be directed to the
                                    contact/consultation form.
                                </p>
                            </TabsContent>

                            <TabsContent
                                value='procedure'
                                className='space-y-4 pt-4'
                            >
                                <div className='space-y-2'>
                                    <Label htmlFor='procedureSlug'>
                                        Procedure Slug
                                    </Label>
                                    <Input
                                        id='procedureSlug'
                                        value={formData.procedureSlug ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'procedureSlug',
                                                e.target.value
                                            )
                                        }
                                        placeholder='e.g., brazilian-butt-lift'
                                    />
                                    <p className='text-muted-foreground text-xs'>
                                        Links to /procedures/[slug]
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value='custom_url'
                                className='space-y-4 pt-4'
                            >
                                <div className='space-y-2'>
                                    <Label htmlFor='customUrl'>
                                        Custom URL
                                    </Label>
                                    <Input
                                        id='customUrl'
                                        value={formData.customUrl ?? ''}
                                        onChange={(e) =>
                                            handleChange(
                                                'customUrl',
                                                e.target.value
                                            )
                                        }
                                        placeholder='https://...'
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className='mt-4 space-y-2'>
                            <Label htmlFor='ctaText'>Button Text</Label>
                            <Input
                                id='ctaText'
                                value={formData.ctaText ?? 'Learn More'}
                                onChange={(e) =>
                                    handleChange('ctaText', e.target.value)
                                }
                                placeholder='Learn More'
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
