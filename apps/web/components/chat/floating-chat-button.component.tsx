/**
 * Floating Chat Button Component
 *
 * Main entry point for the chat widget with premium design.
 * Shows a floating button that opens the chat interface.
 *
 * @module components/chat/floating-chat-button
 */
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, X } from 'lucide-react'

import { ChatWidget } from './chat-widget.component'
import { Z_INDEX, ARIA_LABELS } from '@/lib/chat/constants'

type ChatConfig = {
    isEnabled: boolean
    agentName: string
    welcomeMessage: string
    buttonPosition: string
    primaryColor: string
    agentImageUrl: string | null
}

type FloatingChatButtonProps = {
    /** Override position (useful for testing) */
    position?: 'bottom-right' | 'bottom-left'
}

/**
 * Premium floating chat button with luxury design
 *
 * Features:
 * - Gradient background with gold accent
 * - Pulse animation when closed (attention-grabber)
 * - Smooth icon transition on open/close
 * - Premium shadow and hover effects
 * - Mobile-optimized touch target (56px)
 * - Safe area support for mobile
 */
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
                    'fixed flex h-14 w-14 items-center justify-center rounded-full',
                    // Premium gradient background
                    'bg-linear-to-br from-stone-800 to-stone-900',
                    'text-white',
                    // Shadow and depth
                    'shadow-xl shadow-stone-900/30',
                    'ring-1 ring-white/10',
                    // Transitions
                    'transition-all duration-300 ease-out',
                    // Hover effects
                    'hover:scale-105 hover:shadow-2xl hover:shadow-stone-900/40',
                    'hover:from-stone-700 hover:to-stone-800',
                    // Press feedback
                    'active:scale-95',
                    // Focus ring with gold accent
                    'focus:ring-gold-500/50 focus:ring-2 focus:ring-offset-2 focus:outline-none',
                    // Position
                    isRight ? 'right-6' : 'left-6',
                    'bottom-6',
                    // Safe area for mobile
                    'mb-[env(safe-area-inset-bottom)]'
                )}
                style={{ zIndex: Z_INDEX.BUTTON }}
                aria-label={
                    isOpen ? ARIA_LABELS.CLOSE_CHAT : ARIA_LABELS.OPEN_CHAT
                }
                aria-expanded={isOpen}
            >
                {/* Pulse animation when closed */}
                {!isOpen && (
                    <span
                        className={cn(
                            'absolute inset-0 rounded-full',
                            'from-gold-400 to-gold-500 bg-linear-to-br',
                            'animate-ping opacity-30'
                        )}
                        aria-hidden='true'
                    />
                )}

                {/* Icon with rotation transition */}
                <span
                    className={cn(
                        'relative transition-transform duration-300',
                        isOpen && 'rotate-180'
                    )}
                >
                    {isOpen ? (
                        <X className='h-6 w-6' />
                    ) : (
                        <MessageCircle className='h-6 w-6' />
                    )}
                </span>

                {/* Premium badge when closed */}
                {!isOpen && (
                    <span
                        className={cn(
                            'absolute -top-1 -right-1',
                            'flex h-5 min-w-5 items-center justify-center',
                            'rounded-full px-1',
                            // Gold gradient badge
                            'from-gold-400 to-gold-500 bg-linear-to-br',
                            'text-[10px] font-bold text-white',
                            // Shadow for depth
                            'shadow-gold-500/30 shadow-lg',
                            // Ring for polish
                            'ring-2 ring-white'
                        )}
                    >
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
                    agentImageUrl: config.agentImageUrl,
                }}
            />

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className={cn(
                        'fixed inset-0 sm:hidden',
                        'bg-black/30 backdrop-blur-sm',
                        // Animation
                        'animate-in fade-in duration-200'
                    )}
                    style={{ zIndex: Z_INDEX.BACKDROP }}
                    onClick={() => setIsOpen(false)}
                    aria-hidden='true'
                />
            )}
        </>
    )
}
