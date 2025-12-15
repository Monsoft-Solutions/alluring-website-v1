'use client'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Calendar, Clock, Images, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

import type { GalleryMediaDetail } from '@/lib/types/gallery/gallery-media.type'

type MediaDetailViewProps = {
    readonly media: GalleryMediaDetail
    readonly className?: string
}

/**
 * Media Detail View Component
 *
 * Displays full media detail with image, metadata, and groups.
 */
export function MediaDetailView({ media, className }: MediaDetailViewProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    const formattedDate = media.publishedAt
        ? new Date(media.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : null

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12',
                className
            )}
        >
            {/* Main Image/Video */}
            <div className='lg:col-span-8'>
                {media.type === 'image' ? (
                    <button
                        onClick={() => setIsLightboxOpen(true)}
                        className='group focus:ring-gold-500 relative w-full cursor-zoom-in overflow-hidden rounded-xl bg-stone-100 focus:ring-2 focus:ring-offset-2 focus:outline-none'
                        aria-label='Open image in fullscreen'
                        style={{
                            aspectRatio:
                                media.width && media.height
                                    ? `${media.width} / ${media.height}`
                                    : '3 / 4',
                            minHeight: '400px',
                        }}
                    >
                        <Image
                            src={media.url}
                            alt={media.alt}
                            fill
                            className='object-contain transition-transform duration-500 group-hover:scale-[1.02]'
                            sizes='(max-width: 1024px) 100vw, 66vw'
                            placeholder={media.blurDataUrl ? 'blur' : 'empty'}
                            blurDataURL={media.blurDataUrl ?? undefined}
                            priority
                        />

                        {/* Zoom Indicator */}
                        <div className='absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 opacity-0 shadow-lg backdrop-blur-sm transition-opacity group-hover:opacity-100'>
                            <svg
                                className='h-4 w-4 text-stone-700'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7'
                                />
                            </svg>
                            <span className='text-sm font-medium text-stone-700'>
                                Click to enlarge
                            </span>
                        </div>
                    </button>
                ) : (
                    <div className='relative aspect-video w-full overflow-hidden rounded-xl bg-stone-900'>
                        <video
                            src={media.url}
                            poster={media.thumbnailUrl ?? undefined}
                            controls
                            className='h-full w-full object-contain'
                        />
                    </div>
                )}

                {/* Lightbox */}
                <Lightbox
                    open={isLightboxOpen}
                    close={() => setIsLightboxOpen(false)}
                    slides={[
                        {
                            src: media.url,
                            alt: media.alt,
                            width: media.width ?? undefined,
                            height: media.height ?? undefined,
                        },
                    ]}
                    carousel={{ finite: true }}
                    render={{
                        buttonPrev: () => null,
                        buttonNext: () => null,
                    }}
                    styles={{
                        container: {
                            backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        },
                    }}
                />
            </div>

            {/* Metadata Sidebar */}
            <div className='lg:col-span-4'>
                <div className='sticky top-24 space-y-6'>
                    {/* Title */}
                    <div>
                        <h1 className='mb-3 font-serif text-3xl text-stone-900 lg:text-4xl'>
                            {media.title}
                        </h1>

                        {/* Featured Badge */}
                        {media.isFeatured && (
                            <div className='bg-gold-500/10 mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5'>
                                <Star className='text-gold-600 h-4 w-4' />
                                <span className='text-gold-700 text-sm font-medium'>
                                    Featured
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {media.description && (
                        <div className='border-t border-stone-200 pt-6'>
                            <h2 className='mb-3 text-sm font-bold tracking-wider text-stone-500 uppercase'>
                                About This Image
                            </h2>
                            <p className='leading-relaxed text-stone-600'>
                                {media.description}
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className='border-t border-stone-200 pt-6'>
                        <h2 className='mb-4 text-sm font-bold tracking-wider text-stone-500 uppercase'>
                            Details
                        </h2>
                        <dl className='space-y-3'>
                            {formattedDate && (
                                <div className='flex items-center gap-3'>
                                    <dt>
                                        <Calendar className='h-4 w-4 text-stone-400' />
                                        <span className='sr-only'>
                                            Published
                                        </span>
                                    </dt>
                                    <dd className='text-sm text-stone-600'>
                                        {formattedDate}
                                    </dd>
                                </div>
                            )}
                            {media.type === 'video' && media.duration && (
                                <div className='flex items-center gap-3'>
                                    <dt>
                                        <Clock className='h-4 w-4 text-stone-400' />
                                        <span className='sr-only'>
                                            Duration
                                        </span>
                                    </dt>
                                    <dd className='text-sm text-stone-600'>
                                        {formatDuration(media.duration)}
                                    </dd>
                                </div>
                            )}
                            {media.width && media.height && (
                                <div className='flex items-center gap-3'>
                                    <dt>
                                        <Images className='h-4 w-4 text-stone-400' />
                                        <span className='sr-only'>
                                            Dimensions
                                        </span>
                                    </dt>
                                    <dd className='text-sm text-stone-600'>
                                        {media.width} × {media.height} px
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Groups/Collections */}
                    {media.groups.length > 0 && (
                        <div className='border-t border-stone-200 pt-6'>
                            <h2 className='mb-4 text-sm font-bold tracking-wider text-stone-500 uppercase'>
                                Collections
                            </h2>
                            <div className='flex flex-wrap gap-2'>
                                {media.groups.map((group) => (
                                    <Link
                                        key={group.id}
                                        href={`/gallery/${group.slug}`}
                                        className='rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200'
                                    >
                                        {group.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className='border-t border-stone-200 pt-6'>
                        <p className='mb-4 text-sm text-stone-500'>
                            Interested in achieving similar results?
                        </p>
                        <Button
                            asChild
                            variant='gold'
                            size='lg'
                            className='w-full'
                        >
                            <Link href='/contact-us'>
                                Schedule Consultation
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
