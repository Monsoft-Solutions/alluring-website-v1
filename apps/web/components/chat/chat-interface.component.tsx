/**
 * Chat Interface Component
 *
 * Main chat UI orchestrator with streaming message support using AI SDK v5.
 * Composes specialized hooks and components for a clean, maintainable architecture.
 *
 * @module components/chat/chat-interface
 */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import { ArrowDown } from 'lucide-react'

import { ChatHeader } from './chat-header.component'
import { ChatMessage } from './chat-message.component'
import { ChatInputArea } from './chat-input-area.component'
import { ChatTypingIndicator } from './chat-typing-indicator.component'
import { QuickReplyButtons } from './quick-reply-buttons.component'

import { useChatMessages, useChatScroll, useQuickQuestions } from '@/hooks/chat'
import type { StoredMessage } from '@/lib/chat/types'
import {
    DIMENSIONS,
    MESSAGES,
    CSS_CLASSES,
    ARIA_LABELS,
} from '@/lib/chat/constants'

type ChatInterfaceProps = {
    sessionId: string
    agentName: string
    welcomeMessage: string
    userName: string
    initialMessages?: StoredMessage[]
    onReset?: () => void
}

/**
 * Premium chat interface with world-class UX
 *
 * Architecture:
 * - useChatMessages: Message state and streaming
 * - useChatScroll: Auto-scroll and scroll button
 * - useQuickQuestions: Dynamic question fetching
 * - Composed sub-components for header, input, messages
 */
export function ChatInterface({
    sessionId,
    agentName,
    welcomeMessage,
    userName,
    initialMessages = [],
    onReset,
}: ChatInterfaceProps) {
    const [input, setInput] = useState('')
    const [showQuickReplies, setShowQuickReplies] = useState(true)

    // Chat messages with streaming support
    const {
        messages,
        isLoading,
        isStreaming,
        error,
        sendMessage,
        clearMessages,
        getMessageContent,
        userMessageCount,
        lastMessageIsAssistant,
        streamingJustCompleted,
    } = useChatMessages({
        sessionId,
        welcomeMessage,
        initialMessages,
    })

    // Scroll behavior management
    const {
        scrollContainerRef,
        messagesEndRef,
        showScrollButton,
        scrollToBottom,
        handleScroll,
        forceScrollToBottom,
    } = useChatScroll({ bottomThreshold: DIMENSIONS.SCROLL_BOTTOM_THRESHOLD })

    // Dynamic quick questions
    const {
        questions: dynamicQuestions,
        isLoading: dynamicQuestionsLoading,
        startFetching: startFetchingQuestions,
        clearQuestions,
    } = useQuickQuestions({ sessionId })

    // Determine quick reply category: only 'initial' fetches from DB,
    // after the first message, AI-generated questions take over
    const quickReplyCategory = userMessageCount === 0 ? 'initial' : 'dynamic'

    // Start fetching questions when streaming completes
    useEffect(() => {
        if (streamingJustCompleted && lastMessageIsAssistant) {
            startFetchingQuestions()
        }
    }, [streamingJustCompleted, lastMessageIsAssistant, startFetchingQuestions])

    // Auto-scroll on new messages
    useEffect(() => {
        forceScrollToBottom()
    }, [messages.length, forceScrollToBottom])

    // Hide quick replies after threshold
    useEffect(() => {
        if (userMessageCount >= MESSAGES.HIDE_QUICK_REPLIES_AFTER) {
            setShowQuickReplies(false)
        }
    }, [userMessageCount])

    // Handlers
    const handleSubmit = useCallback(async () => {
        if (!input.trim() || isLoading) return
        const message = input.trim()
        setInput('')
        clearQuestions()
        await sendMessage(message)
    }, [input, isLoading, sendMessage, clearQuestions])

    const handleQuickReplySelect = useCallback(
        async (message: string) => {
            if (isLoading) return
            clearQuestions()
            await sendMessage(message)
        },
        [isLoading, sendMessage, clearQuestions]
    )

    const handleReset = useCallback(() => {
        clearMessages()
        setInput('')
        setShowQuickReplies(true)
        clearQuestions()
        onReset?.()
    }, [clearMessages, clearQuestions, onReset])

    // Determine if typing indicator should show
    const showTypingIndicator =
        isLoading && messages[messages.length - 1]?.role === 'user'

    return (
        <div className='relative flex h-full flex-col overflow-hidden'>
            {/* Header */}
            <ChatHeader
                agentName={agentName}
                userName={userName}
                sessionId={sessionId}
                isTyping={isStreaming}
                onReset={onReset ? handleReset : undefined}
            />

            {/* Messages Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className='min-h-0 w-full flex-1 overflow-y-auto scroll-smooth p-4'
            >
                <div className='min-h-full space-y-4'>
                    {/* Restored session indicator */}
                    {initialMessages.length > 0 && (
                        <div className='flex justify-center'>
                            <span
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs',
                                    'bg-stone-100/80 text-stone-500',
                                    'ring-1 ring-stone-200/50'
                                )}
                            >
                                Conversation restored
                            </span>
                        </div>
                    )}

                    {/* Messages */}
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

                    {/* Typing Indicator */}
                    {showTypingIndicator && (
                        <ChatTypingIndicator agentName={agentName} />
                    )}

                    {/* Error Message */}
                    {error && (
                        <div
                            className={cn(
                                'rounded-xl p-4 text-sm',
                                'bg-red-50 text-red-600',
                                'ring-1 ring-red-100',
                                CSS_CLASSES.MESSAGE_APPEAR
                            )}
                        >
                            Sorry, something went wrong. Please try again.
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
                <button
                    onClick={() => scrollToBottom('smooth')}
                    className={cn(
                        'absolute bottom-32 left-1/2 z-10 -translate-x-1/2',
                        'flex h-9 w-9 items-center justify-center rounded-full',
                        'border border-stone-200/60 bg-white/90 backdrop-blur-sm',
                        'text-stone-500 shadow-lg shadow-stone-900/10',
                        'transition-all duration-200',
                        'hover:scale-105 hover:bg-white hover:text-stone-700',
                        'active:scale-95',
                        CSS_CLASSES.FADE_IN
                    )}
                    aria-label={ARIA_LABELS.SCROLL_TO_BOTTOM}
                >
                    <ArrowDown className='h-4 w-4' />
                </button>
            )}

            {/* Quick Replies */}
            {showQuickReplies && !isLoading && (
                <div
                    className={cn(
                        'border-t border-stone-100/60 px-4 py-3',
                        'bg-linear-to-t from-stone-50/80 to-transparent'
                    )}
                >
                    <QuickReplyButtons
                        category={quickReplyCategory}
                        onSelect={handleQuickReplySelect}
                        dynamicQuestions={dynamicQuestions}
                        dynamicQuestionsLoading={dynamicQuestionsLoading}
                    />
                </div>
            )}

            {/* Input Area */}
            <ChatInputArea
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                placeholder={`Message ${agentName}...`}
                isLoading={isLoading}
            />
        </div>
    )
}
