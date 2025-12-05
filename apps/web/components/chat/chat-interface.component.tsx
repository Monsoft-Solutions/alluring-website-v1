/**
 * Chat Interface Component
 *
 * Main chat UI with streaming message support using AI SDK v5.
 *
 * @module components/chat/chat-interface
 */
'use client'

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, RotateCcw, Send, Loader2 } from 'lucide-react'

import { ChatMessage } from './chat-message.component'
import { MAX_MESSAGE_LENGTH } from '@workspace/chat/constants'

type ChatInterfaceProps = {
    sessionId: string
    agentName: string
    welcomeMessage: string
    userName: string
    onReset?: () => void
}

export function ChatInterface({
    sessionId,
    agentName,
    welcomeMessage,
    userName,
    onReset,
}: ChatInterfaceProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')

    const { messages, sendMessage, status, error, setMessages } = useChat({
        transport: new TextStreamChatTransport({
            api: '/api/chat',
            body: { sessionId },
        }),
        messages: [
            {
                id: 'welcome',
                role: 'assistant',
                parts: [{ type: 'text', text: welcomeMessage }],
            },
        ],
    })

    const isLoading = status === 'streaming' || status === 'submitted'

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (input.trim() && !isLoading) {
            const message = input.trim()
            setInput('')
            await sendMessage({ text: message })
        }
    }

    const handleReset = () => {
        setMessages([])
        setInput('')
        onReset?.()
    }

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    // Extract text content from message parts
    const getMessageContent = (message: (typeof messages)[0]): string => {
        if (!message.parts) return ''
        return message.parts
            .filter(
                (part): part is { type: 'text'; text: string } =>
                    part.type === 'text'
            )
            .map((part) => part.text)
            .join('')
    }

    return (
        <div className='flex h-full flex-col'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-stone-200 bg-stone-50 px-4 py-3'>
                <div className='flex items-center gap-3'>
                    <div className='bg-gold-100 flex h-9 w-9 items-center justify-center rounded-full'>
                        <MessageCircle className='text-gold-700 h-4 w-4' />
                    </div>
                    <div>
                        <h3 className='font-serif text-sm font-semibold text-stone-900'>
                            {agentName}
                        </h3>
                        <p className='text-xs text-stone-500'>
                            Chatting with {userName}
                        </p>
                    </div>
                </div>
                {onReset && (
                    <button
                        onClick={handleReset}
                        className='rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700'
                        title='Start new conversation'
                    >
                        <RotateCcw className='h-4 w-4' />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4'>
                <div className='space-y-4'>
                    {messages.map((message, index) => {
                        const content = getMessageContent(message)
                        if (!content) return null

                        return (
                            <ChatMessage
                                key={message.id}
                                role={message.role as 'user' | 'assistant'}
                                content={content}
                                agentName={agentName}
                                isStreaming={
                                    isLoading &&
                                    index === messages.length - 1 &&
                                    message.role === 'assistant'
                                }
                            />
                        )
                    })}

                    {/* Typing indicator */}
                    {isLoading &&
                        (messages[messages.length - 1]?.role as string) ===
                            'user' && (
                            <div className='flex gap-3'>
                                <div className='bg-gold-100 text-gold-700 flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
                                    <MessageCircle className='h-4 w-4' />
                                </div>
                                <div className='flex items-center gap-1 rounded-2xl rounded-tl-sm bg-stone-100 px-4 py-2.5'>
                                    <span className='h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.3s]' />
                                    <span className='h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.15s]' />
                                    <span className='h-2 w-2 animate-bounce rounded-full bg-stone-400' />
                                </div>
                            </div>
                        )}

                    {/* Error message */}
                    {error && (
                        <div className='rounded-lg bg-red-50 p-3 text-sm text-red-600'>
                            Sorry, something went wrong. Please try again.
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className='flex items-end gap-2 border-t border-stone-200 bg-white p-4'>
                <div className='relative flex-1'>
                    <textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder={`Message ${agentName}...`}
                        disabled={isLoading}
                        maxLength={MAX_MESSAGE_LENGTH}
                        rows={1}
                        className={cn(
                            'w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 pr-12 text-sm',
                            'placeholder:text-stone-400',
                            'focus:border-stone-300 focus:bg-white focus:ring-2 focus:ring-stone-900/5 focus:outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            'max-h-32 min-h-[44px]'
                        )}
                        style={{
                            height: 'auto',
                            minHeight: '44px',
                        }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement
                            target.style.height = 'auto'
                            target.style.height = `${Math.min(target.scrollHeight, 128)}px`
                        }}
                    />
                    <span className='absolute right-3 bottom-3 text-xs text-stone-400'>
                        {input.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                </div>

                <button
                    type='button'
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading}
                    className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
                        input.trim() && !isLoading
                            ? 'bg-stone-900 text-white hover:bg-stone-800'
                            : 'cursor-not-allowed bg-stone-200 text-stone-400'
                    )}
                    aria-label='Send message'
                >
                    {isLoading ? (
                        <Loader2 className='h-5 w-5 animate-spin' />
                    ) : (
                        <Send className='h-5 w-5' />
                    )}
                </button>
            </div>
        </div>
    )
}
