/**
 * @workspace/ai/functions
 *
 * AI operation functions.
 *
 * @module @workspace/ai/functions
 */

export {
    classifyIntent,
    type ClassifyIntentOptions,
} from './classify-intent.function'

export {
    streamChat,
    streamText,
    smoothStream,
    openai,
    TextStreamChatTransport,
    type ChatMessage,
    type StreamChatOptions,
} from './stream-chat.function'
