'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Loader2, Save, X } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import {
    createTag,
    updateTag,
    type TagFormData,
} from '@/lib/actions/tag.action'
import type { TagItem } from '@/lib/types/tag.type'

type TagDialogProps = {
    mode: 'create' | 'edit'
    tag?: TagItem
    onSuccess: () => void
    trigger: React.ReactNode
}

export function TagDialog({ mode, tag, onSuccess, trigger }: TagDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    // Compute initial form data based on tag
    const initialFormData = useMemo<TagFormData>(
        () => ({
            name: tag?.name ?? '',
            slug: tag?.slug ?? '',
            description: tag?.description ?? '',
            color: tag?.color ?? '#78716c',
            isActive: tag?.isActive ?? true,
        }),
        [tag]
    )

    const [formData, setFormData] = useState<TagFormData>(initialFormData)

    // Reset form and error when dialog opens via onOpenChange callback
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (newOpen) {
            // Reset form data when opening
            setFormData(initialFormData)
            setError(null)
        }
    }

    const handleChange = (
        field: keyof TagFormData,
        value: string | boolean
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
        if (mode === 'create') {
            handleChange('slug', generateSlug(name))
        }
    }

    const handleSave = () => {
        startTransition(async () => {
            try {
                const result =
                    mode === 'create'
                        ? await createTag(formData)
                        : await updateTag(tag!.id, formData)

                if (result.success) {
                    toast.success(
                        mode === 'create' ? 'Tag created' : 'Tag updated'
                    )
                    setOpen(false)
                    onSuccess()
                } else {
                    setError(result.error ?? 'Operation failed')
                }
            } catch {
                setError('An unexpected error occurred')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Create Tag' : 'Edit Tag'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new blog tag'
                            : 'Update tag details'}
                    </DialogDescription>
                </DialogHeader>

                <div className='space-y-4'>
                    {error && (
                        <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                            {error}
                        </div>
                    )}

                    <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='name'>Name *</Label>
                            <Input
                                id='name'
                                value={formData.name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder='Tag name'
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='slug'>Slug *</Label>
                            <Input
                                id='slug'
                                value={formData.slug}
                                onChange={(e) =>
                                    handleChange('slug', e.target.value)
                                }
                                placeholder='tag-slug'
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
                            placeholder='Tag description...'
                            rows={2}
                        />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='color'>Color</Label>
                            <div className='flex gap-2'>
                                <Input
                                    id='color'
                                    type='color'
                                    value={formData.color ?? '#78716c'}
                                    onChange={(e) =>
                                        handleChange('color', e.target.value)
                                    }
                                    className='h-10 w-14 cursor-pointer p-1'
                                />
                                <Input
                                    value={formData.color ?? '#78716c'}
                                    onChange={(e) =>
                                        handleChange('color', e.target.value)
                                    }
                                    placeholder='#78716c'
                                    className='flex-1'
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='status'>Status</Label>
                            <Select
                                value={
                                    formData.isActive ? 'active' : 'inactive'
                                }
                                onValueChange={(value) =>
                                    handleChange('isActive', value === 'active')
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='active'>
                                        Active
                                    </SelectItem>
                                    <SelectItem value='inactive'>
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button
                            variant='outline'
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isPending}>
                            {isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <Save className='mr-2 h-4 w-4' />
                            )}
                            {mode === 'create' ? 'Create' : 'Save'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
