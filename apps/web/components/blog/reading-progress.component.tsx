/**
 * ReadingProgress Component
 *
 * A thin progress bar that appears at the top of the viewport
 * indicating how far the user has scrolled through the article content.
 *
 * Features:
 * - Gold-colored progress bar
 * - Fades in after scrolling past the hero
 * - Tracks scroll position relative to article content
 * - SSR-safe with client-side hydration
 *
 * @example
 * ```tsx
 * <ReadingProgress />
 * ```
 */
'use client'

import { useCallback, useEffect, useState } from 'react'

import { cn } from '@workspace/ui/lib/utils'

type ReadingProgressProps = {
    /**
     * ID of the content element to track (default: tracks document)
     */
    contentId?: string

    /**
     * Scroll offset before showing the progress bar (default: 200px)
     */
    showAfter?: number

    /**
     * Additional CSS classes
     */
    className?: string
}

export function ReadingProgress({
    showAfter = 200,
    className,
}: ReadingProgressProps) {
    const [progress, setProgress] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    const calculateProgress = useCallback(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight
        const winHeight = window.innerHeight
        const scrollableHeight = docHeight - winHeight

        if (scrollableHeight <= 0) {
            setProgress(0)
            return
        }

        const currentProgress = Math.min(
            (scrollTop / scrollableHeight) * 100,
            100
        )
        setProgress(currentProgress)
        setIsVisible(scrollTop > showAfter)
    }, [showAfter])

    useEffect(() => {
        // Calculate on mount
        calculateProgress()

        // Throttled scroll handler
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    calculateProgress()
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', calculateProgress, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', calculateProgress)
        }
    }, [calculateProgress])

    return (
        <div
            className={cn(
                'fixed top-0 right-0 left-0 z-50 h-1 bg-stone-200/50',
                'transition-opacity duration-300',
                isVisible ? 'opacity-100' : 'opacity-0',
                className
            )}
            role='progressbar'
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label='Reading progress'
        >
            <div
                className='bg-gold-500 h-full transition-[width] duration-75 ease-out'
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
