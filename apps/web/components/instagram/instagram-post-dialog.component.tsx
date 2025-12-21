'use client'

/**
 * Instagram Post Dialog Component
 *
 * Full-screen dialog for viewing Instagram post content.
 * Simplified version for public website display.
 *
 * @module components/instagram/instagram-post-dialog
 */
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    MessageCircle,
    ExternalLink,
    Instagram,
} from 'lucide-react'

import type {
    InstagramPostPublic,
    InstagramProfileInfo,
} from '@/types/instagram.type'

type InstagramPostDialogProps = {
    post: InstagramPostPublic | null
    profile?: InstagramProfileInfo | null
    isOpen: boolean
    onClose: () => void
}

/**
 * Format large numbers with K/M suffix
 */
function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

/**
 * Format relative time from date
 */
function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800)
        return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })
}

/**
 * Format caption with styled hashtags
 */
function formatCaptionWithHashtags(caption: string): ReactNode {
    const parts = caption.split(/(#\w+)/g)
    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            return (
                <span key={index} className='text-gold-600'>
                    {part}
                </span>
            )
        }
        return part
    })
}

export function InstagramPostDialog({
    post,
    profile,
    isOpen,
    onClose,
}: InstagramPostDialogProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    const mediaItems = useMemo(() => {
        if (!post) return []

        const hasCarouselMedia =
            post.mediaType === 'carousel' &&
            (post.carouselMedia?.length ?? 0) > 0

        if (hasCarouselMedia) {
            return post.carouselMedia ?? []
        }

        return [post.media]
    }, [post])

    const boundedIndex =
        mediaItems.length > 0
            ? Math.min(currentImageIndex, mediaItems.length - 1)
            : 0

    if (!post) return null

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : mediaItems.length - 1
        )
    }

    const handleNextImage = () => {
        setCurrentImageIndex((prev) =>
            prev < mediaItems.length - 1 ? prev + 1 : 0
        )
    }

    const isCarousel = mediaItems.length > 1
    const currentMedia = mediaItems[boundedIndex] ?? post.media

    return (
        <Dialog
            key={post.id}
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent
                className='max-h-[95vh] max-w-5xl gap-0 overflow-hidden border-stone-200 bg-white p-0'
                showCloseButton={true}
                size='xl'
            >
                <DialogTitle className='sr-only'>Instagram Post</DialogTitle>
                <DialogDescription className='sr-only'>
                    View Instagram post content
                </DialogDescription>

                <div className='grid h-[85vh] grid-cols-1 md:grid-cols-[1fr_380px]'>
                    {/* Left: Media */}
                    <div className='relative flex min-h-[300px] w-full items-center justify-center overflow-hidden bg-stone-900'>
                        {currentMedia.type === 'video' ? (
                            <video
                                key={currentMedia.id}
                                src={currentMedia.url}
                                controls
                                className='h-full w-full object-contain'
                            />
                        ) : (
                            <Image
                                src={currentMedia.url}
                                alt={
                                    post.caption?.substring(0, 100) ??
                                    'Instagram post'
                                }
                                fill
                                className='object-contain'
                                sizes='(max-width: 768px) 100vw, 60vw'
                                priority
                            />
                        )}

                        {/* Carousel navigation */}
                        {isCarousel && (
                            <>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={handlePrevImage}
                                    className='absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/90 text-stone-900 hover:bg-white'
                                    aria-label='Previous image'
                                >
                                    <ChevronLeft className='h-5 w-5' />
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={handleNextImage}
                                    className='absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/90 text-stone-900 hover:bg-white'
                                    aria-label='Next image'
                                >
                                    <ChevronRight className='h-5 w-5' />
                                </Button>

                                {/* Carousel dots */}
                                <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5'>
                                    {mediaItems.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() =>
                                                setCurrentImageIndex(idx)
                                            }
                                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                                idx === boundedIndex
                                                    ? 'bg-white'
                                                    : 'bg-white/50'
                                            }`}
                                            aria-label={`Go to image ${idx + 1}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: Content */}
                    <div className='flex flex-col overflow-hidden border-l border-stone-200'>
                        {/* Profile Header */}
                        <div className='flex items-center gap-3 border-b border-stone-200 p-4'>
                            {profile?.profilePictureUrl && (
                                <Image
                                    src={profile.profilePictureUrl}
                                    alt={profile.handle ?? 'Profile'}
                                    width={40}
                                    height={40}
                                    className='rounded-full'
                                />
                            )}
                            <div className='flex-1'>
                                <p className='font-semibold text-stone-900'>
                                    {profile?.handle ??
                                        'alluringplasticsurgery'}
                                </p>
                            </div>
                            <Link
                                href={post.permalink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-stone-500 transition-colors hover:text-stone-900'
                                aria-label='View on Instagram'
                            >
                                <Instagram className='h-5 w-5' />
                            </Link>
                        </div>

                        {/* Caption */}
                        <div className='flex-1 overflow-y-auto p-4'>
                            {post.caption && (
                                <div className='text-sm leading-relaxed whitespace-pre-wrap text-stone-700'>
                                    <span className='mr-2 font-semibold text-stone-900'>
                                        {profile?.handle ??
                                            'alluringplasticsurgery'}
                                    </span>
                                    {formatCaptionWithHashtags(post.caption)}
                                </div>
                            )}
                        </div>

                        {/* Stats & Actions */}
                        <div className='space-y-3 border-t border-stone-200 p-4'>
                            {/* Engagement Stats */}
                            <div className='flex items-center gap-4'>
                                <div className='flex items-center gap-1.5 text-stone-700'>
                                    <Heart className='h-6 w-6' />
                                    <span className='font-semibold'>
                                        {formatNumber(post.likeCount)}
                                    </span>
                                </div>
                                <div className='flex items-center gap-1.5 text-stone-700'>
                                    <MessageCircle className='h-6 w-6' />
                                    <span className='font-semibold'>
                                        {formatNumber(post.commentCount)}
                                    </span>
                                </div>
                            </div>

                            {/* Date */}
                            <p className='text-xs text-stone-500 uppercase'>
                                {formatRelativeTime(new Date(post.takenAt))}
                            </p>

                            {/* View on Instagram */}
                            <Link
                                href={post.permalink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex w-full items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800'
                            >
                                <ExternalLink className='h-4 w-4' />
                                View on Instagram
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
