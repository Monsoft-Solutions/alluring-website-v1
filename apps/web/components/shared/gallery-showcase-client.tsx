'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

import { cn } from '@workspace/ui/lib/utils'

import type { GalleryMediaCard } from '@/lib/types/gallery/gallery-group.type'

type GalleryShowcaseClientProps = {
    readonly media: GalleryMediaCard[]
}

/**
 * Gallery Showcase Client Component
 *
 * Interactive gallery with hero image display,
 * thumbnail carousel navigation, and lightbox viewing.
 */
export function GalleryShowcaseClient({ media }: GalleryShowcaseClientProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [lightboxOpen, setLightboxOpen] = useState(false)

    // Embla carousel for thumbnails
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: true,
    })

    const selectedMedia = media[selectedIndex]

    // Scroll thumbnail carousel to keep selected visible
    const scrollToSelected = useCallback(
        (index: number) => {
            if (emblaApi) {
                emblaApi.scrollTo(index)
            }
        },
        [emblaApi]
    )

    // Handle thumbnail click
    const handleThumbnailClick = (index: number) => {
        setSelectedIndex(index)
        scrollToSelected(index)
    }

    // Navigate to previous image
    const handlePrev = useCallback(() => {
        const newIndex =
            selectedIndex === 0 ? media.length - 1 : selectedIndex - 1
        setSelectedIndex(newIndex)
        scrollToSelected(newIndex)
    }, [selectedIndex, media.length, scrollToSelected])

    // Navigate to next image
    const handleNext = useCallback(() => {
        const newIndex =
            selectedIndex === media.length - 1 ? 0 : selectedIndex + 1
        setSelectedIndex(newIndex)
        scrollToSelected(newIndex)
    }, [selectedIndex, media.length, scrollToSelected])

    // Generate lightbox slides
    const lightboxSlides = media.map((item) => ({
        src: item.url,
        alt: item.alt,
        title: item.title,
    }))

    if (!selectedMedia) return null

    return (
        <div className='space-y-8'>
            {/* Hero Image Section */}
            <div className='grid gap-8 lg:grid-cols-2 lg:gap-12'>
                {/* Main Image */}
                <div className='relative'>
                    <Link
                        href={`/gallery/media/${selectedMedia.slug}`}
                        className='group relative block aspect-[4/5] w-full overflow-hidden rounded-xl bg-stone-100'
                    >
                        <Image
                            src={selectedMedia.url}
                            alt={selectedMedia.alt}
                            fill
                            className='object-cover transition-transform duration-500 group-hover:scale-105'
                            sizes='(max-width: 1024px) 100vw, 50vw'
                            placeholder={
                                selectedMedia.blurDataUrl ? 'blur' : 'empty'
                            }
                            blurDataURL={selectedMedia.blurDataUrl ?? undefined}
                            priority={selectedIndex === 0}
                        />

                        {/* Hover Overlay */}
                        <div className='absolute inset-0 bg-stone-900/0 transition-colors duration-300 group-hover:bg-stone-900/10' />

                        {/* Badge */}
                        <div className='absolute top-4 left-4 bg-white/90 px-3 py-1.5 backdrop-blur-sm'>
                            <span className='text-xs font-bold tracking-widest text-stone-900 uppercase'>
                                Real Results
                            </span>
                        </div>
                    </Link>

                    {/* Expand Button */}
                    <button
                        onClick={() => setLightboxOpen(true)}
                        className='absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white'
                        aria-label='View full screen'
                    >
                        <Expand className='h-5 w-5' />
                    </button>
                </div>

                {/* Info Panel */}
                <div className='flex flex-col justify-center'>
                    <h3 className='mb-4 font-serif text-3xl text-stone-900 md:text-4xl'>
                        {selectedMedia.title}
                    </h3>

                    <p className='mb-6 text-lg text-stone-600'>
                        Browse our gallery of real patient results. These
                        authentic transformations showcase the precision and
                        artistry of our board-certified surgeons.
                    </p>

                    {/* View Details Link */}
                    <Link
                        href={`/gallery/media/${selectedMedia.slug}`}
                        className='text-gold-600 hover:text-gold-700 mb-8 inline-flex w-fit items-center gap-2 text-sm font-semibold transition-colors'
                    >
                        View Details
                        <ChevronRight className='h-4 w-4' />
                    </Link>

                    {/* Navigation Arrows - Desktop */}
                    <div className='hidden items-center gap-4 lg:flex'>
                        <button
                            onClick={handlePrev}
                            className='hover:border-gold-500 hover:text-gold-600 flex h-12 w-12 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-all'
                            aria-label='Previous image'
                        >
                            <ChevronLeft className='h-5 w-5' />
                        </button>
                        <span className='text-sm text-stone-500'>
                            {selectedIndex + 1} of {media.length}
                        </span>
                        <button
                            onClick={handleNext}
                            className='hover:border-gold-500 hover:text-gold-600 flex h-12 w-12 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-all'
                            aria-label='Next image'
                        >
                            <ChevronRight className='h-5 w-5' />
                        </button>
                    </div>
                </div>
            </div>

            {/* Thumbnail Carousel */}
            <div className='relative'>
                {/* Carousel Container */}
                <div className='overflow-hidden' ref={emblaRef}>
                    <div className='-ml-3 flex md:-ml-4'>
                        {media.map((item, index) => (
                            <div
                                key={item.id}
                                className='min-w-0 shrink-0 basis-[28%] pl-3 sm:basis-[22%] md:basis-[18%] md:pl-4 lg:basis-[14%]'
                            >
                                <ThumbnailCard
                                    media={item}
                                    isSelected={selectedIndex === index}
                                    onClick={() => handleThumbnailClick(index)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows - Mobile */}
                <div className='mt-6 flex items-center justify-center gap-4 lg:hidden'>
                    <button
                        onClick={handlePrev}
                        className='hover:border-gold-500 hover:text-gold-600 flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-all'
                        aria-label='Previous image'
                    >
                        <ChevronLeft className='h-5 w-5' />
                    </button>
                    <span className='text-sm text-stone-500'>
                        {selectedIndex + 1} / {media.length}
                    </span>
                    <button
                        onClick={handleNext}
                        className='hover:border-gold-500 hover:text-gold-600 flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-600 transition-all'
                        aria-label='Next image'
                    >
                        <ChevronRight className='h-5 w-5' />
                    </button>
                </div>
            </div>

            {/* Lightbox */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={selectedIndex}
                slides={lightboxSlides}
                carousel={{
                    finite: false,
                }}
                styles={{
                    container: {
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    },
                }}
            />
        </div>
    )
}

/**
 * Thumbnail Card Component
 */
function ThumbnailCard({
    media,
    isSelected,
    onClick,
}: {
    readonly media: GalleryMediaCard
    readonly isSelected: boolean
    readonly onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'group relative block aspect-square w-full overflow-hidden rounded-lg transition-all',
                isSelected
                    ? 'ring-gold-500 ring-2 ring-offset-2'
                    : 'hover:ring-2 hover:ring-stone-300 hover:ring-offset-2'
            )}
        >
            <Image
                src={media.thumbnailUrl ?? media.url}
                alt={media.alt}
                fill
                className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                sizes='(max-width: 640px) 28vw, (max-width: 768px) 22vw, (max-width: 1024px) 18vw, 14vw'
                placeholder={media.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={media.blurDataUrl ?? undefined}
            />

            {/* Hover/Selected Overlay */}
            <div
                className={cn(
                    'absolute inset-0 transition-colors duration-200',
                    isSelected
                        ? 'bg-gold-500/10'
                        : 'bg-stone-900/0 group-hover:bg-stone-900/10'
                )}
            />
        </button>
    )
}
