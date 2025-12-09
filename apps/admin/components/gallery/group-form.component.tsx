'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

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
    createGalleryGroup,
    updateGalleryGroup,
    type GalleryGroupFormData,
} from '@/lib/actions/gallery.action'

type GroupFormDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    initialData?: GalleryGroupFormData & { id: string }
    mode: 'create' | 'edit'
}

export function GroupFormDialog({
    open,
    onOpenChange,
    initialData,
    mode,
}: GroupFormDialogProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<GalleryGroupFormData>({
        name: initialData?.name ?? '',
        slug: initialData?.slug ?? '',
        description: initialData?.description ?? '',
        coverImageId: initialData?.coverImageId ?? null,
        displayOrder: initialData?.displayOrder ?? 0,
        isVisible: initialData?.isVisible ?? true,
    })

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

    const handleSubmit = async () => {
        startTransition(async () => {
            try {
                if (mode === 'create') {
                    const result = await createGalleryGroup(formData)
                    if (result.success) {
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
        <Dialog open={open} onOpenChange={onOpenChange}>
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
