/**
 * Chat Widget Component
 *
 * Container component that manages the chat flow:
 * 1. Pre-chat form for lead capture
 * 2. Chat interface after form submission
 *
 * @module components/chat/chat-widget
 */
'use client'

import { useState, useCallback } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { X } from 'lucide-react'

import { PreChatForm } from './pre-chat-form.component'
import { ChatInterface } from './chat-interface.component'
import type { PreChatFormInput } from '@workspace/chat/types'

type ChatConfig = {
    agentName: string
    welcomeMessage: string
    primaryColor: string
}

type SessionData = {
    id: string
    fullName: string
    config: ChatConfig
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
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handlePreChatSubmit = useCallback(async (data: PreChatFormInput) => {
        setIsLoading(true)
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

            setSession({
                id: result.session.id,
                fullName: result.session.fullName,
                config: result.config,
            })
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to start chat. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }, [])

    const handleReset = useCallback(() => {
        setSession(null)
        setError(null)
    }, [])

    const handleClose = useCallback(() => {
        onClose()
        // Optionally reset session when closing
        // setSession(null)
    }, [onClose])

    if (!isOpen) return null

    return (
        <div
            className={cn(
                'fixed z-[60] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl',
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

            {/* Error message */}
            {error && (
                <div className='bg-red-50 px-4 py-2 text-sm text-red-600'>
                    {error}
                </div>
            )}

            {/* Content */}
            {session ? (
                <ChatInterface
                    sessionId={session.id}
                    agentName={session.config.agentName}
                    welcomeMessage={session.config.welcomeMessage}
                    userName={session.fullName.split(' ')[0] || 'there'}
                    onReset={handleReset}
                />
            ) : (
                <PreChatForm
                    onSubmit={handlePreChatSubmit}
                    agentName={initialConfig?.agentName}
                    welcomeMessage={initialConfig?.welcomeMessage}
                />
            )}
        </div>
    )
}
