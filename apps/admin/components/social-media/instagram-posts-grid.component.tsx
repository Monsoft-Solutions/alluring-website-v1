'use client'

/**
 * Instagram Posts Grid Component
 *
 * Instagram-style grid display with detail modal.
 * Supports selection mode for bulk operations.
 *
 * @module components/social-media/instagram-posts-grid
 */
import { useState } from 'react'
import Image from 'next/image'
import {
    Heart,
    MessageCircle,
    Play,
    Layers,
    Grid,
    Clapperboard,
    ImageIcon,
    Pin,
    Check,
} from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'
import { Skeleton } from '@workspace/ui/components/skeleton'

import type {
    InstagramMediaTypeFilter,
    InstagramPostListItem,
} from '@/lib/types/social-media/social-media.type'
import { InstagramPostDialog } from './instagram-post-dialog.component'

export type ProfileInfo = {
    handle: string | null
    profilePictureUrl: string | null
    fullName: string | null
}

type InstagramPostsGridProps = {
    posts: InstagramPostListItem[]
    profile?: ProfileInfo | null
    mediaType: InstagramMediaTypeFilter
    onMediaTypeChange: (mediaType: InstagramMediaTypeFilter) => void
    isLoading?: boolean
    isLoadingMore?: boolean
    loadingPlaceholders?: number
    /** Selection mode - enables checkboxes on posts */
    selectionMode?: boolean
    /** Currently selected post IDs */
    selectedIds?: string[]
    /** Callback when a post is selected/deselected */
    onSelectPost?: (postId: string) => void
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

type PostThumbnailProps = {
    post: InstagramPostListItem
    onClick: () => void
    selectionMode?: boolean
    isSelected?: boolean
    onSelect?: () => void
}

function PostThumbnail({
    post,
    onClick,
    selectionMode = false,
    isSelected = false,
    onSelect,
}: PostThumbnailProps) {
    const isVideo = post.mediaType === 'video'
    const isCarousel = post.mediaType === 'carousel'

    const handleClick = () => {
        if (selectionMode && onSelect) {
            onSelect()
        } else {
            onClick()
        }
    }

    return (
        <button
            onClick={handleClick}
            className='group relative aspect-square w-full cursor-pointer overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white'
        >
            <Image
                src={post.media.thumbnailUrl ?? post.media.url}
                alt={post.caption?.substring(0, 100) ?? 'Instagram post'}
                fill
                className={cn(
                    'object-cover transition-all duration-200',
                    selectionMode && isSelected && 'scale-[0.92] rounded-lg'
                )}
                sizes='(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw'
            />

            {/* Selection overlay */}
            {selectionMode && (
                <div
                    className={cn(
                        'absolute inset-0 transition-colors duration-200',
                        isSelected ? 'bg-blue-500/20' : 'bg-transparent'
                    )}
                />
            )}

            {/* Selection checkbox */}
            {selectionMode && (
                <div className='absolute top-2 left-2 z-10'>
                    <div
                        className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200',
                            isSelected
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-white bg-black/30 text-transparent hover:border-blue-300'
                        )}
                    >
                        <Check className='h-4 w-4' />
                    </div>
                </div>
            )}

            {/* Hover overlay with stats - only show when not in selection mode */}
            {!selectionMode && (
                <div className='absolute inset-0 flex items-center justify-center gap-6 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
                    <div className='flex items-center gap-1.5 text-white'>
                        <Heart className='h-5 w-5 fill-white' />
                        <span className='text-sm font-bold'>
                            {formatNumber(post.likeCount)}
                        </span>
                    </div>
                    <div className='flex items-center gap-1.5 text-white'>
                        <MessageCircle className='h-5 w-5 fill-white' />
                        <span className='text-sm font-bold'>
                            {formatNumber(post.commentCount)}
                        </span>
                    </div>
                </div>
            )}

            {/* Media type indicator - top right */}
            {(isVideo || isCarousel) && (
                <div
                    className={cn(
                        'absolute top-2 right-2 text-white drop-shadow-lg',
                        selectionMode && isSelected && 'top-3 right-3'
                    )}
                >
                    {isVideo && <Play className='h-5 w-5 fill-white' />}
                    {isCarousel && <Layers className='h-5 w-5' />}
                </div>
            )}

            {/* Pinned indicator - below selection checkbox when in selection mode */}
            {post.isFeatured && (
                <div
                    className={cn(
                        'absolute text-white drop-shadow-lg',
                        selectionMode ? 'top-10 left-2' : 'top-2 left-2'
                    )}
                >
                    <Pin className='h-4 w-4 fill-white' />
                </div>
            )}
        </button>
    )
}

