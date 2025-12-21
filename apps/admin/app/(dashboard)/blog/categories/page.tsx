'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Loader2, FolderOpen } from 'lucide-react'

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

import type { Category } from '@/lib/types/category.type'
import { CategoryDialog } from './category-dialog.component'
import { DeleteCategoryButton } from './delete-category-button.component'

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        void fetchCategories()
    }, [])

    async function fetchCategories() {
        try {
            const res = await fetch('/api/categories')
            if (!res.ok) {
                throw new Error(`Failed to fetch: ${res.status}`)
            }
            const data = (await res.json()) as Category[]
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
