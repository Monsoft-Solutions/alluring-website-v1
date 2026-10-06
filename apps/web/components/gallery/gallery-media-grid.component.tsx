'use client'

import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Lightbox, { type Slide } from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Video from 'yet-another-react-lightbox/plugins/video'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import { ExternalLink } from 'lucide-react'

import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'

/** A card, optionally labelled with the collection it came from. */
type GridMedia = GalleryMediaCard & { readonly groupName?: string }

type GalleryMediaGridProps = {
    readonly media: GridMedia[]
    readonly className?: string
    readonly enableLightbox?: boolean
    readonly linkToDetail?: boolean
    /** Caption colours for the band the grid sits on. */
    readonly tone?: 'light' | 'dark'
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
    tone = 'light',
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

    // Convert media to lightbox slides. A video must be a `video` slide:
    // given as a plain slide, its .mp4 is loaded as an image and never plays.
    const lightboxSlides: Slide[] = media.map((item) =>
        item.type === 'video'
            ? {
                  type: 'video',
                  poster: item.thumbnailUrl ?? undefined,
                  width: item.width ?? undefined,
                  height: item.height ?? undefined,
                  autoPlay: true,
                  playsInline: true,
                  sources: [{ src: item.url, type: 'video/mp4' }],
                  title: item.title,
                  description: item.title,
              }
            : {
                  src: item.url,
                  alt: item.alt,
                  width: item.width ?? undefined,
                  height: item.height ?? undefined,
                  title: item.title,
                  description: item.title,
              }
    )

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
                        tone={tone}
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
                    plugins={[Captions, Video]}
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
    readonly item: GridMedia
    readonly linkToDetail: boolean
    readonly tone: 'light' | 'dark'
    readonly onClick: () => void
}

function MediaGridItem({
    item,
    linkToDetail,
    tone,
    onClick,
}: MediaGridItemProps) {
    const content = (
        <span className='group block'>
            <span
                className={cn(
                    'relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-stone-950 ring-1 ring-stone-900/10',
                    'transition-all duration-300',
                    'group-hover:ring-gold-300 group-hover:shadow-xl group-hover:ring-2 group-hover:shadow-stone-900/15'
                )}
            >
                {/* Shown whole: a before-and-after cropped to fill the
                    frame loses half of its point */}
                <Image
                    src={item.thumbnailUrl ?? item.url}
                    alt={item.alt}
                    fill
                    className='object-contain transition-transform duration-500 group-hover:scale-[1.03]'
                    sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
                    placeholder={item.blurDataUrl ? 'blur' : 'empty'}
                    blurDataURL={item.blurDataUrl ?? undefined}
                />

                {/* Video Indicator */}
                {item.type === 'video' && (
                    <span className='absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm'>
                        <svg
                            className='ml-1 h-6 w-6 text-stone-900'
                            fill='currentColor'
                            viewBox='0 0 24 24'
                            aria-hidden='true'
                        >
                            <path d='M8 5v14l11-7z' />
                        </svg>
                    </span>
                )}
            </span>

            <span className='mt-2.5 block text-left'>
                {item.groupName && (
                    <span
                        className={cn(
                            'block text-[0.7rem] font-semibold tracking-[0.14em] uppercase',
                            tone === 'dark' ? 'text-gold-300' : 'text-stone-500'
                        )}
                    >
                        {item.groupName}
                    </span>
                )}
                <span
                    className={cn(
                        'mt-0.5 line-clamp-2 block text-sm leading-snug',
                        tone === 'dark' ? 'text-stone-200' : 'text-stone-800'
                    )}
                >
                    {item.title}
                </span>
            </span>
        </span>
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
