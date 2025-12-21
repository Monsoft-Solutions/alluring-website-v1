'use client'

/**
 * Instagram Carousel Component
 *
 * Carousel navigation for posts with multiple images/videos.
 *
 * @module components/instagram/instagram-carousel
 */
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

import type { InstagramCarouselItem } from '@/lib/types/instagram.type'

type InstagramCarouselProps = {
    media: InstagramCarouselItem[]
    caption?: string | null
}

export function InstagramCarousel({ media, caption }: InstagramCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (media.length === 0) return null

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
    }

    const currentMedia = media[currentIndex]!

    return (
        <div className='relative h-full w-full'>
            {/* Media */}
            {currentMedia.type === 'video' ? (
                <video
                    key={currentMedia.id}
                    src={currentMedia.url}
                    controls
                    className='h-full w-full object-contain'
                />
            ) : (
                <Image
                    key={currentMedia.id}
                    src={currentMedia.url}
                    alt={
                        caption?.substring(0, 100) ??
                        `Carousel image ${currentIndex + 1}`
                    }
                    fill
                    className='object-contain'
                    sizes='(max-width: 768px) 100vw, 600px'
                    priority={currentIndex === 0}
                />
            )}

            {/* Navigation Buttons */}
            {media.length > 1 && (
                <>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={handlePrev}
                        className='absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/90 text-stone-900 hover:bg-white'
                        aria-label='Previous image'
                    >
                        <ChevronLeft className='h-5 w-5' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={handleNext}
                        className='absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/90 text-stone-900 hover:bg-white'
                        aria-label='Next image'
                    >
                        <ChevronRight className='h-5 w-5' />
                    </Button>

                    {/* Dots */}
                    <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5'>
                        {media.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                    idx === currentIndex
                                        ? 'bg-white'
                                        : 'bg-white/50'
                                }`}
                                aria-label={`Go to image ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
