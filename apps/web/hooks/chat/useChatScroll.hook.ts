/**
 * Chat Scroll Hook
 *
 * Manages scroll position, auto-scroll behavior, and scroll-to-bottom button visibility
 * for chat interfaces with streaming messages.
 *
 * @module hooks/chat/useChatScroll
 */
'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

type UseChatScrollOptions = {
    /** Threshold in pixels from bottom to consider "at bottom" */
    bottomThreshold?: number
    /** Whether to enable smooth scrolling */
    smoothScroll?: boolean
}

type UseChatScrollReturn = {
    /** Ref for the scroll container element */
    scrollContainerRef: React.RefObject<HTMLDivElement | null>
    /** Ref for the messages end element (scroll target) */
    messagesEndRef: React.RefObject<HTMLDivElement | null>
    /** Whether the scroll-to-bottom button should be visible */
    showScrollButton: boolean
    /** Whether the user is currently at the bottom of the scroll container */
    isAtBottom: boolean
    /** Scroll to the bottom of the container */
    scrollToBottom: (behavior?: 'smooth' | 'auto') => void
    /** Handle scroll events (attach to onScroll) */
    handleScroll: () => void
    /** Force scroll to bottom on next render (for new messages) */
    forceScrollToBottom: () => void
}

/**
 * Custom hook for managing chat scroll behavior
 *
 * Features:
 * - Auto-scroll when at bottom and new messages arrive
 * - Show/hide scroll-to-bottom button based on position
 * - Smooth scrolling with configurable behavior
 * - Maintains scroll position when user scrolls up
 *
 * @example
 * ```tsx
 * const {
 *   scrollContainerRef,
 *   messagesEndRef,
 *   showScrollButton,
 *   scrollToBottom,
 *   handleScroll,
 * } = useChatScroll()
 *
 * return (
 *   <div ref={scrollContainerRef} onScroll={handleScroll}>
 *     {messages.map(...)}
 *     <div ref={messagesEndRef} />
 *   </div>
 * )
 * ```
 */
export function useChatScroll(
    options: UseChatScrollOptions = {}
): UseChatScrollReturn {
    const { bottomThreshold = 100, smoothScroll = true } = options

    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const isAtBottomRef = useRef(true)
    const shouldForceScrollRef = useRef(false)

    const [showScrollButton, setShowScrollButton] = useState(false)
    const [isAtBottom, setIsAtBottom] = useState(true)

    /**
     * Scroll to the bottom of the messages container
     */
    const scrollToBottom = useCallback(
        (behavior: 'smooth' | 'auto' = smoothScroll ? 'smooth' : 'auto') => {
            if (scrollContainerRef.current) {
                const { scrollHeight, clientHeight } =
                    scrollContainerRef.current
                scrollContainerRef.current.scrollTo({
                    top: scrollHeight - clientHeight,
                    behavior,
                })
            }
        },
        [smoothScroll]
    )

    /**
     * Handle scroll events to track position and button visibility
     */
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return

        const { scrollTop, scrollHeight, clientHeight } =
            scrollContainerRef.current
        const distanceToBottom = scrollHeight - scrollTop - clientHeight
        const atBottom = distanceToBottom < bottomThreshold

        // Update refs and state
        isAtBottomRef.current = atBottom
        setIsAtBottom(atBottom)
        setShowScrollButton(!atBottom)
    }, [bottomThreshold])

    /**
     * Force scroll to bottom on next effect run
     */
    const forceScrollToBottom = useCallback(() => {
        shouldForceScrollRef.current = true
        isAtBottomRef.current = true
    }, [])

    // Handle forced scroll
    useEffect(() => {
        if (shouldForceScrollRef.current) {
            scrollToBottom('smooth')
            shouldForceScrollRef.current = false
        }
    }, [scrollToBottom])

    return {
        scrollContainerRef,
        messagesEndRef,
        showScrollButton,
        isAtBottom,
        scrollToBottom,
        handleScroll,
        forceScrollToBottom,
    }
}
