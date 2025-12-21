'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import { Switch } from '@workspace/ui/components/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'

import { updateGalleryGroup } from '@/lib/actions/gallery.action'
import type { GalleryGroupDetail } from '@/lib/types/gallery/gallery-group.type'
import type { GalleryMediaListItem } from '@/lib/types/gallery/gallery-media.type'
import { PROCEDURE_OPTIONS } from '@/lib/constants/procedure.constant'

type GroupDetailsFormProps = {
    group: GalleryGroupDetail
    groupMedia: GalleryMediaListItem[]
}

type FormData = {
    name: string
    slug: string
    description: string
    procedureSlug: string | null
    coverImageId: string | null
    displayOrder: number
    isVisible: boolean
}

export function GroupDetailsForm({ group, groupMedia }: GroupDetailsFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<FormData>({
        name: group.name,
        slug: group.slug,
        description: group.description ?? '',
        procedureSlug: group.procedureSlug,
        coverImageId: group.coverImageId,
        displayOrder: group.displayOrder,
        isVisible: group.isVisible,
    })

    const handleChange = (
        field: keyof FormData,
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
        // Auto-generate slug only if it matches the current generated slug
        const currentGeneratedSlug = generateSlug(group.name)
        if (formData.slug === currentGeneratedSlug || formData.slug === '') {
            handleChange('slug', generateSlug(name))
        }
    }

    const handleSaveGroup = () => {
        startTransition(async () => {
            try {
                const result = await updateGalleryGroup(group.id, {
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description || null,
                    procedureSlug: formData.procedureSlug,
                    coverImageId: formData.coverImageId,
                    displayOrder: formData.displayOrder,
                    isVisible: formData.isVisible,
                })

                if (result.success) {
                    toast.success('Group updated successfully')
                    router.refresh()
                } else {
                    setError(result.error ?? 'Failed to update group')
                }
            } catch {
                setError('An unexpected error occurred')
            }
        })
    }

    const coverImageOptions = groupMedia.filter((m) => m.type === 'image')

    return (
        <>
            {error && (
                <div className='rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                    {error}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Group Details</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='name'>Name</Label>
                            <Input
                                id='name'
                                value={formData.name}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
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
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='description'>Description</Label>
                        <Textarea
                            id='description'
                            value={formData.description}
                            onChange={(e) =>
                                handleChange('description', e.target.value)
                            }
                            placeholder='Brief description of this group'
                            rows={3}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='procedureSlug'>
                            Link to Procedure (Optional)
                        </Label>
                        <Select
                            value={formData.procedureSlug ?? 'none'}
                            onValueChange={(value) =>
                                handleChange(
                                    'procedureSlug',
                                    value === 'none' ? null : value
                                )
                            }
                        >
                            <SelectTrigger id='procedureSlug'>
                                <SelectValue placeholder='Select a procedure' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='none'>
                                    None - General Gallery
                                </SelectItem>
                                {PROCEDURE_OPTIONS.filter(
                                    (p) => p.slug !== null
                                ).map((procedure) => (
                                    <SelectItem
                                        key={procedure.slug}
                                        value={procedure.slug as string}
                                    >
                                        {procedure.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='grid gap-4 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label>Cover Image</Label>
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
                                    {coverImageOptions.map((media) => (
                                        <SelectItem
                                            key={media.id}
                                            value={media.id}
                                        >
                                            {media.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formData.coverImageId && (
                                <div className='relative aspect-video w-full overflow-hidden rounded-lg border bg-stone-100'>
                                    {(() => {
                                        const selectedImage =
                                            coverImageOptions.find(
                                                (m) =>
                                                    m.id ===
                                                    formData.coverImageId
                                            )
                                        return selectedImage ? (
                                            <Image
                                                src={selectedImage.url}
                                                alt={selectedImage.title}
                                                fill
                                                className='object-cover'
                                                sizes='400px'
                                            />
                                        ) : null
                                    })()}
                                </div>
                            )}
                        </div>

                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='displayOrder'>
                                    Display Order
                                </Label>
                                <Input
                                    id='displayOrder'
                                    type='number'
                                    value={formData.displayOrder}
                                    onChange={(e) =>
                                        handleChange(
                                            'displayOrder',
                                            parseInt(e.target.value, 10) || 0
                                        )
                                    }
                                />
                            </div>

                            <div className='flex items-center justify-between'>
                                <Label
                                    htmlFor='isVisible'
                                    className='font-normal'
                                >
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
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button
                            variant='outline'
                            onClick={() => router.push('/gallery/groups')}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSaveGroup} disabled={isPending}>
                            {isPending && (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
