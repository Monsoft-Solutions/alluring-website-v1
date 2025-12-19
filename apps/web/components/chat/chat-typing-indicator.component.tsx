/**
 * Chat Typing Indicator Component
 *
 * Animated typing indicator shown when the AI is preparing a response.
 *
 * @module components/chat/chat-typing-indicator
 */
'use client'

import { memo } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle } from 'lucide-react'

type ChatTypingIndicatorProps = {
    /** Agent name for screen readers */
    agentName?: string
    /** Additional CSS classes */
    className?: string
}

/**
 * Animated typing indicator with premium styling
 *
 * Features:
 * - Three bouncing dots with staggered animation
 * - Agent avatar with gold accent
 * - Fade-in animation on mount
 * - Accessible with proper ARIA attributes
 */
export const ChatTypingIndicator = memo(function ChatTypingIndicator({
    agentName = 'Assistant',
    className,
}: ChatTypingIndicatorProps) {
    return (
        <div
            className={cn(
                'flex gap-3',
                // Entrance animation
                'animate-in fade-in slide-in-from-bottom-2 duration-300',
                className
            )}
            role='status'
            aria-label={`${agentName} is typing`}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    'from-gold-100 to-gold-50 bg-linear-to-br',
                    'ring-gold-200/60 ring-1',
                    'shadow-gold-500/10 shadow-sm'
                )}
            >
                <MessageCircle className='text-gold-600 h-4 w-4' />
            </div>

            {/* Typing Bubble */}
            <div
                className={cn(
                    'flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3',
                    // Premium gradient background
                    'bg-linear-to-br from-stone-100 to-stone-50',
                    // Subtle border
                    'ring-1 ring-stone-200/50',
                    // Shadow for depth
                    'shadow-sm shadow-stone-900/5'
                )}
            >
                {/* Bouncing Dots */}
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className={cn(
                            'h-2.5 w-2.5 rounded-full',
                            // Gold gradient dots
                            'from-gold-400 to-gold-500 bg-linear-to-br',
                            // Bounce animation with stagger
                            'animate-bounce',
                            // Staggered delays
                            i === 0 && '[animation-delay:-0.32s]',
                            i === 1 && '[animation-delay:-0.16s]',
                            i === 2 && '[animation-delay:0s]'
                        )}
                    />
                ))}
            </div>
        </div>
    )
})
