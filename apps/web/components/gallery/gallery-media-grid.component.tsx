'use client'

import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import { ExternalLink } from 'lucide-react'

import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'

type GalleryMediaGridProps = {
    readonly media: GalleryMediaCard[]
    readonly className?: string
    readonly enableLightbox?: boolean
    readonly linkToDetail?: boolean
}

/**
 * Gallery Media Grid Component
 *
 * Displays a grid of gallery media items with optional lightbox or detail page links.
 */
export function GalleryMediaGrid({
    media,
    className,
    enableLightbox = true,
    linkToDetail = true,
}: GalleryMediaGridProps) {
    const [lightboxIndex, setLightboxIndex] = useState(-1)
    const router = useRouter()

    if (media.length === 0) {
        return (
            <div className='py-20 text-center'>
                <p className='text-lg text-stone-500'>
                    No images available in this gallery yet.
                </p>
            </div>
        )
    }

    // Convert media to lightbox slides
    const lightboxSlides = media.map((item) => ({
        src: item.url,
        alt: item.alt,
        width: item.width ?? undefined,
        height: item.height ?? undefined,
        title: item.title,
        description: item.title,
    }))

    const handleMediaClick = (index: number) => {
        if (enableLightbox && !linkToDetail) {
            setLightboxIndex(index)
        }
    }

    const handleViewDetails = () => {
        if (lightboxIndex >= 0 && lightboxIndex < media.length) {
            const currentMedia = media[lightboxIndex]
            if (currentMedia) {
                router.push(`/gallery/media/${currentMedia.slug}`)
            }
        }
    }

    return (
        <>
            <div
                className={cn(
                    'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6',
                    className
                )}
            >
                {media.map((item, index) => (
                    <MediaGridItem
                        key={item.id}
                        item={item}
                        linkToDetail={linkToDetail}
                        onClick={() => handleMediaClick(index)}
                    />
                ))}
            </div>

            {/* Lightbox */}
            {enableLightbox && !linkToDetail && (
                <Lightbox
                    open={lightboxIndex >= 0}
                    close={() => setLightboxIndex(-1)}
                    index={lightboxIndex}
                    slides={lightboxSlides}
                    plugins={[Captions]}
                    carousel={{
                        finite: false,
                    }}
                    styles={{
                        container: {
                            backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        },
                    }}
                    toolbar={{
                        buttons: [
                            <button
                                key='view-details'
                                type='button'
                                aria-label='View details page'
                                className='yarl__button'
                                onClick={handleViewDetails}
                            >
                                <ExternalLink className='h-5 w-5' />
                            </button>,
                            'close',
                        ],
                    }}
                />
            )}
        </>
    )
}

type MediaGridItemProps = {
    readonly item: GalleryMediaCard
    readonly linkToDetail: boolean
    readonly onClick: () => void
}

function MediaGridItem({ item, linkToDetail, onClick }: MediaGridItemProps) {
    const content = (
        <div
            className={cn(
                'group relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-stone-100',
                'transition-all duration-300',
                'hover:shadow-xl hover:shadow-stone-900/10'
            )}
        >
            <Image
                src={item.thumbnailUrl ?? item.url}
                alt={item.alt}
                fill
                className='object-cover transition-transform duration-500 group-hover:scale-105'
                sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
                placeholder={item.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={item.blurDataUrl ?? undefined}
            />

            {/* Hover Overlay */}
            <div className='absolute inset-0 flex flex-col justify-end bg-linear-to-t from-stone-900/80 via-stone-900/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                <div className='p-4'>
                    <h3 className='line-clamp-2 text-sm font-medium text-white'>
                        {item.title}
                    </h3>
                </div>
            </div>

            {/* Featured Badge */}
            {item.isFeatured && (
                <div className='absolute top-3 left-3'>
                    <span className='bg-gold-500 rounded-full px-2 py-1 text-xs font-bold text-white uppercase'>
                        Featured
                    </span>
                </div>
            )}

            {/* Video Indicator */}
            {item.type === 'video' && (
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <div className='flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm'>
                        <svg
                            className='ml-1 h-6 w-6 text-stone-900'
                            fill='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path d='M8 5v14l11-7z' />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    )

    if (linkToDetail) {
        return (
            <Link
                href={`/gallery/media/${item.slug}`}
                className='focus:ring-gold-500 block rounded-lg focus:ring-2 focus:ring-offset-2 focus:outline-none'
                aria-label={`View ${item.title}`}
            >
                {content}
            </Link>
        )
    }

    return (
        <button
            onClick={onClick}
            className='focus:ring-gold-500 block w-full rounded-lg text-left focus:ring-2 focus:ring-offset-2 focus:outline-none'
            aria-label={`View ${item.title} in lightbox`}
        >
            {content}
        </button>
    )
}
