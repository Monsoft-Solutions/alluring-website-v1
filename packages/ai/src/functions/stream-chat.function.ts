/**
 * Stream Chat Function
 *
 * Wrapper for AI SDK streamText for consistent chat streaming.
 * Re-exports the necessary types and functions from the AI SDK.
 *
 * @module @workspace/ai/functions/stream-chat
 */
import { streamText, smoothStream } from 'ai'
import { openai } from '@ai-sdk/openai'

import { DEFAULT_CHAT_MODEL_ID } from '../models/available-models.constant'

/**
 * Chat message format
 */
export type ChatMessage = {
    role: 'user' | 'assistant' | 'system'
    content: string
}

/**
 * Options for streaming chat
 */
export type StreamChatOptions = {
    /** Model ID to use */
    modelId?: string
    /** System prompt */
    systemPrompt: string
    /** Conversation messages */
    messages: ChatMessage[]
    /** Temperature for generation */
    temperature?: number
    /** Maximum output tokens */
    maxTokens?: number
    /** Enable smooth streaming (word-by-word) */
    smoothStreaming?: boolean
    /** Callback when streaming finishes */
    onFinish?: (result: { text: string }) => void | Promise<void>
}

/**
 * Stream a chat response
 *
 * Provides a consistent interface for streaming chat responses
 * with sensible defaults.
 *
 * @param options - Streaming options
 * @returns StreamText result with response methods
 *
 * @example
 * ```typescript
 * const result = streamChat({
 *   systemPrompt: 'You are a helpful assistant',
 *   messages: [{ role: 'user', content: 'Hello' }],
 *   onFinish: async ({ text }) => {
 *     await saveMessage(text)
 *   },
 * })
 * return result.toTextStreamResponse()
 * ```
 */
export function streamChat(options: StreamChatOptions) {
    const {
        modelId = DEFAULT_CHAT_MODEL_ID,
        systemPrompt,
        messages,
        temperature = 0.7,
        maxTokens = 1000,
        smoothStreaming = true,
        onFinish,
    } = options

    return streamText({
        model: openai(modelId),
        system: systemPrompt,
        messages,
        temperature,
        maxOutputTokens: maxTokens,
        ...(smoothStreaming && {
            experimental_transform: smoothStream({
                delayInMs: 20, // optional: defaults to 10ms
                chunking: 'line', // optional: defaults to 'word'
            }),
        }),
        onFinish,
    })
}

// Re-export AI SDK functions and types for convenience
export { streamText, smoothStream, TextStreamChatTransport } from 'ai'
export { openai } from '@ai-sdk/openai'
