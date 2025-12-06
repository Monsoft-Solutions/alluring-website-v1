/**
 * Chat Messages Hook
 *
 * Wraps AI SDK's useChat with optimistic updates, message content extraction,
 * and conversation state management.
 *
 * The AI SDK v5 handles optimistic updates automatically:
 * - User messages appear instantly in the UI when sendMessage is called
 * - Assistant messages stream in real-time as they're generated
 *
 * @module hooks/chat/useChatMessages
 */
'use client'

import { useMemo, useCallback, useRef, useEffect } from 'react'
import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from '@workspace/ai'

/** Re-export UIMessage as Message for backwards compatibility */
type Message = UIMessage

/** Stored message format from database */
export type StoredMessage = {
    id: string
    role: 'user' | 'assistant'
    content: string
    createdAt: string
}

/** AI SDK v5 message format with parts */
export type AISDKMessage = {
    id: string
    role: 'user' | 'assistant' | 'system'
    parts: Array<{ type: 'text'; text: string }>
}

type UseChatMessagesOptions = {
    /** Chat session ID */
    sessionId: string
    /** Welcome message to display at start */
    welcomeMessage: string
    /** Previously stored messages to restore */
    initialMessages?: StoredMessage[]
}

type UseChatMessagesReturn = {
    /** All messages including welcome and streamed */
    messages: Message[]
    /** Whether currently loading/streaming */
    isLoading: boolean
    /** Whether currently streaming (subset of isLoading) */
    isStreaming: boolean
    /** Whether the request was submitted but not yet streaming */
    isPending: boolean
    /** Any error that occurred */
    error: Error | undefined
    /** Send a new message */
    sendMessage: (text: string) => Promise<void>
    /** Clear all messages */
    clearMessages: () => void
    /** Extract text content from a message */
    getMessageContent: (message: Message) => string
    /** Count of user messages (excluding welcome) */
    userMessageCount: number
    /** The last assistant message content */
    lastAssistantMessage: string | undefined
    /** Whether the last message is from the assistant */
    lastMessageIsAssistant: boolean
    /** Whether streaming just completed (for triggering side effects) */
    streamingJustCompleted: boolean
    /** AI-generated quick questions from the stream */
    streamedQuickQuestions: string[]
}

/**
 * Convert stored DB messages to AI SDK message format
 */
function convertToAISDKMessages(messages: StoredMessage[]): AISDKMessage[] {
    return messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        parts: [{ type: 'text' as const, text: msg.content }],
    }))
}

/**
 * Custom hook for managing chat messages with AI SDK v5
 *
 * Features:
 * - Integrates with AI SDK useChat for streaming
 * - Handles message format conversion
 * - Tracks streaming state transitions
 * - Provides message content extraction
 * - Manages welcome message
 *
 * @example
 * ```tsx
 * const {
 *   messages,
 *   isLoading,
 *   sendMessage,
 *   getMessageContent,
 * } = useChatMessages({
 *   sessionId: 'abc123',
 *   welcomeMessage: 'Hello! How can I help?',
 * })
 * ```
 */
export function useChatMessages(
    options: UseChatMessagesOptions
): UseChatMessagesReturn {
    const { sessionId, welcomeMessage, initialMessages = [] } = options

    const wasLoadingRef = useRef(false)
    const streamingJustCompletedRef = useRef(false)

    // Convert initial messages to AI SDK format with welcome message
    const startingMessages = useMemo(() => {
        const welcome: AISDKMessage = {
            id: 'welcome',
            role: 'assistant',
            parts: [{ type: 'text' as const, text: welcomeMessage }],
        }

        if (initialMessages.length > 0) {
            const converted = convertToAISDKMessages(initialMessages)
            return [welcome, ...converted]
        }

        return [welcome]
    }, [welcomeMessage, initialMessages])

    // Use AI SDK's useChat hook with DefaultChatTransport for UIMessageStream support
    const {
        messages,
        sendMessage: sdkSendMessage,
        status,
        error,
        setMessages,
    } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: { sessionId },
        }),
        messages: startingMessages,
    })

    const isStreaming = status === 'streaming'
    const isPending = status === 'submitted'
    const isLoading = isStreaming || isPending

    // Track streaming completion
    useEffect(() => {
        streamingJustCompletedRef.current = wasLoadingRef.current && !isLoading
        wasLoadingRef.current = isLoading
    }, [isLoading])

    /**
     * Extract text content from message parts
     */
    const getMessageContent = useCallback((message: Message): string => {
        if (!message.parts) return ''
        return message.parts
            .filter(
                (part: {
                    type: string
                    text?: string
                }): part is { type: 'text'; text: string } =>
                    part.type === 'text'
            )
            .map((part: { type: 'text'; text: string }) => part.text)
            .join('')
    }, [])

    /**
     * Send a message
     */
    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return
            await sdkSendMessage({ text: text.trim() })
        },
        [isLoading, sdkSendMessage]
    )

    /**
     * Clear all messages
     */
    const clearMessages = useCallback(() => {
        setMessages([])
    }, [setMessages])

    // Computed values
    const userMessageCount = useMemo(
        () => messages.filter((m) => m.role === 'user').length,
        [messages]
    )

    const lastAssistantMessage = useMemo(() => {
        const assistantMessages = messages.filter((m) => m.role === 'assistant')
        if (assistantMessages.length === 0) return undefined
        return getMessageContent(
            assistantMessages[assistantMessages.length - 1]!
        )
    }, [messages, getMessageContent])

    const lastMessageIsAssistant = useMemo(() => {
        const lastMessage = messages[messages.length - 1]
        return lastMessage?.role === 'assistant'
    }, [messages])

    /**
     * Extract quick questions from the latest assistant message's data parts
     */
    const streamedQuickQuestions = useMemo(() => {
        // Find the last assistant message
        const assistantMessages = messages.filter((m) => m.role === 'assistant')
        const lastAssistant = assistantMessages[assistantMessages.length - 1]

        if (!lastAssistant?.parts) return []

        // Look for data-quick-questions part
        // Use type assertion since UIMessage parts can include custom data types
        for (const part of lastAssistant.parts as Array<{
            type: string
            data?: { questions?: string[] }
        }>) {
            if (
                part.type === 'data-quick-questions' &&
                part.data &&
                Array.isArray(part.data.questions)
            ) {
                return part.data.questions
            }
        }

        return []
    }, [messages])

    return {
        messages,
        isLoading,
        isStreaming,
        isPending,
        error,
        sendMessage,
        clearMessages,
        getMessageContent,
        userMessageCount,
        lastAssistantMessage,
        lastMessageIsAssistant,
        streamingJustCompleted: streamingJustCompletedRef.current,
        streamedQuickQuestions,
    }
}
