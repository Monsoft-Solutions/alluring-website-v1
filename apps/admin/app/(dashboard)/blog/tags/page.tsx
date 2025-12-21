'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Loader2, Tag } from 'lucide-react'

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

import type { TagItem } from '@/lib/types/blog/tag.type'
import { TagDialog } from './tag-dialog.component'
import { DeleteTagButton } from './delete-tag-button.component'

export default function TagsPage() {
    const [tags, setTags] = useState<TagItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        void fetchTags()
    }, [])

    async function fetchTags() {
        try {
            const res = await fetch('/api/tags')
            if (!res.ok) {
                throw new Error(`Failed to fetch: ${res.status}`)
            }
            const data = (await res.json()) as TagItem[]
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
