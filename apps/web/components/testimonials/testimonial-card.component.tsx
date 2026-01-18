'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, Play, Instagram, Quote } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

import type { TestimonialCard as TestimonialCardType } from '@/lib/types/testimonials/testimonial.type'
import { TestimonialVideoModal } from './testimonial-video-modal.component'

interface TestimonialCardProps {
    testimonial: TestimonialCardType
    className?: string
}

export function TestimonialCard({
    testimonial,
    className,
}: TestimonialCardProps) {
    const [showVideo, setShowVideo] = useState(false)
    const hasVideo = testimonial.mediaType === 'video' && testimonial.mediaUrl

    return (
        <>
            <article
                className={cn(
                    'group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100 transition-all hover:shadow-lg',
                    className
                )}
            >
                {/* Media Section */}
                {(testimonial.thumbnailUrl || testimonial.mediaUrl) && (
                    <div className='relative aspect-[4/3] overflow-hidden'>
                        <Image
                            src={
                                testimonial.thumbnailUrl ||
                                testimonial.mediaUrl ||
                                ''
                            }
                            alt={`Testimonial from ${testimonial.patientName}`}
                            fill
                            className='object-cover transition-transform duration-500 group-hover:scale-105'
                            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                        />

                        {/* Play button overlay for videos */}
                        {hasVideo && (
                            <button
                                onClick={() => setShowVideo(true)}
                                className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 transition-opacity group-hover:bg-black/40'
                                aria-label='Play video testimonial'
                            >
                                <div className='flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform group-hover:scale-110'>
                                    <Play className='h-7 w-7 fill-stone-900 text-stone-900' />
                                </div>
                            </button>
                        )}

                        {/* Instagram badge */}
                        {testimonial.instagramPermalink && (
                            <a
                                href={testimonial.instagramPermalink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-700 backdrop-blur-sm transition-colors hover:bg-white'
                            >
                                <Instagram className='h-3.5 w-3.5' />
                                View on Instagram
                            </a>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className='p-5'>
                    {/* Quote icon */}
                    <Quote className='text-gold-400/60 mb-3 h-6 w-6' />

                    {/* Quote text */}
                    <blockquote className='mb-4 line-clamp-4 text-sm leading-relaxed text-stone-600'>
                        "{testimonial.quote}"
                    </blockquote>

                    {/* Patient info */}
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='font-serif text-lg font-medium text-stone-900'>
                                {testimonial.patientName}
                            </p>
                            <p className='text-sm text-stone-500'>
                                {testimonial.procedure}
                                {testimonial.timeframe && (
                                    <span className='text-stone-400'>
                                        {' '}
                                        · {testimonial.timeframe}
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className='flex items-center gap-0.5'>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        'h-4 w-4',
                                        i < testimonial.rating
                                            ? 'fill-gold-400 text-gold-400'
                                            : 'text-stone-200'
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </article>

            {/* Video Modal */}
            {hasVideo && (
                <TestimonialVideoModal
                    open={showVideo}
                    onOpenChange={setShowVideo}
                    videoUrl={testimonial.mediaUrl!}
                    patientName={testimonial.patientName}
                    procedure={testimonial.procedure}
                />
            )}
        </>
    )
}
