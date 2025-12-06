/**
 * Chat Message Component
 *
 * Renders individual chat messages with premium styling for user vs assistant.
 * Memoized for performance with streaming updates.
 *
 * @module components/chat/chat-message
 */
'use client'

import { memo } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { User, Sparkles } from 'lucide-react'

import { formatMessageTime } from '@workspace/chat/utils'

import { ChatMarkdown } from './chat-markdown.component'
import { CSS_CLASSES } from '@/lib/chat/constants'

type ChatMessageProps = {
    role: 'user' | 'assistant' | 'system'
    content: string
    createdAt?: Date
    isStreaming?: boolean
    agentName?: string
}

/**
 * Premium chat message with luxury styling
 *
 * Features:
 * - Gradient backgrounds for depth
 * - Gold accents for assistant messages
 * - Smooth entrance animations
 * - Memoized for streaming performance
 * - Accessible with proper semantics
 */
export const ChatMessage = memo(function ChatMessage({
    role,
    content,
    createdAt,
    isStreaming,
    agentName = 'Assistant',
}: ChatMessageProps) {
    const isUser = role === 'user'

    return (
        <article
            className={cn(
                'flex gap-3',
                CSS_CLASSES.MESSAGE_APPEAR,
                isUser ? 'flex-row-reverse' : 'flex-row'
            )}
            aria-label={`Message from ${isUser ? 'you' : agentName}`}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    'transition-transform duration-200',
                    isUser
                        ? [
                              // User: dark gradient
                              'bg-linear-to-br from-stone-800 to-stone-900',
                              'text-white',
                              'ring-1 ring-stone-700/50',
                              'shadow-md shadow-stone-900/20',
                          ]
                        : [
                              // Assistant: gold gradient
                              'from-gold-100 to-gold-50 bg-linear-to-br',
                              'text-gold-600',
                              'ring-gold-200/60 ring-1',
                              'shadow-gold-500/10 shadow-md',
                          ]
                )}
            >
                {isUser ? (
                    <User className='h-4 w-4' />
                ) : (
                    <Sparkles className='h-4 w-4' />
                )}
            </div>

            {/* Message Content */}
            <div
                className={cn(
                    'flex max-w-[80%] flex-col gap-1',
                    isUser ? 'items-end' : 'items-start'
                )}
            >
                {/* Name & Time */}
                <div className='flex items-center gap-2 px-1 text-xs text-stone-500'>
                    <span className='font-medium tracking-tight'>
                        {isUser ? 'You' : agentName}
                    </span>
                    {createdAt && (
                        <span className='text-stone-400'>
                            {formatMessageTime(createdAt)}
                        </span>
                    )}
                </div>

                {/* Message Bubble */}
                <div
                    className={cn(
                        'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                        isUser
                            ? [
                                  // User bubble: dark gradient
                                  'rounded-tr-sm',
                                  'bg-linear-to-br from-stone-800 to-stone-900',
                                  'text-stone-50',
                                  'ring-1 ring-stone-700/30',
                                  'shadow-lg shadow-stone-900/20',
                              ]
                            : [
                                  // Assistant bubble: light gradient with gold hint
                                  'rounded-tl-sm',
                                  'bg-linear-to-br from-stone-100 via-stone-50 to-white',
                                  'text-stone-800',
                                  'ring-1 ring-stone-200/50',
                                  'shadow-md shadow-stone-900/5',
                              ]
                    )}
                >
                    {isUser ? content : <ChatMarkdown content={content} />}

                    {/* Streaming cursor */}
                    {isStreaming && (
                        <span
                            className={cn(
                                'ml-1 inline-block',
                                isUser ? 'text-gold-300' : 'text-gold-500',
                                'animate-pulse'
                            )}
                            aria-hidden='true'
                        >
                            ▋
                        </span>
                    )}
                </div>
            </div>
        </article>
    )
})
