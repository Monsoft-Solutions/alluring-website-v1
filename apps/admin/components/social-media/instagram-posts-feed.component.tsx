'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Loader2, RefreshCcw } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select'
import { Skeleton } from '@workspace/ui/components/skeleton'

import type {
    InstagramMediaTypeFilter,
    InstagramPostListItem,
    InstagramPostSortBy,
    InstagramPostSortDirection,
} from '@/lib/types/social-media.type'
import {
    InstagramPostsGrid,
    type ProfileInfo,
} from './instagram-posts-grid.component'
import { PostCounterBadge } from './post-counter-badge.component'

type InstagramPostsFeedProps = {
    initialPosts: InstagramPostListItem[]
    total: number
    profile?: ProfileInfo | null
    defaultSortBy?: InstagramPostSortBy
    defaultSortDirection?: InstagramPostSortDirection
    pageSize?: number
}

const DEFAULT_PAGE_SIZE = 20

const sortLabels: Record<InstagramPostSortBy, string> = {
    date: 'Date',
    likes: 'Likes',
    views: 'Views',
}

export function InstagramPostsFeed({
    initialPosts,
    total,
    profile,
    defaultSortBy = 'date',
    defaultSortDirection = 'desc',
    pageSize = DEFAULT_PAGE_SIZE,
}: InstagramPostsFeedProps) {
    const [posts, setPosts] = useState<InstagramPostListItem[]>(initialPosts)
    const [totalCount, setTotalCount] = useState(total)
    const [page, setPage] = useState(1)
    const [sortBy, setSortBy] = useState<InstagramPostSortBy>(defaultSortBy)
    const [sortDirection, setSortDirection] =
        useState<InstagramPostSortDirection>(defaultSortDirection)
    const [mediaType, setMediaType] = useState<InstagramMediaTypeFilter>('all')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Refs for stable callbacks and preventing infinite loops
    const loadMoreRef = useRef<HTMLDivElement | null>(null)
    const hasHydrated = useRef(false)
    const isFetchingRef = useRef(false)
    const prevFiltersRef = useRef({ sortBy, sortDirection, mediaType })
    const handleLoadMoreRef = useRef<() => void>(() => {})

    // Simple hasMore check without loading states (guards handled via ref)
    const hasMore = posts.length < totalCount

    const mergePosts = useCallback(
        (incoming: InstagramPostListItem[], replace: boolean) => {
            if (replace) {
                setPosts(incoming)
                return
            }

            setPosts((current) => {
                const seen = new Set(current.map((post) => post.id))
                const merged = [...current]

                for (const post of incoming) {
                    if (!seen.has(post.id)) {
                        merged.push(post)
                        seen.add(post.id)
                    }
                }

                return merged
            })
        },
        []
    )

    // Stable fetchPage - uses ref for concurrency guard instead of state
    const fetchPage = useCallback(
        async (nextPage: number, { replace }: { replace: boolean }) => {
            // Use ref to prevent concurrent fetches (avoids infinite loop)
            if (isFetchingRef.current) return
            isFetchingRef.current = true

            setError(null)
            if (replace) {
                setIsLoading(true)
            } else {
                setIsLoadingMore(true)
            }

            try {
                const params = new URLSearchParams({
                    page: String(nextPage),
                    pageSize: String(pageSize),
                    sortBy,
                    sortDirection,
                    mediaType,
                })

                const response = await fetch(
                    `/api/social-media/instagram/posts?${params.toString()}`,
                    {
                        method: 'GET',
                        cache: 'no-store',
                    }
                )

                if (!response.ok) {
                    throw new Error('Failed to load posts')
                }

                const data = (await response.json()) as {
                    posts: InstagramPostListItem[]
                    total: number
                }
                mergePosts(data.posts ?? [], replace)
                setTotalCount(data.total ?? 0)
                setPage(nextPage)
            } catch (fetchError) {
                console.error('Error loading Instagram posts', fetchError)
                setError('Unable to load posts right now. Please try again.')
            } finally {
                if (replace) {
                    setIsLoading(false)
                } else {
                    setIsLoadingMore(false)
                }
                isFetchingRef.current = false
            }
        },
        [mergePosts, pageSize, sortBy, sortDirection, mediaType]
    )

    // Update the handleLoadMore ref whenever dependencies change
    useEffect(() => {
        handleLoadMoreRef.current = () => {
            if (isFetchingRef.current || posts.length >= totalCount) return
            void fetchPage(page + 1, { replace: false })
        }
    }, [fetchPage, page, posts.length, totalCount])

    // Stable callback that delegates to the ref
    const handleLoadMore = useCallback(() => {
        handleLoadMoreRef.current()
    }, [])

    // Handle sort/filter changes - only triggers when filters actually change
    useEffect(() => {
        if (!hasHydrated.current) {
            hasHydrated.current = true
            return
        }

        // Only fetch if filters actually changed
        const prev = prevFiltersRef.current
        if (
            prev.sortBy !== sortBy ||
            prev.sortDirection !== sortDirection ||
            prev.mediaType !== mediaType
        ) {
            prevFiltersRef.current = { sortBy, sortDirection, mediaType }
            void fetchPage(1, { replace: true })
        }
    }, [sortBy, sortDirection, mediaType, fetchPage])

    // IntersectionObserver for infinite scroll - stable since handleLoadMore is stable
    useEffect(() => {
        const node = loadMoreRef.current
        if (!node) return

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (entry?.isIntersecting) {
                    handleLoadMore()
                }
            },
            { rootMargin: '200px' }
        )

        observer.observe(node)
        return () => observer.disconnect()
    }, [handleLoadMore])

    const toggleSortDirection = () => {
        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
    }

    const handleRetry = () => {
        void fetchPage(page || 1, { replace: posts.length === 0 })
    }

    const handleRefresh = () => {
        void fetchPage(1, { replace: true })
    }

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap items-center justify-between gap-3 sm:gap-4'>
                <div className='flex items-center gap-2'>
                    <Select
                        value={sortBy}
                        onValueChange={(value: InstagramPostSortBy) =>
                            setSortBy(value)
                        }
                        disabled={isLoading}
                    >
                        <SelectTrigger className='h-9 w-[140px] font-medium shadow-sm transition-all hover:shadow-md'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='date' className='font-medium'>
                                {sortLabels.date}
                            </SelectItem>
                            <SelectItem value='likes' className='font-medium'>
                                {sortLabels.likes}
                            </SelectItem>
                            <SelectItem value='views' className='font-medium'>
                                {sortLabels.views}
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant='outline'
                        size='icon'
                        className='h-9 w-9 shadow-sm transition-all hover:scale-105 hover:shadow-md'
                        onClick={toggleSortDirection}
                        disabled={isLoading}
                        aria-label={`Sort direction: ${sortDirection === 'desc' ? 'Descending' : 'Ascending'}`}
                    >
                        {sortDirection === 'desc' ? (
                            <ArrowDown className='h-4 w-4' />
                        ) : (
                            <ArrowUp className='h-4 w-4' />
                        )}
                    </Button>

                    <div className='border-border bg-border mx-1 h-6 w-px' />

                    <Button
                        variant='ghost'
                        size='sm'
                        className='hover:bg-accent h-9 gap-2 transition-all'
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCcw className='h-4 w-4' />
                        <span className='hidden sm:inline'>Refresh</span>
                        <span className='sr-only sm:hidden'>Refresh posts</span>
                    </Button>
                </div>

                <PostCounterBadge
                    current={posts.length}
                    total={totalCount}
                    isLoading={isLoading || isLoadingMore}
                />
            </div>

            {error && (
                <div className='border-destructive/40 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm'>
                    <div className='flex items-center justify-between gap-3'>
                        <span>{error}</span>
                        <Button
                            size='sm'
                            variant='outline'
                            onClick={handleRetry}
                        >
                            Try again
                        </Button>
                    </div>
                </div>
            )}

            {posts.length === 0 && isLoading ? (
                <div className='grid grid-cols-3 gap-0.5'>
                    {Array.from({ length: 9 }).map((_, index) => (
                        <Skeleton
                            key={`initial-skeleton-${index}`}
                            className='aspect-square w-full rounded-none'
                        />
                    ))}
                </div>
            ) : (
                <InstagramPostsGrid
                    posts={posts}
                    profile={profile}
                    mediaType={mediaType}
                    onMediaTypeChange={setMediaType}
                    isLoading={isLoading && posts.length === 0}
                    isLoadingMore={isLoadingMore}
                    loadingPlaceholders={9}
                />
            )}

            <div ref={loadMoreRef} />

            {hasMore && (
                <div className='flex justify-center'>
                    <Button
                        variant='outline'
                        onClick={handleLoadMore}
                        disabled={isLoading || isLoadingMore}
                        className='gap-2'
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                Loading more
                            </>
                        ) : (
                            'Load more'
                        )}
                    </Button>
                </div>
            )}
        </div>
    )
}
