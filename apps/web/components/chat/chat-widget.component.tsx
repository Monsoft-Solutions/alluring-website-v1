/**
 * Chat Widget Component
 *
 * Container component that manages the chat flow:
 * 1. Checks for existing session in cookies (Crisp-style persistence)
 * 2. Pre-chat form for lead capture (if no session)
 * 3. Chat interface with restored message history
 *
 * @module components/chat/chat-widget
 */
'use client'

import { useState, useCallback, useEffect } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { X, Loader2 } from 'lucide-react'

import { PreChatForm } from './pre-chat-form.component'
import { ChatInterface } from './chat-interface.component'
import { useChatSession } from '@/hooks/useChatSession.hook'
import type { PreChatFormInput } from '@workspace/chat/types'

type ChatConfig = {
    agentName: string
    welcomeMessage: string
    primaryColor: string
}

type StoredMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
    createdAt: string
}

type SessionData = {
    id: string
    fullName: string
    config: ChatConfig
    messages?: StoredMessage[]
}

type ChatWidgetProps = {
    isOpen: boolean
    onClose: () => void
    initialConfig?: Partial<ChatConfig>
}

export function ChatWidget({
    isOpen,
    onClose,
    initialConfig,
}: ChatWidgetProps) {
    const [session, setSession] = useState<SessionData | null>(null)
    const [isRestoringSession, setIsRestoringSession] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { getStoredSession, saveSession, clearSession, renewSession } =
        useChatSession()

    /**
     * Attempt to restore session from cookie on mount
     */
    useEffect(() => {
        async function restoreSession() {
            const stored = getStoredSession()

            if (!stored) {
                setIsRestoringSession(false)
                return
            }

            try {
                // Validate session with server and get messages
                const response = await fetch(
                    `/api/chat/session/${stored.sessionId}`
                )

                if (!response.ok) {
                    // Session invalid/expired, clear cookie
                    clearSession()
                    setIsRestoringSession(false)
                    return
                }

                const data = await response.json()

                if (data.success) {
                    // Renew cookie expiry on successful restore
                    renewSession()

                    // Set session with restored messages
                    setSession({
                        id: data.session.id,
                        fullName: data.session.fullName,
                        config: data.config,
                        messages: data.messages,
                    })
                } else {
                    // Invalid session, clear cookie
                    clearSession()
                }
            } catch (err) {
                console.error('Failed to restore session:', err)
                clearSession()
            } finally {
                setIsRestoringSession(false)
            }
        }

        if (isOpen) {
            restoreSession()
        }
    }, [isOpen, getStoredSession, clearSession, renewSession])

    const handlePreChatSubmit = useCallback(
        async (data: PreChatFormInput) => {
            setError(null)

            try {
                const response = await fetch('/api/chat/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...data,
                        pageUrl: window.location.href,
                        referrer: document.referrer,
                        // Get UTM params from URL
                        utmSource:
                            new URLSearchParams(window.location.search).get(
                                'utm_source'
                            ) ?? undefined,
                        utmMedium:
                            new URLSearchParams(window.location.search).get(
                                'utm_medium'
                            ) ?? undefined,
                        utmCampaign:
                            new URLSearchParams(window.location.search).get(
                                'utm_campaign'
                            ) ?? undefined,
                    }),
                })

                const result = await response.json()

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Failed to start chat')
                }

                // Save session to cookie for persistence
                saveSession({
                    sessionId: result.session.id,
                    fullName: result.session.fullName,
                })

                setSession({
                    id: result.session.id,
                    fullName: result.session.fullName,
                    config: result.config,
                    messages: [], // New session, no messages yet
                })
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to start chat. Please try again.'
                )
            }
        },
        [saveSession]
    )

    const handleReset = useCallback(() => {
        // Clear cookie and session
        clearSession()
        setSession(null)
        setError(null)
    }, [clearSession])

    const handleClose = useCallback(() => {
        onClose()
        // Don't clear session on close - that's the whole point!
    }, [onClose])

    if (!isOpen) return null

    return (
        <div
            className={cn(
                'fixed z-60 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl',
                'transition-all duration-300 ease-out',
                // Mobile: full screen with some padding
                'inset-4 sm:inset-auto',
                // Desktop: fixed size in corner
                'sm:right-6 sm:bottom-24 sm:h-[600px] sm:w-[400px]'
            )}
            role='dialog'
            aria-label='Chat widget'
        >
            {/* Close button */}
            <button
                onClick={handleClose}
                className='absolute top-3 right-3 z-10 rounded-full bg-white/80 p-1.5 text-stone-500 shadow-sm backdrop-blur transition-colors hover:bg-stone-100 hover:text-stone-700'
                aria-label='Close chat'
            >
                <X className='h-4 w-4' />
            </button>

            {/* Loading state while restoring session */}
            {isRestoringSession && (
                <div className='flex h-full flex-col items-center justify-center gap-3'>
                    <Loader2 className='h-8 w-8 animate-spin text-stone-400' />
                    <p className='text-sm text-stone-500'>
                        Loading your conversation...
                    </p>
                </div>
            )}

            {/* Error message */}
            {!isRestoringSession && error && (
                <div className='bg-red-50 px-4 py-2 text-sm text-red-600'>
                    {error}
                </div>
            )}

            {/* Content */}
            {!isRestoringSession && (
                <>
                    {session ? (
                        <ChatInterface
                            sessionId={session.id}
                            agentName={session.config.agentName}
                            welcomeMessage={session.config.welcomeMessage}
                            userName={session.fullName.split(' ')[0] || 'there'}
                            initialMessages={session.messages}
                            onReset={handleReset}
                        />
                    ) : (
                        <PreChatForm
                            onSubmit={handlePreChatSubmit}
                            agentName={initialConfig?.agentName}
                            welcomeMessage={initialConfig?.welcomeMessage}
                        />
                    )}
                </>
            )}
        </div>
    )
}
