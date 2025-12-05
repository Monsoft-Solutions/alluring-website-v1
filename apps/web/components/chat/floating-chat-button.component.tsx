/**
 * Floating Chat Button Component
 *
 * Main entry point for the chat widget.
 * Shows a floating button that opens the chat interface.
 *
 * @module components/chat/floating-chat-button
 */
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, X } from 'lucide-react'

import { ChatWidget } from './chat-widget.component'

type ChatConfig = {
    isEnabled: boolean
    agentName: string
    welcomeMessage: string
    buttonPosition: string
    primaryColor: string
}

type FloatingChatButtonProps = {
    /** Override position (useful for testing) */
    position?: 'bottom-right' | 'bottom-left'
}

export function FloatingChatButton({
    position: positionOverride,
}: FloatingChatButtonProps = {}) {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState<ChatConfig | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch chat configuration on mount
    useEffect(() => {
        async function fetchConfig() {
            try {
                const response = await fetch('/api/chat/config')
                if (response.ok) {
                    const data = await response.json()
                    setConfig(data)
                }
            } catch (error) {
                console.error('Failed to load chat config:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchConfig()
    }, [])

    // Don't render if loading, disabled, or failed to load
    if (isLoading || !config?.isEnabled) {
        return null
    }

    const position = positionOverride ?? config.buttonPosition ?? 'bottom-right'
    const isRight = position.includes('right')

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'fixed z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
                    'bg-stone-900 text-white hover:scale-105 hover:bg-stone-800',
                    'focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:outline-none',
                    isRight ? 'right-6' : 'left-6',
                    'bottom-6'
                )}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
                aria-expanded={isOpen}
            >
                {/* Pulse animation when closed */}
                {!isOpen && (
                    <span className='absolute inset-0 animate-ping rounded-full bg-stone-900 opacity-25' />
                )}

                {/* Icon with transition */}
                <span
                    className={cn(
                        'relative transition-transform duration-300',
                        isOpen && 'rotate-90'
                    )}
                >
                    {isOpen ? (
                        <X className='h-6 w-6' />
                    ) : (
                        <MessageCircle className='h-6 w-6' />
                    )}
                </span>

                {/* Badge */}
                {!isOpen && (
                    <span className='bg-gold-400 absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow'>
                        Chat
                    </span>
                )}
            </button>

            {/* Chat Widget */}
            <ChatWidget
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                initialConfig={{
                    agentName: config.agentName,
                    welcomeMessage: config.welcomeMessage,
                    primaryColor: config.primaryColor,
                }}
            />

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className='fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm sm:hidden'
                    onClick={() => setIsOpen(false)}
                    aria-hidden='true'
                />
            )}
        </>
    )
}
