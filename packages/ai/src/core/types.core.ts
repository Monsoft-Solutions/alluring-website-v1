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
 * Tool definition for AI agents
 * This is our simplified tool interface that gets converted to AI SDK format
 */
export type CoreTool<TParams extends z.ZodType = z.ZodType> = {
    /** Tool description for the AI */
    description: string
    /** Zod schema for tool parameters */
    parameters: TParams
    /** Execute function for the tool */
    execute: (params: z.infer<TParams>) => Promise<unknown>
}

/**
 * Tool set for AI agents
 */
export type CoreToolSet = Record<string, CoreTool>

/**
 * Step finish event data (simplified from AI SDK StepResult)
 */
export type CoreStepFinishEvent = {
    /** The text generated in this step */
    text: string
    /** Tool calls made in this step */
    toolCalls: unknown[]
    /** Tool results from this step */
    toolResults: unknown[]
    /** Finish reason for this step */
    finishReason: string
}

/**
 * Step result callback type
 * Note: Uses 'any' for compatibility with AI SDK's complex step result types
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CoreStepFinishCallback = (step: any) => void

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
    /**
     * Sampling temperature (0-2, lower = more deterministic).
     *
     * Opt-in: omitted from the request entirely unless a caller sets it, so each
     * model uses its own default. Only the chat surfaces pass this, from the
     * user-controlled `chat_config.temperature`. The blog pipeline deliberately
     * does not — vendors differ on which values they honour, and reasoning models
     * ignore or reject it outright.
     */
    temperature?: number
}

/**
 * Message format for chat-based functions
 */
export type ModelMessage = {
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
 * Tool-related options for generateText
 */
export type CoreGenerateTextToolOptions = {
    /** Tools available for the AI to use */
    tools?: CoreToolSet
    /** Maximum number of agentic steps (tool calls + responses) */
    maxSteps?: number
    /** Callback when each step ends */
    onStepEnd?: CoreStepFinishCallback
}

/**
 * Options for generateText core function with prompt
 */
export type CoreGenerateTextPromptOptions = CoreBaseOptions &
    CoreGenerateTextToolOptions & {
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
export type CoreGenerateTextMessagesOptions = CoreBaseOptions &
    CoreGenerateTextToolOptions & {
        /** System prompt for the AI */
        system?: string
        /** Messages for chat-based generation */
        messages: ModelMessage[]
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
    messages: ModelMessage[]
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
    /** Callback when streaming ends */
    onEnd?: (result: { text: string }) => void | Promise<void>
}