export function InstagramPostsGrid({
    posts,
    profile,
    mediaType,
    onMediaTypeChange,
    isLoading = false,
    isLoadingMore = false,
    loadingPlaceholders = 6,
    selectionMode = false,
    selectedIds = [],
    onSelectPost,
}: InstagramPostsGridProps) {
    const [selectedPost, setSelectedPost] =
        useState<InstagramPostListItem | null>(null)

    const selectedSet = new Set(selectedIds)

    if (posts.length === 0 && !isLoading) {
        return (
            <div className='py-12 text-center'>
                <p className='text-muted-foreground'>
                    No posts found. Click &quot;Sync Now&quot; to fetch posts
                    from Instagram.
                </p>
            </div>
        )
    }

    return (
        <div className='space-y-0'>
            {/* Tabs */}
            <div className='flex justify-center border-t'>
                <div className='flex gap-12'>
                    <button
                        onClick={() => onMediaTypeChange('all')}
                        className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                            mediaType === 'all'
                                ? 'border-foreground text-foreground'
                                : 'text-muted-foreground hover:text-foreground border-transparent'
                        }`}
                    >
                        <Grid className='h-3 w-3' />
                        All
                    </button>
                    <button
                        onClick={() => onMediaTypeChange('image')}
                        className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                            mediaType === 'image'
                                ? 'border-foreground text-foreground'
                                : 'text-muted-foreground hover:text-foreground border-transparent'
                        }`}
                    >
                        <ImageIcon className='h-3 w-3' />
                        Images
                    </button>
                    <button
                        onClick={() => onMediaTypeChange('video')}
                        className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                            mediaType === 'video'
                                ? 'border-foreground text-foreground'
                                : 'text-muted-foreground hover:text-foreground border-transparent'
                        }`}
                    >
                        <Clapperboard className='h-3 w-3' />
                        Reels
                    </button>
                    <button
                        onClick={() => onMediaTypeChange('carousel')}
                        className={`flex h-12 items-center gap-2 border-t text-xs font-semibold tracking-widest uppercase transition-colors ${
                            mediaType === 'carousel'
                                ? 'border-foreground text-foreground'
                                : 'text-muted-foreground hover:text-foreground border-transparent'
                        }`}
                    >
                        <Layers className='h-3 w-3' />
                        Carousel
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className='grid grid-cols-3 gap-0.5'>
                {posts.map((post) => (
                    <PostThumbnail
                        key={post.id}
                        post={post}
                        onClick={() => setSelectedPost(post)}
                        selectionMode={selectionMode}
                        isSelected={selectedSet.has(post.id)}
                        onSelect={() => onSelectPost?.(post.id)}
                    />
                ))}

                {(isLoading || isLoadingMore) &&
                    Array.from({ length: loadingPlaceholders }).map(
                        (_, index) => (
                            <div
                                key={`loading-${index}`}
                                className='aspect-square w-full'
                            >
                                <Skeleton className='h-full w-full rounded-none' />
                            </div>
                        )
                    )}
            </div>

            {/* Detail Modal */}
            <InstagramPostDialog
                post={selectedPost}
                profile={profile}
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
            />
        </div>
    )
}
