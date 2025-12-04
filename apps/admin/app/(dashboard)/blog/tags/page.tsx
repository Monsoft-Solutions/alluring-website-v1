'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, Save, X, Tag } from 'lucide-react'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
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
    deleteTag,
    type TagFormData,
} from '@/lib/actions/tag.action'

type TagItem = {
    id: string
    name: string
    slug: string
    description: string | null
    color: string | null
    usageCount: number
    isActive: boolean
    createdAt: Date
}

export default function TagsPage() {
    const [tags, setTags] = useState<TagItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTags()
    }, [])

    async function fetchTags() {
        try {
            const res = await fetch('/api/tags')
            if (!res.ok) {
                throw new Error(`Failed to fetch: ${res.status}`)
            }
            const data = await res.json()
            setTags(data)
        } catch (error) {
            console.error('Failed to fetch tags:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className='flex h-64 items-center justify-center'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        )
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Tags</h1>
                    <p className='text-muted-foreground'>
                        Manage blog post tags ({tags.length} total)
                    </p>
                </div>
                <TagDialog
                    mode='create'
                    onSuccess={fetchTags}
                    trigger={
                        <Button>
                            <Plus className='mr-2 h-4 w-4' />
                            New Tag
                        </Button>
                    }
                />
            </div>

            <Card>
                <CardContent className='p-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className='text-right'>
                                    Usage
                                </TableHead>
                                <TableHead className='w-[100px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tags.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        <Tag className='mx-auto mb-2 h-8 w-8' />
                                        No tags found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tags.map((tag) => (
                                    <TableRow key={tag.id}>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                {tag.color && (
                                                    <div
                                                        className='h-3 w-3 rounded-full'
                                                        style={{
                                                            backgroundColor:
                                                                tag.color,
                                                        }}
                                                    />
                                                )}
                                                <span className='font-medium'>
                                                    {tag.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className='text-muted-foreground text-sm'>
                                                {tag.slug}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    tag.isActive
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {tag.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {tag.usageCount}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-1'>
                                                <TagDialog
                                                    mode='edit'
                                                    tag={tag}
                                                    onSuccess={fetchTags}
                                                    trigger={
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                        >
                                                            <Pencil className='h-4 w-4' />
                                                        </Button>
                                                    }
                                                />
                                                <DeleteTagButton
                                                    tag={tag}
                                                    onSuccess={fetchTags}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

type TagDialogProps = {
    mode: 'create' | 'edit'
    tag?: TagItem
    onSuccess: () => void
    trigger: React.ReactNode
}

function TagDialog({ mode, tag, onSuccess, trigger }: TagDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<TagFormData>({
        name: tag?.name ?? '',
        slug: tag?.slug ?? '',
        description: tag?.description ?? '',
        color: tag?.color ?? '#78716c',
        isActive: tag?.isActive ?? true,
    })

    // Reset form state when dialog opens or tag changes
    useEffect(() => {
        if (open) {
            setFormData({
                name: tag?.name ?? '',
                slug: tag?.slug ?? '',
                description: tag?.description ?? '',
                color: tag?.color ?? '#78716c',
                isActive: tag?.isActive ?? true,
            })
            setError(null)
        }
    }, [open, tag])

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
        <Dialog open={open} onOpenChange={setOpen}>
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

function DeleteTagButton({
    tag,
    onSuccess,
}: {
    tag: TagItem
    onSuccess: () => void
}) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (tag.usageCount > 0) {
            alert(
                `Cannot delete tag "${tag.name}" because it is used by ${tag.usageCount} posts`
            )
            return
        }

        if (!confirm(`Are you sure you want to delete "${tag.name}"?`)) {
            return
        }

        startTransition(async () => {
            const result = await deleteTag(tag.id)
            if (result.success) {
                onSuccess()
            } else {
                alert(result.error ?? 'Failed to delete tag')
            }
        })
    }

    return (
        <Button
            variant='ghost'
            size='sm'
            onClick={handleDelete}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
                <Trash2 className='h-4 w-4 text-red-500' />
            )}
        </Button>
    )
}
