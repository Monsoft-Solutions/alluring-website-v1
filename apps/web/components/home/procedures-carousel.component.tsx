/**
 * Procedures Carousel
 *
 * The interactive shell around the signature-procedure cards: horizontal
 * snap scrolling, arrows, pagination dots and the first-visit swipe hint.
 *
 * It takes the cards as `children` rather than reading the procedure catalog
 * itself. That is deliberate: this file is a client component, so anything it
 * imports is downloaded by the browser, and importing the catalog to render
 * four cards shipped all nine procedures' full copy with it (issue #210). The
 * cards are built on the server in `procedures.component.tsx`; all this needs
 * from them is how many there are.
 */
'use client'

import { useRef, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@workspace/ui/lib/utils'

import { useScrollProgress } from '@/hooks/use-scroll-progress.hook'

import { SectionContainer } from '../shared/section-container.component'
import { ContentWrapper } from '../shared/content-wrapper.component'

// Storage key for swipe hint
const SWIPE_HINT_KEY = 'procedures-swipe-hint-shown'

type ProceduresCarouselProps = {
    /** The rendered procedure cards, in display order. */
    children: ReactNode
    /** How many cards `children` contains — drives the dots and the arrows. */
    count: number
}

export const ProceduresCarousel = ({
    children,
    count,
}: ProceduresCarouselProps) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [showSwipeHint, setShowSwipeHint] = useState(false)

    const {
        activeIndex,
        canScrollLeft,
        canScrollRight,
        scrollToIndex,
        scrollPrev,
        scrollNext,
    } = useScrollProgress(scrollContainerRef, count)

    // Show swipe hint on first visit (mobile only)
    useEffect(() => {
        // Only show on mobile
        if (typeof window === 'undefined' || window.innerWidth > 768) return

        const hasSeenHint = localStorage.getItem(SWIPE_HINT_KEY)
        if (!hasSeenHint) {
            // Defer state update to avoid cascading renders
            queueMicrotask(() => {
                setShowSwipeHint(true)
            })
            localStorage.setItem(SWIPE_HINT_KEY, 'true')

            // Hide after 3 seconds
            const timer = setTimeout(() => {
                setShowSwipeHint(false)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [])

    // Hide swipe hint on any scroll
    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container || !showSwipeHint) return

        const handleScroll = () => setShowSwipeHint(false)
        container.addEventListener('scroll', handleScroll, { once: true })

        return () => container.removeEventListener('scroll', handleScroll)
    }, [showSwipeHint])

    return (
        <SectionContainer
            id='procedures'
            variant='default'
            className='overflow-hidden bg-stone-900 text-white'
            paddingY='py-24'
        >
            <ContentWrapper size='lg' paddingX='px-6 md:px-12'>
                {/* Header with Navigation Arrows */}
                <div className='mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
                    <div className='max-w-xl'>
                        <span className='text-gold-400 mb-4 block text-sm font-bold tracking-widest uppercase'>
                            Expertise
                        </span>
                        <h2 className='mb-6 font-serif text-4xl text-white md:text-5xl lg:text-6xl'>
                            Signature Procedures
                        </h2>
                        <p className='text-xl font-light text-stone-400'>
                            Tailored surgical plans for your body, your
                            lifestyle, and your definition of confidence.
                        </p>
                    </div>

                    {/* Navigation Controls - Mobile */}
                    <div className='flex items-center gap-4 md:hidden'>
                        <button
                            onClick={scrollPrev}
                            disabled={!canScrollLeft}
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full border transition-all',
                                canScrollLeft
                                    ? 'hover:border-gold-400 hover:text-gold-400 border-stone-600 text-white'
                                    : 'cursor-not-allowed border-stone-700 text-stone-600'
                            )}
                            aria-label='Previous procedure'
                        >
                            <ChevronLeft className='h-5 w-5' />
                        </button>
                        <button
                            onClick={scrollNext}
                            disabled={!canScrollRight}
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-full border transition-all',
                                canScrollRight
                                    ? 'hover:border-gold-400 hover:text-gold-400 border-stone-600 text-white'
                                    : 'cursor-not-allowed border-stone-700 text-stone-600'
                            )}
                            aria-label='Next procedure'
                        >
                            <ChevronRight className='h-5 w-5' />
                        </button>
                    </div>

                    {/* View All Link - Desktop */}
                    <Link
                        href='/procedures'
                        className='hover:text-gold-400 hover:border-gold-400 hidden items-center gap-2 border-b border-stone-600 pb-2 text-sm tracking-widest uppercase transition-all md:flex'
                    >
                        View All Procedures <ArrowRight className='h-4 w-4' />
                    </Link>
                </div>
            </ContentWrapper>

            {/* Carousel Container with Edge Gradients */}
            <div className='relative'>
                {/* Left Edge Gradient - Shows when scrolled */}
                <div
                    className={cn(
                        'pointer-events-none absolute top-0 bottom-12 left-0 z-10 w-12 bg-gradient-to-r from-stone-900 to-transparent transition-opacity duration-300 md:hidden',
                        canScrollLeft ? 'opacity-100' : 'opacity-0'
                    )}
                    aria-hidden='true'
                />

                {/* Right Edge Gradient - Shows more content hint */}
                <div
                    className={cn(
                        'pointer-events-none absolute top-0 right-0 bottom-12 z-10 w-16 bg-gradient-to-l from-stone-900 to-transparent transition-opacity duration-300 md:hidden',
                        canScrollRight ? 'opacity-100' : 'opacity-0'
                    )}
                    aria-hidden='true'
                />

                {/* Horizontal Scroll Area */}
                <div
                    ref={scrollContainerRef}
                    className='scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pr-12 pb-12 pl-6 md:gap-8 md:pl-12'
                >
                    {children}
                </div>

                {/* Swipe Hint Animation - First Visit Only */}
                {showSwipeHint && (
                    <div
                        className='animate-swipe-hint pointer-events-none absolute right-8 bottom-20 flex items-center gap-2 text-stone-400 md:hidden'
                        aria-hidden='true'
                    >
                        <ChevronLeft className='h-4 w-4' />
                        <span className='text-xs tracking-wider uppercase'>
                            Swipe to explore
                        </span>
                    </div>
                )}
            </div>

            {/* Pagination Dots - Mobile */}
            <div className='mt-4 flex justify-center gap-2 md:hidden'>
                {Array.from({ length: count }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollToIndex(index)}
                        className={cn(
                            'h-2 rounded-full transition-all duration-300',
                            activeIndex === index
                                ? 'bg-gold-500 w-6'
                                : 'w-2 bg-white/30 hover:bg-white/50'
                        )}
                        aria-label={`Go to procedure ${index + 1}`}
                    />
                ))}
            </div>

            {/* View All Link - Mobile */}
            <ContentWrapper size='lg' paddingX='px-6'>
                <div className='mt-8 text-center md:hidden'>
                    <Link
                        href='/procedures'
                        className='hover:text-gold-400 hover:border-gold-400 inline-flex items-center gap-2 border-b border-stone-600 pb-2 text-sm tracking-widest uppercase transition-all'
                    >
                        View All Procedures <ArrowRight className='h-4 w-4' />
                    </Link>
                </div>
            </ContentWrapper>
        </SectionContainer>
    )
}
