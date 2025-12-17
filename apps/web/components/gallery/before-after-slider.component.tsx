'use client'

import { cn } from '@workspace/ui/lib/utils'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'

import type { BeforeAfterPairCard } from '@/lib/types/gallery/before-after.type'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

type BeforeAfterSliderProps = {
    readonly pair: BeforeAfterPairCard
    readonly className?: string
}

/**
 * Before/After Slider Component
 *
 * An interactive comparison slider for before/after images.
 * Supports mouse drag and touch gestures.
 */
export function BeforeAfterSlider({ pair, className }: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const { track } = useAnalyticsEvent()
    const hasTrackedInteraction = useRef(false)

    const updateSliderPosition = useCallback((clientX: number) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
        setSliderPosition(percentage)
    }, [])

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            setIsDragging(true)
            updateSliderPosition(e.clientX)

            // Track interaction once per slider
            if (!hasTrackedInteraction.current) {
                hasTrackedInteraction.current = true
                track('gallery_slider_interact', {
                    procedure_type: pair.procedureType ?? undefined,
                    timeframe: pair.timeframe ?? undefined,
                    interaction_type: 'drag',
                })
            }
        },
        [updateSliderPosition, pair.procedureType, pair.timeframe, track]
    )

    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isDragging) return
            updateSliderPosition(e.clientX)
        },
        [isDragging, updateSliderPosition]
    )

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            setIsDragging(true)
            updateSliderPosition(e.touches[0]!.clientX)

            // Track interaction once per slider
            if (!hasTrackedInteraction.current) {
                hasTrackedInteraction.current = true
                track('gallery_slider_interact', {
                    procedure_type: pair.procedureType ?? undefined,
                    timeframe: pair.timeframe ?? undefined,
                    interaction_type: 'drag',
                })
            }
        },
        [updateSliderPosition, pair.procedureType, pair.timeframe, track]
    )

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (!isDragging) return
            updateSliderPosition(e.touches[0]!.clientX)
        },
        [isDragging, updateSliderPosition]
    )

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false)
    }, [])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const step = 5
            let newPosition = sliderPosition

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                    e.preventDefault()
                    newPosition = Math.max(0, sliderPosition - step)
                    break
                case 'ArrowRight':
                case 'ArrowUp':
                    e.preventDefault()
                    newPosition = Math.min(100, sliderPosition + step)
                    break
                case 'Home':
                    e.preventDefault()
                    newPosition = 0
                    break
                case 'End':
                    e.preventDefault()
                    newPosition = 100
                    break
                default:
                    return
            }

            setSliderPosition(newPosition)
        },
        [sliderPosition]
    )

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Slider Container */}
            <div
                ref={containerRef}
                className='relative aspect-[4/5] w-full cursor-col-resize overflow-hidden rounded-xl bg-stone-100 select-none'
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onKeyDown={handleKeyDown}
                role='slider'
                aria-label='Before and after comparison slider'
                aria-valuenow={Math.round(sliderPosition)}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={0}
            >
                {/* After Image (Background) */}
                <div className='absolute inset-0'>
                    <Image
                        src={pair.afterImage.url}
                        alt={pair.afterImage.alt}
                        fill
                        className='object-cover'
                        sizes='(max-width: 768px) 100vw, 50vw'
                        placeholder={
                            pair.afterImage.blurDataUrl ? 'blur' : 'empty'
                        }
                        blurDataURL={pair.afterImage.blurDataUrl ?? undefined}
                        draggable={false}
                    />
                </div>

                {/* Before Image (Clipped) */}
                <div
                    className='absolute inset-0 overflow-hidden'
                    style={{
                        clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    }}
                >
                    <Image
                        src={pair.beforeImage.url}
                        alt={pair.beforeImage.alt}
                        fill
                        className='object-cover'
                        sizes='(max-width: 768px) 100vw, 50vw'
                        placeholder={
                            pair.beforeImage.blurDataUrl ? 'blur' : 'empty'
                        }
                        blurDataURL={pair.beforeImage.blurDataUrl ?? undefined}
                        draggable={false}
                    />
                </div>

                {/* Slider Handle */}
                <div
                    className='absolute top-0 bottom-0 z-10 w-1'
                    style={{
                        left: `${sliderPosition}%`,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {/* Line */}
                    <div className='h-full w-full bg-white shadow-lg' />

                    {/* Handle Circle */}
                    <div
                        className={cn(
                            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                            'flex h-12 w-12 items-center justify-center rounded-full',
                            'bg-white shadow-xl',
                            'transition-transform duration-150',
                            isDragging && 'scale-110'
                        )}
                    >
                        {/* Arrows */}
                        <div className='flex items-center gap-1'>
                            <svg
                                className='h-4 w-4 text-stone-600'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M15 19l-7-7 7-7'
                                />
                            </svg>
                            <svg
                                className='h-4 w-4 text-stone-600'
                                fill='none'
                                viewBox='0 0 24 24'
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 5l7 7-7 7'
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Labels */}
                <div className='pointer-events-none absolute top-4 right-4 left-4 flex justify-between'>
                    <span className='rounded-full bg-stone-900/70 px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm'>
                        Before
                    </span>
                    <span className='rounded-full bg-stone-900/70 px-3 py-1.5 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-sm'>
                        After
                    </span>
                </div>
            </div>

            {/* Metadata */}
            {(pair.procedureType || pair.timeframe) && (
                <div className='mt-4 flex flex-wrap items-center gap-3 text-sm'>
                    {pair.procedureType && (
                        <span className='bg-gold-500/10 text-gold-700 rounded-full px-3 py-1 font-medium'>
                            {pair.procedureType}
                        </span>
                    )}
                    {pair.timeframe && (
                        <span className='text-stone-500'>{pair.timeframe}</span>
                    )}
                </div>
            )}
        </div>
    )
}
