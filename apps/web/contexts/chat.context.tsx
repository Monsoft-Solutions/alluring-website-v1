/**
 * Chat Context
 *
 * Global state management for chat sessions and messages.
 * Provides real-time synchronization between floating widget and embedded chat sections.
 *
 * @module contexts/chat
 */
'use client'

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react'
import { useChatSession } from '@/hooks/useChatSession.hook'

/**
 * Chat configuration from server
 */
export type ChatConfig = {
    agentName: string
    welcomeMessage: string
    primaryColor: string
    agentImageUrl?: string | null
}

/**
 * Session data
 */
export type SessionData = {
    id: string
    isAnonymous: boolean
    fullName?: string
    config: ChatConfig
}

/**
 * Stored message format
 */
export type StoredMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
    createdAt: string
}

/**
 * Contact information for upgrading anonymous sessions
 */
export type ContactInfo = {
    fullName: string
    phone: string
    email?: string
}

/**
 * Chat context value
 */
type ChatContextValue = {
    /** Current session data */
    session: SessionData | null
    /** Messages from session */
    messages: StoredMessage[]
    /** Whether session is being created or restored */
    isInitializing: boolean
    /** Whether the session is ready for chatting */
    isReady: boolean
    /** Error message if any */
    error: string | null
    /** Initialize session (creates or restores) */
    initializeSession: () => Promise<string | null>
    /** Add a message to the shared state */
    addMessage: (message: StoredMessage) => void
    /** Update session with contact information */
    updateContactInfo: (data: ContactInfo) => Promise<boolean>
    /** Reset session (clear cookie and create new) */
    resetSession: () => void
}

const ChatContext = createContext<ChatContextValue | null>(null)

/**
 * Chat Context Provider Props
 */
type ChatContextProviderProps = {
    children: ReactNode
}

/**
 * Chat Context Provider
 *
 * Manages chat session state globally across the application.
 * Automatically restores session on mount if cookie exists.
 *
 * Features:
 * - Single source of truth for session and messages
 * - Cookie-based session persistence
 * - Automatic session restoration
 * - Real-time message synchronization
 *
 * @example
 * ```tsx
 * <ChatContextProvider>
 *   <App />
 * </ChatContextProvider>
 * ```
 */
export function ChatContextProvider({ children }: ChatContextProviderProps) {
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
                        typeof window !== 'undefined'
                            ? window.location.href
                            : undefined,
                    referrer:
                        typeof document !== 'undefined'
                            ? document.referrer
                            : undefined,
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
    }, [session, getStoredSession, saveSession, clearSession, renewSession])

    /**
     * Add a message to the shared state
     * This keeps messages in sync across all chat components
     */
    const addMessage = useCallback((message: StoredMessage) => {
        setMessages((prev) => {
            // Avoid duplicates by checking message ID
            if (prev.some((m) => m.id === message.id)) {
                return prev
            }
            return [...prev, message]
        })
    }, [])

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

    // Auto-initialize session on mount if cookie exists
    useEffect(() => {
        const stored = getStoredSession()
        if (stored && !session && !isInitializing) {
            initializeSession()
        }
    }, [initializeSession, session, isInitializing, getStoredSession]) // Only run once on mount

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    const value: ChatContextValue = {
        session,
        messages,
        isInitializing,
        isReady: !!session && !isInitializing,
        error,
        initializeSession,
        addMessage,
        updateContactInfo,
        resetSession,
    }

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

/**
 * Hook to access chat context
 *
 * @throws Error if used outside of ChatContextProvider
 *
 * @example
 * ```tsx
 * const { session, messages, initializeSession } = useChatContext()
 * ```
 */
export function useChatContext() {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error(
            'useChatContext must be used within ChatContextProvider'
        )
    }
    return context
}
