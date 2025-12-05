/**
 * Chat Message Component
 *
 * Renders individual chat messages with different styling for user vs assistant.
 *
 * @module components/chat/chat-message
 */
'use client'

import { cn } from '@workspace/ui/lib/utils'
import { User, Bot } from 'lucide-react'

import { formatMessageTime } from '@workspace/chat/utils'

import { ChatMarkdown } from './chat-markdown.component'

type ChatMessageProps = {
    role: 'user' | 'assistant' | 'system'
    content: string
    createdAt?: Date
    isStreaming?: boolean
    agentName?: string
}

export function ChatMessage({
    role,
    content,
    createdAt,
    isStreaming,
    agentName = 'Assistant',
}: ChatMessageProps) {
    const isUser = role === 'user'

    return (
        <div
            className={cn(
                'flex gap-3',
                isUser ? 'flex-row-reverse' : 'flex-row'
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    isUser
                        ? 'bg-stone-900 text-white'
                        : 'bg-gold-100 text-gold-700'
                )}
            >
                {isUser ? (
                    <User className='h-4 w-4' />
                ) : (
                    <Bot className='h-4 w-4' />
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
                <div className='flex items-center gap-2 text-xs text-stone-500'>
                    <span className='font-medium'>
                        {isUser ? 'You' : agentName}
                    </span>
                    {createdAt && <span>{formatMessageTime(createdAt)}</span>}
                </div>

                {/* Message Bubble */}
                <div
                    className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        isUser
                            ? 'rounded-tr-sm bg-stone-900 text-white'
                            : 'rounded-tl-sm bg-stone-100 text-stone-900'
                    )}
                >
                    {isUser ? content : <ChatMarkdown content={content} />}
                    {isStreaming && (
                        <span className='ml-1 inline-block animate-pulse'>
                            ▋
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
