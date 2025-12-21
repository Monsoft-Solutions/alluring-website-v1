'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Switch } from '@workspace/ui/components/switch'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import {
    createGalleryGroup,
    updateGalleryGroup,
    type GalleryGroupFormData,
} from '@/lib/actions/gallery.action'
import type { MediaOption } from '@/lib/types/media-option.type'

type GroupFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: GalleryGroupFormData & { id: string }
    mode: 'create' | 'edit'
    mediaOptions?: MediaOption[]
}

export function GroupFormDialog({
    open,
    onOpenChange,
    initialData,
    mode,
    mediaOptions = [],
}: GroupFormDialogProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    // Compute initial form data based on initialData
    const initialFormData = useMemo<GalleryGroupFormData>(
        () => ({
            name: initialData?.name ?? '',
            slug: initialData?.slug ?? '',
            description: initialData?.description ?? '',
            coverImageId: initialData?.coverImageId ?? null,
            displayOrder: initialData?.displayOrder ?? 0,
            isVisible: initialData?.isVisible ?? true,
        }),
        [initialData]
    )

    const [formData, setFormData] =
        useState<GalleryGroupFormData>(initialFormData)

    // Reset form and error when dialog opens via onOpenChange callback
    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen)
        if (newOpen) {
            // Reset form data when opening
            setFormData(initialFormData)
            setError(null)
        }
    }

    const handleChange = (
        field: keyof GalleryGroupFormData,
        value: string | number | boolean | null
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError(null)
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleNameChange = (name: string) => {
        handleChange('name', name)
        if (mode === 'create' && !formData.slug) {
            handleChange('slug', generateSlug(name))
        }
    }

    const handleSubmit = () => {
        startTransition(async () => {
            try {
                if (mode === 'create') {
                    const result = await createGalleryGroup(formData)
                    if (result.success) {
                        toast.success('Gallery group created')
                        onOpenChange(false)
                        router.refresh()
                        // Reset form
                        setFormData({
                            name: '',
                            slug: '',
                            description: '',
                            coverImageId: null,
                            displayOrder: 0,
                            isVisible: true,
                        })
                    } else {
                        setError(result.error ?? 'Failed to create group')
                    }
                } else if (initialData?.id) {
                    const result = await updateGalleryGroup(
                        initialData.id,
                        formData
                    )
                    if (result.success) {
                        toast.success('Gallery group updated')
                        onOpenChange(false)
                        router.refresh()
                    } else {
                        setError(result.error ?? 'Failed to update group')
                    }
                }
            } catch {
                setError('An unexpected error occurred')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create Group' : 'Edit Group'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Create a new gallery group to organize your media.'
                            : 'Update the details of this gallery group.'}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                        {error}
                    </div>
                )}

                <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='name'>Name</Label>
                        <Input
                            id='name'
                            value={formData.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder='e.g., BBL Results'
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='slug'>URL Slug</Label>
                        <Input
                            id='slug'
                            value={formData.slug}
                            onChange={(e) =>
                                handleChange('slug', e.target.value)
                            }
                            placeholder='bbl-results'
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='description'>Description</Label>
                        <Textarea
                            id='description'
                            value={formData.description ?? ''}
                            onChange={(e) =>
                                handleChange('description', e.target.value)
                            }
                            placeholder='Brief description of this group'
                            rows={3}
                        />
                    </div>

                    {/* Cover Image Selection */}
                    <div className='space-y-2'>
                        <Label>Cover Image (Thumbnail)</Label>
                        <Select
                            value={formData.coverImageId ?? 'none'}
                            onValueChange={(value) =>
                                handleChange(
                                    'coverImageId',
                                    value === 'none' ? null : value
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder='Select a cover image' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='none'>
                                    No cover image
                                </SelectItem>
                                {mediaOptions
                                    .filter((m) => m.type === 'image')
                                    .map((media) => (
                                        <SelectItem
                                            key={media.id}
                                            value={media.id}
                                        >
                                            {media.title}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        {/* Cover Image Preview */}
                        {formData.coverImageId && (
                            <div className='relative aspect-video w-full overflow-hidden rounded-lg border bg-stone-100'>
                                {(() => {
                                    const selectedImage = mediaOptions.find(
                                        (m) => m.id === formData.coverImageId
                                    )
                                    return selectedImage ? (
                                        <Image
                                            src={selectedImage.url}
                                            alt={selectedImage.title}
                                            fill
                                            className='object-cover'
                                            sizes='400px'
                                        />
                                    ) : (
                                        <div className='flex h-full items-center justify-center'>
                                            <ImageIcon className='text-muted-foreground h-8 w-8' />
                                        </div>
                                    )
                                })()}
                            </div>
                        )}
                        <p className='text-muted-foreground text-xs'>
                            This image will be displayed as the group thumbnail
                            in the gallery.
                        </p>
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

                    <div className='flex items-center justify-between'>
                        <Label htmlFor='isVisible' className='font-normal'>
                            Visible to public
                        </Label>
                        <Switch
                            id='isVisible'
                            checked={formData.isVisible}
                            onCheckedChange={(checked) =>
                                handleChange('isVisible', checked)
                            }
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant='outline'
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending && (
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        {mode === 'create' ? 'Create' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
