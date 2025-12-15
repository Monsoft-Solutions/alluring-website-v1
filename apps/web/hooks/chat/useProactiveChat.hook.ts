/**
 * Proactive Chat Hook
 *
 * Manages proactive chat engagement triggers including:
 * - Time-based button expansion
 * - Scroll-based tooltip display
 * - Session storage persistence
 * - Analytics event tracking
 *
 * @module hooks/chat/useProactiveChat
 */
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { PROACTIVE } from '@/lib/chat/constants'
import { trackEvent } from '@/lib/analytics/analytics.client'

type ProactiveChatState = {
    /** Whether tooltip should be shown */
    showTooltip: boolean
    /** Manually show the tooltip */
    showTooltipNow: () => void
    /** Dismiss the tooltip */
    dismissTooltip: () => void
}

/**
 * Hook to manage proactive chat engagement
 *
 * Features:
 * - Shows tooltip after scrolling past 50% of page
 * - Persists tooltip dismissal in sessionStorage
 * - Handles cleanup on unmount
 * - Tracks analytics events
 *
 * @returns Proactive chat state and controls
 */
export function useProactiveChat(): ProactiveChatState {
    const [showTooltip, setShowTooltip] = useState(false)
    const [tooltipDismissed, setTooltipDismissed] = useState(() => {
        // Check if tooltip was previously dismissed this session
        if (typeof window !== 'undefined') {
            return (
                sessionStorage.getItem(PROACTIVE.TOOLTIP_DISMISSED_KEY) ===
                'true'
            )
        }
        return false
    })
    const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const tooltipShownRef = useRef(false)

    /**
     * Scroll-based tooltip trigger
     * Shows tooltip when user scrolls past SCROLL_THRESHOLD
     */
    useEffect(() => {
        if (tooltipDismissed) {
            tooltipShownRef.current = false
            return
        }

        let scrollTimeout: NodeJS.Timeout | null = null

        const handleScroll = () => {
            // Clear existing timeout to debounce
            if (scrollTimeout) {
                clearTimeout(scrollTimeout)
            }

            scrollTimeout = setTimeout(() => {
                const scrollTop =
                    window.scrollY || document.documentElement.scrollTop
                const scrollHeight = document.documentElement.scrollHeight
                const clientHeight = document.documentElement.clientHeight

                // Calculate scroll percentage
                const scrollableHeight = scrollHeight - clientHeight
                const scrollPercentage =
                    scrollableHeight > 0 ? scrollTop / scrollableHeight : 0

                // Show tooltip if past threshold
                if (
                    scrollPercentage >= PROACTIVE.SCROLL_THRESHOLD &&
                    !tooltipShownRef.current
                ) {
                    tooltipShownRef.current = true
                    setShowTooltip(true)

                    // Track tooltip shown event
                    trackEvent('chat_tooltip_shown', {
                        event_category: 'engagement',
                        trigger: 'scroll_depth',
                        scroll_percentage: Math.round(scrollPercentage * 100),
                    })

                    // Clear any existing tooltip timeout
                    if (tooltipTimeoutRef.current) {
                        clearTimeout(tooltipTimeoutRef.current)
                    }

                    // Auto-hide after TOOLTIP_AUTO_HIDE_MS
                    tooltipTimeoutRef.current = setTimeout(() => {
                        setShowTooltip(false)
                    }, PROACTIVE.TOOLTIP_AUTO_HIDE_MS)
                }
            }, 100) // Debounce delay
        }

        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (scrollTimeout) {
                clearTimeout(scrollTimeout)
            }
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current)
            }
        }
    }, [tooltipDismissed])

    /**
     * Manually show tooltip
     */
    const showTooltipNow = useCallback(() => {
        if (!tooltipDismissed) {
            setShowTooltip(true)
        }
    }, [tooltipDismissed])

    /**
     * Dismiss tooltip and persist in sessionStorage
     */
    const dismissTooltip = useCallback(() => {
        setShowTooltip(false)
        setTooltipDismissed(true)
        sessionStorage.setItem(PROACTIVE.TOOLTIP_DISMISSED_KEY, 'true')

        // Track tooltip dismissal
        trackEvent('chat_tooltip_dismissed', {
            event_category: 'engagement',
            action: 'manual_dismiss',
        })
    }, [])

    return {
        showTooltip,
        showTooltipNow,
        dismissTooltip,
    }
}
