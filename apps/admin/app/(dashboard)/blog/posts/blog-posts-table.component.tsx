'use client'

/**
 * Blog Posts Table Component
 *
 * Table with selection checkboxes for blog posts.
 * Extracted from page.tsx to enable client-side selection state.
 *
 * @module @admin/app/(dashboard)/blog/posts/blog-posts-table
 */

import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import { Eye, ExternalLink, Pencil } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { StatusBadge } from '@/components/blog/status-badge.component'
import type {
    BlogPostListItem,
    BlogPostSortBy,
    BlogPostSortOrder,
} from '@/lib/queries/blog.query'
import { SortIcon } from './sort-icon.component'

type BlogPostsTableProps = {
    posts: BlogPostListItem[]
    selectedIds: Set<string>
    onToggle: (id: string) => void
    onSelectAll: () => void
    sortBy: BlogPostSortBy
    sortOrder: BlogPostSortOrder
    buildSortUrl: (newSortBy: BlogPostSortBy) => string
}

export function BlogPostsTable({
    posts,
    selectedIds,
    onToggle,
    onSelectAll,
    sortBy,
    sortOrder,
    buildSortUrl,
}: BlogPostsTableProps) {
    // Determine if all visible posts are selected
    const allSelected =
        posts.length > 0 && posts.every((post) => selectedIds.has(post.id))
    const someSelected = posts.some((post) => selectedIds.has(post.id))
    const isIndeterminate = someSelected && !allSelected

    return (
        <Card>
            <CardContent className='p-0'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[48px]'>
                                <Checkbox
                                    checked={
                                        isIndeterminate
                                            ? 'indeterminate'
                                            : allSelected
                                    }
                                    onCheckedChange={() => onSelectAll()}
                                    aria-label={
                                        allSelected
                                            ? 'Deselect all posts'
                                            : 'Select all posts'
                                    }
                                />
                            </TableHead>
                            <TableHead className='w-[80px]'>Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className='text-right'>
                                <Link
                                    href={buildSortUrl('views')}
                                    className='hover:text-foreground inline-flex items-center'
                                >
                                    Views
                                    <SortIcon
                                        column='views'
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                    />
                                </Link>
                            </TableHead>
                            <TableHead>
                                <Link
                                    href={buildSortUrl('publishedAt')}
                                    className='hover:text-foreground inline-flex items-center'
                                >
                                    Published
                                    <SortIcon
                                        column='publishedAt'
                                        sortBy={sortBy}
                                        sortOrder={sortOrder}
                                    />
                                </Link>
                            </TableHead>
                            <TableHead className='w-[120px]'>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className='text-muted-foreground py-8 text-center'
                                >
                                    No blog posts found.{' '}
                                    <Link
                                        href='/blog/posts/new'
                                        className='text-blue-600 hover:underline'
                                    >
                                        Create your first post
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ) : (
                            posts.map((post) => (
                                <TableRow
                                    key={post.id}
                                    className={
                                        selectedIds.has(post.id)
                                            ? 'bg-muted/50'
                                            : undefined
                                    }
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(post.id)}
                                            onCheckedChange={() =>
                                                onToggle(post.id)
                                            }
                                            aria-label={`Select ${post.title}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {post.featuredImageUrl ? (
                                            <div className='relative h-12 w-16 overflow-hidden rounded-md bg-stone-100'>
                                                <Image
                                                    src={post.featuredImageUrl}
                                                    alt={post.title}
                                                    fill
                                                    className='object-cover'
                                                    sizes='64px'
                                                />
                                            </div>
                                        ) : (
                                            <div className='h-12 w-16 rounded-md bg-stone-100' />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className='max-w-[300px]'>
                                            <Link
                                                href={`/blog/posts/${post.id}/edit`}
                                                className='truncate font-medium hover:text-blue-600 hover:underline'
                                            >
                                                {post.title}
                                            </Link>
                                            <p className='text-muted-foreground truncate text-sm'>
                                                /{post.slug}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className='text-sm'>
                                            {post.authorName ?? 'No author'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={post.status} />
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <div className='flex items-center justify-end gap-1'>
                                            <Eye className='text-muted-foreground h-3 w-3' />
                                            <span className='text-sm'>
                                                {post.views.toLocaleString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className='text-muted-foreground text-sm'>
                                            {post.publishedAt
                                                ? new Date(
                                                      post.publishedAt
                                                  ).toLocaleDateString()
                                                : 'Not published'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className='flex items-center gap-1'>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                asChild
                                            >
                                                <Link
                                                    href={`/blog/posts/${post.id}/edit`}
                                                >
                                                    <Pencil className='h-4 w-4' />
                                                </Link>
                                            </Button>
                                            {post.status === 'published' && (
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/blog/${post.slug}`}
                                                        target='_blank'
                                                    >
                                                        <ExternalLink className='h-4 w-4' />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
