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
    DefaultChatTransport,
    createUIMessageStream,
    createUIMessageStreamResponse,
    type ChatMessage,
    type StreamChatOptions,
    type UIMessageStreamWriter,
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

// Gallery Image Analysis
export {
    analyzeGalleryImage,
    type AnalyzeImageOptions,
} from './analyze-image.function'

export {
    generateGallerySEOContent,
    type GenerateSEOContentOptions,
} from './generate-seo-content.function'

export {
    generateGalleryVisitorContent,
    type GenerateVisitorContentOptions,
} from './generate-visitor-content.function'

export {
    suggestGalleryGroups,
    type SuggestGroupsOptions,
} from './suggest-groups.function'

// Text Improvement
export {
    streamImproveText,
    type StreamImproveTextOptions,
} from './stream-improve-text.function'
