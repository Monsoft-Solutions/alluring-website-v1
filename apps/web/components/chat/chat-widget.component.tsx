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
import { X, Loader2, MessageCircle } from 'lucide-react'

import { PreChatForm } from './pre-chat-form.component'
import { ChatInterface } from './chat-interface.component'
import { useChatSession } from '@/hooks/useChatSession.hook'
import { Z_INDEX, CSS_CLASSES } from '@/lib/chat/constants'
import type { PreChatFormInput } from '@workspace/chat/types'

type ChatConfig = {
    agentName: string
    welcomeMessage: string
    primaryColor: string
    agentImageUrl?: string | null
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

/**
 * Loading skeleton for session restore
 */
function LoadingSkeleton() {
    return (
        <div className='flex h-full flex-col items-center justify-center gap-4 p-8'>
            {/* Animated logo */}
            <div
                className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full',
                    'from-gold-100 to-gold-50 bg-linear-to-br',
                    'ring-gold-200/60 ring-2',
                    'shadow-gold-500/10 shadow-lg',
                    'animate-pulse'
                )}
            >
                <MessageCircle className='text-gold-600 h-7 w-7' />
            </div>

            {/* Loading text */}
            <div className='space-y-2 text-center'>
                <p className='font-serif text-sm font-medium text-stone-700'>
                    Loading your conversation
                </p>
                <p className='text-xs text-stone-500'>Just a moment...</p>
            </div>

            {/* Loading indicator */}
            <Loader2 className='text-gold-500 h-5 w-5 animate-spin' />
        </div>
    )
}

/**
 * Premium chat widget with luxury design
 *
 * Features:
 * - Glassmorphism container with rounded corners
 * - Smooth entrance/exit animations
 * - Loading skeleton for session restore
 * - Error state with retry option
 * - Mobile-first responsive design
 * - Safe area support
 */
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
            void restoreSession()
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
                'fixed flex flex-col overflow-hidden',
                // Premium container styling
                'rounded-2xl bg-white',
                'ring-1 ring-stone-200/60',
                // Premium shadow
                'shadow-2xl shadow-stone-900/20',
                // Animation
                CSS_CLASSES.SCALE_UP,
                // Mobile: full screen with some padding
                'inset-4 sm:inset-auto',
                // Desktop: fixed size in corner
                'sm:right-6 sm:bottom-24',
                // Fixed dimensions for desktop (400x600)
                'sm:h-[600px] sm:max-h-[calc(100vh-8rem)] sm:w-[400px]',
                // Safe area padding for mobile
                'pb-[env(safe-area-inset-bottom)] sm:pb-0'
            )}
            style={{
                zIndex: Z_INDEX.WIDGET,
                // Mobile max height
                maxHeight: 'calc(100dvh - 2rem)',
            }}
            role='dialog'
            aria-label='Chat widget'
            aria-modal='true'
        >
            {/* Close button */}
            <button
                onClick={handleClose}
                className={cn(
                    'absolute top-3 right-3 z-10',
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    // Glassmorphism background
                    'bg-white/80 backdrop-blur-sm',
                    'text-stone-500',
                    'ring-1 ring-stone-200/60',
                    'shadow-sm',
                    // Transitions
                    'transition-all duration-200',
                    'hover:bg-white hover:text-stone-700 hover:shadow-md',
                    'active:scale-95',
                    // Focus
                    'focus:ring-2 focus:ring-stone-900/10 focus:outline-none'
                )}
                aria-label='Close chat'
            >
                <X className='h-4 w-4' />
            </button>

            {/* Loading state while restoring session */}
            {isRestoringSession && <LoadingSkeleton />}

            {/* Error message */}
            {!isRestoringSession && error && (
                <div
                    className={cn(
                        'mx-4 mt-4 rounded-xl p-4',
                        'bg-red-50 text-sm text-red-600',
                        'ring-1 ring-red-100'
                    )}
                >
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
                            agentImageUrl={session.config.agentImageUrl}
                            userName={session.fullName.split(' ')[0] || 'there'}
                            initialMessages={session.messages}
                            onReset={handleReset}
                        />
                    ) : (
                        <PreChatForm
                            onSubmit={handlePreChatSubmit}
                            agentName={initialConfig?.agentName}
                            welcomeMessage={initialConfig?.welcomeMessage}
                            agentImageUrl={initialConfig?.agentImageUrl}
                        />
                    )}
                </>
            )}
        </div>
    )
}
