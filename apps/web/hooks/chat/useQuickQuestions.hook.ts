/**
 * Quick Questions Hook
 *
 * Fetches AI-generated contextual quick questions with proper cleanup
 * using AbortController instead of setInterval for better reliability.
 *
 * @module hooks/chat/useQuickQuestions
 */
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/** Configuration for polling behavior */
const POLL_INTERVAL_MS = 500
const MAX_POLL_ATTEMPTS = 6

type UseQuickQuestionsOptions = {
    /** Chat session ID for API calls */
    sessionId: string
    /** Custom poll interval in milliseconds */
    pollIntervalMs?: number
    /** Maximum number of poll attempts */
    maxAttempts?: number
}

type UseQuickQuestionsReturn = {
    /** Array of dynamic question strings */
    questions: string[]
    /** Whether questions are currently being fetched */
    isLoading: boolean
    /** Start fetching questions (call after assistant response completes) */
    startFetching: () => void
    /** Clear questions (call when user sends a message) */
    clearQuestions: () => void
    /** Cancel any ongoing fetch operations */
    cancel: () => void
}

/**
 * Custom hook for fetching AI-generated quick questions
 *
 * Uses recursive setTimeout with AbortController instead of setInterval
 * for better cleanup and control.
 *
 * @example
 * ```tsx
 * const { questions, isLoading, startFetching, clearQuestions } = useQuickQuestions({
 *   sessionId: 'abc123',
 * })
 *
 * // After streaming completes
 * useEffect(() => {
 *   if (!isStreaming && lastMessageIsAssistant) {
 *     startFetching()
 *   }
 * }, [isStreaming])
 *
 * // When user sends message
 * const handleSend = () => {
 *   clearQuestions()
 *   sendMessage(...)
 * }
 * ```
 */
export function useQuickQuestions(
    options: UseQuickQuestionsOptions
): UseQuickQuestionsReturn {
    const {
        sessionId,
        pollIntervalMs = POLL_INTERVAL_MS,
        maxAttempts = MAX_POLL_ATTEMPTS,
    } = options

    const [questions, setQuestions] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const abortControllerRef = useRef<AbortController | null>(null)
    const attemptCountRef = useRef(0)
    const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isMountedRef = useRef(true)

    /**
     * Cancel any ongoing operations
     */
    const cancel = useCallback(() => {
        // Abort fetch
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }

        // Clear timeout
        if (timeoutIdRef.current) {
            clearTimeout(timeoutIdRef.current)
            timeoutIdRef.current = null
        }

        // Reset state
        attemptCountRef.current = 0
        if (isMountedRef.current) {
            setIsLoading(false)
        }
    }, [])

    /**
     * Clear questions and cancel operations
     */
    const clearQuestions = useCallback(() => {
        cancel()
        if (isMountedRef.current) {
            setQuestions([])
        }
    }, [cancel])

    /**
     * Fetch questions from the API
     */
    const fetchQuestions = useCallback(async (): Promise<boolean> => {
        // Create new AbortController for this request
        abortControllerRef.current = new AbortController()

        try {
            const response = await fetch(
                `/api/chat/session/${sessionId}/quick-questions`,
                {
                    signal: abortControllerRef.current.signal,
                }
            )

            if (!response.ok) {
                return false
            }

            const data = await response.json()

            if (
                data.success &&
                Array.isArray(data.questions) &&
                data.questions.length > 0
            ) {
                if (isMountedRef.current) {
                    setQuestions(data.questions)
                    setIsLoading(false)
                }
                return true
            }

            return false
        } catch (error) {
            // Ignore abort errors
            if (error instanceof Error && error.name === 'AbortError') {
                return false
            }
            console.error('Failed to fetch quick questions:', error)
            return false
        }
    }, [sessionId])

    /**
     * Poll for questions with recursive setTimeout
     */
    const pollForQuestions = useCallback(async () => {
        if (!isMountedRef.current) return

        attemptCountRef.current += 1
        const success = await fetchQuestions()

        // Stop if successful or max attempts reached
        if (success || attemptCountRef.current >= maxAttempts) {
            if (isMountedRef.current) {
                setIsLoading(false)
            }
            return
        }

        // Schedule next attempt
        if (isMountedRef.current) {
            timeoutIdRef.current = setTimeout(pollForQuestions, pollIntervalMs)
        }
    }, [fetchQuestions, maxAttempts, pollIntervalMs])

    /**
     * Start fetching questions
     */
    const startFetching = useCallback(() => {
        // Cancel any existing operations
        cancel()

        // Reset state
        setQuestions([])
        setIsLoading(true)
        attemptCountRef.current = 0

        // Start polling
        void pollForQuestions()
    }, [cancel, pollForQuestions])

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true

        return () => {
            isMountedRef.current = false
            cancel()
        }
    }, [cancel])

    return {
        questions,
        isLoading,
        startFetching,
        clearQuestions,
        cancel,
    }
}
