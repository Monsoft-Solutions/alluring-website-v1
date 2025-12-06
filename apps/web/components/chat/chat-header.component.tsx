/**
 * Chat Header Component
 *
 * Premium header with agent info, status, and action buttons.
 * Features glassmorphism design with gold accents.
 *
 * @module components/chat/chat-header
 */
'use client'

import { memo } from 'react'
import Image from 'next/image'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, RotateCcw, Sparkles } from 'lucide-react'

import { HandoffButton } from './handoff-button.component'

type ChatHeaderProps = {
    /** Agent/assistant name */
    agentName: string
    /** Agent avatar image URL */
    agentImageUrl?: string | null
    /** User's first name for personalization */
    userName: string
    /** Chat session ID for handoff */
    sessionId: string
    /** Whether agent is currently responding */
    isTyping?: boolean
    /** Callback for reset button */
    onReset?: () => void
    /** Additional CSS classes */
    className?: string
}

/**
 * Premium chat header with glassmorphism design
 *
 * Features:
 * - Agent avatar with gold accent ring
 * - Online status indicator with pulse animation
 * - Typing indicator when agent is responding
 * - Handoff and reset action buttons
 * - Glassmorphism backdrop blur effect
 */
export const ChatHeader = memo(function ChatHeader({
    agentName,
    agentImageUrl,
    userName,
    sessionId,
    isTyping = false,
    onReset,
    className,
}: ChatHeaderProps) {
    return (
        <header
            className={cn(
                // Layout
                'flex items-center justify-between px-4 py-3',
                // Premium glassmorphism background
                'border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-xl',
                // Subtle top shadow for depth
                'shadow-sm shadow-stone-900/5',
                className
            )}
        >
            {/* Agent Info */}
            <div className='flex items-center gap-3'>
                {/* Avatar with gold ring */}
                <div className='relative'>
                    <div
                        className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            'from-gold-100 to-gold-50 bg-linear-to-br',
                            'ring-gold-200/60 ring-2 ring-offset-1 ring-offset-white',
                            'shadow-gold-500/10 shadow-md',
                            'overflow-hidden'
                        )}
                    >
                        {agentImageUrl ? (
                            <Image
                                src={agentImageUrl}
                                alt={agentName}
                                width={40}
                                height={40}
                                className='h-full w-full object-cover'
                            />
                        ) : isTyping ? (
                            <Sparkles className='text-gold-600 h-4 w-4 animate-pulse' />
                        ) : (
                            <MessageCircle className='text-gold-600 h-4 w-4' />
                        )}
                    </div>

                    {/* Online status indicator */}
                    <span
                        className={cn(
                            'absolute -right-0.5 -bottom-0.5',
                            'h-3 w-3 rounded-full border-2 border-white',
                            'bg-emerald-500',
                            // Pulse animation
                            'after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-emerald-500 after:opacity-75'
                        )}
                        aria-label='Online'
                    />
                </div>

                {/* Name and status */}
                <div className='flex flex-col'>
                    <h3 className='font-serif text-sm font-semibold tracking-tight text-stone-900'>
                        {agentName}
                    </h3>
                    <p className='text-xs text-stone-500'>
                        {isTyping ? (
                            <span className='flex items-center gap-1'>
                                <span className='text-gold-600'>Typing</span>
                                <span className='flex gap-0.5'>
                                    <span className='bg-gold-500 h-1 w-1 animate-bounce rounded-full [animation-delay:-0.3s]' />
                                    <span className='bg-gold-500 h-1 w-1 animate-bounce rounded-full [animation-delay:-0.15s]' />
                                    <span className='bg-gold-500 h-1 w-1 animate-bounce rounded-full' />
                                </span>
                            </span>
                        ) : (
                            `Chatting with ${userName}`
                        )}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex items-center gap-1.5'>
                <HandoffButton sessionId={sessionId} />

                {onReset && (
                    <button
                        type='button'
                        onClick={onReset}
                        className={cn(
                            'group relative flex h-8 w-8 items-center justify-center rounded-lg',
                            'text-stone-400 transition-all duration-200',
                            'hover:bg-stone-100 hover:text-stone-600',
                            'focus:ring-2 focus:ring-stone-900/10 focus:outline-none',
                            // Press feedback
                            'active:scale-95'
                        )}
                        title='Start new conversation'
                        aria-label='Start new conversation'
                    >
                        <RotateCcw className='h-4 w-4 transition-transform duration-300 group-hover:rotate-[-45deg]' />
                    </button>
                )}
            </div>
        </header>
    )
})
