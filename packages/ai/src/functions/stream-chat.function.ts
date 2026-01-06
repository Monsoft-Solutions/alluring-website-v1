/**
 * Stream Chat Function
 *
 * Wrapper for AI SDK streamText for consistent chat streaming.
 * Re-exports the necessary types and functions from the AI SDK.
 *
 * @module @workspace/ai/functions/stream-chat
 */
import { type Output } from 'ai'
import { coreStreamText } from '../core'

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
export function streamChat(
    options: StreamChatOptions
): ReturnType<typeof coreStreamText> {
    const {
        modelId,
        systemPrompt,
        messages,
        temperature = 0.7,
        maxTokens = 1000,
        smoothStreaming = true,
        onFinish,
    } = options

    return coreStreamText({
        modelId,
        system: systemPrompt,
        messages,
        temperature,
        maxTokens,
        smoothStreaming: smoothStreaming
            ? { delayInMs: 20, chunking: 'line' }
            : false,
        onFinish,
    })
}

// Re-export AI SDK functions and types for convenience
export {
    streamText,
    smoothStream,
    TextStreamChatTransport,
    DefaultChatTransport,
    createUIMessageStream,
    createUIMessageStreamResponse,
} from 'ai'
export type { UIMessageStreamWriter } from 'ai'
export { openai } from '@ai-sdk/openai'
