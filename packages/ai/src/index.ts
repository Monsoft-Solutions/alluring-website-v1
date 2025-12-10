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
    type CoreMessage,
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
} from './functions'

// Schemas for structured outputs
export {
    intentClassificationSchema,
    intentTypeSchema,
    detectableProcedureSchema,
    sessionTagSchema,
    quickQuestionsSchema,
    conversationAnalysisSchema,
    leadProfileSchema,
    psychographicDataSchema,
    actionableIntelligenceSchema,
    contactPreferenceSchema,
    budgetIndicatorSchema,
    timelineSchema,
    decisionStageSchema,
    patientTypeSchema,
    sentimentSchema,
    recommendedActionSchema,
    followUpPrioritySchema,
    contactMethodSchema,
    INTENT_TYPES,
    DETECTABLE_PROCEDURES,
    SESSION_TAGS,
    MAX_QUESTION_LENGTH,
    BUDGET_INDICATORS,
    TIMELINE_OPTIONS,
    DECISION_STAGES,
    PATIENT_TYPES,
    SENTIMENT_OPTIONS,
    RECOMMENDED_ACTIONS,
    FOLLOW_UP_PRIORITIES,
    CONTACT_METHODS,
    DEFAULT_CONVERSATION_ANALYSIS,
    type IntentType,
    type DetectableProcedure,
    type SessionTag,
    type IntentClassification,
    type ClassificationMessage,
    type QuickQuestions,
    type QuickQuestionsMessage,
    type GenerateQuickQuestionsParams,
    type ConversationAnalysis,
    type LeadProfile,
    type PsychographicData,
    type ActionableIntelligence,
    type ContactPreference,
    type BudgetIndicator,
    type Timeline,
    type DecisionStage,
    type PatientType,
    type Sentiment,
    type RecommendedAction,
    type FollowUpPriority,
    type ContactMethod,
    type AnalysisMessage,
    // Image analysis schemas
    imageAnalysisSchema,
    seoContentSchema,
    visitorContentSchema,
    galleryProcedureSlugSchema,
    GALLERY_PROCEDURE_SLUGS,
    type ImageAnalysis,
    type SEOContent,
    type VisitorContent,
    type GalleryProcedureSlug,
    // Group suggestion schemas
    groupSuggestionSchema,
    groupSuggestionItemSchema,
    type GroupSuggestion,
    type GroupSuggestionItem,
    type AvailableGroup,
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
} from './prompts'

// Telemetry configuration
export { telemetryConfig } from './telemetry'
