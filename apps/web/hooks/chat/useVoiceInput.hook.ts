/**
 * Voice Input Hook
 *
 * Provides voice-to-text functionality using ElevenLabs Realtime STT.
 * Follows official documentation patterns for VAD (Voice Activity Detection)
 * with automatic commit on silence.
 *
 * @see https://elevenlabs.io/docs/developers/guides/cookbooks/speech-to-text/streaming
 * @module hooks/chat/useVoiceInput
 */
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CommitStrategy, useScribe } from '@elevenlabs/react'

/**
 * Configuration options for voice input
 */
type UseVoiceInputOptions = {
    /** Callback for partial/live transcript updates (replaces input as user speaks) */
    onPartialTranscript: (text: string) => void
    /** Callback when VAD commits a transcript segment */
    onCommittedTranscript: (text: string) => void
    /** Callback when recording session ends */
    onSessionEnd?: () => void
    /** Maximum recording duration in seconds (default: 60) */
    maxDuration?: number
    /** Language code for transcription (default: 'en') */
    languageCode?: string
}

/**
 * Voice input error types with user-friendly messages
 */
const ERROR_MESSAGES = {
    NotAllowedError:
        'Microphone permission denied. Please allow microphone access.',
    NotFoundError: 'No microphone found. Please connect a microphone.',
    network: 'Connection lost. Please check your internet connection.',
    quota_exceeded: 'Voice input limit reached. Please try again later.',
    auth_error: 'Voice input authentication failed. Please try again.',
    rate_limited: 'Too many requests. Please wait a moment.',
    default: 'Voice input unavailable. Please type your message.',
} as const

/**
 * Voice input state returned by the hook
 */
type UseVoiceInputReturn = {
    /** Whether currently recording */
    isRecording: boolean
    /** Whether connecting to STT service */
    isConnecting: boolean
    /** Error message, if any */
    error: string | null
    /** Start voice recording */
    startRecording: () => Promise<void>
    /** Stop voice recording and commit transcript */
    stopRecording: () => void
    /** Remaining recording time in seconds (null when not recording) */
    remainingTime: number | null
    /** Clear any existing error */
    clearError: () => void
}

/**
 * Custom hook for voice input with ElevenLabs STT
 *
 * Features:
 * - Real-time partial transcript updates via onPartialTranscript
 * - VAD-based auto-commit when user stops speaking
 * - Maximum duration timeout with countdown
 * - Error handling with user-friendly messages
 *
 * @example
 * ```tsx
 * const {
 *   isRecording,
 *   isConnecting,
 *   startRecording,
 *   stopRecording,
 *   remainingTime,
 *   error,
 * } = useVoiceInput({
 *   onPartialTranscript: (text) => setPartialText(text),
 *   onCommittedTranscript: (text) => appendToInput(text),
 * })
 * ```
 */
