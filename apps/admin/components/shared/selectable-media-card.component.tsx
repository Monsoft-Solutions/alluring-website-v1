'use client'

import { Check } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@workspace/ui/components/badge'

import type { GalleryMediaListItem } from '@/lib/queries/gallery.query'

type SelectableMediaCardProps = {
    media: GalleryMediaListItem
    isSelected: boolean
    onToggle: (mediaId: string) => void
}

export function SelectableMediaCard({
    media,
    isSelected,
    onToggle,
}: SelectableMediaCardProps) {
    return (
        <button
            onClick={() => onToggle(media.id)}
            className={`group relative overflow-hidden rounded-lg border transition-all ${
                isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'hover:border-blue-300'
            }`}
        >
            <div className='relative aspect-square'>
                <Image
                    src={media.thumbnailUrl || media.url}
                    alt={media.title}
                    fill
                    className='object-cover'
                    sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                />
                {isSelected && (
                    <div className='absolute inset-0 flex items-center justify-center bg-blue-500/20'>
                        <div className='rounded-full bg-blue-500 p-2'>
                            <Check className='h-6 w-6 text-white' />
                        </div>
                    </div>
                )}
            </div>
            <div className='p-2'>
                <p className='truncate text-left text-sm font-medium'>
                    {media.title}
                </p>
                <div className='mt-1 flex items-center gap-2'>
                    <Badge
                        variant={
                            media.status === 'published'
                                ? 'default'
                                : 'secondary'
                        }
                        className='text-xs'
                    >
                        {media.status}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                        {media.type}
                    </Badge>
                </div>
            </div>
        </button>
    )
}
