/**
 * Chat Interface Component
 *
 * Main chat UI with streaming message support using AI SDK v5.
 * Supports restoring previous messages for session persistence.
 * Includes quick reply suggestions for guided conversations.
 *
 * @module components/chat/chat-interface
 */
'use client'

import {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
    type ChangeEvent,
} from 'react'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from '@workspace/ai'
import { cn } from '@workspace/ui/lib/utils'
import { MessageCircle, RotateCcw, Send, Loader2 } from 'lucide-react'

import { ChatMessage } from './chat-message.component'
import {
    QuickReplyButtons,
    getQuickReplyCategory,
} from './quick-reply-buttons.component'
import { HandoffButton } from './handoff-button.component'
import { MAX_MESSAGE_LENGTH } from '@workspace/chat/constants'

type StoredMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
    createdAt: string
}

type ChatInterfaceProps = {
    sessionId: string
    agentName: string
    welcomeMessage: string
    userName: string
    /** Previously stored messages to restore on session resume */
    initialMessages?: StoredMessage[]
    onReset?: () => void
}

/**
 * Convert stored DB messages to AI SDK message format
 */
function convertToAISDKMessages(messages: StoredMessage[]): Array<{
    id: string
    role: 'user' | 'assistant'
    parts: Array<{ type: 'text'; text: string }>
}> {
    return messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        parts: [{ type: 'text' as const, text: msg.content }],
    }))
}

/**
 * Polling configuration for dynamic questions
 */
const QUICK_QUESTIONS_POLL_INTERVAL = 500 // ms
const QUICK_QUESTIONS_MAX_ATTEMPTS = 6 // 3 seconds max

export function ChatInterface({
    sessionId,
    agentName,
    welcomeMessage,
    userName,
    initialMessages = [],
    onReset,
}: ChatInterfaceProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [input, setInput] = useState('')
    const [showQuickReplies, setShowQuickReplies] = useState(true)

    // Dynamic quick questions state
    const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([])
    const [dynamicQuestionsLoading, setDynamicQuestionsLoading] =
        useState(false)
    const pollAttemptsRef = useRef(0)
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // Convert initial messages to AI SDK format with welcome message
    const startingMessages = useMemo(() => {
        const welcome = {
            id: 'welcome',
            role: 'assistant' as const,
            parts: [{ type: 'text' as const, text: welcomeMessage }],
        }

        // If we have stored messages, add them after welcome
        if (initialMessages.length > 0) {
            const converted = convertToAISDKMessages(initialMessages)
            return [welcome, ...converted]
        }

        return [welcome]
    }, [welcomeMessage, initialMessages])

    const { messages, sendMessage, status, error, setMessages } = useChat({
        transport: new TextStreamChatTransport({
            api: '/api/chat',
            body: { sessionId },
        }),
        messages: startingMessages,
    })

    const isLoading = status === 'streaming' || status === 'submitted'
    const wasLoadingRef = useRef(false)

    // Extract text content from message parts
    const getMessageContent = useCallback(
        (message: (typeof messages)[0]): string => {
            if (!message.parts) return ''
            return message.parts
                .filter(
                    (part): part is { type: 'text'; text: string } =>
                        part.type === 'text'
                )
                .map((part) => part.text)
                .join('')
        },
        []
    )

    // Determine quick reply category based on conversation state
    const quickReplyCategory = useMemo(() => {
        // Count user messages (exclude welcome message)
        const userMessageCount = messages.filter(
            (m) => m.role === 'user'
        ).length

        // Get the last assistant message
        const assistantMessages = messages.filter((m) => m.role === 'assistant')
        const lastAssistantMessage =
            assistantMessages.length > 0
                ? getMessageContent(
                      assistantMessages[assistantMessages.length - 1]!
                  )
                : undefined

        return getQuickReplyCategory(userMessageCount, lastAssistantMessage)
    }, [messages, getMessageContent])

    /**
     * Fetch dynamic quick questions from the server
     */
    const fetchDynamicQuestions = useCallback(async () => {
        try {
            const response = await fetch(
                `/api/chat/session/${sessionId}/quick-questions`
            )
            const data = await response.json()

            if (data.success && data.questions && data.questions.length > 0) {
                setDynamicQuestions(data.questions)
                setDynamicQuestionsLoading(false)
                // Clear polling interval on success
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current)
                    pollIntervalRef.current = null
                }
                return true
            }
            return false
        } catch (error) {
            console.error('Failed to fetch dynamic questions:', error)
            return false
        }
    }, [sessionId])

    /**
     * Start polling for dynamic questions after streaming completes
     */
    const startPollingForQuestions = useCallback(() => {
        // Clear existing interval if any
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
        }

        // Reset state
        setDynamicQuestions([])
        setDynamicQuestionsLoading(true)
        pollAttemptsRef.current = 0

        // Start polling
        pollIntervalRef.current = setInterval(async () => {
            pollAttemptsRef.current += 1

            const success = await fetchDynamicQuestions()

            // Stop polling if successful or max attempts reached
            if (
                success ||
                pollAttemptsRef.current >= QUICK_QUESTIONS_MAX_ATTEMPTS
            ) {
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current)
                    pollIntervalRef.current = null
                }
                setDynamicQuestionsLoading(false)
            }
        }, QUICK_QUESTIONS_POLL_INTERVAL)
    }, [fetchDynamicQuestions])

    // Detect when streaming completes and start polling for questions
    useEffect(() => {
        // Detect transition from loading to not loading (streaming just completed)
        if (wasLoadingRef.current && !isLoading) {
            // Check if the last message is from assistant (response completed)
            const lastMessage = messages[messages.length - 1]
            if (lastMessage && lastMessage.role === 'assistant') {
                startPollingForQuestions()
            }
        }
        wasLoadingRef.current = isLoading
    }, [isLoading, messages, startPollingForQuestions])

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current)
            }
        }
    }, [])

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Hide quick replies after several messages
    useEffect(() => {
        const userMessageCount = messages.filter(
            (m) => m.role === 'user'
        ).length
        if (userMessageCount >= 5) {
            setShowQuickReplies(false)
        }
    }, [messages])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (input.trim() && !isLoading) {
            const message = input.trim()
            setInput('')
            // Clear dynamic questions when user sends a new message
            setDynamicQuestions([])
            await sendMessage({ text: message })
        }
    }

    const handleQuickReplySelect = useCallback(
        async (message: string) => {
            if (!isLoading) {
                // Clear dynamic questions when user selects a quick reply
                setDynamicQuestions([])
                await sendMessage({ text: message })
            }
        },
        [isLoading, sendMessage]
    )

    const handleReset = () => {
        setMessages([])
        setInput('')
        setShowQuickReplies(true)
        setDynamicQuestions([])
        setDynamicQuestionsLoading(false)
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
        }
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
                <div className='flex items-center gap-2'>
                    <HandoffButton sessionId={sessionId} />
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
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4'>
                <div className='space-y-4'>
                    {/* Restored session indicator */}
                    {initialMessages.length > 0 && (
                        <div className='flex justify-center'>
                            <span className='rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500'>
                                Conversation restored
                            </span>
                        </div>
                    )}

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

            {/* Quick Replies */}
            {showQuickReplies && !isLoading && (
                <div className='border-t border-stone-100 bg-stone-50/50 px-4 py-3'>
                    <QuickReplyButtons
                        category={quickReplyCategory}
                        onSelect={handleQuickReplySelect}
                        dynamicQuestions={dynamicQuestions}
                        dynamicQuestionsLoading={dynamicQuestionsLoading}
                    />
                </div>
            )}

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
