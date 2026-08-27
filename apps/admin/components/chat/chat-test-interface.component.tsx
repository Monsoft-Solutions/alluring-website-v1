/**
 * Chat Test Interface Component
 *
 * Admin interface for testing the chat agent with real AI responses.
 * Uses AI SDK v5 with TextStreamChatTransport.
 *
 * @module components/chat/chat-test-interface
 */
'use client'

import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from '@workspace/ai/client'
import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card'
import { Textarea } from '@workspace/ui/components/textarea'
import {
    MessageCircle,
    Send,
    Loader2,
    RotateCcw,
    User,
    Bot,
    AlertCircle,
} from 'lucide-react'

import { createTestSession } from '@/lib/actions/chat.action'
import { MAX_MESSAGE_LENGTH } from '@workspace/chat/constants'

type ChatTestInterfaceProps = {
    welcomeMessage: string
    agentName: string
    hasApiKey: boolean
}

export function ChatTestInterface({
    welcomeMessage,
    agentName,
    hasApiKey,
}: ChatTestInterfaceProps) {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const {
        messages,
        sendMessage,
        status,
        setMessages,
        error: chatError,
    } = useChat({
        transport: sessionId
            ? new TextStreamChatTransport({
                  api: '/api/chat',
                  body: { sessionId },
              })
            : undefined,
        messages: sessionId
            ? [
                  {
                      id: 'welcome',
                      role: 'assistant',
                      parts: [{ type: 'text', text: welcomeMessage }],
                  },
              ]
            : [],
    })

    const isLoading = status === 'streaming' || status === 'submitted'

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const startSession = async () => {
        setIsCreatingSession(true)
        setError(null)

        try {
            const result = await createTestSession()

            if (result.success && result.sessionId) {
                setSessionId(result.sessionId)
                setMessages([
                    {
                        id: 'welcome',
                        role: 'assistant',
                        parts: [{ type: 'text', text: welcomeMessage }],
                    },
                ])
            } else {
                setError(result.error ?? 'Failed to create test session')
            }
        } catch {
            setError('Failed to create test session')
        } finally {
            setIsCreatingSession(false)
        }
    }

    const resetSession = () => {
        setSessionId(null)
        setMessages([])
        setError(null)
        setInput('')
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (input.trim() && !isLoading && sessionId) {
            const message = input.trim()
            setInput('')
            await sendMessage({ text: message })
        }
    }

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
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

    if (!hasApiKey) {
        return (
            <Card className='border-amber-200 bg-amber-50'>
                <CardContent className='flex items-center gap-4 py-8'>
                    <AlertCircle className='h-8 w-8 text-amber-600' />
                    <div>
                        <h3 className='font-semibold text-amber-900'>
                            OpenRouter API Key Required
                        </h3>
                        <p className='text-sm text-amber-700'>
                            Add OPENROUTER_API_KEY to your environment variables
                            to test the chat.
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!sessionId) {
        return (
            <Card>
                <CardContent className='flex flex-col items-center justify-center py-16'>
                    <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100'>
                        <MessageCircle className='h-8 w-8 text-stone-600' />
                    </div>
                    <h3 className='mb-2 text-lg font-semibold'>
                        Test Chat Agent
                    </h3>
                    <p className='text-muted-foreground mb-6 text-center text-sm'>
                        Start a test conversation to see how the chat agent
                        responds.
                        <br />
                        Test sessions are marked and won&apos;t appear in
                        analytics.
                    </p>
                    {error && (
                        <p className='mb-4 text-sm text-red-600'>{error}</p>
                    )}
                    <Button onClick={startSession} disabled={isCreatingSession}>
                        {isCreatingSession ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Starting...
                            </>
                        ) : (
                            <>
                                <MessageCircle className='mr-2 h-4 w-4' />
                                Start Test Chat
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className='flex h-[600px] flex-col'>
            {/* Header */}
            <CardHeader className='flex flex-row items-center justify-between border-b py-3'>
                <div className='flex items-center gap-3'>
                    <div className='bg-gold-100 flex h-9 w-9 items-center justify-center rounded-full'>
                        <Bot className='text-gold-700 h-4 w-4' />
                    </div>
                    <div>
                        <CardTitle className='text-base'>{agentName}</CardTitle>
                        <p className='text-muted-foreground text-xs'>
                            Test Session
                        </p>
                    </div>
                </div>
                <Button variant='outline' size='sm' onClick={resetSession}>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    New Test
                </Button>
            </CardHeader>

            {/* Messages */}
            <CardContent className='flex-1 overflow-y-auto p-4'>
                <div className='space-y-4'>
                    {messages.map((message, index) => {
                        const content = getMessageContent(message)
                        if (!content) return null
                        const role = message.role as string
                        const isUser = role === 'user'

                        return (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex gap-3',
                                    isUser ? 'flex-row-reverse' : 'flex-row'
                                )}
                            >
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
                                <div
                                    className={cn(
                                        'flex max-w-[80%] flex-col gap-1',
                                        isUser ? 'items-end' : 'items-start'
                                    )}
                                >
                                    <div className='flex items-center gap-2 text-xs text-stone-500'>
                                        <span className='font-medium'>
                                            {isUser ? 'You (Admin)' : agentName}
                                        </span>
                                    </div>
                                    <div
                                        className={cn(
                                            'rounded-2xl px-4 py-2.5 text-sm',
                                            isUser
                                                ? 'rounded-tr-sm bg-stone-900 text-white'
                                                : 'rounded-tl-sm bg-stone-100 text-stone-900'
                                        )}
                                    >
                                        {content}
                                        {isLoading &&
                                            index === messages.length - 1 &&
                                            role === 'assistant' && (
                                                <span className='ml-1 inline-block animate-pulse'>
                                                    ▋
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* Typing indicator */}
                    {isLoading &&
                        (messages[messages.length - 1]?.role as string) ===
                            'user' && (
                            <div className='flex gap-3'>
                                <div className='bg-gold-100 text-gold-700 flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
                                    <Bot className='h-4 w-4' />
                                </div>
                                <div className='flex items-center gap-1 rounded-2xl rounded-tl-sm bg-stone-100 px-4 py-2.5'>
                                    <span className='h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.3s]' />
                                    <span className='h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:-0.15s]' />
                                    <span className='h-2 w-2 animate-bounce rounded-full bg-stone-400' />
                                </div>
                            </div>
                        )}

                    {/* Error */}
                    {chatError && (
                        <div className='rounded-lg bg-red-50 p-3 text-sm text-red-600'>
                            Error: {chatError.message}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </CardContent>

            {/* Input */}
            <div className='border-t p-4'>
                <form onSubmit={handleSubmit} className='flex gap-2'>
                    <Textarea
                        value={input}
                        onChange={handleInputChange}
                        placeholder='Type a message to test...'
                        disabled={isLoading}
                        maxLength={MAX_MESSAGE_LENGTH}
                        rows={1}
                        className='max-h-32 min-h-[44px] resize-none'
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                void handleSubmit()
                            }
                        }}
                    />
                    <Button
                        type='submit'
                        disabled={!input.trim() || isLoading}
                        className='shrink-0'
                    >
                        {isLoading ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                        ) : (
                            <Send className='h-4 w-4' />
                        )}
                    </Button>
                </form>
            </div>
        </Card>
    )
}
