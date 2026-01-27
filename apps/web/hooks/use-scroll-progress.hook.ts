'use client'

import { useCallback, useEffect, useState, type RefObject } from 'react'

type ScrollProgressResult = {
    /** Current scroll progress as percentage (0-100) */
    scrollProgress: number
    /** Current active card index (0-based) */
    activeIndex: number
    /** Total number of cards */
    totalCards: number
    /** Whether the scroll container can scroll left */
    canScrollLeft: boolean
    /** Whether the scroll container can scroll right */
    canScrollRight: boolean
    /** Scroll to a specific card by index */
    scrollToIndex: (index: number) => void
    /** Scroll to the previous card */
    scrollPrev: () => void
    /** Scroll to the next card */
    scrollNext: () => void
}

/**
 * Hook for tracking horizontal scroll progress
 *
 * Provides scroll position tracking, active index calculation,
 * and programmatic scroll methods for carousels.
 *
 * @param containerRef - Ref to the scrollable container
 * @param cardCount - Number of cards in the carousel
 * @returns Scroll progress state and navigation methods
 */
export function useScrollProgress(
    containerRef: RefObject<HTMLDivElement | null>,
    cardCount: number
): ScrollProgressResult {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [activeIndex, setActiveIndex] = useState(0)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    // Calculate scroll state
    const updateScrollState = useCallback(() => {
        const container = containerRef.current
        if (!container || cardCount === 0) return

        const { scrollLeft, scrollWidth, clientWidth } = container
        const maxScroll = scrollWidth - clientWidth

        // Calculate progress percentage
        const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0
        setScrollProgress(Math.min(100, Math.max(0, progress)))

        // Calculate active index based on scroll position
        // Each card takes up approximately (scrollWidth / cardCount) space
        const cardWidth = scrollWidth / cardCount
        const newIndex = Math.round(scrollLeft / cardWidth)
        setActiveIndex(Math.min(cardCount - 1, Math.max(0, newIndex)))

        // Update scroll ability flags
        setCanScrollLeft(scrollLeft > 10)
        setCanScrollRight(scrollLeft < maxScroll - 10)
    }, [containerRef, cardCount])

    // Scroll to specific index
    const scrollToIndex = useCallback(
        (index: number) => {
            const container = containerRef.current
            if (!container) return

            const cardWidth = container.scrollWidth / cardCount
            const targetScroll = cardWidth * index

            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth',
            })
        },
        [containerRef, cardCount]
    )

    // Scroll to previous card
    const scrollPrev = useCallback(() => {
        const container = containerRef.current
        if (!container) return

        // Get actual card width from first card element
        const firstCard = container.querySelector(':scope > *') as HTMLElement
        const cardWidth = firstCard?.offsetWidth ?? container.clientWidth * 0.85
        const gap = 24 // gap-6 = 24px

        container.scrollBy({
            left: -(cardWidth + gap),
            behavior: 'smooth',
        })
    }, [containerRef])

    // Scroll to next card
    const scrollNext = useCallback(() => {
        const container = containerRef.current
        if (!container) return

        // Get actual card width from first card element
        const firstCard = container.querySelector(':scope > *') as HTMLElement
        const cardWidth = firstCard?.offsetWidth ?? container.clientWidth * 0.85
        const gap = 24 // gap-6 = 24px

        container.scrollBy({
            left: cardWidth + gap,
            behavior: 'smooth',
        })
    }, [containerRef])

    // Set up scroll listener
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Defer initial update to avoid cascading renders
        queueMicrotask(() => {
            updateScrollState()
        })

        // Listen for scroll events
        container.addEventListener('scroll', updateScrollState, {
            passive: true,
        })

        // Also listen for resize events
        const resizeObserver = new ResizeObserver(updateScrollState)
        resizeObserver.observe(container)

        return () => {
            container.removeEventListener('scroll', updateScrollState)
            resizeObserver.disconnect()
        }
    }, [containerRef, updateScrollState])

    return {
        scrollProgress,
        activeIndex,
        totalCards: cardCount,
        canScrollLeft,
        canScrollRight,
        scrollToIndex,
        scrollPrev,
        scrollNext,
    }
}
