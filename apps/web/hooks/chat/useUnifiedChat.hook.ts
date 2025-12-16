/**
 * Unified Chat Hook
 *
 * Single hook for managing chat sessions across all contexts (floating widget, embedded sections).
 * Always creates anonymous sessions that can be upgraded with contact info via AI-driven conversation.
 *
 * @module hooks/chat/useUnifiedChat
 */
'use client'

import { useState, useCallback, useEffect } from 'react'
import { useChatSession } from '../useChatSession.hook'

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
 * Session data
 */
type SessionData = {
    id: string
    isAnonymous: boolean
    fullName?: string
    config: ChatConfig
}

/**
 * Stored message format
 */
type StoredMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
    createdAt: string
}

/**
 * Contact information for upgrading anonymous sessions
 */
type ContactInfo = {
    fullName: string
    phone: string
    email?: string
}

/**
 * Options for useUnifiedChat hook
 */
type UseUnifiedChatOptions = {
    /** Page URL for session metadata */
    pageUrl?: string
    /** Referrer for session metadata */
    referrer?: string
    /** Callback when session is created */
    onSessionCreated?: (sessionId: string) => void
}

/**
 * Return type for useUnifiedChat hook
 */
type UseUnifiedChatReturn = {
    /** Current session data */
    session: SessionData | null
    /** Messages from restored session */
    messages: StoredMessage[]
    /** Whether session is being created or restored */
    isInitializing: boolean
    /** Whether the session is ready for chatting */
    isReady: boolean
    /** Error message if any */
    error: string | null
    /** Initialize session (creates or restores) */
    initializeSession: () => Promise<string | null>
    /** Update session with contact information */
    updateContactInfo: (data: ContactInfo) => Promise<boolean>
    /** Reset session (clear cookie and create new) */
    resetSession: () => void
}

/**
 * Unified hook for managing chat sessions
 *
 * Features:
 * - Always creates anonymous sessions (no pre-chat form)
 * - Persists sessionId in cookie for cross-page continuity
 * - Restores message history when session exists
 * - Supports upgrading anonymous sessions with contact info
 *
 * @example
 * ```tsx
 * const {
 *   session,
 *   messages,
 *   isReady,
 *   initializeSession,
 *   updateContactInfo,
 * } = useUnifiedChat({
 *   pageUrl: window.location.href,
 * })
 *
 * // Initialize on mount or first interaction
 * useEffect(() => {
 *   initializeSession()
 * }, [])
 * ```
 */
export function useUnifiedChat(
    options: UseUnifiedChatOptions = {}
): UseUnifiedChatReturn {
    const { pageUrl, referrer, onSessionCreated } = options

    const [session, setSession] = useState<SessionData | null>(null)
    const [messages, setMessages] = useState<StoredMessage[]>([])
    const [isInitializing, setIsInitializing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { getStoredSession, saveSession, clearSession, renewSession } =
        useChatSession()

    /**
     * Initialize session: restore existing or create new anonymous session
     */
    const initializeSession = useCallback(async (): Promise<string | null> => {
        // Don't re-initialize if already have a session
        if (session) {
            return session.id
        }

        setIsInitializing(true)
        setError(null)

        try {
            // Try to restore existing session from cookie
            const stored = getStoredSession()

            if (stored) {
                // Validate session with server and get messages
                const response = await fetch(
                    `/api/chat/session/${stored.sessionId}`
                )

                if (response.ok) {
                    const data = await response.json()

                    if (data.success) {
                        // Renew cookie expiry on successful restore
                        renewSession()

                        // Set session with restored messages
                        setSession({
                            id: data.session.id,
                            isAnonymous: data.session.isAnonymous,
                            fullName: data.session.fullName,
                            config: data.config,
                        })
                        setMessages(data.messages || [])

                        return data.session.id
                    }
                }

                // If restore failed, clear invalid cookie
                clearSession()
            }

            // No valid session - create new anonymous session
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

            const newSession: SessionData = {
                id: result.session.id,
                isAnonymous: true,
                config: result.config,
            }

            // Save session ID to cookie
            saveSession(newSession.id)

            setSession(newSession)
            setMessages([])
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
            setIsInitializing(false)
        }
    }, [
        session,
        pageUrl,
        referrer,
        getStoredSession,
        saveSession,
        clearSession,
        renewSession,
        onSessionCreated,
    ])

    /**
     * Update session with contact information (upgrade from anonymous)
     */
    const updateContactInfo = useCallback(
        async (data: ContactInfo): Promise<boolean> => {
            if (!session) {
                setError('No active session to update')
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
                    throw new Error(result.error || 'Failed to update session')
                }

                // Update local session state
                setSession((prev) =>
                    prev
                        ? {
                              ...prev,
                              isAnonymous: false,
                              fullName: data.fullName,
                          }
                        : null
                )

                return true
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to save contact information. Please try again.'
                setError(errorMessage)
                return false
            }
        },
        [session]
    )

    /**
     * Reset session (clear cookie and state)
     */
    const resetSession = useCallback(() => {
        clearSession()
        setSession(null)
        setMessages([])
        setError(null)
    }, [clearSession])

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    return {
        session,
        messages,
        isInitializing,
        isReady: !!session && !isInitializing,
        error,
        initializeSession,
        updateContactInfo,
        resetSession,
    }
}
