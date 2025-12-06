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

export {
    generateQuickQuestions,
    type GenerateQuickQuestionsOptions,
} from './generate-quick-questions.function'

export {
    analyzeConversation,
    calculateLeadScoreFromAnalysis,
    type AnalyzeConversationOptions,
} from './analyze-conversation.function'
