/**
 * Embedded Chat Hook
 *
 * Manages state for embedded chat sections that don't require
 * a pre-chat form. Creates anonymous sessions and handles
 * deferred lead capture.
 *
 * @module hooks/chat/useEmbeddedChat
 */
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Chat configuration from server
 */
type ChatConfig = {
    agentName: string
    welcomeMessage: string
    primaryColor: string
    agentImageUrl?: string | null
}

/**
 * Session data for embedded chat
 */
type EmbeddedSessionData = {
    id: string
    isAnonymous: boolean
    fullName?: string
    config: ChatConfig
}

/**
 * Lead capture data
 */
type LeadCaptureData = {
    fullName: string
    phone: string
    email?: string
}

/**
 * Keywords that trigger lead capture prompt
 */
const BOOKING_INTENT_KEYWORDS = [
    'book',
    'schedule',
    'appointment',
    'consultation',
    'call me',
    'call back',
    'contact me',
    'speak to someone',
    'talk to someone',
    'human',
    'real person',
]

/**
 * Number of user messages before prompting for lead capture
 */
const MESSAGE_COUNT_THRESHOLD = 3

/**
 * Options for useEmbeddedChat hook
 */
type UseEmbeddedChatOptions = {
    /** Page URL for session metadata */
    pageUrl?: string
    /** Referrer for session metadata */
    referrer?: string
    /** Callback when session is created */
    onSessionCreated?: (sessionId: string) => void
    /** Callback when lead capture should be shown */
    onLeadCaptureTriggered?: () => void
}

/**
 * Return type for useEmbeddedChat hook
 */
type UseEmbeddedChatReturn = {
    /** Current session data */
    session: EmbeddedSessionData | null
    /** Whether session is being created */
    isCreatingSession: boolean
    /** Whether the session is ready for chatting */
    isReady: boolean
    /** Error message if any */
    error: string | null
    /** User message count */
    userMessageCount: number
    /** Whether lead capture modal should be shown */
    showLeadCapture: boolean
    /** Whether the session has been upgraded */
    isUpgraded: boolean
    /** Initialize session (call before first message) */
    initializeSession: () => Promise<string | null>
    /** Track a user message (call after sending) */
    trackUserMessage: (message: string) => void
    /** Show lead capture modal */
    triggerLeadCapture: () => void
    /** Dismiss lead capture modal */
    dismissLeadCapture: () => void
    /** Upgrade session with contact info */
    upgradeSession: (data: LeadCaptureData) => Promise<boolean>
}

/**
 * Hook for managing embedded chat state
 *
 * Creates anonymous sessions on first interaction and handles
 * deferred lead capture based on message count or booking intent.
 *
 * @example
 * ```tsx
 * const {
 *   session,
 *   isReady,
 *   initializeSession,
 *   trackUserMessage,
 *   showLeadCapture,
 *   upgradeSession,
 * } = useEmbeddedChat({
 *   pageUrl: window.location.href,
 * })
 *
 * // Initialize before first message
 * const handleSendMessage = async (message: string) => {
 *   if (!session) {
 *     await initializeSession()
 *   }
 *   // Send message...
 *   trackUserMessage(message)
 * }
 * ```
 */
