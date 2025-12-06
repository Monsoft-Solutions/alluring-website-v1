/**
 * Auto-Resize Textarea Hook
 *
 * Provides automatic height adjustment for textareas based on content,
 * with configurable min/max heights.
 *
 * @module hooks/chat/useAutoResizeTextarea
 */
'use client'

import { useCallback, useRef, useEffect } from 'react'

type UseAutoResizeTextareaOptions = {
    /** Minimum height in pixels */
    minHeight?: number
    /** Maximum height in pixels */
    maxHeight?: number
}

type UseAutoResizeTextareaReturn = {
    /** Ref to attach to the textarea element */
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
    /** Resize the textarea based on current content */
    resize: () => void
    /** Reset textarea to minimum height */
    reset: () => void
}

/**
 * Custom hook for auto-resizing textarea elements
 *
 * Automatically adjusts textarea height based on content while
 * respecting min/max constraints.
 *
 * @example
 * ```tsx
 * const { textareaRef, resize, reset } = useAutoResizeTextarea({
 *   minHeight: 44,
 *   maxHeight: 128,
 * })
 *
 * return (
 *   <textarea
 *     ref={textareaRef}
 *     onChange={(e) => {
 *       setInput(e.target.value)
 *       resize()
 *     }}
 *   />
 * )
 * ```
 */
export function useAutoResizeTextarea(
    options: UseAutoResizeTextareaOptions = {}
): UseAutoResizeTextareaReturn {
    const { minHeight = 44, maxHeight = 128 } = options

    const textareaRef = useRef<HTMLTextAreaElement | null>(null)

    /**
     * Resize textarea to fit content
     */
    const resize = useCallback(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        // Reset to min height to get accurate scrollHeight
        textarea.style.height = 'auto'

        // Calculate new height within bounds
        const newHeight = Math.min(
            Math.max(textarea.scrollHeight, minHeight),
            maxHeight
        )

        textarea.style.height = `${newHeight}px`
    }, [minHeight, maxHeight])

    /**
     * Reset textarea to minimum height
     */
    const reset = useCallback(() => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = `${minHeight}px`
    }, [minHeight])

    // Initial resize on mount
    useEffect(() => {
        resize()
    }, [resize])

    return {
        textareaRef,
        resize,
        reset,
    }
}
