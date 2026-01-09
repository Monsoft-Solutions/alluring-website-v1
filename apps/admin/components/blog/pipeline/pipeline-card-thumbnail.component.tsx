'use client'

import Image from 'next/image'
import { ImageIcon } from 'lucide-react'

type PipelineCardThumbnailProps = {
    title: string
    imageUrl?: string | null
}

export function PipelineCardThumbnail({
    title,
    imageUrl,
}: PipelineCardThumbnailProps) {
    if (imageUrl) {
        return (
            <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-stone-100'>
                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className='object-cover'
                    sizes='56px'
                />
            </div>
        )
    }

    return (
        <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-stone-100'>
            <ImageIcon className='h-5 w-5 text-stone-400' />
        </div>
    )
}
