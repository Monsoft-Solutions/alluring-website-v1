'use client'

import { useEffect, useRef, useCallback } from 'react'

type PromotionViewTrackerProps = {
    /** The promotion ID to track */
    promotionId: string
    /** Minimum time (ms) the promotion must be visible before tracking (default: 1000ms) */
    minVisibleTime?: number
    /** Visibility threshold (0-1) required to trigger tracking (default: 0.5) */
    visibilityThreshold?: number
}

/**
 * Client-side component for tracking promotion views
 *
 * Uses Intersection Observer to detect when the promotion is visible to the user.
 * Only triggers the view increment after the promotion has been visible for a
 * minimum amount of time, preventing accidental or automated view inflation.
 *
 * This component renders nothing - it's purely for tracking logic.
 */
export function PromotionViewTracker({
    promotionId,
    minVisibleTime = 1000,
    visibilityThreshold = 0.5,
}: PromotionViewTrackerProps) {
    const hasTracked = useRef(false)
    const visibleStartTime = useRef<number | null>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const targetRef = useRef<HTMLDivElement | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const trackView = useCallback(async () => {
        if (hasTracked.current) return
        hasTracked.current = true

        try {
            // Fire and forget - don't block on response
            await fetch(`/api/promotions/${promotionId}/views`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Use keepalive to ensure request completes even if user navigates away
                keepalive: true,
            })
        } catch {
            // Silently fail - view tracking should never impact user experience
            // Reset flag to allow retry on next visibility
            hasTracked.current = false
        }
    }, [promotionId])

    useEffect(() => {
        // Don't run in non-browser environments
        if (
            typeof window === 'undefined' ||
            !('IntersectionObserver' in window)
        ) {
            return
        }

        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            const entry = entries[0]
            if (!entry) return

            if (entry.isIntersecting) {
                // Element became visible
                if (visibleStartTime.current === null) {
                    visibleStartTime.current = Date.now()

                    // Set timeout to track after minimum visible time
                    timeoutRef.current = setTimeout(() => {
                        if (
                            visibleStartTime.current !== null &&
                            !hasTracked.current
                        ) {
                            void trackView()
                        }
                    }, minVisibleTime)
                }
            } else {
                // Element is no longer visible
                visibleStartTime.current = null

                // Clear pending timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                    timeoutRef.current = null
                }
            }
        }

        observerRef.current = new IntersectionObserver(handleIntersection, {
            threshold: visibilityThreshold,
            // Use null to observe relative to viewport
            root: null,
        })

        // Create and observe a target element
        if (targetRef.current) {
            observerRef.current.observe(targetRef.current)
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [promotionId, minVisibleTime, visibilityThreshold, trackView])

    // Render a small invisible div that we can observe
    // This should be placed near the main content of the promotion
    return (
        <div
            ref={targetRef}
            aria-hidden='true'
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '1px',
                height: '1px',
                pointerEvents: 'none',
                opacity: 0,
            }}
        />
    )
}
