/**
 * @workspace/ai/schemas
 *
 * Zod schemas for AI structured outputs.
 *
 * @module @workspace/ai/schemas
 */

export {
    intentClassificationSchema,
    intentTypeSchema,
    detectableProcedureSchema,
    sessionTagSchema,
    INTENT_TYPES,
    DETECTABLE_PROCEDURES,
    SESSION_TAGS,
    type IntentType,
    type DetectableProcedure,
    type SessionTag,
    type IntentClassification,
    type ClassificationMessage,
} from './intent-classification.schema'

export {
    quickQuestionsSchema,
    MAX_QUESTION_LENGTH,
    type QuickQuestions,
    type QuickQuestionsMessage,
    type GenerateQuickQuestionsParams,
} from './quick-questions.schema'

export {
    // Schemas
    conversationAnalysisSchema,
    leadProfileSchema,
    psychographicDataSchema,
    actionableIntelligenceSchema,
    contactPreferenceSchema,
    // Enum schemas
    budgetIndicatorSchema,
    timelineSchema,
    decisionStageSchema,
    patientTypeSchema,
    sentimentSchema,
    recommendedActionSchema,
    followUpPrioritySchema,
    contactMethodSchema,
    // Constants
    BUDGET_INDICATORS,
    TIMELINE_OPTIONS,
    DECISION_STAGES,
    PATIENT_TYPES,
    SENTIMENT_OPTIONS,
    RECOMMENDED_ACTIONS,
    FOLLOW_UP_PRIORITIES,
    CONTACT_METHODS,
    DEFAULT_CONVERSATION_ANALYSIS,
    // Types
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
} from './conversation-analysis.schema'

export {
    // Schemas
    imageAnalysisSchema,
    seoContentSchema,
    visitorContentSchema,
    beforeAfterTypeSchema,
    bodyAreaSchema,
    imageQualitySchema,
    galleryProcedureSlugSchema,
    patientGenderSchema,
    patientDescriptionSchema,
    // Constants
    BEFORE_AFTER_TYPES,
    BODY_AREAS,
    IMAGE_QUALITY_LEVELS,
    GALLERY_PROCEDURE_SLUGS,
    PATIENT_GENDERS,
    // Types
    type ImageAnalysis,
    type GalleryMediaAIAnalysis,
    type SEOContent,
    type VisitorContent,
    type BeforeAfterType,
    type BodyArea,
    type ImageQuality,
    type GalleryProcedureSlug,
    type PatientGender,
    type PatientDescription,
} from './image-analysis.schema'

export {
    // Schemas
    groupSuggestionSchema,
    groupSuggestionItemSchema,
    // Types
    type GroupSuggestion,
    type GroupSuggestionItem,
    type AvailableGroup,
} from './group-suggestion.schema'
