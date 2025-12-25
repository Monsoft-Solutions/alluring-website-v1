/**
 * @workspace/ai/client
 *
 * Client-safe exports from the AI package.
 * Only includes browser-compatible utilities and types.
 * Server-only functions (like web search, research) are excluded.
 *
 * @module @workspace/ai/client
 *
 * @example
 * ```typescript
 * // In client components, use this import:
 * import { DefaultChatTransport } from '@workspace/ai/client'
 *
 * // DON'T import from the main package in client components:
 * // import { DefaultChatTransport } from '@workspace/ai' // ❌
 * ```
 */

// Re-export client-safe AI SDK functions and types
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

// Chat message types (no server dependencies)
export type { ChatMessage } from './functions/stream-chat.function'
