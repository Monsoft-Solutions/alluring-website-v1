/**
 * SpecialsGalleryCarousel Component
 *
 * An auto-scrolling carousel showcasing gallery images from main procedures.
 * Uses shadcn/ui Carousel with Embla and autoplay plugin.
 *
 * Features:
 * - Auto-scrolling every 4 seconds
 * - Pauses on hover/touch
 * - Responsive: 1 slide mobile, 2 tablet, 3 desktop
 * - Seamless infinite loop
 * - Procedure name overlay on each image
 */
'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@workspace/ui/components/carousel'
import { Button } from '@workspace/ui/components/button'

import type { SpecialsGalleryImage } from '@/lib/types/gallery/specials-gallery.type'

import { ContentWrapper } from '@/components/shared/content-wrapper.component'
import { SectionContainer } from '@/components/shared/section-container.component'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

type SpecialsGalleryCarouselProps = {
    readonly id?: string
    readonly images: SpecialsGalleryImage[]
    readonly className?: string
}

/**
 * Gallery Carousel for Specials Page
 *
 * Displays an auto-scrolling carousel of gallery images from main procedures
 * to showcase real patient results and build trust.
 */
export function SpecialsGalleryCarousel({
    id = 'gallery-results',
    images,
    className,
}: SpecialsGalleryCarouselProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    // Convert images to lightbox slides format
    const lightboxSlides = images.map((image) => ({
        src: image.url,
        alt: image.alt,
        width: image.width ?? undefined,
        height: image.height ?? undefined,
    }))

    // Update current slide index - hooks must be called before any early returns
    useEffect(() => {
        if (!api) return

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap())
        }

        api.on('select', onSelect)

        // Cleanup listener on unmount
        return () => {
            api.off('select', onSelect)
        }
    }, [api])

    const scrollPrev = useCallback(() => {
        api?.scrollPrev()
    }, [api])

    const scrollNext = useCallback(() => {
        api?.scrollNext()
    }, [api])

    // Don't render if no images available - must be after all hooks
    if (images.length === 0) {
        return null
    }

    return (
        <SectionContainer
            id={id}
            variant='muted'
            className={cn('bg-stone-50', className)}
            paddingY='py-20 lg:py-28'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Section Header */}
                <div className='mb-12 md:mb-16'>
                    <div className='mx-auto max-w-3xl text-center'>
                        {/* Badge */}
                        <div className='mb-4 flex justify-center'>
                            <span className='text-gold-500 text-sm font-bold tracking-[0.2em] uppercase'>
                                Real Results
                            </span>
                        </div>

                        {/* Title */}
                        <h2 className='mb-6 font-serif text-4xl text-stone-900 md:text-5xl'>
                            Patient{' '}
                            <span className='text-gold-600'>
                                Transformations
                            </span>
                        </h2>

                        {/* Description */}
                        <p className='text-lg leading-relaxed font-light text-stone-600'>
                            Browse our gallery of real patient results. These
                            authentic transformations showcase the precision and
                            artistry of our board-certified surgeons.
                        </p>
                    </div>
                </div>

                {/* Carousel */}
                <div className='relative'>
                    <Carousel
                        setApi={setApi}
                        opts={{
                            align: 'start',
                            loop: true,
                        }}
                        plugins={[
                            Autoplay({
                                delay: 4000,
                                stopOnInteraction: true,
                                stopOnMouseEnter: true,
                            }),
                        ]}
                        className='w-full'
                    >
                        <CarouselContent className='-ml-4 md:-ml-6'>
                            {images.map((image, index) => (
                                <CarouselItem
                                    key={image.id}
                                    className='pl-4 md:basis-1/2 md:pl-6 lg:basis-1/3'
                                >
                                    <GalleryImageCard
                                        image={image}
                                        onClick={() => {
                                            setSelectedImageIndex(index)
                                            setLightboxOpen(true)
                                        }}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    {/* Custom Navigation */}
                    <div className='mt-8 flex items-center justify-center gap-4'>
                        {/* Previous Button */}
                        <Button
                            variant='outline'
                            size='icon'
                            onClick={scrollPrev}
                            className='hover:border-gold-500 hover:bg-gold-50 h-12 w-12 rounded-full border-stone-300'
                        >
                            <ArrowLeft className='h-5 w-5' />
                            <span className='sr-only'>Previous slide</span>
                        </Button>

                        {/* Dots Indicator */}
                        <div className='flex items-center gap-2'>
                            {Array.from({ length: count }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => api?.scrollTo(index)}
                                    className={cn(
                                        'h-2 rounded-full transition-all duration-300',
                                        current === index
                                            ? 'bg-gold-500 w-6'
                                            : 'w-2 bg-stone-300 hover:bg-stone-400'
                                    )}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Next Button */}
                        <Button
                            variant='outline'
                            size='icon'
                            onClick={scrollNext}
                            className='hover:border-gold-500 hover:bg-gold-50 h-12 w-12 rounded-full border-stone-300'
                        >
                            <ArrowRight className='h-5 w-5' />
                            <span className='sr-only'>Next slide</span>
                        </Button>
                    </div>
                </div>

                {/* Image Lightbox */}
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    index={selectedImageIndex}
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
            </ContentWrapper>
        </SectionContainer>
    )
}

/**
 * Gallery Image Card
 *
 * Individual image card that opens lightbox on click.
 */
function GalleryImageCard({
    image,
    onClick,
}: {
    readonly image: SpecialsGalleryImage
    readonly onClick: () => void
}) {
    return (
        <button
            type='button'
            onClick={onClick}
            className='group relative block aspect-3/4 w-full cursor-pointer overflow-hidden rounded-lg bg-stone-200 transition-transform hover:scale-[1.02]'
        >
            {/* Image */}
            <Image
                src={image.url}
                alt={image.alt}
                fill
                className='object-cover object-center transition-transform duration-500 group-hover:scale-105'
                sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                placeholder={image.blurDataUrl ? 'blur' : 'empty'}
                blurDataURL={image.blurDataUrl ?? undefined}
            />

            {/* Hover Effect */}
            <div className='bg-gold-500/0 group-hover:bg-gold-500/10 absolute inset-0 transition-colors duration-300' />
        </button>
    )
}
