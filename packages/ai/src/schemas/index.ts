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
