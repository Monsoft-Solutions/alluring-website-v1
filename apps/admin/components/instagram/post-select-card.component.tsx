/**
 * Post Select Card Component
 *
 * Displays an Instagram post with selection checkbox and metadata.
 *
 * @module components/instagram/post-select-card
 */
'use client'

import Image from 'next/image'
import { Badge } from '@workspace/ui/components/badge'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Layers } from 'lucide-react'

import type { InstagramPostListItem } from '@/lib/queries/social-media.query'

type PostSelectCardProps = {
    post: InstagramPostListItem
    isSelected: boolean
    onToggle: () => void
}

export function PostSelectCard({
    post,
    isSelected,
    onToggle,
}: PostSelectCardProps) {
    const isCarousel = post.mediaType === 'carousel'

    return (
        <div
            onClick={onToggle}
            className={`group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                isSelected
                    ? 'border-primary ring-primary ring-2 ring-offset-2'
                    : 'hover:border-muted-foreground/30 border-transparent'
            }`}
        >
            <Image
                src={post.media.thumbnailUrl ?? post.media.url}
                alt={post.caption?.substring(0, 100) ?? 'Instagram post'}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 25vw, 16vw'
            />

            {/* Checkbox */}
            <div className='absolute top-2 left-2'>
                <Checkbox checked={isSelected} className='bg-white' />
            </div>

            {/* Status badge */}
            <Badge
                className='absolute top-2 right-2'
                variant={
                    post.analysisStatus === 'pending'
                        ? 'secondary'
                        : post.analysisStatus === 'analyzed'
                          ? 'default'
                          : 'outline'
                }
            >
                {post.analysisStatus}
            </Badge>

            {/* Carousel indicator */}
            {isCarousel && (
                <div className='absolute right-2 bottom-2 text-white drop-shadow-lg'>
                    <Layers className='h-5 w-5' />
                </div>
            )}
        </div>
    )
}
