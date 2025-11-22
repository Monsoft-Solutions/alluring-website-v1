'use client'

import { useInfiniteBlogPosts } from '@/hooks/useInfiniteBlogPosts.hook'
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'

import { PostCard } from './PostCard.component'
import { PostCardSkeleton } from './PostCardSkeleton.component'

type InfinitePostListProps = {
    initialPosts: BlogPostCard[]
    initialCursor?: string
    className?: string
    pageSize?: number
    categorySlug?: string
    tagSlug?: string
}

export function InfinitePostList({
    initialPosts,
    initialCursor,
    className = '',
    pageSize = 12,
    categorySlug,
    tagSlug,
}: InfinitePostListProps) {
    const { posts, isLoading, hasMore, observerRef } = useInfiniteBlogPosts({
        initialPosts,
        pageSize,
        initialCursor,
        categorySlug,
        tagSlug,
    })

    if (posts.length === 0 && !isLoading) {
        return (
            <div className='flex min-h-[500px] items-center justify-center'>
                <div className='space-y-4 px-4 text-center'>
                    <div className='bg-muted mx-auto flex h-20 w-20 items-center justify-center rounded-full'>
                        <svg
                            className='text-muted-foreground h-10 w-10'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            aria-hidden='true'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={1.5}
                                d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                            />
                        </svg>
                    </div>
                    <div className='space-y-2'>
                        <h2 className='text-foreground text-2xl font-bold tracking-tight'>
                            No posts found
                        </h2>
                        <p className='text-muted-foreground mx-auto max-w-md text-sm'>
                            Try adjusting your filters or check back later.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-16'>
            <div
                className={`grid gap-10 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
            >
                {posts.map((post, index) => (
                    <div
                        key={post.id}
                        style={{
                            animationDelay: `${index * 0.05}s`,
                            animationFillMode: 'backwards',
                        }}
                        className='animate-fade-in'
                    >
                        <PostCard post={post} />
                    </div>
                ))}
            </div>

            {/* Loading skeleton for additional posts */}
            {isLoading && (
                <div className='grid gap-10 sm:grid-cols-2 lg:grid-cols-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <PostCardSkeleton key={`skeleton-${index}`} />
                    ))}
                </div>
            )}

            {/* Intersection observer trigger */}
            {hasMore && !isLoading && (
                <div
                    ref={observerRef}
                    className='flex justify-center py-8'
                    aria-label='Loading more posts'
                    aria-live='polite'
                />
            )}

            {/* End of list message */}
            {!hasMore && posts.length > 0 && (
                <div className='flex flex-col items-center justify-center gap-3 py-12'>
                    <div className='bg-muted h-px w-24' />
                    <p className='text-muted-foreground text-sm font-medium'>
                        You&apos;ve reached the end
                    </p>
                    <div className='bg-muted h-px w-24' />
                </div>
            )}
        </div>
    )
}
