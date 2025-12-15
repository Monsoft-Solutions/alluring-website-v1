/**
 * Floating Chat Button Component
 *
 * Main entry point for the chat widget with premium design.
 * Shows a floating button that opens the chat interface.
 *
 * Features:
 * - Auto-expands to pill shape after 5 seconds
 * - Shows agent avatar and "Get Answers" text when expanded
 * - Proactive tooltip on scroll
 *
 * @module components/chat/floating-chat-button
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, X, Sparkles } from 'lucide-react'

import { ChatWidget } from './chat-widget.component'
import { Z_INDEX, ARIA_LABELS } from '@/lib/chat/constants'
import { useProactiveChat } from '@/hooks/chat/useProactiveChat.hook'
import { useAnalyticsEvent } from '@/lib/analytics/useAnalyticsEvent.hook'

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
 * - Auto-expands to pill shape after 5 seconds
 * - Shows agent avatar and "Get Answers" text when expanded
 * - Proactive tooltip on scroll
 * - Gradient background with gold accent
 * - Pulse animation when closed
 * - Premium shadow and hover effects
 * - Mobile-optimized touch target
 */
export function FloatingChatButton({
    position: positionOverride,
}: FloatingChatButtonProps = {}) {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState<ChatConfig | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Proactive engagement hooks (no expansion, just tooltip)
    const { showTooltip, dismissTooltip } = useProactiveChat()

    // Analytics hook
    const { trackClick, track } = useAnalyticsEvent()

    /**
     * Handle button click with analytics tracking
     */
    const handleButtonClick = useCallback(() => {
        const wasTooltipVisible = showTooltip

        setIsOpen((prev) => {
            const willOpen = !prev

            // Track chat button click
            if (willOpen) {
                trackClick('chat_button', {
                    button_position: config?.buttonPosition ?? 'bottom-right',
                    source: wasTooltipVisible ? 'tooltip' : 'direct',
                })

                // Track specific event if opened from tooltip
                if (wasTooltipVisible) {
                    track('chat_opened_from_tooltip', {
                        event_category: 'conversion',
                    })
                }
            }

            return willOpen
        })
    }, [showTooltip, config?.buttonPosition, trackClick, track])

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
            {/* Floating Button - Responsive Circular Icon */}
            <button
                onClick={handleButtonClick}
                className={cn(
                    'fixed flex items-center justify-center rounded-full',
                    // Responsive sizing - compact on mobile, larger on desktop
                    'h-12 w-12 sm:h-16 sm:w-16',
                    // Premium gradient background
                    'bg-linear-to-br from-stone-800 to-stone-900',
                    'text-white',
                    // Shadow and depth
                    'shadow-lg shadow-stone-900/20',
                    'ring-1 ring-white/10',
                    // Transitions
                    'transition-all duration-300 ease-out',
                    // Hover effects
                    'hover:scale-105 hover:shadow-xl hover:shadow-stone-900/30',
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
                {/* Icon with rotation transition - responsive sizing */}
                <span
                    className={cn(
                        'relative transition-transform duration-300',
                        isOpen && 'rotate-180'
                    )}
                >
                    {isOpen ? (
                        <X className='h-5 w-5 sm:h-6 sm:w-6' />
                    ) : (
                        <MessageCircle className='h-5 w-5 sm:h-6 sm:w-6' />
                    )}
                </span>
            </button>

            {/* Enhanced Tooltip with Agent Avatar */}
            {showTooltip && !isOpen && (
                <div
                    className={cn(
                        'fixed flex items-center gap-3',
                        'rounded-2xl px-4 py-3',
                        // Premium glassmorphism
                        'bg-white/95 backdrop-blur-xl',
                        'text-stone-800',
                        'ring-1 ring-stone-200/60',
                        'shadow-2xl shadow-stone-900/20',
                        // Animation
                        'animate-in slide-in-from-bottom-4 fade-in duration-500',
                        // Position above button
                        isRight ? 'right-6' : 'left-6',
                        'bottom-24',
                        // Safe area
                        'mb-[env(safe-area-inset-bottom)]',
                        // Max width
                        'max-w-xs'
                    )}
                    style={{ zIndex: Z_INDEX.BUTTON + 1 }}
                    role='tooltip'
                    aria-live='polite'
                >
                    {/* Agent Avatar */}
                    <div
                        className={cn(
                            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                            'from-gold-100 to-gold-50 bg-linear-to-br',
                            'ring-gold-200/60 ring-2',
                            'shadow-gold-500/10 shadow-md',
                            'overflow-hidden'
                        )}
                    >
                        {config.agentImageUrl ? (
                            <Image
                                src={config.agentImageUrl}
                                alt={config.agentName}
                                width={48}
                                height={48}
                                className='h-full w-full object-cover'
                            />
                        ) : (
                            <Sparkles className='text-gold-600 h-5 w-5' />
                        )}

                        {/* Online indicator */}
                        <span
                            className={cn(
                                'absolute -right-0.5 -bottom-0.5',
                                'h-3 w-3 rounded-full border-2 border-white',
                                'bg-emerald-500'
                            )}
                            aria-label='Online'
                        />
                    </div>

                    {/* Message content */}
                    <div className='min-w-0 flex-1'>
                        <p className='font-serif text-base leading-tight font-semibold text-stone-900'>
                            Ask me anything...
                        </p>
                        <p className='mt-0.5 text-xs text-stone-600'>
                            {config.agentName}
                        </p>
                    </div>

                    {/* Dismiss button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            dismissTooltip()
                        }}
                        className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                            'text-stone-400 transition-colors',
                            'hover:bg-stone-100 hover:text-stone-600',
                            'focus:ring-2 focus:ring-stone-900/10 focus:outline-none'
                        )}
                        aria-label={ARIA_LABELS.DISMISS_TOOLTIP}
                    >
                        <X className='h-3.5 w-3.5' />
                    </button>

                    {/* Tooltip arrow */}
                    <div
                        className={cn(
                            'absolute -bottom-2 h-4 w-4 rotate-45',
                            'bg-white/95 ring-1 ring-stone-200/60',
                            isRight ? 'right-10' : 'left-10'
                        )}
                        aria-hidden='true'
                    />
                </div>
            )}

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
