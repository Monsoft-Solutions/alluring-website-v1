'use client'

/**
 * Blog Posts List Client Component
 *
 * Client wrapper that manages selection state for bulk operations.
 * Renders the table, pagination, and bulk action toolbar.
 *
 * @module @admin/app/(dashboard)/blog/posts/blog-posts-list-client
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Plus, TrendingUp } from 'lucide-react'
import Link from 'next/link'

import { BlogBulkActionToolbar } from '@/components/blog/bulk-action-toolbar.component'
import type {
    BlogPostListItem,
    BlogPostSortBy,
    BlogPostSortOrder,
} from '@/lib/queries/blog.query'
import { BlogPostsTable } from './blog-posts-table.component'

type BlogPostsListClientProps = {
    posts: BlogPostListItem[]
    total: number
    page: number
    totalPages: number
    sortBy: BlogPostSortBy
    sortOrder: BlogPostSortOrder
}

export function BlogPostsListClient({
    posts,
    total,
    page,
    totalPages,
    sortBy,
    sortOrder,
}: BlogPostsListClientProps) {
    const router = useRouter()

    // Create a stable key from posts to detect when they change
    const postsKey = useMemo(() => posts.map((p) => p.id).join(','), [posts])

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [lastPostsKey, setLastPostsKey] = useState(postsKey)

    // Clear selection when posts change (pagination, sort, etc.)
    // Using a key comparison instead of direct setState in effect
    if (postsKey !== lastPostsKey) {
        setSelectedIds(new Set())
        setLastPostsKey(postsKey)
    }

    // ESC key to clear selection
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedIds.size > 0) {
                setSelectedIds(new Set())
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedIds.size])

    // Toggle selection for a single post
    const handleToggle = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    // Select/deselect all visible posts
    const handleSelectAll = useCallback(() => {
        const allSelected = posts.every((post) => selectedIds.has(post.id))
        if (allSelected) {
            // Deselect all
            setSelectedIds(new Set())
        } else {
            // Select all visible
            setSelectedIds(new Set(posts.map((post) => post.id)))
        }
    }, [posts, selectedIds])

    // Clear selection
    const handleClearSelection = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    // Refresh data after action completes
    const handleActionComplete = useCallback(() => {
        router.refresh()
    }, [router])

    // Helper to build URL with sort params
    const buildSortUrl = useCallback(
        (newSortBy: BlogPostSortBy) => {
            const newOrder =
                sortBy === newSortBy && sortOrder === 'desc' ? 'asc' : 'desc'
            return `/blog/posts?sortBy=${newSortBy}&sortOrder=${newOrder}`
        },
        [sortBy, sortOrder]
    )

    // Helper to build pagination URL preserving sort
    const buildPageUrl = useCallback(
        (newPage: number) => {
            return `/blog/posts?page=${newPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        },
        [sortBy, sortOrder]
    )

    const isSortedByViews = sortBy === 'views' && sortOrder === 'desc'

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold'>Blog Posts</h1>
                    <p className='text-muted-foreground'>
                        Manage your blog posts ({total} total)
                        {selectedIds.size > 0 && (
                            <span className='ml-2 font-medium text-blue-600'>
                                {selectedIds.size} selected
                            </span>
                        )}
                    </p>
                </div>
                <div className='flex items-center gap-3'>
                    <Button
                        variant={isSortedByViews ? 'secondary' : 'outline'}
                        size='sm'
                        asChild
                    >
                        <Link href='/blog/posts?sortBy=views&sortOrder=desc'>
                            <TrendingUp className='mr-2 h-4 w-4' />
                            Most Viewed
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href='/blog/posts/new'>
                            <Plus className='mr-2 h-4 w-4' />
                            New Post
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Table */}
            <BlogPostsTable
                posts={posts}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                onSelectAll={handleSelectAll}
                sortBy={sortBy}
                sortOrder={sortOrder}
                buildSortUrl={buildSortUrl}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={page <= 1}
                        asChild={page > 1}
                    >
                        {page > 1 ? (
                            <Link href={buildPageUrl(page - 1)}>Previous</Link>
                        ) : (
                            <span>Previous</span>
                        )}
                    </Button>
                    <span className='text-muted-foreground text-sm'>
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={page >= totalPages}
                        asChild={page < totalPages}
                    >
                        {page < totalPages ? (
                            <Link href={buildPageUrl(page + 1)}>Next</Link>
                        ) : (
                            <span>Next</span>
                        )}
                    </Button>
                </div>
            )}

            {/* Bulk Action Toolbar */}
            <BlogBulkActionToolbar
                selectedIds={Array.from(selectedIds)}
                onClearSelection={handleClearSelection}
                onActionComplete={handleActionComplete}
            />
        </div>
    )
}
