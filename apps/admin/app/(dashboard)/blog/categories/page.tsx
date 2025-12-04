'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Save,
    X,
    FolderOpen,
} from 'lucide-react'

import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
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
    createCategory,
    updateCategory,
    deleteCategory,
    type CategoryFormData,
} from '@/lib/actions/category.action'

type Category = {
    id: string
    name: string
    slug: string
    description: string | null
    color: string | null
    sortOrder: number | null
    isActive: boolean
    postCount: number
    createdAt: Date | null
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        try {
            const res = await fetch('/api/categories')
            const data = await res.json()
            setCategories(data)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
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
                    <h1 className='text-2xl font-semibold'>Categories</h1>
                    <p className='text-muted-foreground'>
                        Manage blog post categories ({categories.length} total)
                    </p>
                </div>
                <CategoryDialog
                    mode='create'
                    onSuccess={fetchCategories}
                    trigger={
                        <Button>
                            <Plus className='mr-2 h-4 w-4' />
                            New Category
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
                                    Posts
                                </TableHead>
                                <TableHead>Order</TableHead>
                                <TableHead className='w-[100px]'>
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className='text-muted-foreground py-8 text-center'
                                    >
                                        <FolderOpen className='mx-auto mb-2 h-8 w-8' />
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className='flex items-center gap-2'>
                                                {category.color && (
                                                    <div
                                                        className='h-3 w-3 rounded-full'
                                                        style={{
                                                            backgroundColor:
                                                                category.color,
                                                        }}
                                                    />
                                                )}
                                                <span className='font-medium'>
                                                    {category.name}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className='text-muted-foreground text-sm'>
                                                {category.slug}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    category.isActive
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {category.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {category.postCount}
                                        </TableCell>
                                        <TableCell>
                                            {category.sortOrder ?? 0}
                                        </TableCell>
                                        <TableCell>
                                            <div className='flex items-center gap-1'>
                                                <CategoryDialog
                                                    mode='edit'
                                                    category={category}
                                                    onSuccess={fetchCategories}
                                                    trigger={
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                        >
                                                            <Pencil className='h-4 w-4' />
                                                        </Button>
                                                    }
                                                />
                                                <DeleteCategoryButton
                                                    category={category}
                                                    onSuccess={fetchCategories}
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

type CategoryDialogProps = {
    mode: 'create' | 'edit'
    category?: Category
    onSuccess: () => void
    trigger: React.ReactNode
}

function CategoryDialog({
    mode,
    category,
    onSuccess,
    trigger,
}: CategoryDialogProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState<CategoryFormData>({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        color: category?.color ?? '#78716c',
        sortOrder: category?.sortOrder ?? 0,
        isActive: category?.isActive ?? true,
    })

    const handleChange = (
        field: keyof CategoryFormData,
        value: string | number | boolean
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
                        ? await createCategory(formData)
                        : await updateCategory(category!.id, formData)

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
                        {mode === 'create'
                            ? 'Create Category'
                            : 'Edit Category'}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create'
                            ? 'Add a new blog category'
                            : 'Update category details'}
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
                                placeholder='Category name'
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
                                placeholder='category-slug'
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
                            placeholder='Category description...'
                            rows={2}
                        />
                    </div>

                    <div className='grid gap-4 sm:grid-cols-3'>
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
                            <Label htmlFor='sortOrder'>Sort Order</Label>
                            <Input
                                id='sortOrder'
                                type='number'
                                value={formData.sortOrder ?? 0}
                                onChange={(e) =>
                                    handleChange(
                                        'sortOrder',
                                        parseInt(e.target.value) || 0
                                    )
                                }
                            />
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

function DeleteCategoryButton({
    category,
    onSuccess,
}: {
    category: Category
    onSuccess: () => void
}) {
    const [isPending, startTransition] = useTransition()

    const handleDelete = () => {
        if (category.postCount > 0) {
            alert(
                `Cannot delete category "${category.name}" because it has ${category.postCount} posts`
            )
            return
        }

        if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
            return
        }

        startTransition(async () => {
            const result = await deleteCategory(category.id)
            if (result.success) {
                onSuccess()
            } else {
                alert(result.error ?? 'Failed to delete category')
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
