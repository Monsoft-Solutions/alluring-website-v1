'use client'

import { Check } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@workspace/ui/components/badge'

import type { GalleryMediaListItem } from '@/lib/queries/gallery.query'

type SelectableCurrentMediaCardProps = {
    media: GalleryMediaListItem
    isSelected: boolean
    onToggle: (mediaId: string) => void
}

export function SelectableCurrentMediaCard({
    media,
    isSelected,
    onToggle,
}: SelectableCurrentMediaCardProps) {
    return (
        <button
            type='button'
            onClick={() => onToggle(media.id)}
            className={`group relative overflow-hidden rounded-lg border bg-white text-left transition-all ${
                isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'hover:border-blue-300 hover:shadow-md'
            }`}
        >
            <div className='relative aspect-square'>
                <Image
                    src={media.thumbnailUrl || media.url}
                    alt={media.title}
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                />
                {/* Selection overlay */}
                {isSelected && (
                    <div className='absolute inset-0 flex items-center justify-center bg-blue-500/20'>
                        <div className='rounded-full bg-blue-500 p-2 shadow-lg'>
                            <Check className='h-6 w-6 text-white' />
                        </div>
                    </div>
                )}
                {/* Hover overlay for unselected */}
                {!isSelected && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/10 group-hover:opacity-100'>
                        <div className='rounded-full border-2 border-white p-2'>
                            <div className='h-6 w-6' />
                        </div>
                    </div>
                )}
            </div>
            <div className='p-3'>
                <div className='mb-2 flex items-start justify-between gap-2'>
                    <p className='line-clamp-2 text-sm font-medium'>
                        {media.title}
                    </p>
                    <Badge
                        variant={
                            media.status === 'published'
                                ? 'default'
                                : 'secondary'
                        }
                        className='shrink-0'
                    >
                        {media.status}
                    </Badge>
                </div>
            </div>
        </button>
    )
}
