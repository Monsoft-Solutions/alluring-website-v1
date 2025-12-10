/**
 * AI Text Improvement Hook
 *
 * Custom hook for managing AI text improvement state and operations.
 * Handles streaming fetch, cancellation, and undo functionality.
 *
 * @module components/shared/ai-text-field/use-ai-text-improvement.hook
 */
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'sonner'

import type {
    TextOperation,
    AITextImprovementState,
} from './ai-text-field.type'

type UseAITextImprovementOptions = {
    /** Current field value */
    value: string
    /** Change handler to update the field */
    onChange: (value: string) => void
    /** Field name for AI context */
    fieldName: string
}

/**
 * Hook for AI text improvement functionality
 *
 * Manages streaming API calls, cancellation, and undo.
 *
 * @example
 * ```tsx
 * const ai = useAITextImprovement({
 *   value: formData.title,
 *   onChange: (v) => handleChange('title', v),
 *   fieldName: 'title',
 * })
 *
 * // Use in component
 * ai.handleOperation('improve')
 * ai.handleUndo()
 * ```
 */
export function useAITextImprovement(
    options: UseAITextImprovementOptions
): AITextImprovementState {
    const { value, onChange, fieldName } = options

    // State
    const [isOpen, setIsOpen] = useState(false)
    const [isStreaming, setIsStreaming] = useState(false)
    const [streamingText, setStreamingText] = useState('')
    const [previousValue, setPreviousValue] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Ref for abort controller
    const abortControllerRef = useRef<AbortController | null>(null)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort()
        }
    }, [])

    /**
     * Open the command menu
     */
    const openMenu = useCallback(() => {
        setIsOpen(true)
        setError(null)
    }, [])

    /**
     * Close the command menu
     */
    const closeMenu = useCallback(() => {
        setIsOpen(false)
        setError(null)
    }, [])

    /**
     * Cancel the current streaming operation
     */
    const handleCancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setIsStreaming(false)
        setStreamingText('')
    }, [])

    /**
     * Undo the last operation
     */
    const handleUndo = useCallback(() => {
        if (previousValue !== null) {
            onChange(previousValue)
            setPreviousValue(null)
            toast.success('Reverted to previous text')
        }
    }, [previousValue, onChange])

    /**
     * Execute an AI text improvement operation
     */
    const handleOperation = useCallback(
        async (operation: TextOperation, customInstruction?: string) => {
            // Validate input
            if (!value?.trim()) {
                toast.error('Please enter some text first')
                return
            }

            // Store current value for undo
            setPreviousValue(value)

            // Reset state
            setError(null)
            setStreamingText('')
            setIsStreaming(true)
            closeMenu()

            // Create abort controller
            abortControllerRef.current = new AbortController()

            try {
                const response = await fetch('/api/ai/improve-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: value,
                        operation,
                        fieldName,
                        customInstruction,
                    }),
                    signal: abortControllerRef.current.signal,
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to improve text')
                }

                // Handle streaming response
                const reader = response.body?.getReader()
                if (!reader) {
                    throw new Error('No response body')
                }

                const decoder = new TextDecoder()
                let accumulatedText = ''

                while (true) {
                    const { done, value: chunk } = await reader.read()
                    if (done) break

                    const text = decoder.decode(chunk, { stream: true })
                    accumulatedText += text
                    setStreamingText(accumulatedText)
                }

                // Update the field with final text
                onChange(accumulatedText)
                toast.success('Text improved successfully')
            } catch (err) {
                // Handle abort
                if (err instanceof Error && err.name === 'AbortError') {
                    // User cancelled - restore previous value
                    if (previousValue !== null) {
                        onChange(previousValue)
                    }
                    return
                }

                // Handle other errors
                const message =
                    err instanceof Error ? err.message : 'An error occurred'
                setError(message)
                toast.error(message)

                // Restore previous value on error
                if (previousValue !== null) {
                    onChange(previousValue)
                    setPreviousValue(null)
                }
            } finally {
                setIsStreaming(false)
                setStreamingText('')
                abortControllerRef.current = null
            }
        },
        [value, fieldName, onChange, closeMenu, previousValue]
    )

    return {
        isOpen,
        isStreaming,
        canUndo: previousValue !== null && !isStreaming,
        streamingText,
        error,
        openMenu,
        closeMenu,
        handleOperation,
        handleUndo,
        handleCancel,
    }
}
