'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Quote, Star, Play, Pause, Instagram } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

import type { FeaturedTestimonial } from '@/lib/types/testimonials/testimonial.type'

interface FeaturedTestimonialCardProps {
    testimonial: FeaturedTestimonial
}

export function FeaturedTestimonialCard({
    testimonial,
}: FeaturedTestimonialCardProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    const hasVideo = testimonial.mediaType === 'video' && testimonial.mediaUrl
    const hasMedia = testimonial.thumbnailUrl || testimonial.mediaUrl

    const handlePlayPause = () => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.pause()
            setIsPlaying(false)
        } else {
            videoRef.current.play()
            setIsPlaying(true)
        }
    }

    const handleVideoEnded = () => {
        setIsPlaying(false)
    }

    return (
        <article className='group relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg'>
            {/* Media Section */}
            {hasMedia && (
                <div className='relative aspect-video overflow-hidden'>
                    {hasVideo && isPlaying ? (
                        // Video player
                        <video
                            ref={videoRef}
                            src={testimonial.mediaUrl!}
                            className='h-full w-full object-cover'
                            onEnded={handleVideoEnded}
                            playsInline
                        >
                            <track kind='captions' />
                        </video>
                    ) : (
                        // Thumbnail
                        <Image
                            src={
                                testimonial.thumbnailUrl ||
                                testimonial.mediaUrl ||
                                ''
                            }
                            alt={`Testimonial from ${testimonial.patientName}`}
                            fill
                            className='object-cover transition-transform duration-500 group-hover:scale-105'
                            sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                        />
                    )}

                    {/* Play/Pause button for videos */}
                    {hasVideo && (
                        <button
                            onClick={handlePlayPause}
                            className={cn(
                                'absolute inset-0 flex items-center justify-center transition-opacity',
                                isPlaying
                                    ? 'bg-transparent opacity-0 hover:opacity-100'
                                    : 'bg-black/30 opacity-100'
                            )}
                            aria-label={
                                isPlaying ? 'Pause video' : 'Play video'
                            }
                        >
                            <div
                                className={cn(
                                    'flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform',
                                    !isPlaying && 'group-hover:scale-110'
                                )}
                            >
                                {isPlaying ? (
                                    <Pause className='h-6 w-6 fill-stone-900 text-stone-900' />
                                ) : (
                                    <Play className='h-6 w-6 fill-stone-900 text-stone-900' />
                                )}
                            </div>
                        </button>
                    )}

                    {/* Instagram attribution */}
                    {testimonial.instagramPermalink && !isPlaying && (
                        <a
                            href={testimonial.instagramPermalink}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-stone-700 backdrop-blur-sm transition-colors hover:bg-white'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Instagram className='h-3 w-3' />
                            <span className='sr-only sm:not-sr-only'>
                                Instagram
                            </span>
                        </a>
                    )}
                </div>
            )}

            {/* Content */}
            <div className='flex flex-grow flex-col p-6 md:p-8'>
                {/* Quote Icon - only show if no media */}
                {!hasMedia && (
                    <div className='text-gold-200 mb-4'>
                        <Quote className='h-8 w-8' />
                    </div>
                )}

                {/* Rating Stars */}
                <div className='mb-4 flex gap-1'>
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                            key={i}
                            className='fill-gold-400 text-gold-400 h-4 w-4'
                        />
                    ))}
                </div>

                {/* Quote Text */}
                <blockquote className='mb-6 flex-grow text-base leading-relaxed text-stone-700 italic'>
                    &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                {/* Attribution */}
                <div className='border-t border-stone-100 pt-4'>
                    <p className='font-semibold text-stone-900'>
                        {testimonial.patientName}
                    </p>
                    <p className='text-gold-600 text-sm'>
                        {testimonial.procedure}
                    </p>
                    {testimonial.timeframe && (
                        <p className='text-xs text-stone-500'>
                            {testimonial.timeframe}
                        </p>
                    )}
                </div>
            </div>
        </article>
    )
}
