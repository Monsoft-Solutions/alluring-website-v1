/**
 * InfinitePostList Component
 *
 * Displays blog posts in a grid with infinite scroll loading.
 * Features luxury styling with section header, improved grid,
 * and elegant loading/end states.
 *
 * Client component for scroll-based loading behavior.
 */
'use client'

import { BookOpen } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import { useInfiniteBlogPosts } from '@/hooks/useInfiniteBlogPosts.hook'
import type { BlogPostCard } from '@/lib/types/blog/post-card.type'

import { MobilePostCard } from './mobile-post-card.component'
import { PostCard } from './post-card.component'
import { PostCardSkeleton } from './post-card-skeleton.component'

type InfinitePostListProps = {
    initialPosts: BlogPostCard[]
    initialCursor?: string
    className?: string
    pageSize?: number
    categorySlug?: string
    tagSlug?: string
    badge?: string
    title?: string
    description?: string
    showHeader?: boolean
}

export function InfinitePostList({
    initialPosts,
    initialCursor,
    className = '',
    pageSize = 12,
    categorySlug,
    tagSlug,
    badge = 'Knowledge Hub',
    title = 'All Articles',
    description = 'Explore our collection of expert articles covering procedures, recovery, and everything you need to know about your transformation journey.',
    showHeader = true,
}: InfinitePostListProps) {
    const { posts, isLoading, hasMore, observerRef } = useInfiniteBlogPosts({
        initialPosts,
        pageSize,
        initialCursor,
        categorySlug,
        tagSlug,
    })

    // Empty state
    if (posts.length === 0 && !isLoading) {
        return (
            <SectionContainer variant='muted' className='py-24'>
                <ContentWrapper size='md'>
                    <div className='flex min-h-[400px] flex-col items-center justify-center text-center'>
                        <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-200'>
                            <BookOpen className='h-10 w-10 text-stone-400' />
                        </div>
                        <h2 className='mb-3 font-serif text-2xl text-stone-900'>
                            No Articles Found
                        </h2>
                        <p className='max-w-md text-stone-600'>
                            We&apos;re working on new content. Check back soon
                            for expert insights and guides.
                        </p>
                    </div>
                </ContentWrapper>
            </SectionContainer>
        )
    }

    return (
        <SectionContainer
            variant='muted'
            className={cn('py-8 md:py-24', className)}
        >
            {/* Section Header - with padding */}
            {showHeader && (
                <ContentWrapper size='lg' paddingX='px-5 md:px-12'>
                    <div className='mb-8 max-w-2xl md:mb-12'>
                        <div className='mb-4 flex items-center gap-3'>
                            <span className='bg-gold-400 h-px w-12' />
                            <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                {badge}
                            </span>
                        </div>
                        <h2 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl'>
                            {title}
                        </h2>
                        <p className='text-base leading-relaxed font-light text-stone-600'>
                            {description}
                        </p>
                    </div>
                </ContentWrapper>
            )}

            {/* Mobile: Cinematic full-bleed cards */}
            <div className='flex flex-col gap-4 md:hidden'>
                {posts.map((post, index) => (
                    <div
                        key={post.id}
                        className='animate-fade-in-up'
                        style={{
                            animationDelay: `${Math.min(index * 50, 300)}ms`,
                            animationFillMode: 'backwards',
                        }}
                    >
                        <MobilePostCard post={post} />
                    </div>
                ))}
            </div>

            {/* Desktop: Grid layout with padding */}
            <ContentWrapper
                size='lg'
                paddingX='px-6 md:px-12'
                className='hidden md:block'
            >
                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {posts.map((post, index) => (
                        <div
                            key={post.id}
                            className='animate-fade-in-up'
                            style={{
                                animationDelay: `${Math.min(index * 50, 300)}ms`,
                                animationFillMode: 'backwards',
                            }}
                        >
                            <PostCard post={post} />
                        </div>
                    ))}
                </div>
            </ContentWrapper>

            {/* Loading skeletons */}
            {isLoading && (
                <>
                    {/* Mobile loading */}
                    <div className='flex flex-col gap-4 md:hidden'>
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div
                                key={`skeleton-mobile-${index}`}
                                className='aspect-4/5 w-full animate-pulse bg-stone-200'
                            />
                        ))}
                    </div>
                    {/* Desktop loading */}
                    <ContentWrapper
                        size='lg'
                        paddingX='px-6 md:px-12'
                        className='hidden md:block'
                    >
                        <div className='mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <PostCardSkeleton key={`skeleton-${index}`} />
                            ))}
                        </div>
                    </ContentWrapper>
                </>
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

            {/* End of list */}
            {!hasMore && posts.length > 0 && (
                <div className='mt-12 flex flex-col items-center justify-center gap-4 py-8 md:mt-16'>
                    <div className='flex items-center gap-4'>
                        <div className='bg-gold-500/30 h-px w-16' />
                        <span className='text-gold-600 text-xs font-bold tracking-[0.2em] uppercase'>
                            End of Articles
                        </span>
                        <div className='bg-gold-500/30 h-px w-16' />
                    </div>
                    <p className='text-sm text-stone-500'>
                        You&apos;ve explored all our articles
                    </p>
                </div>
            )}
        </SectionContainer>
    )
}
