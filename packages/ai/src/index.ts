/**
 * @workspace/ai
 *
 * Centralized AI package for the Alluring Plastic Surgery application.
 * Consolidates all AI-related operations, models, prompts, and schemas.
 *
 * @module @workspace/ai
 *
 * @example
 * ```typescript
 * // Import AI functions
 * import { classifyIntent, streamChat, openai, streamText } from '@workspace/ai'
 *
 * // Import schemas
 * import { intentClassificationSchema, type IntentClassification } from '@workspace/ai/schemas'
 *
 * // Import models
 * import { AVAILABLE_MODELS, DEFAULT_CHAT_MODEL_ID } from '@workspace/ai/models'
 *
 * // Import prompts
 * import { getIntentClassificationPrompt } from '@workspace/ai/prompts'
 * ```
 */

// Core wrapper functions
export {
    coreGenerateObject,
    coreGenerateText,
    coreStreamObject,
    coreStreamText,
    type GenerateObjectResult,
    type FlexibleSchema,
    type InferSchema,
    type GenerateTextResult,
    type StreamObjectResult,
    type DeepPartial,
    type StreamTextResult,
    type CoreBaseOptions,
    type ModelMessage,
    type CoreGenerateObjectOptions,
    type CoreGenerateTextOptions,
    type CoreGenerateTextPromptOptions,
    type CoreGenerateTextMessagesOptions,
    type CoreStreamObjectOptions,
    type CoreStreamTextOptions,
} from './core'

// AI operation functions
export {
    classifyIntent,
    streamChat,
    streamText,
    smoothStream,
    openai,
    TextStreamChatTransport,
    DefaultChatTransport,
    createUIMessageStream,
    createUIMessageStreamResponse,
    generateQuickQuestions,
    analyzeConversation,
    calculateLeadScoreFromAnalysis,
    // Gallery image analysis functions
    analyzeGalleryImage,
    generateGallerySEOContent,
    generateGalleryVisitorContent,
    suggestGalleryGroups,
    // Text improvement
    streamImproveText,
    // Blog post functions
    summarizeBlogPost,
    generateImagePrompt,
    generateInlineImagePrompt,
    generateImageAlt,
    analyzeBlogPost,
    generateFeaturedImagePrompt,
    // SEO functions
    generateContentBrief,
    type ClassifyIntentOptions,
    type ChatMessage,
    type StreamChatOptions,
    type UIMessageStreamWriter,
    type GenerateQuickQuestionsOptions,
    type AnalyzeConversationOptions,
    type AnalyzeImageOptions,
    type GenerateSEOContentOptions,
    type GenerateVisitorContentOptions,
    type SuggestGroupsOptions,
    type StreamImproveTextOptions,
    type SummarizeBlogPostOptions,
    type BlogPostSummary,
    type GenerateImagePromptOptions,
    type ImagePromptResult,
    type GenerateInlineImagePromptOptions,
    type InlineImagePromptResult,
    type InlineImageType,
    type GenerateImageAltOptions,
    type ImageAltResult,
    type AnalyzeBlogPostOptions,
    type GenerateFeaturedImagePromptOptions,
    type FeaturedImagePromptResult,
    type GenerateContentBriefOptions,
} from './functions'

// AI-specific schemas for structured outputs
// Note: Shared types (chat, gallery) should be imported from @workspace/shared
export {
    // Quick questions - AI-specific schema
    quickQuestionsSchema,
    MAX_QUESTION_LENGTH,
    type QuickQuestions,
    type QuickQuestionsMessage,
    type GenerateQuickQuestionsParams,
    // Image analysis - AI-specific schema that composes shared schemas
    imageAnalysisSchema,
    type ImageAnalysis,
} from './schemas'

// Model definitions
export {
    AVAILABLE_MODELS,
    DEFAULT_CHAT_MODEL_ID,
    DEFAULT_CLASSIFICATION_MODEL_ID,
    DEFAULT_CONVERSATION_ANALYSIS_MODEL_ID,
    DEFAULT_QUICK_QUESTIONS_MODEL_ID,
    DEFAULT_DEEP_DIVE_ANALYSIS_MODEL_ID,
    getModelById,
    getRecommendedModels,
    getModelsByTier,
    isValidModelId,
    type AIModel,
    type ModelCapability,
    type ModelProvider,
    type ModelTier,
} from './models'

// Prompt templates
export {
    INTENT_CLASSIFICATION_SYSTEM_PROMPT,
    formatMessagesForClassification,
    getIntentClassificationPrompt,
    DEFAULT_CHAT_SYSTEM_PROMPT,
    generateSystemPrompt,
    QUICK_QUESTIONS_SYSTEM_PROMPT,
    formatMessagesForQuickQuestions,
    getQuickQuestionsPrompt,
    CONVERSATION_ANALYSIS_SYSTEM_PROMPT,
    formatMessagesForAnalysis,
    getConversationAnalysisPrompt,
    type SystemPromptParams,
    // Gallery prompts
    IMAGE_ANALYSIS_SYSTEM_PROMPT,
    getImageAnalysisPrompt,
    SEO_CONTENT_SYSTEM_PROMPT,
    getSEOContentPrompt,
    VISITOR_CONTENT_SYSTEM_PROMPT,
    getVisitorContentPrompt,
    GROUP_SUGGESTION_SYSTEM_PROMPT,
    getGroupSuggestionPrompt,
    // Text improvement prompts
    TEXT_IMPROVEMENT_SYSTEM_PROMPT,
    getTextImprovementPrompt,
    // Blog prompts
    BLOG_SUMMARY_SYSTEM_PROMPT,
    getBlogSummaryPrompt,
    IMAGE_PROMPT_SYSTEM_PROMPT,
    getImagePromptPrompt,
    BLOG_ANALYSIS_SYSTEM_PROMPT,
    getBlogAnalysisPrompt,
    FEATURED_IMAGE_PROMPT_SYSTEM,
    getFeaturedImagePrompt,
    type FeaturedImagePromptInput,
    // SEO prompts
    CONTENT_BRIEF_SYSTEM_PROMPT,
    getContentBriefPrompt,
} from './prompts'

// Telemetry configuration
export { telemetryConfig } from './telemetry'