export function useEmbeddedChat(
    options: UseEmbeddedChatOptions = {}
): UseEmbeddedChatReturn {
    const { pageUrl, referrer, onSessionCreated, onLeadCaptureTriggered } =
        options

    const [session, setSession] = useState<EmbeddedSessionData | null>(null)
    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userMessageCount, setUserMessageCount] = useState(0)
    const [showLeadCapture, setShowLeadCapture] = useState(false)
    const [isUpgraded, setIsUpgraded] = useState(false)

    // Track if lead capture has been dismissed to avoid re-showing
    const leadCaptureDismissedRef = useRef(false)
    // Track if we've already triggered lead capture for this session
    const leadCaptureTriggeredRef = useRef(false)

    /**
     * Check if a message contains booking intent keywords
     */
    const hasBookingIntent = useCallback((message: string): boolean => {
        const lowerMessage = message.toLowerCase()
        return BOOKING_INTENT_KEYWORDS.some((keyword) =>
            lowerMessage.includes(keyword)
        )
    }, [])

    /**
     * Initialize an anonymous session
     */
    const initializeSession = useCallback(async (): Promise<string | null> => {
        if (session) {
            return session.id
        }

        setIsCreatingSession(true)
        setError(null)

        try {
            const response = await fetch('/api/chat/session/anonymous', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageUrl:
                        pageUrl ??
                        (typeof window !== 'undefined'
                            ? window.location.href
                            : undefined),
                    referrer:
                        referrer ??
                        (typeof document !== 'undefined'
                            ? document.referrer
                            : undefined),
                    utmSource:
                        typeof window !== 'undefined'
                            ? new URLSearchParams(window.location.search).get(
                                  'utm_source'
                              )
                            : undefined,
                    utmMedium:
                        typeof window !== 'undefined'
                            ? new URLSearchParams(window.location.search).get(
                                  'utm_medium'
                              )
                            : undefined,
                    utmCampaign:
                        typeof window !== 'undefined'
                            ? new URLSearchParams(window.location.search).get(
                                  'utm_campaign'
                              )
                            : undefined,
                }),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to create session')
            }

            const newSession: EmbeddedSessionData = {
                id: result.session.id,
                isAnonymous: true,
                config: result.config,
            }

            setSession(newSession)
            onSessionCreated?.(newSession.id)

            return newSession.id
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Failed to start chat. Please try again.'
            setError(errorMessage)
            return null
        } finally {
            setIsCreatingSession(false)
        }
    }, [session, pageUrl, referrer, onSessionCreated])

    /**
     * Track a user message and check for lead capture trigger
     */
    const trackUserMessage = useCallback(
        (message: string): void => {
            const newCount = userMessageCount + 1
            setUserMessageCount(newCount)

            // Skip if already upgraded or dismissed
            if (
                isUpgraded ||
                leadCaptureDismissedRef.current ||
                leadCaptureTriggeredRef.current
            ) {
                return
            }

            // Check for booking intent or message threshold
            const shouldTrigger =
                hasBookingIntent(message) || newCount >= MESSAGE_COUNT_THRESHOLD

            if (shouldTrigger) {
                leadCaptureTriggeredRef.current = true
                setShowLeadCapture(true)
                onLeadCaptureTriggered?.()
            }
        },
        [userMessageCount, isUpgraded, hasBookingIntent, onLeadCaptureTriggered]
    )

    /**
     * Manually trigger lead capture modal
     */
    const triggerLeadCapture = useCallback((): void => {
        if (!isUpgraded && !leadCaptureDismissedRef.current) {
            setShowLeadCapture(true)
            onLeadCaptureTriggered?.()
        }
    }, [isUpgraded, onLeadCaptureTriggered])

    /**
     * Dismiss lead capture modal
     */
    const dismissLeadCapture = useCallback((): void => {
        leadCaptureDismissedRef.current = true
        setShowLeadCapture(false)
    }, [])

    /**
     * Upgrade session with contact information
     */
    const upgradeSession = useCallback(
        async (data: LeadCaptureData): Promise<boolean> => {
            if (!session) {
                setError('No active session to upgrade')
                return false
            }

            try {
                const response = await fetch(
                    `/api/chat/session/${session.id}/upgrade`,
                    {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    }
                )

                const result = await response.json()

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to upgrade session')
                }

                setSession((prev) =>
                    prev
                        ? {
                              ...prev,
                              isAnonymous: false,
                              fullName: data.fullName,
                          }
                        : null
                )
                setIsUpgraded(true)
                setShowLeadCapture(false)

                return true
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to save your information. Please try again.'
                setError(errorMessage)
                return false
            }
        },
        [session]
    )

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    return {
        session,
        isCreatingSession,
        isReady: !!session && !isCreatingSession,
        error,
        userMessageCount,
        showLeadCapture,
        isUpgraded,
        initializeSession,
        trackUserMessage,
        triggerLeadCapture,
        dismissLeadCapture,
        upgradeSession,
    }
}