export function useVoiceInput({
    onPartialTranscript,
    onCommittedTranscript,
    onSessionEnd,
    maxDuration = 60,
    _languageCode = 'en',
}: UseVoiceInputOptions): UseVoiceInputReturn {
    // State
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [remainingTime, setRemainingTime] = useState<number | null>(null)

    // Refs for timers
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const countdownRef = useRef<NodeJS.Timeout | null>(null)

    /**
     * Clear all timers
     */
    const clearTimers = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        if (countdownRef.current) {
            clearInterval(countdownRef.current)
            countdownRef.current = null
        }
    }, [])

    // ElevenLabs Scribe hook with VAD configuration
    const { status, connect, disconnect, commit, clearTranscripts } = useScribe(
        {
            modelId: 'scribe_v2_realtime',
            onSessionStarted: () => {
                console.log('[VoiceInput] Session started')
            },
            onConnect: () => {
                console.log('[VoiceInput] Connected')
                setIsConnecting(false)
            },
            onDisconnect: () => {
                console.log('[VoiceInput] Disconnected')
                clearTimers()
                setRemainingTime(null)
                setIsConnecting(false)
                onSessionEnd?.()
            },
            onPartialTranscript: ({ text }) => {
                onPartialTranscript(text)
            },
            onCommittedTranscript: ({ text }) => {
                if (text.trim()) {
                    console.log('[VoiceInput] Committed:', text.trim())
                    onCommittedTranscript(text.trim())
                }
            },
            onError: (err) => {
                console.error('[VoiceInput] Error:', err)
                setError(ERROR_MESSAGES.default)
            },
            onAuthError: ({ error }) => {
                console.error('[VoiceInput] Auth error:', error)
                setError(ERROR_MESSAGES.auth_error)
            },
            onQuotaExceededError: ({ error }) => {
                console.error('[VoiceInput] Quota exceeded:', error)
                setError(ERROR_MESSAGES.quota_exceeded)
            },
            onRateLimitedError: ({ error }) => {
                console.error('[VoiceInput] Rate limited:', error)
                setError(ERROR_MESSAGES.rate_limited)
            },
            onInsufficientAudioActivityError: ({ error }) => {
                console.error('[VoiceInput] Insufficient audio:', error)
                setError(
                    'No audio detected. Please speak louder or check your microphone.'
                )
            },
            onTranscriberError: ({ error }) => {
                console.error('[VoiceInput] Transcriber error:', error)
                setError(ERROR_MESSAGES.default)
            },
            onInputError: ({ error }) => {
                console.error('[VoiceInput] Input error:', error)
                setError(
                    'Microphone input error. Please check your microphone settings.'
                )
            },
        }
    )

    // Derived state
    const isRecording = status === 'connected' || status === 'transcribing'

    /**
     * Fetch token from API endpoint
     */
    const fetchToken = useCallback(async (): Promise<string | null> => {
        try {
            const response = await fetch('/api/stt/token', { method: 'POST' })

            if (!response.ok) {
                if (response.status === 503) {
                    // Voice input not configured
                    return null
                }
                throw new Error(`Token fetch failed: ${response.status}`)
            }

            const data = await response.json()
            return data.token
        } catch (err) {
            console.error('[VoiceInput] Token fetch error:', err)
            return null
        }
    }, [])

    /**
     * Stop recording and disconnect
     */
    const stopRecordingInternal = useCallback(() => {
        console.log('[VoiceInput] Stopping...')
        clearTimers()
        setRemainingTime(null)

        // Commit any pending audio before disconnect
        try {
            commit()
        } catch {
            // Ignore commit errors
        }

        // Allow time for final commit to process
        setTimeout(() => {
            disconnect()
        }, 300)
    }, [clearTimers, commit, disconnect])

    /**
     * Start recording with VAD-based auto-commit
     */
    const startRecording = useCallback(async () => {
        setError(null)
        setIsConnecting(true)
        clearTranscripts()

        try {
            const token = await fetchToken()
            if (!token) {
                setError(ERROR_MESSAGES.default)
                setIsConnecting(false)
                return
            }

            console.log('[VoiceInput] Starting recording with VAD...')

            // Connect with VAD configuration per ElevenLabs docs
            await connect({
                token,
                microphone: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                // VAD strategy: auto-commit when silence detected
                commitStrategy: CommitStrategy.VAD,
                // Commit after 1 second of silence
                vadSilenceThresholdSecs: 1.0,
                // Voice detection sensitivity (0-1, lower = more sensitive)
                vadThreshold: 0.5,
                // Minimum speech duration to consider valid
                minSpeechDurationMs: 250,
                // Minimum silence before committing
                minSilenceDurationMs: 300,
            })

            // Start countdown timer
            setRemainingTime(maxDuration)
            countdownRef.current = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev === null || prev <= 1) return null
                    return prev - 1
                })
            }, 1000)

            // Max duration timeout
            timeoutRef.current = setTimeout(() => {
                console.log('[VoiceInput] Max duration reached')
                stopRecordingInternal()
            }, maxDuration * 1000)
        } catch (err) {
            console.error('[VoiceInput] Start error:', err)
            setIsConnecting(false)

            if (err instanceof Error) {
                if (
                    err.name === 'NotAllowedError' ||
                    err.message.includes('Permission')
                ) {
                    setError(ERROR_MESSAGES.NotAllowedError)
                } else if (
                    err.name === 'NotFoundError' ||
                    err.message.includes('device')
                ) {
                    setError(ERROR_MESSAGES.NotFoundError)
                } else {
                    setError(ERROR_MESSAGES.default)
                }
            } else {
                setError(ERROR_MESSAGES.default)
            }
        }
    }, [
        fetchToken,
        connect,
        maxDuration,
        clearTranscripts,
        stopRecordingInternal,
    ])

    /**
     * Public stop recording function
     */
    const stopRecording = useCallback(() => {
        stopRecordingInternal()
    }, [stopRecordingInternal])

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            clearTimers()
            disconnect()
        }
    }, [clearTimers, disconnect])

    return {
        isRecording,
        isConnecting,
        error,
        startRecording,
        stopRecording,
        remainingTime,
        clearError,
    }
}
