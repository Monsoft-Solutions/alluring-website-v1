/**
 * Core AI Types
 *
 * Shared types for all core AI wrapper functions.
 *
 * @module @workspace/ai/core/types
 */
import type { z } from 'zod'
import type { ModelMessage as AISDKCoreMessage } from 'ai'

/**
 * Message content part for multimodal content (text or image)
 */
export type CoreMessageContentPart =
    | { type: 'text'; text: string }
    | { type: 'image'; image: string }

/**
 * AI SDK message format supporting multimodal content
 * Compatible with generateObject messages parameter
 * Uses the AI SDK's CoreMessage type which supports both string and array content
 */
export type CoreAISDKMessage = AISDKCoreMessage

/**
 * Base options shared by all core AI functions
 */
export type CoreBaseOptions = {
    /** Model ID to use (e.g., 'gpt-4.1', 'gpt-4.1-mini') */
    modelId?: string
    /** Temperature for generation (0-2, lower = more deterministic) */
    temperature?: number
}

/**
 * Message format for chat-based functions
 */
export type CoreMessage = {
    role: 'user' | 'assistant' | 'system'
    content: string
}

/**
 * Options for generateObject core function with prompt
 */
export type CoreGenerateObjectPromptOptions<TSchema extends z.ZodType> =
    CoreBaseOptions & {
        /** Zod schema for structured output */
        schema: TSchema
        /** System prompt for the AI */
        system?: string
        /** User prompt for the AI */
        prompt: string
    }

/**
 * Options for generateObject core function with messages
 * Supports multimodal content including images for vision capabilities
 */
export type CoreGenerateObjectMessagesOptions<TSchema extends z.ZodType> =
    CoreBaseOptions & {
        /** Zod schema for structured output */
        schema: TSchema
        /** System prompt for the AI */
        system?: string
        /** Messages for multimodal generation (supports images) */
        messages: CoreAISDKMessage[]
    }

/**
 * Options for generateObject core function (either prompt or messages)
 */
export type CoreGenerateObjectOptions<TSchema extends z.ZodType> =
    | CoreGenerateObjectPromptOptions<TSchema>
    | CoreGenerateObjectMessagesOptions<TSchema>

/**
 * Options for generateText core function with prompt
 */
export type CoreGenerateTextPromptOptions = CoreBaseOptions & {
    /** System prompt for the AI */
    system?: string
    /** User prompt for the AI */
    prompt: string
    /** Maximum output tokens */
    maxTokens?: number
}

/**
 * Options for generateText core function with messages
 */
export type CoreGenerateTextMessagesOptions = CoreBaseOptions & {
    /** System prompt for the AI */
    system?: string
    /** Messages for chat-based generation */
    messages: CoreMessage[]
    /** Maximum output tokens */
    maxTokens?: number
}

/**
 * Options for generateText core function (either prompt or messages)
 */
export type CoreGenerateTextOptions =
    | CoreGenerateTextPromptOptions
    | CoreGenerateTextMessagesOptions

/**
 * Options for streamObject core function
 */
export type CoreStreamObjectOptions<TSchema extends z.ZodType> =
    CoreBaseOptions & {
        /** Zod schema for structured output */
        schema: TSchema
        /** System prompt for the AI */
        system?: string
        /** User prompt for the AI */
        prompt: string
    }

/**
 * Options for streamText core function
 */
export type CoreStreamTextOptions = CoreBaseOptions & {
    /** System prompt for the AI */
    system?: string
    /** Messages for chat-based streaming */
    messages: CoreMessage[]
    /** Maximum output tokens */
    maxTokens?: number
    /** Enable smooth streaming (word-by-word or line-by-line) */
    smoothStreaming?:
        | boolean
        | {
              /** Delay between chunks in milliseconds */
              delayInMs?: number
              /** Chunking strategy */
              chunking?: 'word' | 'line'
          }
    /** Callback when streaming finishes */
    onFinish?: (result: { text: string }) => void | Promise<void>
}
