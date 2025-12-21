/**
 * Instagram Post Thumbnail Component
 *
 * Individual post thumbnail with hover overlay showing engagement stats.
 *
 * @module components/instagram/post-thumbnail
 */
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MessageCircle, Play, Layers } from 'lucide-react'

import type { InstagramPostPublic } from '@/lib/types/instagram.type'
import { formatNumber } from '@/lib/utils/format.util'

type PostThumbnailProps = {
    post: InstagramPostPublic
}

export function PostThumbnail({ post }: PostThumbnailProps) {
    const isVideo = post.mediaType === 'video'
    const isCarousel = post.mediaType === 'carousel'

    return (
        <Link
            href={`/instagram/${post.code}`}
            className='group relative aspect-square w-full cursor-pointer overflow-hidden bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900'
            aria-label={`View Instagram post: ${post.caption?.substring(0, 50) || 'No caption'}`}
        >
            <Image
                src={post.media.thumbnailUrl ?? post.media.url}
                alt={post.caption?.substring(0, 100) ?? 'Instagram post'}
                fill
                className='object-cover transition-transform duration-300 group-hover:scale-105'
                sizes='(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw'
            />

            {/* Hover overlay with stats */}
            <div className='absolute inset-0 flex items-center justify-center gap-6 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
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

            {/* Media type indicator - top right */}
            {(isVideo || isCarousel) && (
                <div className='absolute top-2 right-2 text-white drop-shadow-lg'>
                    {isVideo && <Play className='h-5 w-5 fill-white' />}
                    {isCarousel && <Layers className='h-5 w-5' />}
                </div>
            )}
        </Link>
    )
}
