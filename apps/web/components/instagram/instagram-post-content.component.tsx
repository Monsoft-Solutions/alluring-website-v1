/**
 * Instagram Post Content Component
 *
 * Full page content for individual Instagram post display.
 * Similar layout to the dialog but as a standalone page.
 *
 * @module components/instagram/instagram-post-content
 */
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    ChevronLeft,
    Heart,
    MessageCircle,
    ExternalLink,
    Instagram,
} from 'lucide-react'

import type {
    InstagramPostPublic,
    InstagramProfileInfo,
} from '@/types/instagram.type'
import { InstagramCarousel } from './instagram-carousel.component'

type InstagramPostContentProps = {
    post: InstagramPostPublic
    profile?: InstagramProfileInfo | null
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
 * Format date for display
 */
function formatDate(date: Date): string {
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

export function InstagramPostContent({
    post,
    profile,
}: InstagramPostContentProps) {
    const hasCarousel =
        post.mediaType === 'carousel' && (post.carouselMedia?.length ?? 0) > 0

    const handle = profile?.handle ?? 'alluringplasticsurgery'

    return (
        <div className='bg-white'>
            {/* Fixed Back Navigation - positioned below navbar and announcement bar */}
            <div
                style={{
                    top: 'calc(var(--announcement-bar-height, 0px) + 4rem)',
                }}
                className='fixed right-0 left-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-xl md:top-[calc(var(--announcement-bar-height,0px)+5rem)]'
            >
                <div className='mx-auto max-w-4xl px-4 py-3'>
                    <Link
                        href='/instagram'
                        className='inline-flex items-center gap-1 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900'
                    >
                        <ChevronLeft className='h-4 w-4' />
                        Back to Instagram
                    </Link>
                </div>
            </div>

            {/* Spacer for announcement bar + navbar + back navigation */}
            <div
                style={{
                    height: 'calc(var(--announcement-bar-height, 0px) + 7rem)',
                }}
                className='md:h-[calc(var(--announcement-bar-height,0px)+8rem)]'
            />

            {/* Main Content */}
            <div className='mx-auto max-w-4xl px-3 py-6 sm:px-4 md:py-12'>
                <div className='grid gap-6 md:grid-cols-[1fr_320px] md:gap-8'>
                    {/* Media Section */}
                    <div className='relative aspect-square w-full overflow-hidden rounded-lg bg-stone-900'>
                        {hasCarousel ? (
                            <InstagramCarousel
                                media={post.carouselMedia!}
                                caption={post.caption}
                            />
                        ) : post.media.type === 'video' ? (
                            <video
                                src={post.media.url}
                                controls
                                className='h-full w-full object-contain'
                            />
                        ) : (
                            <Image
                                src={post.media.url}
                                alt={
                                    post.caption?.substring(0, 100) ??
                                    'Instagram post'
                                }
                                fill
                                className='object-contain'
                                sizes='(max-width: 768px) 100vw, 600px'
                                priority
                            />
                        )}
                    </div>

                    {/* Info Section */}
                    <div className='flex flex-col md:min-h-0'>
                        {/* Profile Header */}
                        <div className='flex items-center gap-3 border-b border-stone-200 pb-3 md:pb-4'>
                            {profile?.profilePictureUrl && (
                                <Image
                                    src={profile.profilePictureUrl}
                                    alt={handle}
                                    width={40}
                                    height={40}
                                    className='rounded-full md:h-11 md:w-11'
                                />
                            )}
                            <div className='flex-1'>
                                <p className='text-sm font-semibold text-stone-900 md:text-base'>
                                    @{handle}
                                </p>
                                <p className='text-xs text-stone-500'>
                                    {formatDate(new Date(post.takenAt))}
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
                        <div className='flex-1 py-3 md:py-4'>
                            {post.caption && (
                                <p className='text-sm leading-relaxed whitespace-pre-wrap text-stone-700 md:text-base md:leading-relaxed'>
                                    {formatCaptionWithHashtags(post.caption)}
                                </p>
                            )}
                        </div>

                        {/* Stats */}
                        <div className='space-y-3 border-t border-stone-200 pt-3 md:space-y-4 md:pt-4'>
                            <div className='flex items-center gap-4 md:gap-6'>
                                <div className='flex items-center gap-1.5 text-stone-700'>
                                    <Heart className='h-5 w-5 md:h-6 md:w-6' />
                                    <span className='text-sm font-semibold md:text-base'>
                                        {formatNumber(post.likeCount)}
                                    </span>
                                    <span className='text-xs text-stone-500 md:text-sm'>
                                        likes
                                    </span>
                                </div>
                                <div className='flex items-center gap-1.5 text-stone-700'>
                                    <MessageCircle className='h-5 w-5 md:h-6 md:w-6' />
                                    <span className='text-sm font-semibold md:text-base'>
                                        {formatNumber(post.commentCount)}
                                    </span>
                                    <span className='text-xs text-stone-500 md:text-sm'>
                                        comments
                                    </span>
                                </div>
                            </div>

                            {/* View on Instagram Button */}
                            <Link
                                href={post.permalink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex w-full items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 md:py-3'
                            >
                                <ExternalLink className='h-4 w-4' />
                                View on Instagram
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
